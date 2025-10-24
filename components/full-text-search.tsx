"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useGlobalState } from "@/context/global-state-zus";
import { SquarePen, Clock, MessageSquare, Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";

interface ChatResult {
  id: string;
  title: string;
  content?: string;
}

export default function FullTextSearch() {
  const { openSearchBar, setOpenSearchBar } = useGlobalState();
  const [search, setSearch] = useState("");
  const router = useRouter();
  const setSearchHistory = useMutation(api.search.setSearchHistory);
  const searchHistory = useQuery(api.search.getSearchHistory);

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

  const searchRes = useQuery(api.chat.searchBody, {
    searchText: search.trim(),
  });

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

  const handleChatSelect = async (chat: ChatResult, save: boolean) => {
    try {
      setOpenSearchBar(false);
      router.push(`/chat/${chat.id}`);
      if (save) {
        await setSearchHistory({
          id: chat.id,
          title: chat.title,
          content: chat.content || "",
          searchText: search,
        });
      }
      setSearch("");
      setData(null);
    } catch (error) {
      console.error("Failed to save search history:", error);
      setOpenSearchBar(false);
      setSearch("");
      router.push(`/chat/${chat.id}`);
      setData(null);
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
    <Dialog
      open={openSearchBar}
      onOpenChange={(open) => {
        setOpenSearchBar(open);
        if (!open) {
          setData(null);
        }
      }}
    >
      <DialogContent className="p-0 gap-0 max-w-2xl">
        <DialogTitle className="sr-only">Search Chats</DialogTitle>

        {/* Search Input Section */}
        <div className="relative border-b">
          <Input
            placeholder="Search chats..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value.length === 0) {
                setData(null);
              }
            }}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 text-base"
            autoFocus
          />
          {searchRes === undefined && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="max-h-[400px] overflow-y-auto">
          {/* New Chat Button */}
          <div className="border-b">
            <button
              onClick={() => {
                setOpenSearchBar(false);
                setSearch("");
                router.push(`/chat/`);
              }}
              className="w-full flex items-center gap-2 px-4 py-3 hover:bg-accent transition-colors text-left"
            >
              <SquarePen className="size-4 text-muted-foreground" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Search Results */}
          {data && data.length > 0 && (
            <div className="py-2">
              {data.map((chat, index) => (
                <button
                  key={index}
                  onClick={() => handleChatSelect(chat, true)}
                  className="w-full flex flex-col items-start gap-1.5 px-4 py-3 hover:bg-accent transition-colors text-left"
                >
                  <div className="flex items-start gap-2 w-full">
                    <MessageSquare className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm leading-tight">
                        {highlightText(chat.title, search)}
                      </div>
                      {chat.content && (
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {highlightText(chat.content.slice(0, 120), search)}
                          {chat.content.length > 120 ? "…" : ""}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {(data === undefined || data === null) &&
            searchHistoryData &&
            searchHistoryData.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-medium text-muted-foreground">
                  Recent Searches
                </div>
                {searchHistoryData.map((chat, index) => (
                  <button
                    key={index}
                    onClick={() => handleChatSelect(chat, false)}
                    className="w-full flex flex-col items-start gap-1.5 px-4 py-3 hover:bg-accent transition-colors text-left"
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
                  </button>
                ))}
              </div>
            )}

          {/* Empty State */}
          {data && data.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No results found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
