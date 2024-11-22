import { createSearchParamsCache, SearchParams } from "nuqs/server";
import { expenseStrings, ReceiptProductType } from "~/lib/shared/types/receipt";
import { createdAtParser, lastDaysParser, priceParser } from "./searchParams";
import { api } from "~/trpc/main/server";
import {
  Dashboard,
  DashboardContent,
  DashboardHeader,
  DashboardTitle,
} from "~/components/ui/dashboard";
import { Table } from "~/components/ui/table";
import { DataTable } from "~/components/ui/data-table";
import { columns } from "./columns";
import Filters from "./filters";

const searchParamsCache = createSearchParamsCache({
  ...lastDaysParser,
  ...createdAtParser,
  ...priceParser,
});

export default async function ExpensesPage({
  params,
  searchParams,
}: {
  params: {
    category: ReceiptProductType | "all";
  };
  searchParams: SearchParams;
}) {
  const query = searchParamsCache.parse(searchParams);

  const receipts = await api.receipt.getAll({
    category: params.category === "all" ? undefined : params.category,
    ...query,
  });

  return (
    <Dashboard>
      <DashboardHeader>
        <DashboardTitle>
          {params.category === "all"
            ? "Все расходы"
            : expenseStrings[params.category]}
        </DashboardTitle>
        <Filters />
      </DashboardHeader>
      <DashboardContent>
        <DataTable columns={columns} data={receipts} />
      </DashboardContent>
    </Dashboard>
  );
}
