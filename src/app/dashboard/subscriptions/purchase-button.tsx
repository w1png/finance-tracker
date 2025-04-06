"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import type { Subscription } from "~/lib/shared/types/subscriptions";
import { api } from "~/trpc/main/react";

export default function PurchaseButton({
  subscription,
  isActive,
}: {
  subscription: Subscription;
  isActive: boolean;
}) {
  const router = useRouter();

  const createPaymentMutation = api.payment.create.useMutation({
    onSuccess: (data) => {
      router.push(data.url);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Button
      loading={createPaymentMutation.isPending}
      className="w-full"
      variant={isActive ? "secondary" : "default"}
      onClick={() =>
        createPaymentMutation.mutate({ subscription: subscription.name })
      }
    >
      {isActive
        ? subscription.name === "start"
          ? "Ваш тариф"
          : "Продлить"
        : "Перейти"}
    </Button>
  );
}
