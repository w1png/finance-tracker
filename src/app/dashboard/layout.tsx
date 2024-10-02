import { redirect } from "next/navigation";
import type React from "react";
import { getServerAuthSession } from "~/server/auth";
import DashboardSidebar from "./sidebar";
import FileUploader from "./file_uploader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex gap-6 w-screen h-screen p-6">
      <FileUploader />
      <DashboardSidebar />
      {children}
    </div>
  );
}
