import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { getServerAuthSession } from "~/server/auth";

export default async function SignInLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerAuthSession();

  if (session) {
    redirect("/dashboard");
  }

  return children;
}
