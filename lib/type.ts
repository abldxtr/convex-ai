import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { UIMessage } from "ai";
import { Preloaded } from "convex/react";

export type chat = {
  chatItem: {
    _id: Id<"chats">;
    _creationTime: number;
    id: string;
    title: string;
    userId: Id<"users">;
    isDeleted: boolean;
  };
  chatMessages: {
    _id: Id<"vercelAiMessages">;
    _creationTime: number;
    parts?:
      | {
          type: string;
          text: string;
        }[]
      | undefined;
    attachments?:
      | {
          name: string;
          url: string;
          contentType: "image/png" | "image/jpg" | "image/jpeg";
        }
      | undefined;
    userId: Id<"users">;
    chatId: Id<"chats">;
    content: string;
    role: "system" | "user" | "assistant" | "data";
    createdAt: number;
  }[];
} | null;

export type ChatItem = {
  _id: Id<"chats">;
  _creationTime: number;
  id: string;
  title: string;
  userId: Id<"users">;
  isDeleted: boolean;
};

export type ChatMessage = {
  _id: Id<"vercelAiMessages">;
  id: string;
  _creationTime: number;
  parts?: { text: string; type: string }[];
  attachments?: {
    name: string;
    url: string;
    contentType: "image/png" | "image/jpg" | "image/jpeg";
  };
  role: "system" | "user" | "assistant" | "data";
  content: string;
  userId: Id<"users">;
  chatId: Id<"chats">;
  createdAt: number;
};

export type ChatClientProps = {
  chatItem: ChatItem;
  chatMessages: Array<UIMessage>;
  preloaded: Preloaded<typeof api.chat.getChatById>;
  // chatId: string;
};

export type ChatClientPropsPartial = Partial<ChatClientProps>;

export type UserType = Doc<"users"> | null;

export type clientGetChatMessages =
  | {
      chatItem: {
        _id: Id<"chats">;
        _creationTime: number;
        id: string;
        title: string;
        userId: Id<"users">;
        isDeleted: boolean;
      };
      chatMessages: {
        _id: Id<"vercelAiMessages">;
        _creationTime: number;
        parts?:
          | {
              type: string;
              text: string;
            }[]
          | undefined;
        attachments?:
          | {
              name: string;
              url: string;
              contentType: "image/png" | "image/jpg" | "image/jpeg";
            }
          | undefined;
        id: string;
        createdAt: number;
        content: string;
        role: "data" | "system" | "user" | "assistant";
        userId: Id<"users">;
        chatId: Id<"chats">;
      }[];
    }
  | null
  | undefined;
