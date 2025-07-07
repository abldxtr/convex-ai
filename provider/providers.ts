import {
  wrapLanguageModel,
  customProvider,
  extractReasoningMiddleware,
} from "ai";

import { createOpenAI } from "@ai-sdk/openai";
import { openrouter, createOpenRouter } from "@openrouter/ai-sdk-provider";
import { google } from "@ai-sdk/google";
import { vertex } from "@ai-sdk/google-vertex";

// import { xai } from "@ai-sdk/xai";
// import { groq } from "@ai-sdk/groq";
// import { google } from "@ai-sdk/google";
// import { anthropic } from "@ai-sdk/anthropic"

export const openai = createOpenAI({
  compatibility: "strict",
  apiKey: process.env.OPENAI_API_KEY,
  // baseURL: "https://api.chatanywhere.tech/v1",
  // baseURL: "https://api.chatanywhere.org/v1",
  baseURL: "https://api.sambanova.ai/v1",
});

export const openAiChina = createOpenAI({
  compatibility: "strict",
  apiKey: process.env.OPENAI_API_KEY_CHINA,
  baseURL: "https://api.chatanywhere.org/v1",
});

export const openRouter = createOpenRouter({
  compatibility: "strict",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const middleware = extractReasoningMiddleware({
  tagName: "think",
});
//mamad custom ai provider
export const mmd = customProvider({
  languageModels: {
    "mmd-meta-llama": openRouter.chat("meta-llama/llama-3.2-3b-instruct:free"),
    "mmd-google-own": google("gemini-1.5-flash"),
    "mmd-qwen-2.5": openRouter.chat("qwen/qwen-2.5-7b-instruct:free"),
    "mmd-google": openRouter.chat("google/gemini-2.0-flash-exp:free"),
    "mmd-DeepSeek-V3-0324": openai("DeepSeek-V3-0324"),
    "mmd-gpt-4o": openAiChina("gpt-4o"),
    "mmd-Meta-Llama-3.1-8B-Instruct": openai("Meta-Llama-3.1-8B-Instruct"),

    "mmd-Llama-4-Maverick-17B-128E-Instruct": openai(
      "Llama-4-Maverick-17B-128E-Instruct"
    ),
    "mmd-Meta-Llama-3.3-70B-Instruct": openai("Meta-Llama-3.3-70B-Instruct"),
    // "mmd-E5-Mistral-7B-Instruct": openai.embedding(
    //   "E5-Mistral-7B-Instruct"
    // ),

    "mmd-mistral": openRouter.chat("mistralai/mistral-7b-instruct:free"),
    "mmd-meta-llama/llama-3.3-8b-instruct:free": openRouter.chat(
      "meta-llama/llama-3.3-8b-instruct:free"
    ),
    "mmd-meta-llama/llama-4-scout": openRouter.chat(
      "meta-llama/llama-4-scout:free"
    ),
    "mmd-4o": openAiChina("gpt-4o", {
      structuredOutputs: true,
    }),
    "mmd-o4-mini": openai.responses("o4-mini-2025-04-16"),
    "mmd-meta-llama/llama-3.2-11b-vision-instruct:free": openRouter.chat(
      "meta-llama/llama-3.2-11b-vision-instruct:free"
    ),
    "mmd-google/gemini-2.0-flash-exp:free": openRouter.chat(
      "google/gemini-2.0-flash-exp:free"
    ),
  },
});
