"use client";

import { DropdownMenuItem } from "~/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/main/react";
import { toast } from "sonner";

export default function DeleteReceipt({
  id,
}: {
  id: string;
}) {
  const router = useRouter();

  const deleteReceiptMutation = api.receipt.delete.useMutation({
    onSuccess: () => {
      router.refresh();
      toast.success("Чек успешно удален");
    },
    onError: (error) => {
      toast.error("Ошибка", {
        description: error.message,
      });
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          Удалить
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить чек?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          Вы уверены, что хотите удалить чек? Это действие нельзя будет
          отменить.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteReceiptMutation.mutate({ id })}
          >
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
