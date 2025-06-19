"use client";

import { Download } from "lucide-react";
import Image from "~/components/ui/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dashboard,
  DashboardContent,
  DashboardHeader,
  DashboardTitle,
} from "~/components/ui/dashboard";
import { ConvertFiles } from "~/lib/client/file";
import { api } from "~/trpc/main/react";
import Loader from "~/components/ui/loader";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { currencyFormatter } from "~/lib/client/utils";
import { columns } from "../../expenses/[category]/info";
import { DataTable } from "~/components/ui/data-table";
import NotAllowedModal from "~/components/not-allowed-modal";

export const dynamic = "force-dynamic";

export default function NewExpensePage({
  searchParams,
}: {
  searchParams: {
    receiptId: string;
  };
}) {
  const [receiptId, setReceiptId] = useState(searchParams.receiptId);
  const [notAllowedModalOpen, setNotAllowedModalOpen] = useState(false);

  const { data: receipt, isLoading } = api.receipt.getOne.useQuery(
    {
      id: receiptId,
    },
    {
      enabled: !!receiptId,
    },
  );

  const router = useRouter();

  const analyzeReceiptMutation = api.receipt.analyze.useMutation({
    onSuccess: (id) => {
      setReceiptId(id);
      router.push("/dashboard/expense/new?receiptId=${id}");
      toast.success("Чек загружен");
    },
    onError: (error) => {
      if (error.data?.code === "FORBIDDEN") {
        setNotAllowedModalOpen(true);
      } else {
        toast.error("Произошла ошибка!", {
          description: error.message,
        });
      }
    },
  });

  const saveReceiptMutation = api.receipt.save.useMutation({
    onSuccess: () => {
      router.push("/dashboard/expenses/all");
      toast.success("Чек сохранен");
    },
    onError: (error) => {
      toast.error("Ошибка сохранения чека", {
        description: error.message,
      });
    },
  });

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <NotAllowedModal
        open={notAllowedModalOpen}
        setOpen={setNotAllowedModalOpen}
      />

      <Dashboard>
        <DashboardHeader>
          <DashboardTitle>Новый чек</DashboardTitle>
        </DashboardHeader>
        <DashboardContent>
          <div className="flex lg:flex-row gap-4 flex-col">
            <div className="border-primary border-2 rounded-xl overflow-hidden bg-secondary/60 w-full lg:w-52 aspect-[2/2.5]">
              {receipt ? (
                <Image
                  src={receipt?.fileId}
                  alt={receipt?.fileId}
                  className="size-full object-cover"
                  width={1000}
                  height={1500}
                />
              ) : (
                <>
                  {isLoading || analyzeReceiptMutation.isPending ? (
                    <div className="flex items-center justify-center size-full">
                      <Loader />
                    </div>
                  ) : null}
                </>
              )}
            </div>
            <label>
              <Button
                className="w-full"
                onClick={() => inputRef.current?.click()}
              >
                <Download />
                <span>Загрузить чек</span>
              </Button>
              <input
                className="hidden"
                ref={inputRef}
                type="file"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  console.log("starting mutation");
                  analyzeReceiptMutation.mutate({
                    image: (await ConvertFiles([file]))[0]!,
                  });
                }}
              />
            </label>
          </div>
          <div className="">
            {receipt ? (
              <>
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
              </>
            ) : (
              <>
                {isLoading ? (
                  <div className="w-full h-52 flex justify-center items-center">
                    <Loader />
                  </div>
                ) : null}
              </>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/dashboard">
              <Button variant="secondary" className="w-full">
                Отмена
              </Button>
            </Link>
            <Button
              onClick={() => {
                saveReceiptMutation.mutate({
                  id: receiptId,
                });
              }}
            >
              Сохранить
            </Button>
          </div>
        </DashboardContent>
      </Dashboard>
    </>
  );
}
