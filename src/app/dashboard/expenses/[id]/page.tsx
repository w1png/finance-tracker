import {
  Dashboard,
  DashboardContent,
  DashboardFooter,
} from "~/components/ui/dashboard";
import { DataTable } from "~/components/ui/data-table";
import { api } from "~/trpc/main/server";
import { columns } from "./columns";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import SaveButton from "./save";
import DeleteButton from "./delete";
import { cn } from "~/lib/client/utils";

export default async function ExpensePage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const receipt = await api.receipt.getOne(params);

  if (!receipt) notFound();

  return (
    <Dashboard>
      <DashboardContent>
        <div className="flex justify-between items-center">
          <p
            className={cn(
              "text-2xl font-semibold",
              !receipt.isSaved && "text-muted-foreground",
            )}
          >
            Чек от {format(receipt.createdAt, "PPP", { locale: ru })}
          </p>
        </div>
        <DataTable
          data={receipt.expenses}
          columns={columns}
        />
      </DashboardContent>
      {!receipt.isSaved && (
        <DashboardFooter className="flex gap-2">
          <SaveButton receipt={receipt} />
          <DeleteButton receipt={receipt} />
        </DashboardFooter>
      )}
    </Dashboard>
  );
}
