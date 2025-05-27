import { httpRouter } from "convex/server";
import { auth } from "./auth";
import {
  corsRouter,
  DEFAULT_EXPOSED_HEADERS,
} from "convex-helpers/server/cors";
import { sendMessageHttpStream } from "./agent";
import { postMessage } from "./example";
// import { streamChat } from "./chat";
import { httpAction } from "./_generated/server";
const http = httpRouter();

// auth.addHttpRoutes(http);
// const cors = corsRouter(http, {
//   allowCredentials: true,
//   allowedHeaders: ["Authorization", "Content-Type"],
// });

http.route({
  path: "/streamText",
  method: "POST",
  handler: sendMessageHttpStream,
  //   exposedHeaders: [...DEFAULT_EXPOSED_HEADERS, "Message-Id"],
});

http.route({
  path: "/postMessage",
  method: "POST",
  handler: postMessage,
});
// http.route({
//   path: "/chat-stream",
//   method: "POST",
//   handler: streamChat,
// });
http.route({
  path: "/chat-stream",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => {
    const headers = request.headers;
    if (
      headers.get("Origin") !== null &&
      headers.get("Access-Control-Request-Method") !== null &&
      headers.get("Access-Control-Request-Headers") !== null
    ) {
      return new Response(null, {
        headers: new Headers({
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type, Digest",
          "Access-Control-Max-Age": "86400",
        }),
      });
    } else {
      return new Response();
    }
  }),
});
export default http;
