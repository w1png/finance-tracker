"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import Link from "next/link";
import { Button } from "./ui/button";

export default function NotAllowedModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Закончились чеки</DialogTitle>
        </DialogHeader>
        <p>
          У вас закончились чеки. Чтобы продолжить пользоваться приложением,
          пожалуйста, перейдите на новый тариф.
        </p>
        <DialogFooter className="grid grid-cols-1 md:grid-cols-2">
          <DialogClose asChild>
            <Button variant="secondary">Отмена</Button>
          </DialogClose>
          <Link href="/dashboard/subscriptions" onClick={() => setOpen(false)}>
            <Button className="w-full">Тарифы</Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
