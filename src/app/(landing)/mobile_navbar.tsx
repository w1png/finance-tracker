"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import Logo from "~/components/ui/logo";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "~/components/ui/sheet";
import { navbarItems } from "./navbarItems";
import NavbarItem from "./navbarItem";

export default function MobileNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="aspect-square">
          <Menu className="text-primary lg:hidden" />
        </Button>
      </SheetTrigger>
      <SheetContent className="container p-0 bg-background flex flex-col">
        <SheetHeader className="items-center flex justify-between !h-16 px-4 pb-0">
          <Logo />
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="aspect-square">
              <X className="text-primary" />
            </Button>
          </SheetClose>
        </SheetHeader>
        <ul className="grow p-4 flex flex-col gap-4 shrink items-center">
          {navbarItems.map((item) => (
            <li>
              <NavbarItem key={"mobile" + item.name} {...item} />
            </li>
          ))}
        </ul>
        <div className="h-16 items-center justify-center px-4">
          <Button className="w-full">Вход</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
