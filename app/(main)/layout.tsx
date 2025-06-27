import { cookies } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
export default async function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = await convexAuthNextjsToken();
  const user = await fetchQuery(api.user.getUser, {}, { token });
  // const [cookieStore, token] = await Promise.all([
  //   cookies(),
  //   convexAuthNextjsToken(),
  // ]);

  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  // const chatList = await fetchQuery(api.chat.getChat, {}, { token });
  // // console.log({ chatList });

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      {/* <AppSidebar chatList={chatList} /> */}
      <AppSidebar user={user} />

      <SidebarInset className="h-dvh overflow-hidden ">{children}</SidebarInset>
    </SidebarProvider>
  );
}
