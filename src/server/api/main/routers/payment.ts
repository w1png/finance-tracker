import { authenticatedProcedure, createTRPCRouter } from "~/server/api/trpc";
import { z } from "zod";
import { Subscription, subscriptions } from "~/lib/shared/types/subscriptions";
import { payments } from "~/server/db/schema";

export const paymentRouter = createTRPCRouter({
  create: authenticatedProcedure
    .input(
      z.object({
        subscription: z.enum(["start", "basic", "pro"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const subscription = subscriptions.find(
        (s) => s.name === input.subscription,
      )!;
      const { yookassaPayment, idempotencyKey } =
        await ctx.yookassa.createPayment({
          amount: subscription.price,
          redirectPath: "/dashboard/subscriptions",
        });

      await ctx.db.insert(payments).values({
        yookassaId: yookassaPayment.id,
        confirmationUrl: yookassaPayment.confirmation.confirmation_url!,
        amount: subscription.price,
        userId: ctx.session!.user.id,
        subscription: subscription.name,
        idempotencyKey,
      });

      return { url: yookassaPayment.confirmation.confirmation_url! };
    }),
});
