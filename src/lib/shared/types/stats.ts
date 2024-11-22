import { z } from "zod";

export const YearlyStatsOutputSchema = z.object({
  months: z.array(
    z.object({
      past: z
        .object({
          date: z.coerce.date(),
          totalTransactions: z.coerce.number(),
          sumTotal: z.coerce.number(),
        })
        .optional(),
      current: z
        .object({
          date: z.coerce.date(),
          totalTransactions: z.coerce.number(),
          sumTotal: z.coerce.number(),
        })
        .optional(),
    }),
  ),
});

export const CategoryStatsOutputSchema = z.object({
  total: z.coerce.number(),
  categories: z.array(
    z.object({
      categoryId: z.string(),
      purchases: z.coerce.number(),
    }),
  ),
});
