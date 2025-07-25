"use server";

import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateText, type UIMessage } from "ai";
import { cookies } from "next/headers";
// import {
//   createResumableStreamContext,
//   type ResumableStreamContext,
// } from "resumable-stream";

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set("chat-model", model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  const { text: title } = await generateText({
    model: openrouter.chat("meta-llama/llama-3.2-3b-instruct:free"),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}
