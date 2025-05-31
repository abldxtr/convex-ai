import { Attachment } from "ai";
import { UIMessage } from "ai";
import { ChatMessage } from "./type";

export function convertToUIMessages(messages: ChatMessage[]): Array<UIMessage> {
  return messages.map((message: ChatMessage) => ({
    id: message.id,
    parts: message.parts as UIMessage["parts"],
    role: message.role as UIMessage["role"],
    content: "",
    createdAt: new Date(message.createdAt),
    experimental_attachments: message.attachments
      ? [message.attachments as Attachment]
      : [],
  }));
}
