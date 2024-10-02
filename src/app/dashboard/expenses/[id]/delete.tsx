"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Receipt } from "~/lib/shared/types/receipt";
import { api } from "~/trpc/main/react";

export default function DeleteButton({
  receipt,
}: {
  receipt: Receipt;
}) {
  const router = useRouter();
  const deleteMutation = api.receipt.delete.useMutation({
    onSuccess: () => {
      toast.success("Чек удален");
      router.push("/dashboard/expenses");
      router.refresh();
    },
    onError: (error) => {
      toast.error("Ошибка", {
        description: error.message,
      });
    },
  });

  return (
    <Button
      onClick={() =>
        deleteMutation.mutate({
          id: receipt.id,
        })
      }
      variant="destructive"
      loading={deleteMutation.isPending}
    >
      Удалить
    </Button>
  );
}
