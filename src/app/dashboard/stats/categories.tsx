"use client";

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import Loader from "~/components/ui/loader";
import { expenseColors, expenseStrings } from "~/lib/shared/types/receipt";
import { expenseTypeEnum } from "~/server/db/schema";
import { api } from "~/trpc/main/react";

const chartConfig = {} as ChartConfig;

for (const cat of expenseTypeEnum.enumValues) {
  chartConfig[cat] = {
    color: expenseColors[cat],
    label: expenseStrings[cat],
  };
}

export default function CategoriesStats() {
  const { data, isLoading } = api.stat.categories.useQuery();

  if (isLoading || !data) {
    return (
      <div className="min-h-[22.5rem] w-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  let v: Record<string, number> = {};
  data.categories.forEach((category) => {
    v[category.categoryId] = category.purchases;
  });

  return (
    <div className="space-y-4">
      <div className="space-y-1 text-center">
        <p className="font-medium">График категорий</p>
        <p className="text-sm">Траты за последние 30 дней</p>
      </div>
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square w-full max-h-[200px]"
      >
        <RadialBarChart
          className="!h-fit"
          data={[v]}
          endAngle={180}
          innerRadius={80}
          outerRadius={130}
        >
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) - 16}
                        className="fill-foreground text-2xl font-bold"
                      >
                        {data.total}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 4}
                        className="fill-muted-foreground"
                      >
                        Покупок
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </PolarRadiusAxis>
          {expenseTypeEnum.enumValues.map((cat) => (
            <RadialBar
              key={cat}
              dataKey={cat}
              stackId="a"
              cornerRadius={5}
              fill={expenseColors[cat]}
              className="stroke-transparent stroke-2"
            />
          ))}
        </RadialBarChart>
      </ChartContainer>
      <div className="grid grid-cols-2">
        {expenseTypeEnum.enumValues.map((cat) => (
          <div className="flex gap-1 items-center text-xs">
            <div
              className="size-2 rounded-full"
              style={{ background: expenseColors[cat] }}
            ></div>
            <span>{expenseStrings[cat]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
