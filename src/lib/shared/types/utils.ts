import { z } from "zod";

export const IdSchema = z.object({
  id: z
    .string({
      required_error: "Необходимо указать идентификатор",
      invalid_type_error: "Неверный тип идентификатора",
    })
    .min(1, "Необходимо указать идентификатор"),
});

export const OrderSchema = z.enum(["asc", "desc"]);

export const currencyFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});
