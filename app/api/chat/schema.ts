import { z } from "zod";
import {
  appendClientMessage,
  createDataStream,
  smoothStream,
  streamText,
  type UIMessage,
  type Message,
} from "ai";

const textPartSchema = z.object({
  text: z.string().min(1).max(2000),
  type: z.enum(["text"]),
});

// aaaa: {
//   id: '«r4»',
//   message: {
//     id: 'V9l0UTKpZabUpbOv',
//     createdAt: '2025-05-19T04:06:27.440Z',
//     role: 'user',
//     content: 'ببب',
//     parts: [Array]
//   }
// }

export const postRequestBodyExtendedSchema = z.object({
  id: z.string().uuid(),
  message: z.object({
    id: z.string().uuid(),
    createdAt: z.coerce.date(),
    role: z.enum(["user"]),
    content: z.string().min(1).max(2000),
    parts: z.array(textPartSchema),
    experimental_attachments: z
      .array(
        z.object({
          url: z.string().url(),
          name: z.string().min(1).max(2000),
          contentType: z.enum(["image/png", "image/jpg", "image/jpeg"]),
        })
      )
      .optional(),
  }),
  selectedChatModel: z.enum(["chat-model", "chat-model-reasoning"]),
  selectedVisibilityType: z.enum(["public", "private"]),
});
export const postRequestBodySchema = z.object({
  id: z.string().uuid(),
  messages: z.object({
    id: z.string().uuid(),
    createdAt: z.coerce.date(),
    role: z.enum(["user"]),
    content: z.string().min(1).max(2000),
    parts: z.array(textPartSchema),
  }),
});

export type PostRequestBody = z.infer<typeof postRequestBodySchema>;
export type PostRequestBodyExtended = z.infer<
  typeof postRequestBodyExtendedSchema
>;
