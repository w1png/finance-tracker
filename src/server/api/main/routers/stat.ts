import { setDate, setMonth, setYear } from "date-fns";
import { and, asc, eq, gte, lte, sql } from "drizzle-orm";
import { authenticatedProcedure, createTRPCRouter } from "~/server/api/trpc";
import { expenses } from "~/server/db/schema";

export const statRouter = createTRPCRouter({
  getYearly: authenticatedProcedure.query(async ({ ctx }) => {
    async function getYearly(year: number) {
      const startDate = setYear(setDate(setMonth(new Date(), 0), 1), year);
      const endDate = setYear(setDate(setMonth(new Date(), 11), 31), year);

      const months = await ctx.db
        .select({
          date: sql<string>`date_trunc('month', ${expenses.createdAt})`.as(
            "Month",
          ),
          totalTransactions: sql<number>`count(${expenses.id})`,
          sumTotal: sql<number>`sum(${expenses.price}) / 100`,
        })
        .from(expenses)
        .where(
          and(
            eq(expenses.createdById, ctx.session.user.id),
            gte(expenses.createdAt, startDate),
            lte(expenses.createdAt, endDate),
          ),
        )
        .groupBy(sql`"Month"`)
        .orderBy(asc(sql`"Month"`))
        .execute();

      return {
        months: months.map((m) => ({
          ...m,
          date: new Date(m.date),
        })),
      };
    }

    const past = await getYearly(new Date().getFullYear() - 1);
    const current = await getYearly(new Date().getFullYear());

    return {
      months: Array.from({ length: 12 }).map((_, i) => ({
        past: past.months.find((m) => m.date.getMonth() === i),
        current: current.months.find((m) => m.date.getMonth() === i),
      })),
    };
  }),
});
