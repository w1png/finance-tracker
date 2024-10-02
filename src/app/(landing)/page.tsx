"use client";

import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import Loader from "~/components/ui/loader";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { ConvertFiles } from "~/lib/client/file";
import { FileSchema } from "~/lib/shared/types/file";
import { Receipt } from "~/lib/shared/types/receipt";
import { api } from "~/trpc/main/react";

export default function LandingClientPage() {
  return null;
  const [image, setImage] = React.useState<z.infer<typeof FileSchema> | null>(
    null,
  );
  const [receipt, setReceipt] = React.useState<Receipt | null>(null);

  const analyzeReceiptMutation = api.receipt.analyze.useMutation({
    onSuccess(data) {
      console.log(data);
      setReceipt(data);
    },
    onError(error) {
      setImage(null);
      setReceipt(null);
      toast.error("Произошла ошибка!", {
        description: error.message,
      });
    },
  });

  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="container h-screen  flex items-center justify-center">
      <motion.div
        layout
        className="relative rounded-xl shadow-xl bg-secondary p-6 space-y-6 flex flex-col text-secondary-foreground overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {receipt && (
            <motion.div
              initial={{
                opacity: 0,
                x: "-100%",
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 1.2,
              }}
            >
              <Table>
                <TableHeader>
                  <TableHead>Название</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead>Количество</TableHead>
                </TableHeader>
                <TableBody>
                  {receipt.expenses.map((expense) => (
                    <TableRow key={expense.title}>
                      <TableCell>{expense.title}</TableCell>
                      <TableCell>{expense.price}</TableCell>
                      <TableCell>{expense.quantity}</TableCell>
                    </TableRow>
                  ))}
                  <TableFooter>
                    <TableCell>
                      <p>
                        Сумма:{" "}
                        {receipt.expenses.reduce(
                          (acc, expense) =>
                            acc + expense.price * expense.quantity,
                          0,
                        )}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button type="button">Сохранить</Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setImage(null);
                            setReceipt(null);
                          }}
                        >
                          Очистить
                        </Button>
                      </div>
                    </TableCell>
                  </TableFooter>
                </TableBody>
              </Table>
            </motion.div>
          )}

          {image && !receipt && (
            <motion.div
              initial={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: "100%",
              }}
              transition={{
                delay: 1,
              }}
              className="relative aspect-[2/3] max-h-[30rem] w-[20rem] rounded-xl shadow-xl bg-stone-100 p-6 space-y-6 border-slate-200 overflow-hidden"
            >
              <img
                src={image.b64}
                className="size-full object-cover"
              />
              <motion.div
                initial={{
                  opacity: 0,
                  backdropFilter: "blur(0px)",
                }}
                animate={{
                  opacity: 1,
                  backdropFilter: "blur(10px)",
                }}
                exit={{
                  opacity: 0,
                  backdropFilter: "blur(0px)",
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.8,
                }}
                className="rounded-xl absolute inset-0 items-center justify-center bg-stone-900/20 z-30 flex flex-col gap-2"
              >
                <Loader className="text-white" />
                <motion.p
                  style={{
                    scale: 0.5,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  exit={{
                    scale: 0.5,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 1.6,
                  }}
                  className="text-sm text-white"
                >
                  Обрабатываем изображение...
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {!receipt && !image && (
          <label>
            <Button
              type="button"
              onClick={() => {
                inputRef.current?.click();
              }}
            >
              Загрузить файл
            </Button>
            <input
              type="file"
              ref={inputRef}
              className="hidden"
              accept="image/*"
              onChange={async (e) => {
                if (!e.target.files?.[0]) return;

                const img = (await ConvertFiles([e.target.files[0]]))[0]!;

                setImage(img);

                analyzeReceiptMutation.mutate({
                  image: img,
                });
              }}
            />
          </label>
        )}
      </motion.div>
    </div>
  );
}
