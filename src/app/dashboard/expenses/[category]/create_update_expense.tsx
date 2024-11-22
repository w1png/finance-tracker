"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { DropdownMenuItem } from "~/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { OnError } from "~/lib/client/on_error";
import {
  Expense,
  ExpenseSchema,
  expenseStrings,
} from "~/lib/shared/types/receipt";
import { expenseTypeEnum } from "~/server/db/schema";
import { api } from "~/trpc/main/react";

export default function CreateUpdateExpense({
  expense,
  receiptId,
}: {
  expense?: Expense;
  receiptId: string;
}) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(ExpenseSchema),
    defaultValues: {
      ...expense,
      price: (expense?.price ?? 0) / 100,
      receiptId,
    } as z.infer<typeof ExpenseSchema>,
  });

  const utils = api.useUtils();

  const updateExpenseMutation = api.receipt.updateExpense.useMutation({
    onSuccess: () => {
      setOpen(false);
      toast.success("Товар обновлен");
      utils.receipt.getOne.invalidate({ id: receiptId });
    },
    onError: (error) => {
      toast.error("Ошибка", {
        description: error.message,
      });
    },
  });

  const createExpenseMutation = api.receipt.createExpense.useMutation({
    onSuccess: () => {
      setOpen(false);
      toast.success("Товар добавлен");
      utils.receipt.getOne.invalidate({ id: receiptId });
    },
    onError: (error) => {
      toast.error("Ошибка", {
        description: error.message,
      });
    },
  });

  const onSubmit = (data: z.infer<typeof ExpenseSchema>) => {
    if (expense) {
      updateExpenseMutation.mutate({
        ...data,
        id: expense.id,
        price: data.price * 100,
      });
      return;
    }

    createExpenseMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {expense ? (
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            Редактировать
          </DropdownMenuItem>
        ) : (
          <div className="flex justify-end">
            <Button
              size="icon"
              className="aspect-square ml-auto size-8"
              variant="ghost"
            >
              <Plus className="size-4" />
            </Button>
          </div>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {expense ? "Редактирование" : "Создание"} товара
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, OnError)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Цена</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Количество</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Категория</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Категория" />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseTypeEnum.enumValues.map((t) => (
                          <SelectItem value={t} key={t}>
                            {expenseStrings[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                loading={
                  createExpenseMutation.isPending ||
                  updateExpenseMutation.isPending
                }
              >
                Сохранить
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
