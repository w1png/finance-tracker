import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { FileSchema } from "~/lib/shared/types/file";
import { IdSchema } from "~/lib/shared/types/utils";
import {
  authenticatedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { files } from "~/server/db/schema";

export const fileRouter = createTRPCRouter({
  create: authenticatedProcedure
    .input(
      FileSchema.merge(
        z.object({
          createdById: z
            .string({
              required_error: "Необходимо указать идентификатор автора",
              invalid_type_error: "Неверный тип идентификатора автора",
            })
            .min(1, "Необходимо указать идентификатор автора"),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const id = (
        await ctx.db
          .insert(files)
          .values({
            ...input,
            id: undefined,
            objectId: await ctx.s3.upload(input),
          })
          .returning({ id: files.id })
      )[0]!.id;

      return {
        id,
      };
    }),
  get: publicProcedure.input(IdSchema).query(async ({ ctx, input }) => {
    const file = await ctx.db.query.files.findFirst({
      where: eq(files.id, input.id),
    });

    if (!file) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Файл не найден",
      });
    }

    const presignedUrl = await ctx.s3.getSignedUrl(file.objectId);

    return {
      presignedUrl,
      objectId: file.objectId,
      contentType: file.contentType,
      fileName: file.fileName,
      fileSize: file.fileSize,
    };
  }),
});
