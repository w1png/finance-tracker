import { z } from "zod";
import { FileSchema } from "~/lib/shared/types/file";
import { zodResponseFormat } from "openai/helpers/zod";
import crypto from "crypto";
import { authenticatedProcedure, createTRPCRouter } from "~/server/api/trpc";
import {
  ExpenseSchema,
  ReceiptOutputSchema,
  ReceiptProductTypeSchema,
  ReceiptSchema,
} from "~/lib/shared/types/receipt";
import { TRPCError } from "@trpc/server";
import Sharp from "sharp";
import { createCaller } from "..";
import { expenses, receipts, users } from "~/server/db/schema";
import { and, asc, desc, eq, gte, isNull } from "drizzle-orm";
import { IdSchema, OrderSchema } from "~/lib/shared/types/utils";
import { subDays } from "date-fns";
import type { redis as RedisClient } from "~/server/redis";

async function InvalidateReceipt({
  receiptId,
  userId,
  redis,
}: {
  receiptId: string;
  userId: string;
  redis: typeof RedisClient;
}) {
  await redis.del(`receipt:${receiptId}*`);
  await redis.del(`yearly-stats:${userId}`);
  await redis.del(`category-stats:${userId}`);
}

const system_prompt = `Ты анализируешь фотографии чеков пользователей и извлекаешь информацию о каждом товаре согласно заданной схеме:

Если название товара указано в сокращенной форме, ты преобразуешь его в полное название. Используй стандартные наименования товаров.
Пример:
"ВЯЗАНКА Колб. Докт.вар" должно быть преобразовано в "Вязанка колбаса докторская вареная".
Сокращенные слова, такие как "Колб." заменяются на полные слова, например, "колбаса", а "Докт.вар" – на "докторская вареная".
Убедись, что название включает тип товара (например, "колбаса"), его марку (например, "Вязанка") и дополнительную информацию, если она имеется (например, "вареная").
Сохраняй регистр и порядок слов в пределах логики русского языка, следи за корректностью окончаний.
Если название товара понятно, но не является полным, приводи его к стандартной и общепринятой форме.
`;

async function ResizeImage(image: z.infer<typeof FileSchema>): Promise<string> {
  const buf = Buffer.from(image.b64.split(",")[1]!, "base64");
  const resizedImage = await Sharp(buf).resize(640, 640).webp().toBuffer();
  return `data:image/png;base64,${resizedImage.toString("base64")}`;
}

export const receiptRouter = createTRPCRouter({
  analyze: authenticatedProcedure
    .input(
      z.object({
        image: FileSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (
        ctx.session.user.currentSubscription.name !== "pro" &&
        ctx.session.user.receiptsLeft <= 0
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "У вас недостаточно прав для создания чеков",
        });
      }

      const resizedImage = await ResizeImage(input.image);

      const imageHash = crypto
        .createHash("sha256")
        .update(resizedImage)
        .digest("hex");

      const cachedReceiptId = await ctx.redis.get(`img:${imageHash}`);
      if (cachedReceiptId) {
        return cachedReceiptId;
      }

      console.log("receipt not cached");
      const result = await ctx.ai.chat.completions.create({
        model: "gpt-4o-2024-08-06",
        response_format: zodResponseFormat(ReceiptSchema, "receipt"),
        messages: [
          {
            role: "system",
            content: system_prompt,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: resizedImage,
                },
              },
            ],
          },
        ],
      });
      console.log({ result });

      const content = result.choices[0]?.message.content;
      if (!content)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Ошибка создания ответа",
        });
      const receiptData = ReceiptSchema.parse(JSON.parse(content));

      const caller = createCaller(ctx);

      let receiptId: string | undefined;
      await ctx.db.transaction(async (trx) => {
        const receipt = (
          await trx
            .insert(receipts)
            .values({
              fileId: (
                await caller.file.create({
                  ...input.image,
                  createdById: ctx.session.user.id,
                })
              ).id,
              createdById: ctx.session.user.id,
            })
            .returning({ id: receipts.id })
        )[0]!;

        receiptId = receipt.id;

        await trx.insert(expenses).values(
          receiptData.products.map((p) => ({
            ...p,
            price: Math.round(p.price * 100),
            receiptId: receipt.id,
            createdById: ctx.session.user.id,
          })),
        );
      });

      await InvalidateReceipt({
        receiptId: receiptId!,
        redis: ctx.redis,
        userId: ctx.session.user.id,
      });
      await ctx.redis.set(`img:${imageHash}`, receiptId!);

      await ctx.db
        .update(users)
        .set({
          receiptsLeft: ctx.session.user.receiptsLeft - 1,
        })
        .where(eq(users.id, ctx.session.user.id));

      return receiptId!;
    }),
  getAll: authenticatedProcedure
    .input(
      z.object({
        category: ReceiptProductTypeSchema.optional(),
        lastDays: z.number().optional().default(30),
        createdAtOrder: OrderSchema.nullable().default("desc"),
        priceOrder: OrderSchema.nullable(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const rs = await ctx.db.query.receipts.findMany({
        where: and(
          eq(receipts.createdById, ctx.session.user.id),
          isNull(receipts.deletedAt),
          eq(receipts.isSaved, true),

          gte(receipts.createdAt, subDays(new Date(), input.lastDays)),
        ),
        orderBy: and(
          input.createdAtOrder === "asc"
            ? asc(receipts.createdAt)
            : desc(receipts.createdAt),
        ),
        with: {
          expenses: {
            orderBy: desc(expenses.id),
            where: input.category && eq(expenses.type, input.category),
          },
        },
      });

      return rs.filter((r) => r.expenses.length > 0);
    }),
  getOne: authenticatedProcedure
    .input(IdSchema)
    .output(ReceiptOutputSchema)
    .query(async ({ input, ctx }) => {
      const cached = await ctx.redis.get(`receipt:${input.id}`);
      if (cached) {
        return JSON.parse(cached);
      }

      const r = await ctx.db.query.receipts.findFirst({
        where: and(
          eq(receipts.createdById, ctx.session.user.id),
          isNull(receipts.deletedAt),
          eq(receipts.id, input.id),
        ),
        with: {
          expenses: true,
        },
      });
      await ctx.redis.set(`receipt:${input.id}`, JSON.stringify(r));
    }),
  save: authenticatedProcedure
    .input(IdSchema)
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .update(receipts)
        .set({
          isSaved: true,
        })
        .where(
          and(
            eq(receipts.createdById, ctx.session.user.id),
            isNull(receipts.deletedAt),
            eq(receipts.id, input.id),
          ),
        );
      await InvalidateReceipt({
        receiptId: input.id,
        redis: ctx.redis,
        userId: ctx.session.user.id,
      });
    }),
  delete: authenticatedProcedure
    .input(IdSchema)
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .update(receipts)
        .set({
          deletedAt: new Date(),
        })
        .where(
          and(
            eq(receipts.createdById, ctx.session.user.id),
            isNull(receipts.deletedAt),
            eq(receipts.id, input.id),
          ),
        );

      await InvalidateReceipt({
        receiptId: input.id,
        redis: ctx.redis,
        userId: ctx.session.user.id,
      });
    }),

  createExpense: authenticatedProcedure
    .input(ExpenseSchema)
    .mutation(async ({ ctx, input }) => {
      const receipt = await ctx.db.query.receipts.findFirst({
        where: and(
          eq(receipts.createdById, ctx.session.user.id),
          isNull(receipts.deletedAt),
          eq(receipts.id, input.receiptId),
        ),
      });

      if (!receipt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Такого чека не существует",
        });
      }

      await ctx.db.insert(expenses).values({
        ...input,
        createdById: ctx.session.user.id,
      });
      await InvalidateReceipt({
        receiptId: input.receiptId,
        redis: ctx.redis,
        userId: ctx.session.user.id,
      });
    }),

  updateExpense: authenticatedProcedure
    .input(ExpenseSchema.merge(IdSchema))
    .mutation(async ({ ctx, input }) => {
      const r = await ctx.db
        .update(expenses)
        .set(input)
        .where(
          and(
            eq(expenses.id, input.id),
            eq(expenses.createdById, ctx.session.user.id),
          ),
        )
        .returning();
      console.log(r);
      await InvalidateReceipt({
        receiptId: input.receiptId,
        redis: ctx.redis,
        userId: ctx.session.user.id,
      });
    }),

  deleteExpense: authenticatedProcedure
    .input(IdSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(expenses)
        .where(
          and(
            eq(expenses.id, input.id),
            eq(expenses.createdById, ctx.session.user.id),
          ),
        );
      await InvalidateReceipt({
        receiptId: input.id,
        redis: ctx.redis,
        userId: ctx.session.user.id,
      });
    }),
});
