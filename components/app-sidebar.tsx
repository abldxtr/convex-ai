"use client";

import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  PlusIcon,
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
  SquareTerminal,
  Bot,
  BookOpen,
  Settings2,
  Frame,
  PieChart,
  Map,
  Ellipsis,
  Trash2,
  Loader2,
} from "lucide-react";
import { NavUser } from "@/components/nav-user";
import { api } from "@/convex/_generated/api";
import { useAction, useMutation } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { useMemo } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useGlobalstate } from "@/context/global-store";
import { UserType } from "@/lib/type";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";
import { getRelativeDateLabel } from "@/lib/date";
export function AppSidebar({ user }: { user: UserType }) {
  // const chatList = await fetchQuery(api.chat.getChat, {}, { token });

  const chatList = useQuery(api.chat.getChat, {});
  // console.log({ chatList });
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  // const chatIdd = pathName.split("/chat/")[1] || undefined;
  // console.log({ searchParams: searchParams });
  const { newChat, setNewChat, setIsNavigating, active, setActive } =
    useGlobalstate();
  const deleteChat = useMutation(api.chat.deleteChat);
  const chatIdd = useMemo(
    () => pathName.split("/chat/")[1] || undefined,
    [pathName]
  );

  // const isMobile = useMediaQuery("(max-width: 768px)");

  const handleDeleteChat = (id: string) => {
    try {
      deleteChat({ id });
      toast.success("Chat deleted successfully");
      if (chatIdd === id) {
        router.replace("/chat");
      }
    } catch (error) {
      console.log({ error });
      toast.error("Failed to delete chat");
    }
  };

  // // console.log({ pathName: pathName.split("/")[2] });
  // // console.log({ class: pathName.split("/") });

  const { setOpenMobile, toggleSidebar, state, isMobile } = useSidebar();
  // const clientParam = useParams();
  // const chatList = useQuery(api.chat.getChat, {});
  // const chatList = useQuery(api.chat.getChat, {});
  // make group by date
  // const chatGroup = useMemo(() => {
  //   return chatList?.reduce(
  //     (acc, item) => {
  //       const date = new Date(item._creationTime);
  //       const dateString = date.toLocaleDateString();
  //       if (!acc[dateString]) {
  //         acc[dateString] = [];
  //       }
  //       acc[dateString].push(item);
  //       return acc;
  //     },
  //     {} as Record<string, typeof chatList>
  //   );
  // }, [chatList]);

  const chatGroup = useMemo(() => {
    if (chatList === undefined) return undefined;
    return chatList?.reduce(
      (acc, item) => {
        // console.log("item._creationTime:", item._creationTime);

        // فرض کنیم item._creationTime عدد یا رشته عددی است بر حسب میلی‌ثانیه
        const timestamp = Number(item._creationTime);

        // اگر بر حسب ثانیه بود:
        // const timestamp = Number(item._creationTime) * 1000;

        const date = new Date(timestamp);

        if (isNaN(date.getTime())) {
          console.warn("Invalid date for _creationTime:", item._creationTime);
          return acc; // یا هر رفتار دلخواه در صورت تاریخ نامعتبر
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
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
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
                    // setOpenMobile(false);
                    setActive(false);
                    router.push("/chat");
                    setNewChat(() => !newChat);
                    if (state === "expanded" && isMobile) {
                      toggleSidebar();
                    }
                    // window.router.push("/chat");
                    // window.history.replaceState({}, "", `/chat`);
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
          <div className="flex items-center justify-center">
            <Loader2 className="size-6 animate-spin" />
          </div>
        )}
        {chatGroup &&
          Object.entries(chatGroup)
            .slice()
            .reverse()
            .map(([date, chats]) => (
              <SidebarGroup key={date}>
                <SidebarGroupLabel>
                  {getRelativeDateLabel(new Date(Number(date)))}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {chats
                      .slice()
                      .reverse()
                      .map((chat) => (
                        <SidebarMenuItem key={chat._id}>
                          <SidebarMenuButton
                            asChild
                            isActive={chatIdd === chat.id}
                            onClick={() => {
                              if (state === "expanded" && isMobile) {
                                toggleSidebar();
                              }
                            }}
                          >
                            <Link
                              href={`/chat/${chat.id}`}
                              prefetch={true}
                              // onNavigate={(e) => {
                              //   // Only executes during SPA navigation
                              //   console.log("Navigating...");
                              //   setIsNavigating(true);

                              //   // Optionally prevent navigation
                              //   // e.preventDefault()
                              // }}
                            >
                              {chat.title || "Untitled Chat"}
                            </Link>
                          </SidebarMenuButton>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <SidebarMenuAction
                                showOnHover
                                className="data-[state=open]:bg-accent rounded-sm"
                              >
                                {/* <IconDots /> */}
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
                                {/* <IconTrash /> */}
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
