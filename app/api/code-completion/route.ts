import { mmd } from "@/provider/providers";
import { openai } from "@ai-sdk/openai";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { type LanguageModelV1, streamText } from "ai";

import { NextResponse, type NextRequest } from "next/server";

export const maxDuration = 30;

// import { CompletionCopilot, type CompletionRequestBody } from "monacopilot";

// const copilot = new CompletionCopilot(process.env.MISTRAL_API_KEY, {
//   provider: "mistral",
//   model: "codestral",
// });

// export async function POST(req: NextRequest) {
//   const body: CompletionRequestBody = await req.json();
//   const completion = await copilot.complete({
//     body,
//   });

//   return NextResponse.json(completion, { status: 200 });
// }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const searchParams = request.nextUrl.searchParams;
    const _model = searchParams.get("model");
    console.log({ body });

    const prompt = `
<context>
${body.textBeforeCursor}
</context>
<input>${body.textBeforeCursor}</input>
`;

    const result = streamText({
      model: mmd.languageModel(
        body.model ?? "meta-llama/llama-3.2-3b-instruct:free"
      ),
      prompt: `
      <task>
      You are an autocompletion system that suggests text completions.
      Your name is text0.

      Rules:
      - USE the provided context in <context> tags
      - Read CAREFULLY the input text in <input> tags
      - Suggest up to 10 words maximum
      - Ensure suggestions maintain semantic meaning
      - Wrap completion in <completion> tags
      - Return only the completion text
      - Periods at the end of the completion are OPTIONAL, not fully required
      </task>

      <example>
      <context>Math Academy is a challenging but rewarding platform for learning math.</context>
      <input>Math Academy teaches</input>
      <completion> math in a fun and engaging way.</completion>
      </example>

     <context>${body.textBeforeCursor}</context>
     <input>${body.textBeforeCursor}</input>

      Your completion:
    `,
      temperature: 0.75,
      maxTokens: 50,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
