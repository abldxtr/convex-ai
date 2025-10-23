"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { DialogTitle } from "@/components/ui/dialog";
import { useGlobalState } from "@/context/global-state-zus";
import { SquarePen, Search, Clock, MessageSquare, Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";

interface ChatResult {
  id: string;
  title: string;
  content?: string;
}

function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function SearchResultSkeleton() {
  return (
    <div className="px-2 py-3 space-y-2">
      <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
      <div className="h-3 w-full bg-gray-200 rounded"></div>
    </div>
  );
}

export default function FullTextSearch() {
  const { openSearchBar, setOpenSearchBar } = useGlobalState();
  const [search, setSearch] = useState("");
  const router = useRouter();
  const setSearchHistory = useMutation(api.search.setSearchHistory);
  const searchHistory = useQuery(api.search.getSearchHistory);

  const debouncedSearch = useDebounce(search, 400);
  const [data, setData] = useState<
    | {
        id: string;
        title: string;
        content: string;
      }[]
    | null
  >(null);

  const [searchHistoryData, setSearchHistoryData] = useState<
    | {
        id: string;
        title: string;
        content: string;
      }[]
    | null
  >(null);

  const searchRes = useQuery(
    api.chat.searchBody,
    debouncedSearch.trim().length > 2
      ? { searchText: debouncedSearch.trim() }
      : "skip"
  );

  const isMinSearchLength = debouncedSearch.trim().length > 2;
  const isLoading = isMinSearchLength && searchRes === undefined;
  const hasSearchResults = searchRes && searchRes.length > 0;
  const shouldShowResults = isMinSearchLength && !isLoading && hasSearchResults;

  const highlightText = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark
              key={i}
              className="bg-yellow-300 dark:bg-yellow-600 text-black dark:text-white rounded-sm px-0.5"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const handleChatSelect = async (chat: ChatResult) => {
    try {
      if (debouncedSearch.trim().length > 2) {
        await setSearchHistory({
          id: chat.id,
          title: chat.title,
          content: chat.content || "",
          searchText: debouncedSearch,
        });
      }
      setOpenSearchBar(false);
      setSearch(""); // Reset search on navigation
      router.push(`/chat/${chat.id}`);
    } catch (error) {
      console.error("Failed to save search history:", error);
      setOpenSearchBar(false);
      setSearch("");
      router.push(`/chat/${chat.id}`);
    }
  };

  useEffect(() => {
    if (!openSearchBar) {
      setSearch("");
    }
  }, [openSearchBar]);

  useEffect(() => {
    if (searchRes != null && searchRes != undefined) {
      setData(searchRes);
    }
  }, [searchRes]);

  useEffect(() => {
    if (searchHistory != null && searchHistory != undefined) {
      setSearchHistoryData(searchHistory);
    }
  }, [searchHistory, searchRes]);
  return (
    <CommandDialog
      open={openSearchBar}
      onOpenChange={() => {
        setOpenSearchBar(false);
        setData(null);
      }}
    >
      <DialogTitle className="sr-only">Search Chats</DialogTitle>

      <div className="relative">
        <CommandInput
          placeholder="Search chats..."
          value={search}
          onValueChange={setSearch}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <CommandList>
        <CommandGroup>
          <CommandItem
            onSelect={() => {
              setOpenSearchBar(false);
              setSearch("");
              router.push(`/chat/`);
            }}
            className="cursor-pointer"
          >
            <SquarePen className="size-4 mr-2 text-muted-foreground" />
            <span>New Chat</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup
        //   heading={`Found ${searchRes.length} result${searchRes.length !== 1 ? "s" : ""}`}
        >
          {data?.map((chat, index) => {
            return (
              <CommandItem
                key={index}
                onSelect={() => handleChatSelect(chat)}
                className="cursor-pointer flex flex-col items-start gap-1.5 py-3"
              >
                <div className="flex items-start gap-2 w-full">
                  <MessageSquare className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm leading-tight">
                      {highlightText(chat.title, debouncedSearch)}
                    </div>
                    {chat.content && (
                      <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {highlightText(
                          chat.content.slice(0, 120),
                          debouncedSearch
                        )}
                        {chat.content.length > 120 ? "…" : ""}
                      </div>
                    )}
                  </div>
                </div>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandGroup heading="Recent Searches">
          {!data &&
            searchHistoryData?.map((chat, index) => {
              return (
                <CommandItem
                  key={index}
                  onSelect={() => handleChatSelect(chat)}
                  className="cursor-pointer flex flex-col items-start gap-1.5 py-3"
                >
                  <div className="flex items-start gap-2 w-full">
                    <Clock className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm leading-tight">
                        {chat.title}
                      </div>
                      {chat.content && (
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {chat.content.slice(0, 120)}
                          {chat.content.length > 120 ? "…" : ""}
                        </div>
                      )}
                    </div>
                  </div>
                </CommandItem>
              );
            })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
