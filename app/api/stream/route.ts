// import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";

// export async function POST(request: NextRequest) {
//   const { prompt, threadId } = await request.json();
//   const token = await convexAuthNextjsToken();
//   // console.log({ token });

//   const response = await fetch(
//     "https://aware-barracuda-585.convex.site/streamText",
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ prompt, threadId }),
//     }
//   );
//   //   const data = await response.json();
//   // console.log(response);

//   return NextResponse.json({
//     message: "Hello, world!",
//   });
// }

// باید پاک شود.
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const chatId = req.nextUrl.searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json(
        { error: "chatId is required" },
        { status: 400 }
      );
    }

    const token = await convexAuthNextjsToken();

    const chat = await fetchQuery(
      api.chat.getChatById,
      { id: chatId },
      { token }
    );

    return NextResponse.json({ chat }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
