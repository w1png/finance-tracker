"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Button } from "~/components/ui/button";

export type DashboardSidebarItemProps = {
  title: string;
  href: string;
  icon: ReactNode;
};

export default function DashboardSidebarItem({
  title,
  href,
  icon,
}: DashboardSidebarItemProps) {
  const pathname = usePathname();

  return (
    <Link href={href}>
      <Button
        className="w-full"
        variant={href.startsWith(pathname) ? "default" : "outline"}
      >
        {icon}
        {title}
      </Button>
    </Link>
  );
}
