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
} from "lucide-react";
import { NavUser } from "@/components/nav-user";
import { api } from "@/convex/_generated/api";
import { useAction, useMutation, useQuery } from "convex/react";
import { useMemo } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useGlobalstate } from "@/context/global-store";
import { UserType } from "@/lib/type";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";
export function AppSidebar({ user }: { user: UserType }) {
  // const chatList = await fetchQuery(api.chat.getChat, {}, { token });

  const chatList = useQuery(api.chat.getChat, {});
  // console.log({ chatList });
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const chatIdd = pathName.split("/chat/")[1] || undefined;
  // console.log({ searchParams: searchParams });
  const { firstText, setFirstText, newChat, setNewChat } = useGlobalstate();
  const deleteChat = useMutation(api.chat.deleteChat);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleDeleteChat = (id: string) => {
    try {
      deleteChat({ id });
      toast.success("Chat deleted successfully");
      router.push("/chat");
    } catch (error) {
      console.log({ error });
      toast.error("Failed to delete chat");
    }
  };

  // // console.log({ pathName: pathName.split("/")[2] });
  // // console.log({ class: pathName.split("/") });

  const { setOpenMobile } = useSidebar();
  // const clientParam = useParams();
  // const chatList = useQuery(api.chat.getChat, {});
  // const chatList = useQuery(api.chat.getChat, {});
  // make group by date
  const chatGroup = useMemo(() => {
    return chatList?.reduce(
      (acc, item) => {
        const date = new Date(item._creationTime);
        const dateString = date.toLocaleDateString();
        if (!acc[dateString]) {
          acc[dateString] = [];
        }
        acc[dateString].push(item);
        return acc;
      },
      {} as Record<string, typeof chatList>
    );
  }, [chatList]);
  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: "Acme Inc",
        logo: GalleryVerticalEnd,
        plan: "Enterprise",
      },
      {
        name: "Acme Corp.",
        logo: AudioWaveform,
        plan: "Startup",
      },
      {
        name: "Evil Corp.",
        logo: Command,
        plan: "Free",
      },
    ],
    navMain: [
      {
        title: "Playground",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "History",
            url: "#",
          },
          {
            title: "Starred",
            url: "#",
          },
          {
            title: "Settings",
            url: "#",
          },
        ],
      },
      {
        title: "Models",
        url: "#",
        icon: Bot,
        items: [
          {
            title: "Genesis",
            url: "#",
          },
          {
            title: "Explorer",
            url: "#",
          },
          {
            title: "Quantum",
            url: "#",
          },
        ],
      },
      {
        title: "Documentation",
        url: "#",
        icon: BookOpen,
        items: [
          {
            title: "Introduction",
            url: "#",
          },
          {
            title: "Get Started",
            url: "#",
          },
          {
            title: "Tutorials",
            url: "#",
          },
          {
            title: "Changelog",
            url: "#",
          },
        ],
      },
      {
        title: "Settings",
        url: "#",
        icon: Settings2,
        items: [
          {
            title: "General",
            url: "#",
          },
          {
            title: "Team",
            url: "#",
          },
          {
            title: "Billing",
            url: "#",
          },
          {
            title: "Limits",
            url: "#",
          },
        ],
      },
    ],
    projects: [
      {
        name: "Design Engineering",
        url: "#",
        icon: Frame,
      },
      {
        name: "Sales & Marketing",
        url: "#",
        icon: PieChart,
      },
      {
        name: "Travel",
        url: "#",
        icon: Map,
      },
    ],
  };
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
                    router.push("/chat");
                    setNewChat(() => !newChat);
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
        {chatGroup &&
          Object.entries(chatGroup)
            .slice()
            .reverse()
            .map(([date, chats]) => (
              <SidebarGroup key={date}>
                <SidebarGroupLabel>{date}</SidebarGroupLabel>
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
                          >
                            <Link href={`/chat/${chat.id}`} prefetch={true}>
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
