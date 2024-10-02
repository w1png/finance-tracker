"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Receipt } from "~/lib/shared/types/receipt";
import { api } from "~/trpc/main/react";

export default function SaveButton({
  receipt,
}: {
  receipt: Receipt;
}) {
  const router = useRouter();
  const saveMutation = api.receipt.save.useMutation({
    onSuccess: () => {
      router.refresh();
      toast.success("Чек сохранен");
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
        saveMutation.mutate({
          id: receipt.id,
        })
      }
      loading={saveMutation.isPending}
    >
      Сохранить
    </Button>
  );
}
