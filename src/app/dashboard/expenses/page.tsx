import { Dashboard, DashboardContent } from "~/components/ui/dashboard";
import { DataTable } from "~/components/ui/data-table";
import { api } from "~/trpc/main/server";
import { columns } from "./columns";

export default async function ExpensesPage() {
  const receipts = await api.receipt.getAll();

  return (
    <Dashboard>
      <DashboardContent>
        <DataTable
          data={receipts}
          columns={columns}
        />
      </DashboardContent>
    </Dashboard>
  );
}
