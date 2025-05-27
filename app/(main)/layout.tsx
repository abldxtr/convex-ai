import { cookies } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
export default async function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isCollapsed = cookieStore.get("sidebar:state")?.value !== "true";

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset className="h-dvh">{children}</SidebarInset>
    </SidebarProvider>
  );
}
