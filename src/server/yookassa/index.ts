import { type IReceipt, YooCheckout } from "@a2seven/yoo-checkout";
import { NextRequest } from "next/server";
import { env } from "~/env";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { payments, users } from "../db/schema";
import { addMonths } from "date-fns";
import { subscriptions } from "~/lib/shared/types/subscriptions";

export interface PaymentNotification {
  event: "payment.succeeded" | "payment.canceled";
  object: {
    id: string;
    paid: boolean;
  };
}

export class Yookassa {
  private yookassa: YooCheckout;

  constructor() {
    this.yookassa = new YooCheckout({
      shopId: env.YOOKASSA_SHOP_ID,
      secretKey: env.YOOKASSA_SECRET_KEY,
    });
  }

  async handlePurchase(req: NextRequest) {
    const notification: PaymentNotification = await req.json();

    if (!notification.object.paid || notification.event !== "payment.succeeded")
      return;

    const payment = await db.query.payments.findFirst({
      where: eq(payments.yookassaId, notification.object.id),
      with: {
        user: {
          columns: {
            id: true,
          },
        },
      },
    });

    if (!payment) return undefined;

    await db.transaction(async (trx) => {
      await trx
        .update(payments)
        .set({
          paid: true,
        })
        .where(eq(payments.id, payment.id));

      await trx.update(users).set({
        currentSubscription: payment.subscription,
        subscriptionEndsAt: addMonths(new Date(), 1),
        receiptsLeft: subscriptions.find(
          (s) => s.name === payment.subscription,
        )!.receiptsPerMonth,
      });
    });

    return payment;
  }

  async createPayment({
    amount,
    redirectPath,
  }: {
    amount: number;
    redirectPath: string;
  }) {
    const idempotencyKey = crypto.randomUUID();
    try {
      const yookassaPayment = await this.yookassa.createPayment(
        {
          amount: {
            value: amount.toFixed(0).toString(),
            currency: "RUB",
          },
          confirmation: {
            type: "redirect",
            return_url: `${env.NEXTAUTH_URL}${redirectPath}`,
          },
          capture: true,
        },
        idempotencyKey,
      );
      const confirmationUrl = yookassaPayment.confirmation.confirmation_url;
      if (!confirmationUrl) {
        throw new Error("Не удалось создать платеж");
      }

      return { yookassaPayment, idempotencyKey };
    } catch (error) {
      console.error(error);
      throw new Error("Не удалось создать платеж");
    }
  }
}

const globalForYookassa = globalThis as unknown as {
  yookassa: Yookassa;
};

export const yookassa = globalForYookassa.yookassa ?? new Yookassa();
