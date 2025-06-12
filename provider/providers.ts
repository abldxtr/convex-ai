import {
  wrapLanguageModel,
  customProvider,
  extractReasoningMiddleware,
} from "ai";

import { openai } from "@ai-sdk/openai";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { google } from "@ai-sdk/google";
import { vertex } from "@ai-sdk/google-vertex";

// import { xai } from "@ai-sdk/xai";
// import { groq } from "@ai-sdk/groq";
// import { google } from "@ai-sdk/google";
// import { anthropic } from "@ai-sdk/anthropic"

const middleware = extractReasoningMiddleware({
  tagName: "think",
});
//mamad custom ai provider
export const mmd = customProvider({
  languageModels: {
    "mmd-meta-llama": openrouter.chat("meta-llama/llama-3.2-3b-instruct:free"),
    "mmd-google-own": google("gemini-1.5-flash"),
    "mmd-qwen-2.5": openrouter.chat("qwen/qwen-2.5-7b-instruct:free"),
    "mmd-google": openrouter.chat("google/gemini-2.0-flash-exp:free"),
    "mmd-deepseek": openrouter.chat("deepseek/deepseek-r1-0528:free"),
    "mmd-mistral": openrouter.chat("mistralai/mistral-7b-instruct:free"),
    "mmd-meta-llama/llama-3.3-8b-instruct:free": openrouter.chat(
      "meta-llama/llama-3.3-8b-instruct:free"
    ),
    "mmd-meta-llama/llama-4-scout": openrouter.chat(
      "meta-llama/llama-4-scout:free"
    ),
    "mmd-4o": openai("gpt-4o", {
      structuredOutputs: true,
    }),
    "mmd-o4-mini": openai.responses("o4-mini-2025-04-16"),
    "mmd-meta-llama/llama-3.2-11b-vision-instruct:free": openrouter.chat(
      "meta-llama/llama-3.2-11b-vision-instruct:free"
    ),
    "mmd-google/gemini-2.0-flash-exp:free": openrouter.chat(
      "google/gemini-2.0-flash-exp:free"
    ),
  },
});
