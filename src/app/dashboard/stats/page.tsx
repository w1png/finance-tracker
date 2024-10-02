import { Dashboard, DashboardContent } from "~/components/ui/dashboard";
import { cn } from "~/lib/client/utils";
import YearlyChart from "./yearly";

export default function DashboardStats() {
  return (
    <Dashboard>
      <DashboardContent className="grid grid-cols-2 gap-4 grid-flow-col">
        <StatContent className="col-span-2">
          <YearlyChart />
        </StatContent>
      </DashboardContent>
    </Dashboard>
  );
}

function StatContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-background/60 shadow-lg rounded-3xl h-fit p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
