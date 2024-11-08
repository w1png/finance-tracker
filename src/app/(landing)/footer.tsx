import Link from "next/link";
import { Button } from "~/components/ui/button";
import Logo from "~/components/ui/logo";
import { Separator } from "~/components/ui/separator";

interface FooterItem {
  title: string;
  href: string;
}

const footerItems: FooterItem[] = [
  {
    title: "Тарифы",
    href: "/#pricing",
  },
  {
    title: "Оферта",
    href: "/offer",
  },
  {
    title: "Политика конфиденциальности",
    href: "/privacy",
  },
  {
    title: "Компания",
    href: "/company",
  },
];

export default function Footer() {
  return (
    <footer className="py-20 flex flex-col gap-8 lg:gap-16 items-center justify-center container">
      <Logo />
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center justify-center">
        {footerItems.map((item) => (
          <Link key={item.title} href={item.href}>
            <Button variant="link" className="font-bold" size="none">
              {item.title}
            </Button>
          </Link>
        ))}
      </div>
      <Separator />
      <p className="text-muted-foreground">
        {new Date().getFullYear()} Все права защищены
      </p>
    </footer>
  );
}
