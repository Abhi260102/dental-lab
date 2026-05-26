import { redirect } from "next/navigation";
import { getSessionServer } from "@/lib/session";
import DashboardLayoutClient from "@/components/dashboard/dashboard-layout-client";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionServer();
  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <DashboardLayoutClient session={session}>
      {children}
    </DashboardLayoutClient>
  );
}
