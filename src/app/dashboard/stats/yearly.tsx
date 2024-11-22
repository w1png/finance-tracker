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
import { useEffect, useState } from "react";

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function FormatMonth(index: number) {
  return capitalize(
    format(setMonth(new Date(), index), "LLLL", { locale: ru }),
  );
}

export default function YearlyChart() {
  const [maxValue, setMaxValue] = useState(0);

  const { data: yearlyExpenses, isLoading } = api.stat.getYearly.useQuery();

  useEffect(() => {
    if (!yearlyExpenses) return;

    let max = 0;
    yearlyExpenses.months.forEach((m) => {
      max = Math.max(max, m.current?.sumTotal ?? 0);
    });
    setMaxValue(max);
  }, [yearlyExpenses]);

  if (isLoading || !yearlyExpenses)
    return (
      <div className="size-full flex items-center justify-center">
        <Loader />
      </div>
    );

  return (
    <ChartContainer
      className="max-h-[22rem]"
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
        className="p-2"
        data={yearlyExpenses.months.map((m, i) => ({
          month: FormatMonth(i),
          past: m.past?.sumTotal ?? 0,
          current: m.current?.sumTotal ?? 0,
        }))}
        accessibilityLayer
      >
        <CartesianGrid vertical={false} />
        <ChartTooltip content={<ChartTooltipContent lang="ru" />} />

        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
          domain={[0, maxValue * 1.15]}
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => `${value.toFixed(2)} ₽`}
        />

        <Bar dataKey="past" radius={8} className="fill-accent" />
        <Bar dataKey="current" radius={8} className="fill-primary" />
      </BarChart>
    </ChartContainer>
  );
}
