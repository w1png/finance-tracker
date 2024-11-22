"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { currencyFormatter } from "~/lib/client/utils";
import { Receipt } from "~/lib/shared/types/receipt";
import DeleteReceipt from "./delete";
import Info from "./info";

export const columns: ColumnDef<Receipt>[] = [
  {
    id: "expenses_name",
    accessorKey: "expenses",
    header: "Товар",
    cell({ row }) {
      const { expenses } = row.original;
      return (
        <div className="space-y-4">
          {expenses.slice(0, 3).map((e) => (
            <p className="line-clamp-1 max-w-[30ch]">{e.title}</p>
          ))}
          {expenses.length > 3 && (
            <p className="text-muted-foreground">
              Ещё {expenses.length - 3} товаров
            </p>
          )}
        </div>
      );
    },
  },
  {
    id: "expenses_quantity",
    accessorKey: "expenses",
    header: "Кол-во",
    cell({ row }) {
      const { expenses } = row.original;
      return (
        <div className="space-y-4">
          {expenses.slice(0, 3).map((e) => (
            <p className="line-clamp-1 max-w-[30ch]">{e.quantity}</p>
          ))}
          <p> </p>
        </div>
      );
    },
  },
  {
    id: "expenses_price",
    accessorKey: "expenses",
    header: "Цена",
    cell({ row }) {
      const { expenses } = row.original;
      return (
        <div className="space-y-4">
          {expenses.slice(0, 3).map((e) => (
            <p className="line-clamp-1 max-w-[30ch]">
              {currencyFormatter.format(e.price / 100)}
              {e.quantity > 1 &&
                `×${e.quantity}=${currencyFormatter.format((e.price * e.quantity) / 100)}`}
            </p>
          ))}
          <p> </p>
        </div>
      );
    },
  },
  {
    id: "expenses_sum",
    accessorKey: "expenses",
    header: "Сумма",
    cell({ row }) {
      const { expenses } = row.original;
      return currencyFormatter.format(
        expenses.reduce((acc, cur) => acc + cur.price * cur.quantity, 0) / 100,
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Дата",
    cell: ({ row }) => format(row.getValue("createdAt"), "dd.MM.yyyy"),
  },

  {
    id: "actions",
    header: "",
    cell({ row }) {
      const receipt = row.original;

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
              <Info receiptId={receipt} />
              <DeleteReceipt id={receipt.id} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
