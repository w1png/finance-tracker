import { inferProcedureOutput } from "@trpc/server";
import { z } from "zod";
import { Router } from "~/server/api/main";
import { expenseTypeEnum } from "~/server/db/schema";

export const ReceiptProductTypeSchema = z.enum(expenseTypeEnum.enumValues);
export type ReceiptProductType = z.infer<typeof ReceiptProductTypeSchema>;

export const ReceiptProductSchema = z.object({
  title: z.string(),
  price: z.coerce.number(),
  quantity: z.coerce.number(),
  type: ReceiptProductTypeSchema,
});

export const ReceiptSchema = z.object({
  products: z.array(ReceiptProductSchema),
});

export type Receipt = inferProcedureOutput<Router["receipt"]["getAll"]>[number];
export type Expense = Receipt["expenses"][number];
