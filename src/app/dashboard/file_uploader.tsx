"use client";

import { motion } from "framer-motion";
import { FileScan } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import Loader from "~/components/ui/loader";
import { ConvertFiles } from "~/lib/client/file";
import { cn } from "~/lib/client/utils";
import { FileSchema } from "~/lib/shared/types/file";
import { api } from "~/trpc/main/react";

export default function FileUploader() {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<z.infer<typeof FileSchema> | null>(null);

  const router = useRouter();
  const analyzeReceiptMutation = api.receipt.analyze.useMutation({
    onSuccess(data) {
      router.push(`/dashboard/expense/new?receiptId=${data}`);
      setOpen(false);
    },
    onError(error) {
      setOpen(false);
      setImage(null);
      toast.error("Произошла ошибка!", {
        description: error.message,
      });
    },
  });

  useEffect(() => {
    document.addEventListener("dragover", (e) => {
      setTimeout(() => {
        setOpen(true);
      }, 100);
      e.preventDefault();
    });
    document.addEventListener("dragleave", (e) => {
      setTimeout(() => {
        setOpen(false);
      }, 100);
      e.preventDefault();
    });
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-0 flex items-center justify-center bg-black/50 z-[100] transition-all ease-in-out duration-300",
        open
          ? "opacity-100 backdrop-blur-sm"
          : "opacity-0 backdrop-blur-none pointer-events-none",
      )}
      onDragLeave={() => setOpen(false)}
      onDrop={async (e) => {
        e.preventDefault();
        const files = e.dataTransfer?.files;
        const f = files?.[0];
        if (!f) {
          setOpen(false);
          return;
        }

        const convertedImage = (await ConvertFiles([f]))[0];
        if (!convertedImage?.contentType.includes("image")) {
          toast.error("Файл не является изображением!");
          setOpen(false);
          return;
        }
        setImage(convertedImage);
        analyzeReceiptMutation.mutate({
          image: convertedImage,
        });
      }}
    >
      <motion.div
        initial={{
          opacity: 100,
          x: 0,
        }}
        exit={{
          opacity: 0,
          x: "100%",
        }}
        layout
        className="relative p-6 rounded-xl shadow-xl flex flex-col gap-4 bg-background items-center justify-center pointer-events-none max-w-[300px] overflow-hidden"
      >
        {image ? (
          <>
            <div className="absolute inset-0 p-6 z-[200] ">
              <div className="size-full backdrop-blur-sm flex items-center justify-center rounded-xl">
                <Loader className="text-white" size="lg" />
              </div>
            </div>
            <img src={image.b64} className="size-full rounded-xl" />
          </>
        ) : (
          <>
            <FileScan className="text-primary size-24" />
            <p className="text-center text-2xl font-bold">Загрузите файл</p>
          </>
        )}
      </motion.div>
    </div>
  );
}
