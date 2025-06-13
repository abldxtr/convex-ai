import { cn } from "@/lib/utils";
import { ErrorIcon } from "./icons";
import { ChatRequestOptions } from "ai";

export default function ErroMessageAi({
  reload,
}: {
  reload: (
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
}) {
  return (
    <div className=" flex items-center  gap-2 md:gap-2   rounded-2xl border text-sm px-3 py-2.5 md:p-4 mb-2 w-fit self-start bg-[rgba(250,59,56,0.05)]  ">
      {/* 1 */}
      <div className="  text-[#f93a37] shrink-0  ">
        <ErrorIcon />
      </div>

      {/* 2 */}
      <div className=" text-[#f93a37] md:text-[14px] text-[10px]  ">
        Something went wrong, please try reloading the conversation.
      </div>

      {/* 3 */}
      {/* const reload: (chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>
Reload the last AI chat response for the given chat history. If the last message isn't from the assistant, it will request the API to generate a new response.

reload: (chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>; */}
      <div
        className=" hidden md:flex px-3 py-1 border border-gray-400 rounded-full bg-white cursor-pointer   "
        onClick={() => reload()}
      >
        retry
      </div>
    </div>
  );
}

export function AIMessageError({
  reload,
}: {
  reload: (
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
}) {
  return (
    <div
      className={cn(
        "group/turn-messages mx-auto max-w-(--thread-content-max-width) [--thread-content-max-width:32rem] @[34rem]:[--thread-content-max-width:40rem] @[64rem]:[--thread-content-max-width:48rem] lg:[--thread-content-max-width:52rem] "
      )}
    >
      <div
        className="gap-4 rounded-3xl px-5  text-base focus-visible:outline-hidden md:gap-5 lg:gap-6"
        dir="auto"
      >
        <div
          dir="auto"
          className={cn("relative", {
            // "mb-10": true && true,
          })}
        >
          <ErroMessageAi reload={reload} />
        </div>
      </div>
    </div>
  );
}
