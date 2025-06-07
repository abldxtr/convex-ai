// import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
// import { appendClientMessage, streamText, type Message } from "ai";
// import { NextResponse } from "next/server";
// import { fetchMutation, fetchQuery, fetchAction } from "convex/nextjs";
// import { api } from "@/convex/_generated/api";
// import { mmd } from "@/provider/providers";
// import { smoothStream } from "some-smooth-stream-package"; // Declare the smoothStream variable
// import { Id } from "@/convex/_generated/dataModel";

// // Types
// interface ChatRequestBody {
//   chatId: string;
//   message: {
//     id?: string;
//     content: string;
//     role: string;
//     createdAt: string;
//     parts: Array<{ type: string; text: string }>;
//   };
//   model?: string;
// }

// interface DatabaseMessage {
//   createdAt: string;
//   role: string;
//   content: string;
//   parts: Array<{ type: string; text: string }>;
// }

// // Constants
// const DEFAULT_MODEL = "meta-llama/llama-3.2-3b-instruct:free";
// const SYSTEM_PROMPT =
//   "You are a helpful assistant that can answer questions and help with tasks. the output must be in markdown format.";
// const SMOOTH_STREAM_CONFIG = {
//   delayInMs: 20,
//   chunking: "word" as const,
// };

// export const maxDuration = 60;

// // Helper Functions
// function convertDbMessagesToAiMessages(
//   dbMessages: DatabaseMessage[]
// ): Omit<Message, "id">[] {
//   return dbMessages.map((msg) => ({
//     createdAt: new Date(msg.createdAt),
//     role: msg.role as "user" | "assistant",
//     content: msg.content,
//     parts: msg.parts,
//   }));
// }

// async function saveUserMessage(
//   chatId: string,
//   userId: string,
//   message: ChatRequestBody["message"],
//   token: string
// ) {
//   return fetchMutation(
//     api.vercel.createVercelAiMessage,
//     {
//       chatId: chatId as Id<"chats">,
//       userId: userId as Id<"users">,
//       id: message.id || crypto.randomUUID(),
//       content: message.content,
//       role: "user",
//       parts: [{ type: "text", text: message.content }],
//     },
//     { token }
//   );
// }

// async function saveAssistantMessage(
//   chatId: string,
//   userId: string,
//   content: string,
//   token: string
// ) {
//   return fetchMutation(
//     api.vercel.createVercelAiMessage,
//     {
//       chatId: chatId as Id<"chats">,
//       userId: userId as Id<"users">,
//       id: crypto.randomUUID(),
//       content,
//       role: "assistant",
//       parts: [{ type: "text", text: content }],
//     },
//     { token }
//   );
// }

// async function getOrCreateChat(
//   chatId: string,
//   message: ChatRequestBody["message"],
//   userId: string,
//   token: string
// ) {
//   const existingChat = await fetchQuery(
//     api.chat.getChatById,
//     { id: chatId },
//     { token }
//   );

//   if (existingChat?.chatItem) {
//     return { chatId: existingChat.chatItem._id, isNew: false };
//   }

//   // Create new chat
//   const newChat = await fetchAction(api.agent.createThread, {
//     prompt: message.content,
//     id: chatId,
//     userId: userId as Id<"users">,
//     isDeleted: false,
//   });

//   if (!newChat) {
//     throw new Error("Failed to create chat");
//   }

//   return { chatId: newChat.chatId, isNew: true };
// }

// async function getPreviousMessages(chatId: string, token: string) {
//   return fetchQuery(
//     api.vercel.getVercelAiMessages,
//     {
//       chatId: chatId as Id<"chats">,
//     },
//     { token }
//   );
// }

// async function createStreamResponse(
//   messages: Omit<Message, "id">[],
//   userMessage: ChatRequestBody["message"],
//   model: string,
//   chatId: string,
//   userId: string,
//   token: string
// ) {
//   const allMessages = appendClientMessage({
//     messages: messages as Message[],
//     message: userMessage,
//   });

//   const result = streamText({
//     model: mmd.languageModel(model),
//     messages: allMessages,
//     system: SYSTEM_PROMPT,
//     experimental_transform: smoothStream(SMOOTH_STREAM_CONFIG),
//     onFinish: async (result) => {
//       try {
//         await saveAssistantMessage(chatId, userId, result.text, token);
//       } catch (error) {
//         console.error("Failed to save assistant message:", error);
//       }
//     },
//   });

//   return result.toDataStreamResponse();
// }

// // Main Handler
// export async function POST(req: Request) {
//   try {
//     const body: ChatRequestBody = await req.json();
//     console.log("Model:", body.model);

//     // Authentication
//     const token = await convexAuthNextjsToken();
//     const user = await fetchQuery(api.user.getUser, {}, { token });

//     if (!user || !token) {
//       return NextResponse.json({ error: "User not found" }, { status: 401 });
//     }

//     // Get or create chat
//     const { chatId, isNew } = await getOrCreateChat(
//       body.chatId,
//       body.message,
//       user._id,
//       token
//     );

//     // Save user message
//     await saveUserMessage(chatId, user._id, body.message, token);

//     // Get previous messages
//     const previousMessages = await getPreviousMessages(chatId, token);

//     // Convert to AI SDK format
//     const messages =
//       previousMessages && previousMessages.length > 0
//         ? convertDbMessagesToAiMessages(previousMessages)
//         : [
//             {
//               createdAt: new Date(body.message.createdAt),
//               role: body.message.role,
//               content: body.message.content,
//               parts: body.message.parts,
//             },
//           ];

//     // Create and return stream response
//     const model = body.model || DEFAULT_MODEL;
//     return createStreamResponse(
//       messages,
//       body.message,
//       model,
//       chatId,
//       user._id,
//       token
//     );
//   } catch (error) {
//     console.error("Chat API error:", error);

//     if (error instanceof Error && error.message === "Failed to create chat") {
//       return NextResponse.json({ error: "Chat not found" }, { status: 401 });
//     }

//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
