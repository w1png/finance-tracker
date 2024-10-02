"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { currencyFormatter } from "~/lib/shared/formatter";
import { Expense } from "~/lib/shared/types/receipt";

export const columns: ColumnDef<Expense>[] = [
  {
    accessorKey: "title",
    header: "Название",
  },
  {
    accessorKey: "price",
    header: "Цена",
    cell: ({ cell }) => {
      return currencyFormatter.format((cell.getValue() as number) / 100);
    },
  },
  {
    accessorKey: "quantity",
    header: "Количество",
    cell: ({ cell }) => `${cell.getValue()} шт.`,
  },
  {
    accessorFn: (row) => row.price * row.quantity,
    header: "Сумма",
    cell: ({ cell }) =>
      currencyFormatter.format((cell.getValue() as number) / 100),
  },
];
