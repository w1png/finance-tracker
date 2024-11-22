import { redirect } from "next/navigation";
import type React from "react";
import { getServerAuthSession } from "~/server/auth";
import DashboardSidebar from "./sidebar";
import FileUploader from "./file_uploader";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";

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
    <SidebarProvider>
      <FileUploader />
      <DashboardSidebar />
      <div className="flex grow max-w-[100vw] max-h-screen overflow-y-scroll flex-col p-2 lg:p-6 bg-secondary pt-20">
        {children}
      </div>
    </SidebarProvider>
  );
}
