import { createDataStreamResponse, smoothStream, type CoreMessage } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";

export async function POST(req: Request) {
  const { messages, input } = await req.json();
  console.log({ messages, input });

  return createDataStreamResponse({
    execute: (dataStream) => {
      // step 1: get the model
      const result1 = streamText({
        model: openrouter.chat("opengvlab/internvl3-14b:free"),
        system: "extract the user goal from the conversation",
        messages: [
          {
            role: "user",
            content: "درباره لیون مسی 3 خط بنویس",
          },
        ],
      });

      result1.mergeIntoDataStream(dataStream, {
        experimental_sendFinish: false,
      });

      // step 2: stream the result
      const result2 = streamText({
        model: openrouter.chat("meta-llama/llama-3.2-3b-instruct:free"),
        system: "generate a plan to achieve the user goal",
        messages: messages,
      });

      result2.mergeIntoDataStream(dataStream, {
        experimental_sendFinish: true,
      });
    },
  });
}

// const result = streamText({
//     model: openrouter.chat("opengvlab/internvl3-14b:free"),
//     messages: [
//       {
//         role: "user",
//         content: [
//           {
//             type: "text",
//             text: messages,
//           },
//         ],
//       },
//     ],
//     experimental_transform: smoothStream({
//       delayInMs: 30, // optional: defaults to 10ms
//       chunking: "word", // optional: defaults to 'word'
//     }),
//     onFinish: (result) => {
//       console.log(result);
//     },
//   });

//   return result.toDataStreamResponse();
