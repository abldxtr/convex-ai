"use client";

import { usePathname, useRouter } from "next/navigation";
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
import { PlusIcon, Ellipsis, Trash2, Search, SquarePen } from "lucide-react";
import { NavUser } from "@/components/nav-user";
import { api } from "@/convex/_generated/api";
import { Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { Fragment, useMemo, useTransition } from "react";
import { useGlobalState } from "@/context/global-state-zus";
import type { UserType } from "@/lib/type";
import { toast } from "sonner";
import { getRelativeDateLabel } from "@/lib/date";
import { Spinner } from "./spinner";
import { cn } from "@/lib/utils";
import { useDirection } from "@/hooks/use-direction";
import Link from "next/link";
import { Link as CustomLink } from "@/lib/link";
import FullTextSearch from "./full-text-search";

export function AppSidebar({
  user,
  preloadedChatList,
}: {
  user: UserType;
  preloadedChatList: Preloaded<typeof api.chat.getChat>;
}) {
  const chatList = usePreloadedQuery(preloadedChatList);

  const router = useRouter();
  const pathName = usePathname();
  const [isPending, startTransition] = useTransition();

  const {
    newChat,
    setNewChat,
    setActive,
    setDisableLayout,
    changeRandomId,
    setChangeRandomId,
    openSearchBar,
    setOpenSearchBar,
  } = useGlobalState();
  const deleteChat = useMutation(api.chat.deleteChat);

  const chatIdd = useMemo(
    () => pathName.split("/chat/")[1] || undefined,
    [pathName]
  );

  const handleDeleteChat = async (id: string) => {
    try {
      await deleteChat({ id });
      toast.success("Chat deleted successfully");
      if (chatIdd === id) {
        router.replace("/chat");
        router.refresh();
        setDisableLayout(false);
        setActive(false);
        setChangeRandomId(!changeRandomId);
      }
    } catch (error) {
      console.log({ error });
      toast.error("Failed to delete chat");
    }
  };

  const { setOpenMobile, isMobile } = useSidebar();

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

  const menue = [
    {
      title: "New Chat",
      icon: <SquarePen />,
    },
    {
      title: "Search Chats",
      icon: <Search />,
    },
  ];

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row items-center justify-between">
            <CustomLink
              href="/chat"
              onClick={() => {
                startTransition(() => {
                  setChangeRandomId(!changeRandomId);
                  setActive(false);
                  setDisableLayout(false);
                  setOpenMobile(false);
                });
              }}
              prefetch={true}
              className="flex flex-row items-center gap-3"
            >
              <span className="hover:bg-muted cursor-pointer rounded-md px-2 text-lg font-semibold">
                Chatbot
              </span>
            </CustomLink>
            <Tooltip>
              <TooltipTrigger asChild>
                <CustomLink
                  href="/chat"
                  onClick={() => {
                    startTransition(() => {
                      setChangeRandomId(!changeRandomId);
                      setActive(false);
                      setDisableLayout(false);
                      // setOpenMobile(false);
                      setNewChat(!newChat);
                      // if (state === "expanded" && isMobile) {
                      //   toggleSidebar();
                      // }
                    });
                  }}
                  prefetch={true}
                >
                  <Button variant="ghost" type="button" className="h-fit p-2">
                    <PlusIcon />
                  </Button>
                </CustomLink>
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
        <SidebarGroup>
          <SidebarGroupLabel className="  ">
            {/* {dateLabel} */}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                {menue.map((item, index) => {
                  return (
                    <Fragment key={index}>
                      {index === 0 ? (
                        <SidebarMenuButton asChild>
                          <Link href={"/chat"} prefetch={true} scroll={false}>
                            {item.icon}
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton
                          asChild
                          onClick={() => setOpenSearchBar(true)}
                          className=" hover:cursor-pointer "
                        >
                          <div
                          // onClick={() => {
                          //   setOpenSearchBar(true);
                          //   console.log(openSearchBar);
                          // }}
                          // className="flex items-center gap-2 "
                          >
                            {item.icon}
                            <span>{item.title}</span>
                          </div>
                        </SidebarMenuButton>
                      )}
                    </Fragment>
                  );
                })}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {chatGroup &&
          Object.entries(chatGroup)
            .slice()
            .reverse()
            .map(([dateLabel, chats]) => (
              <SidebarGroup key={dateLabel}>
                <SidebarGroupLabel className="  ">
                  {dateLabel}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {chats
                      .slice()
                      .reverse()
                      .map((chat) => {
                        const direction = useDirection(chat.title);
                        return (
                          <SidebarMenuItem key={chat._id}>
                            {!chat.title ? (
                              <SidebarMenuButton
                                asChild
                                isActive={chatIdd === chat.id}
                                // onClick={() => {
                                //   if (state === "expanded" && isMobile) {
                                //     toggleSidebar();
                                //   }
                                // }}
                              >
                                <Link
                                  href={`/chat/${chat.id}`}
                                  prefetch={true}
                                  scroll={false}
                                >
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
                                // onClick={() => {
                                //   if (state === "expanded" && isMobile) {
                                //     toggleSidebar();
                                //   }
                                // }}
                              >
                                <Link
                                  href={`/chat/${chat.id}`}
                                  prefetch={true}
                                  className={cn(
                                    "",
                                    direction === "rtl"
                                      ? " font-vazirmatn "
                                      : " font-sans "
                                  )}
                                  // onMouseEnter={() => prefetchChatData(chat.id)}
                                >
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
                        );
                      })}
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
