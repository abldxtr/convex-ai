import { cookies } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";

export default async function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = await convexAuthNextjsToken();
  if (!!token) {
    redirect("/auth");
  }

  const [user, preloadedTasks] = await Promise.all([
    fetchQuery(api.user.getUser, {}, { token }),
    preloadQuery(api.chat.getChat, {}, { token }),
  ]);

  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar user={user} preloadedChatList={preloadedTasks} />
      <SidebarInset className="h-dvh overflow-hidden ">{children}</SidebarInset>
    </SidebarProvider>
  );
}
