import { z } from "zod";
import { FileSchema } from "~/lib/shared/types/file";
import { zodResponseFormat } from "openai/helpers/zod";
import { authenticatedProcedure, createTRPCRouter } from "~/server/api/trpc";
import { ReceiptSchema } from "~/lib/shared/types/receipt";
import { TRPCError } from "@trpc/server";
import Sharp from "sharp";
import { createCaller } from "..";
import { warn } from "console";
import { expenses, receipts } from "~/server/db/schema";
import { and, eq, isNotNull, isNull, not } from "drizzle-orm";
import { ReceiptIndianRupee } from "lucide-react";
import { IdSchema } from "~/lib/shared/types/utils";

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
      const resizedImage = await ResizeImage(input.image);

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

      return receiptId;
    }),
  getAll: authenticatedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.receipts.findMany({
      where: and(
        eq(receipts.createdById, ctx.session.user.id),
        isNull(receipts.deletedAt),
        eq(receipts.isSaved, true),
      ),
      with: {
        expenses: true,
      },
    });
  }),
  getOne: authenticatedProcedure
    .input(IdSchema)
    .query(async ({ input, ctx }) => {
      return await ctx.db.query.receipts.findFirst({
        where: and(
          eq(receipts.createdById, ctx.session.user.id),
          isNull(receipts.deletedAt),
          eq(receipts.id, input.id),
        ),
        with: {
          expenses: true,
        },
      });
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
    }),
});
