import {
  Dashboard,
  DashboardContent,
  DashboardHeader,
  DashboardTitle,
} from "~/components/ui/dashboard";
import { cn } from "~/lib/client/utils";
import YearlyChart from "./yearly";
import DashboardStatsAI from "./ai";
import { ReactNode } from "react";
import CategoriesStats from "./categories";

export default function DashboardStats() {
  return (
    <Dashboard>
      <DashboardHeader>
        <DashboardTitle>Статистика</DashboardTitle>
      </DashboardHeader>
      <DashboardContent className="bg-transparent space-y-4 border-0 grid-rows-2 max-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <StatContent
            title={"AI Аналитика"}
            className="lg:col-span-2 min-h-32"
          >
            <DashboardStatsAI />
          </StatContent>
          <StatContent title={"Топ категорий"} className="col-span-1">
            <CategoriesStats />
          </StatContent>
        </div>
        <StatContent title={"Траты"} className="w-full hidden lg:block">
          <YearlyChart />
        </StatContent>
      </DashboardContent>
    </Dashboard>
  );
}

function StatContent({
  children,
  className,
  title,
}: {
  title: ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white border overflow-hidden w-full lg:w-auto",
        className,
      )}
    >
      <div className="w-full p-4 border-b rounded-t-2xl font-medium text-sm text-muted-foreground">
        {title}
      </div>
      <div className="w-full p-4 flex flex-col">{children}</div>
    </div>
  );
}
