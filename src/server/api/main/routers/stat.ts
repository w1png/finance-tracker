import { setDate, setMonth, setYear } from "date-fns";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { authenticatedProcedure, createTRPCRouter } from "~/server/api/trpc";
import { expenses } from "~/server/db/schema";

export const statRouter = createTRPCRouter({
  getYearly: authenticatedProcedure.query(async ({ ctx }) => {
    async function getYearly(year: number) {
      const startDate = setYear(setDate(setMonth(new Date(), 0), 1), year);
      const endDate = setYear(setDate(setMonth(new Date(), 11), 31), year);

      const exp = await ctx.db.query.expenses.findMany({
        orderBy: desc(expenses.createdAt),
        where: and(
          eq(expenses.createdById, ctx.session.user.id),
          gte(expenses.createdAt, startDate),
          lte(expenses.createdAt, endDate),
        ),
      });

      let months: number[] = Array.from({ length: 12 }).fill(0) as number[];
      let total = 0;
      for (const expense of exp) {
        const p = expense.price * expense.quantity;
        total += p;
        months[expense.createdAt.getMonth()]! += p;
      }

      return {
        total: total,
        months: months,
      };
    }

    const past = await getYearly(new Date().getFullYear() - 1);
    const current = await getYearly(new Date().getFullYear());

    return {
      total: {
        current: current.total,
        past: past.total,
      },
      months: Array.from({ length: 12 }).map((_, i) => ({
        past: past.months[i]!,
        current: current.months[i]!,
      })),
    };
  }),
});
