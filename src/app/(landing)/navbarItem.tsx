"use client";

import { Button } from "~/components/ui/button";
import { type NavbarItem } from "./navbarItems";
import Link from "next/link";

export default function NavbarItem({ name, href }: NavbarItem) {
  return (
    <Link href={href} className="w-full lg:w-fit">
      <Button variant="link" size="none" className="text-2xl lg:text-base">
        {name}
      </Button>
    </Link>
  );
}
