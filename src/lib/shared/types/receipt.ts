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

export const expenseColors: Record<ReceiptProductType, string> = {
  ELECTRONICS: "#FF4444",
  GROCERIES: "#047857",
  TRANSPORTATION: "#E76E50",
  BILLS: "#FDB241",
  FURNITURE: "#BD62FC",
  RESTAURANT: "#6293FC",
};

export const expenseStrings: Record<ReceiptProductType, string> = {
  ELECTRONICS: "Электроника",
  GROCERIES: "Продукты питания",
  TRANSPORTATION: "Транспорт",
  BILLS: "Счета",
  FURNITURE: "Мебель",
  RESTAURANT: "Ресторан",
};

export const ExpenseSchema = z.object({
  receiptId: z.string(),
  title: z
    .string({
      message: "Название товара обязательно",
    })
    .min(1, "Название товара обязательно"),
  price: z.coerce
    .number({
      message: "Цена обязательна",
    })
    .min(1, "Цена обязательна"),
  quantity: z.coerce
    .number({
      message: "Количество обязательно",
    })
    .min(1, "Количество обязательно"),
  type: ReceiptProductTypeSchema,
});

export const ReceiptOutputSchema = z
  .object({
    id: z.string(),
    createdById: z.string(),
    createdAt: z.coerce.date(),
    fileId: z.string(),
    isSaved: z.coerce.boolean(),
    deletedAt: z.coerce.date().nullable(),
    expenses: z.array(
      z.object({
        id: z.string(),
        createdById: z.string(),
        createdAt: z.coerce.date(),
        type: ReceiptProductTypeSchema,
        title: z.string(),
        quantity: z.coerce.number(),
        price: z.coerce.number(),
        receiptId: z.string(),
      }),
    ),
  })
  .optional();
