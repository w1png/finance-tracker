import Image from "next/image";
import NotFoundImage from "../../public/404.svg";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import LandingLayout from "./(landing)/layout";

export default function NotFound() {
  return (
    <LandingLayout>
      <div className="h-screen w-screen flex flex-col items-center justify-center space-y-12 container">
        <Image src={NotFoundImage} alt="not_found" className="max-w-[300px]" />
        <div className="space-y-4">
          <p className="text-muted-foreground text-center">
            К сожалению, страница, которую вы ищете, не существует или была
            удалена.
          </p>
          <div className="mx-auto w-fit">
            <Link href="/" className="w-fit">
              <Button>На главную</Button>
            </Link>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
