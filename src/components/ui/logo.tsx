import { Coins } from "lucide-react";
import { cn } from "~/lib/client/utils";

export default function Logo({
  className,
}: {
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-3xl bg-gradient-to-r from-green-800 to-primary w-fit bg-clip-text text-transparent font-bold flex gap-2",
        className,
      )}
    >
      <Coins className="size-8 text-primary" />
      Finance tracker
    </p>
  );
}
