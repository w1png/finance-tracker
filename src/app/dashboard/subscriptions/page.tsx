import { Button } from "~/components/ui/button";
import {
  Dashboard,
  DashboardHeader,
  DashboardContent,
  DashboardTitle,
} from "~/components/ui/dashboard";
import { cn, currencyFormatter } from "~/lib/client/utils";
import { subscriptions } from "~/lib/shared/types/subscriptions";
import PurchaseButton from "./purchase-button";
import { getServerAuthSession } from "~/server/auth";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const session = (await getServerAuthSession())!;

  return (
    <Dashboard>
      <DashboardHeader>
        <DashboardTitle>Тарифы</DashboardTitle>
      </DashboardHeader>
      <DashboardContent className="bg-transparent p-0 border-none">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {subscriptions.map((subscription) => (
            <div
              className={cn(
                "py-12 px-6 flex flex-col gap-4 rounded-2xl bg-white border",
              )}
              key={subscription.name}
            >
              <div className="flex flex-col gap-2">
                <p className="text-2xl font-bold">
                  {subscription.localizedName}
                </p>
                <p className={cn("text-muted-foreground")}>
                  {subscription.description}
                </p>
              </div>
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-center gap-1">
                  <span className="font-bold text-5xl">
                    {currencyFormatter.format(subscription.price)}
                  </span>
                  <span
                    className={cn(
                      subscription.name !== "basic" && "text-muted-foreground",
                    )}
                  >
                    /месяц
                  </span>
                </div>
                <PurchaseButton
                  isActive={
                    session.user.currentSubscription.name === subscription.name
                  }
                  subscription={subscription}
                />
              </div>
            </div>
          ))}
        </div>
      </DashboardContent>
    </Dashboard>
  );
}
