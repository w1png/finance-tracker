"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import { Button } from "~/components/ui/button";
import { DataTable } from "~/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { currencyFormatter } from "~/lib/client/utils";
import { expenseStrings, Receipt } from "~/lib/shared/types/receipt";
import CreateUpdateExpense from "./create_update_expense";
import DeleteExpense from "./delete_expense";
import { useQueryStates } from "nuqs";
import { infoIdParser } from "./searchParams";
import { api } from "~/trpc/main/react";
import Loader from "~/components/ui/loader";

export const columns: ColumnDef<Receipt["expenses"][number]>[] = [
  {
    accessorKey: "title",
    header: "Товар",
  },
  {
    accessorKey: "quantity",
    header: "Кол-во",
  },
  {
    accessorKey: "price",
    header: "Цена",
    cell({ row }) {
      const expense = row.original;
      return (
        <p>
          {currencyFormatter.format(expense.price / 100)}
          {expense.quantity > 1 &&
            `×${expense.quantity}=${currencyFormatter.format((expense.price * expense.quantity) / 100)}`}
        </p>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Категория",
    cell({ row }) {
      const expense = row.original;
      return expenseStrings[expense.type];
    },
  },
  {
    id: "actions",
    header: ({}) => {
      const [{ info }] = useQueryStates(infoIdParser);

      if (!info) return null;

      return <CreateUpdateExpense receiptId={info} />;
    },
    cell({ row }) {
      const expense = row.original;

      return (
        <div className="flex items-center justify-end">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full"
                aria-haspopup="true"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <CreateUpdateExpense
                receiptId={expense.receiptId}
                expense={expense}
              />
              <DeleteExpense id={expense.id} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export default function Info({
  receiptId,
}: {
  receiptId: Receipt;
}) {
  const { data: receipt } = api.receipt.getOne.useQuery({ id: receiptId?.id });

  const [_, setInfo] = useQueryStates(infoIdParser);

  if (!receipt)
    return (
      <DropdownMenuItem disabled={true}>
        <Loader size="sm" />
      </DropdownMenuItem>
    );

  return (
    <Sheet onOpenChange={(v) => setInfo({ info: v ? receipt.id : null })}>
      <SheetTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          Подробнее
        </DropdownMenuItem>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            Чек от {format(receipt.createdAt, "dd.MM.yyyy")}
          </SheetTitle>
        </SheetHeader>
        <DataTable columns={columns} data={receipt.expenses} />
        <div className="flex justify-end w-full py-2">
          <p className="font-semibold">
            Итого:{" "}
            {currencyFormatter.format(
              receipt.expenses.reduce(
                (acc, cur) => acc + cur.quantity * cur.price,
                0,
              ) / 100,
            )}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
