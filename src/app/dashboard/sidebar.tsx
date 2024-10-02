import { ChartBar, Cog, ReceiptRussianRuble } from "lucide-react";
import DashboardSidebarItem, {
  DashboardSidebarItemProps,
} from "./sidebar_item";
import Logo from "~/components/ui/logo";

const items: DashboardSidebarItemProps[] = [
  {
    title: "Расходы",
    href: "/dashboard/expenses",
    icon: <ReceiptRussianRuble />,
  },
  {
    title: "Статистика",
    href: "/dashboard/stats",
    icon: <ChartBar />,
  },
  {
    title: "Настройки",
    href: "/dashboard/settings",
    icon: <Cog />,
  },
];

export default function DashboardSidebar() {
  return (
    <div className="shrink-0 w-[300px] h-full bg-secondary rounded-3xl py-6 px-4 shadow-xl flex flex-col gap-8 justify-between">
      <div className="space-y-8">
        <Logo />
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <DashboardSidebarItem
              {...item}
              key={item.title}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
