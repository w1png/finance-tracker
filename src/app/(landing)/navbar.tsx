import { Button } from "~/components/ui/button";
import Logo from "~/components/ui/logo";
import { navbarItems } from "./navbarItems";
import NavbarItem from "./navbarItem";
import MobileNavbar from "./mobile_navbar";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-background h-16 fixed inset-x-0 z-50 top-0">
      <ul className="flex items-center justify-between container h-full">
        <li>
          <Link href="/">
            <Logo />
          </Link>
        </li>
        <div className="gap-6 hidden lg:flex items-center mx-auto">
          {navbarItems.map((item) => (
            <li>
              <NavbarItem key={item.name} {...item} />
            </li>
          ))}
        </div>
        <li className="hidden lg:block">
          <Link href="/auth/signin" className="w-full">
            <Button className="px-12">Вход</Button>
          </Link>
        </li>
        <MobileNavbar />
      </ul>
    </nav>
  );
}
