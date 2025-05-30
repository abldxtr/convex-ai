import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { createDataStream } from "ai";
import { generateUUID } from "@/lib/utils";

export async function POST(req: Request) {
  const { prompt, threadId } = await req.json();
  const token = await convexAuthNextjsToken();

  const streamId = generateUUID();

  const stream = createDataStream({
    async execute(dataStream) {
      try {
        // console.log("Fetching from Convex...");
        const convexRes = await fetch(
          "https://aware-barracuda-585.convex.site/streamText",

          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // اطمینان حاصل کنید که توکن معتبر استفاده می‌کنید
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ prompt, threadId }),
          }
        );

        // console.log("Convex response status:", convexRes.status);

        if (!convexRes.ok || !convexRes.body) {
          console.error("Stream not available:", convexRes.statusText);
          // throw new Error(`Stream not available: ${convexRes.statusText}`);
          return;
        }

        const reader = convexRes.body.getReader();
        const decoder = new TextDecoder();

        // console.log("Starting to read stream");
        while (true) {
          const { done, value } = await reader.read();
          // // console.log({ done, value: value ? `${value.length} bytes` : null });

          if (done) {
            // console.log("Stream completed");
            break;
          }

          const textChunk = decoder.decode(value, { stream: true });
          // // console.log(
          //   "Decoded chunk:",
          //   textChunk.substring(0, 50) + (textChunk.length > 50 ? "..." : ""),
          // );

          // برای جریان متن ساده به مشتری
          dataStream.writeData({ content: textChunk });
        }
      } catch (error) {
        console.error("Error in stream processing:", error);
        throw error;
      }
    },

    onError(error) {
      console.error("Stream error handler:", error);
      return (
        "خطا در دریافت پاسخ استریم: " +
        (error instanceof Error ? error.message : String(error))
      );
    },
  });

  // console.log("Returning stream response");
  return new Response(stream);
}

// IMG model: "opengvlab/internvl3-14b:free",
// TEXT model: "meta-llama/llama-3.2-3b-instruct:free"

// const result = streamText({
//   model: openrouter.chat("opengvlab/internvl3-14b:free"),
//   messages: [
//     {
//       role: "user",
//       content: [
//         {
//           type: "image",
//           image: new URL(
//             "https://www.famousbirthdays.com/faces/jean-elsa-image.jpg",
//           ),
//         },
//       ],
//     },
//   ],
//   experimental_transform: smoothStream({
//     delayInMs: 30, // optional: defaults to 10ms
//     chunking: "word", // optional: defaults to 'word'
//   }),
//   onFinish: (result) => {
//     // console.log(result);
//   },
// });
