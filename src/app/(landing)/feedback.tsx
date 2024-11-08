"use client";

import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";

export default function FeedbackForm() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full lg:w-fit px-12">
          Задать вопрос
        </Button>
      </DialogTrigger>
      <DialogContent></DialogContent>
    </Dialog>
  );
}
