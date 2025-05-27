import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { prompt, threadId } = await request.json();
  const token = await convexAuthNextjsToken();
  console.log({ token });

  const response = await fetch(
    "https://aware-barracuda-585.convex.site/streamText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ prompt, threadId }),
    }
  );
  //   const data = await response.json();
  console.log(response);

  return NextResponse.json({
    message: "Hello, world!",
  });
}
