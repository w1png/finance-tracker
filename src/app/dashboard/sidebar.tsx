"use client";

import { ChartPie, Cog, DoorOpen, LayoutGrid, Menu } from "lucide-react";
import Logo from "~/components/ui/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { expenseTypeEnum } from "~/server/db/schema";
import { expenseStrings } from "~/lib/shared/types/receipt";
import { useEffect, useState } from "react";

export default function DashboardSidebar() {
  const pathName = usePathname();

  const [categoriesOpen, setCategoriesOpen] = useState(false);
  useEffect(() => {
    setCategoriesOpen(pathName.startsWith("/dashboard/expenses"));
  }, [pathName]);

  return (
    <>
      <nav className="fixed lg:hidden top-0 inset-x-0 flex justify-between bg-background h-16 items-center px-6">
        <Link href="/">
          <Logo />
        </Link>
        <SidebarTrigger>
          <Menu />
        </SidebarTrigger>
      </nav>
      <Sidebar dir="left">
        <SidebarHeader className="space-y-12 flex flex-col items-center justify-center pt-6 px-6">
          <Logo />
          <Link href="/dashboard/expense/new" className="w-full">
            <Button className="w-full">Новый чек</Button>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-6">
            <SidebarGroupLabel>Меню</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathName === "/dashboard/stats"}
                >
                  <Link href="/dashboard/stats">
                    <ChartPie />
                    <span>Статистика</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Collapsible
                open={categoriesOpen}
                onOpenChange={setCategoriesOpen}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <LayoutGrid />
                      <span>Категории</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuButton
                      asChild
                      isActive={pathName === "/dashboard/expenses/all"}
                    >
                      <Link href="/dashboard/expenses/all">
                        <span>Все расходы</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuSub>
                  {expenseTypeEnum.enumValues.map((t) => (
                    <SidebarMenuSub key={t}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathName === `/dashboard/expenses/${t}`}
                      >
                        <Link href={`/dashboard/expenses/${t}`}>
                          <span>{expenseStrings[t]}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuSub>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/auth/signout">
                    <DoorOpen />
                    <span>Выйти</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
