"use client";

import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { NavUser } from "@/components/nav-user";
import { api } from "@/convex/_generated/api";
import { useAction, useQuery } from "convex/react";
import { useMemo } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useGlobalstate } from "@/context/global-store";
import { UserType } from "@/lib/type";

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
