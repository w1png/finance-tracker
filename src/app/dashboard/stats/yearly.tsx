"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { format, setMonth } from "date-fns";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import Loader from "~/components/ui/loader";
import { api } from "~/trpc/main/react";
import { ru } from "date-fns/locale";

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function FormatMonth(index: number) {
  return capitalize(
    format(setMonth(new Date(), index), "LLLL", { locale: ru }),
  );
}

export default function YearlyChart() {
  const { data: yearlyExpenses, isLoading } = api.stat.getYearly.useQuery();

  if (isLoading || !yearlyExpenses)
    return (
      <div className="size-full min-h-96 flex items-center justify-center">
        <Loader />
      </div>
    );

  return (
    <ChartContainer
      className="min-h-96 w-full h-fit"
      config={{
        past: {
          label: "Предыдущий год",
        },
        current: {
          label: "Текущий год",
        },
      }}
    >
      <BarChart
        data={yearlyExpenses.months.map((m, i) => ({
          month: FormatMonth(i),
          past: m.past?.sumTotal ?? 0,
          current: m.current?.sumTotal ?? 0,
        }))}
        accessibilityLayer
      >
        <CartesianGrid vertical={false} />

        <ChartTooltip content={<ChartTooltipContent lang="ru" />} />

        <Bar
          dataKey="past"
          radius={8}
          className="fill-primary/60"
        />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => `${value.toFixed(2)} ₽`}
        />
        <Bar
          dataKey="current"
          radius={8}
          className="fill-primary"
        />
      </BarChart>
    </ChartContainer>
  );
}
