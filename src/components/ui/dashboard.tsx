import { cn } from "~/lib/client/utils";

export interface DashboardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Dashboard({ children, className, ...props }: DashboardProps) {
  return (
    <div
      {...props}
      className={cn(
        className,
        "bg-secondary rounded-3xl shadow-xl grow overflow-hidden p-6 flex flex-col gap-4",
      )}
    >
      {children}
    </div>
  );
}

export function DashboardContent({
  children,
  className,
  ...props
}: DashboardProps) {
  return (
    <div
      {...props}
      className={cn(className, "grow overflow-y-scroll overflow-x-hidden")}
    >
      {children}
    </div>
  );
}

export function DashboardFooter({
  children,
  className,
  ...props
}: DashboardProps) {
  return (
    <div
      {...props}
      className={cn(className, "border-t w-full shrink-0 py-4 h-fit")}
    >
      {children}
    </div>
  );
}
