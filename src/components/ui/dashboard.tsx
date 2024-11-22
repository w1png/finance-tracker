import { cn } from "~/lib/client/utils";

export interface DashboardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Dashboard({ children, className, ...props }: DashboardProps) {
  return (
    <div {...props} className={cn("grow flex flex-col gap-6", className)}>
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
      className={cn(
        "rounded-3xl border border-border grow p-6 flex flex-col gap-4 bg-background",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DashboardHeader({
  children,
  className,
  ...props
}: DashboardProps) {
  return (
    <div
      {...props}
      className={cn(
        "min-h-10 justify-between items-center flex flex-col lg:flex-row w-full gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DashboardTitle({
  children,
  className,
  ...props
}: DashboardProps) {
  return (
    <div {...props} className={cn(className, "font-semibold text-2xl")}>
      {children}
    </div>
  );
}
