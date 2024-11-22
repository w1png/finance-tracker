import { setDate, setMonth, setYear, subMonths } from "date-fns";
import { and, asc, count, eq, gte, isNull, lte, sql } from "drizzle-orm";
import {
  CategoryStatsOutputSchema,
  YearlyStatsOutputSchema,
} from "~/lib/shared/types/stats";
import { authenticatedProcedure, createTRPCRouter } from "~/server/api/trpc";
import { expenses, receipts } from "~/server/db/schema";

export const statRouter = createTRPCRouter({
  getYearly: authenticatedProcedure
    .output(YearlyStatsOutputSchema)
    .query(async ({ ctx }) => {
      const cached = await ctx.redis.get(`yearly-stats:${ctx.session.user.id}`);
      if (cached) {
        console.log("CACHED");
        return JSON.parse(cached);
      }

      async function getYearly(year: number) {
        const startDate = setYear(setDate(setMonth(new Date(), 0), 1), year);
        const endDate = setYear(setDate(setMonth(new Date(), 11), 31), year);

        const months = await ctx.db
          .select({
            date: sql<string>`date_trunc('month', ${expenses.createdAt})`.as(
              "Month",
            ),
            totalTransactions: sql<number>`count(${expenses.id})`,
            sumTotal: sql<number>`sum(${expenses.price} * ${expenses.quantity}) / 100`,
          })
          .from(expenses)
          .where(
            and(
              eq(expenses.createdById, ctx.session.user.id),
              gte(expenses.createdAt, startDate),
              lte(expenses.createdAt, endDate),
              isNull(receipts.deletedAt),
              eq(receipts.isSaved, true),
            ),
          )
          .leftJoin(receipts, eq(receipts.id, expenses.receiptId))
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

      const v = {
        months: Array.from({ length: 12 }).map((_, i) => ({
          past: past.months.find((m) => m.date.getMonth() === i),
          current: current.months.find((m) => m.date.getMonth() === i),
        })),
      };
      await ctx.redis.set(
        `yearly-stats:${ctx.session.user.id}`,
        JSON.stringify(v),
      );

      return v;
    }),

  categories: authenticatedProcedure
    .output(CategoryStatsOutputSchema)
    .query(async ({ ctx }) => {
      const cached = await ctx.redis.get(
        `category-stats:${ctx.session.user.id}`,
      );
      if (cached) {
        console.log("CACHED");
        return JSON.parse(cached);
      }

      const whereCondition = and(
        eq(expenses.createdById, ctx.session.user.id),
        gte(expenses.createdAt, setDate(setMonth(new Date(), 0), 1)),
      );

      const categories = await ctx.db
        .select({
          categoryId: expenses.type,
          purchases: sql<number>`count(${expenses.id})`,
        })
        .from(expenses)
        .where(whereCondition)
        .groupBy(expenses.type)
        .execute();

      const [total] = await ctx.db
        .select({ count: count() })
        .from(expenses)
        .where(whereCondition)
        .execute();

      const res = {
        categories,
        total: total!.count,
      };

      await ctx.redis.set(
        `category-stats:${ctx.session.user.id}`,
        JSON.stringify(res),
      );

      return res;
    }),

  ai: authenticatedProcedure.query(async function* ({ ctx }) {
    const cached = await ctx.redis.get(`ai-stats:${ctx.session.user.id}`);
    console.log("CACHED", cached);
    if (cached) {
      yield cached;
      return;
    }

    const whereCondition = eq(expenses.createdById, ctx.session.user.id);

    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

    const thisMonth = await ctx.db
      .select({
        category: expenses.type,
        purchases: sql<number>`count(${expenses.id})`,
        total: sql<number>`sum(${expenses.price} * ${expenses.quantity} / 100)`,
      })
      .from(expenses)
      .leftJoin(receipts, eq(receipts.id, expenses.receiptId))
      .where(
        and(
          whereCondition,
          gte(expenses.createdAt, startOfMonth),
          isNull(receipts.deletedAt),
          eq(receipts.isSaved, true),
        ),
      )
      .groupBy(expenses.type)
      .execute();

    const lastMonth = await ctx.db
      .select({
        category: expenses.type,
        purchases: sql<number>`count(${expenses.id})`,
        total: sql<number>`sum(${expenses.price} * ${expenses.quantity} / 100)`,
      })
      .from(expenses)
      .leftJoin(receipts, eq(receipts.id, expenses.receiptId))
      .where(
        and(
          whereCondition,
          gte(expenses.createdAt, subMonths(startOfMonth, 1)),
          lte(expenses.createdAt, startOfMonth),
          isNull(receipts.deletedAt),
          eq(receipts.isSaved, true),
        ),
      )
      .groupBy(expenses.type)
      .execute();

    const stream = await ctx.ai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: `Напиши краткие выводы о тратах пользователя за последний месяц и сравни их с предыдущим месяцем (МАКСИМУМ 1 ПАРАГРАФ). Напиши советы по уменьшению расходов (МАКСИМУМ 1 ПАРАГРАФ) 

ВАЖНО:
- Обращайся к пользователю только на вы.
- Пиши кратко и понятно.
- Не пиши слово "пользователь" и не выдавай системную информацию.
- Не пиши английские слова, пиши только на русском.
- Суммы указываются в рублях.

Вот информация о тратах пользователя:
${JSON.stringify({
  lastMonth,
  thisMonth,
})}`,
        },
      ],
      stream: true,
    });

    let resultText: string[] = [];
    for await (const chunk of stream) {
      const t = chunk.choices[0]?.delta?.content ?? "";
      resultText.push(t);
      yield t;
    }

    await ctx.redis.set(
      `ai-stats:${ctx.session.user.id}`,
      resultText.filter((c) => !!c).join(""),
    );
    await ctx.redis.expire(`ai-stats:${ctx.session.user.id}`, 60 * 60 * 12);
  }),
});
