import { Button } from "~/components/ui/button";
import Logo from "~/components/ui/logo";
import { navbarItems } from "./navbarItems";
import NavbarItem from "./navbarItem";
import MobileNavbar from "./mobile_navbar";

export default function Navbar() {
  return (
    <nav className="bg-background h-16 fixed inset-x-0 z-50 top-0">
      <ul className="flex items-center justify-between container h-full">
        <li>
          <Logo />
        </li>
        <div className="gap-6 hidden lg:flex items-center">
          {navbarItems.map((item) => (
            <li>
              <NavbarItem key={item.name} {...item} />
            </li>
          ))}
        </div>
        <li className="hidden lg:block">
          <Button className="px-12">Вход</Button>
        </li>
        <MobileNavbar />
      </ul>
    </nav>
  );
}
