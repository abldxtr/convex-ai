"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ThreeDots } from "react-loader-spinner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
  SidebarRail,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { PlusIcon, Ellipsis, Trash2 } from "lucide-react";
import { NavUser } from "@/components/nav-user";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { useMemo } from "react";
import { useGlobalstate } from "@/context/global-store";
import type { UserType } from "@/lib/type";
import { toast } from "sonner";
import { getRelativeDateLabel } from "@/lib/date";
import { Link } from "@/lib/link";
import { Spinner } from "./spinner";

export function AppSidebar({ user }: { user: UserType }) {
  const chatList = useQuery(api.chat.getChat, {});
  const router = useRouter();
  const pathName = usePathname();

  const {
    newChat,
    setNewChat,
    setIsNavigating,
    active,
    setActive,
    disableLayout,
    setDisableLayout,
    changeRandomId,
    setChangeRandomId,
  } = useGlobalstate();
  const deleteChat = useMutation(api.chat.deleteChat);

  const chatIdd = useMemo(
    () => pathName.split("/chat/")[1] || undefined,
    [pathName]
  );

  const handleDeleteChat = (id: string) => {
    try {
      deleteChat({ id });
      toast.success("Chat deleted successfully");
      if (chatIdd === id) {
        router.replace("/chat");
        router.refresh();
        setDisableLayout(false);
        setActive(false);
        setChangeRandomId((prev) => !prev);
      }
    } catch (error) {
      console.log({ error });
      toast.error("Failed to delete chat");
    }
  };

  const { setOpenMobile, toggleSidebar, state, isMobile } = useSidebar();

  const chatGroup = useMemo(() => {
    if (chatList === undefined) return undefined;

    return chatList?.reduce(
      (acc, item) => {
        const timestamp = Number(item._creationTime);
        const date = new Date(timestamp);

        if (isNaN(date.getTime())) {
          console.warn("Invalid date for _creationTime:", item._creationTime);
          return acc;
        }

        const dateLabel = getRelativeDateLabel(date);

        if (!acc[dateLabel]) {
          acc[dateLabel] = [];
        }
        acc[dateLabel].push(item);

        return acc;
      },
      {} as Record<string, typeof chatList>
    );
  }, [chatList]);

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row items-center justify-between">
            <Link
              href="/chat"
              onClick={() => {
                setChangeRandomId((prev) => !prev);

                setActive(false);
                setDisableLayout(false);

                setOpenMobile(false);
              }}
              prefetch={true}
              className="flex flex-row items-center gap-3"
            >
              <span className="hover:bg-muted cursor-pointer rounded-md px-2 text-lg font-semibold">
                Chatbot
              </span>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  type="button"
                  className="h-fit p-2"
                  onClick={() => {
                    setChangeRandomId((prev) => !prev);

                    setActive(false);
                    setDisableLayout(false);
                    // window.history.pushState({}, "", `/chat`);

                    router.push("/chat");
                    setNewChat(() => !newChat);
                    if (state === "expanded" && isMobile) {
                      toggleSidebar();
                    }
                  }}
                >
                  <PlusIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end">New Chat</TooltipContent>
            </Tooltip>
          </div>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {chatList === undefined && (
          <div className="flex items-center justify-center mt-4 ">
            {/* <Loader2 className="size-6 animate-spin" /> */}
            <Spinner />
          </div>
        )}

        {chatGroup &&
          Object.entries(chatGroup)
            .slice()
            .reverse()
            .map(([dateLabel, chats]) => (
              <SidebarGroup key={dateLabel}>
                {/* ✅ اصلاح: مستقیماً از dateLabel استفاده کنید */}
                <SidebarGroupLabel className="  ">
                  {dateLabel}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {chats
                      .slice()
                      .reverse()
                      .map((chat) => (
                        <SidebarMenuItem key={chat._id}>
                          {!chat.title ? (
                            <SidebarMenuButton
                              asChild
                              isActive={chatIdd === chat.id}
                              onClick={() => {
                                if (state === "expanded" && isMobile) {
                                  toggleSidebar();
                                }
                              }}
                            >
                              <Link href={`/chat/${chat.id}`} prefetch={true}>
                                {/* <Skeleton className="h-full w-full rounded-full" /> */}
                                <ThreeDots
                                  visible={true}
                                  height="20"
                                  width="50"
                                  color="black"
                                  radius="9"
                                  ariaLabel="three-dots-loading"
                                  wrapperStyle={{}}
                                  wrapperClass=""
                                />
                              </Link>
                            </SidebarMenuButton>
                          ) : (
                            <SidebarMenuButton
                              asChild
                              isActive={chatIdd === chat.id}
                              onClick={() => {
                                if (state === "expanded" && isMobile) {
                                  toggleSidebar();
                                }
                              }}
                            >
                              <Link href={`/chat/${chat.id}`} prefetch={true}>
                                {chat.title || "Untitled Chat"}
                              </Link>
                            </SidebarMenuButton>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <SidebarMenuAction
                                showOnHover
                                className="data-[state=open]:bg-accent rounded-sm"
                              >
                                <Ellipsis />
                                <span className="sr-only">More</span>
                              </SidebarMenuAction>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              className="w-24 rounded-lg"
                              side={isMobile ? "bottom" : "right"}
                              align={isMobile ? "end" : "start"}
                            >
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => handleDeleteChat(chat.id)}
                              >
                                <Trash2 />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </SidebarMenuItem>
                      ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
