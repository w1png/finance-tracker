"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { ColumnDef } from "@tanstack/react-table";
import { Receipt } from "~/lib/shared/types/receipt";
import { currencyFormatter } from "~/lib/shared/formatter";

export const columns: ColumnDef<Receipt>[] = [
  {
    accessorKey: "createdAt",
    header: "Дата",
    cell: ({ cell }) => format(cell.getValue() as Date, "PPP", { locale: ru }),
  },
  {
    accessorKey: "expenses",
    header: "Сумма",
    cell: ({ cell }) =>
      currencyFormatter.format(
        (cell.getValue() as Receipt["expenses"]).reduce(
          (acc, cur) => acc + cur.price * cur.quantity,
          0,
        ) / 100,
      ),
  },
];
