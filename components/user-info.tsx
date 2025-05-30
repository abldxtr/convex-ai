"use client";

import { useQuery } from "convex/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { api } from "@/convex/_generated/api";

export default function UserInfo() {
  const [streamedText, setStreamedText] = useState("");
  // const getMessages = useQuery(api.agent.getMessagesByThreadId, {
  //   threadId: "ks775p0gkb4rstnpea0wft4e4h7g4yjb",
  // });

  const getMessages = useQuery(api.chat.getThreadMessages, {
    threadId: "ks71t87b3vx77hxbytb2fh25rd7g7rjj",
  });

  // // console.log(getMessages?.page[0]);
  const convexChat = async () => {
    const response = await fetch("http://localhost:3000/api/convexai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: "say something in english in 10 words about the moon",
        threadId: "ks71t87b3vx77hxbytb2fh25rd7g7rjj",
      }),
    });

    if (!response.body) {
      console.error("No stream body");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const matches = chunk.match(/"content":"(.*?)"/g);
      const result =
        matches?.map((m) => m.replace(/"content":"|"/g, "")).join("") ?? "";
      // console.log(result);
      // // console.log("chunk", chunk);
      setStreamedText((prev) => prev + result);
    }
  };

  return (
    <div>
      <p>User Info</p>
      <div className="flex flex-col gap-4">
        <button onClick={convexChat}>Convex Chat</button>
        <div className="mt-4 border p-2 whitespace-pre-wrap">
          {streamedText}
        </div>
        <div>DB DB</div>
        <div className="mt-4 border p-2 whitespace-pre-wrap">
          {getMessages?.page
            .slice() // کپی کردن برای جلوگیری از تغییر اصل داده
            .reverse() // برعکس کردن آرایه
            .map((message) => {
              const role = message.message?.role;
              const content = message.message?.content;

              const renderContent = () => {
                if (!content) return null;

                if (typeof content === "string") {
                  return <p>{content}</p>;
                }

                return content.map((item, index) => {
                  if (item.type === "text") {
                    return <p key={index}>{item.text}</p>;
                  }
                  if (item.type === "image" && typeof item.image === "string") {
                    return (
                      <img
                        key={index}
                        src={item.image}
                        alt="Image message"
                        className="max-w-xs rounded"
                      />
                    );
                  }
                  if (item.type === "file" && typeof item.data === "string") {
                    return (
                      <a
                        key={index}
                        href={item.data}
                        download
                        className="text-blue-500 underline"
                      >
                        Download file
                      </a>
                    );
                  }
                  return null;
                });
              };

              return (
                <div
                  key={message._id}
                  className={cn(
                    "rounded p-2 text-white",
                    role === "user" ? "bg-blue-600" : "bg-green-600"
                  )}
                >
                  <p className="text-sm opacity-70">{role}</p>
                  {renderContent()}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
