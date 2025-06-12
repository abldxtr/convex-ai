import { Check, CopyIcon, Pencil, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import type { ChatRequestOptions, UIMessage } from "ai";
import { useDirection } from "@/hooks/use-direction";
import { useGlobalstate } from "@/context/global-store";
export function MessageTools({
  message,
  role,
  isLastMessage,
  reload,
}: {
  message: UIMessage;
  role: "user" | "assistant";
  isLastMessage?: boolean;
  reload?: (
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
}) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({
    timeout: 2000,
  });
  const { getError, setGetError } = useGlobalstate();
  // console.log("getError", getError);
  const textPart = message.parts.find((part) => part.type === "text");

  const direction = useDirection(textPart?.text ?? "");
  return (
    <div
      className={cn(
        "mx-auto flex h-[18px] w-full my-2 max-w-(--thread-content-max-width) items-center px-1 opacity-0 transition-all duration-300 [--thread-content-max-width:32rem] @[34rem]:[--thread-content-max-width:40rem] @[64rem]:[--thread-content-max-width:48rem] lg:[--thread-content-max-width:52rem] group-hover/turn-messages:opacity-100",
        direction !== "rtl"
          ? "flex items-center justify-start"
          : "flex items-center justify-end"
      )}
    >
      <Button
        variant="ghost"
        size="smIcon"
        onClick={() => {
          const textPart = message.parts.find((part) => part.type === "text");
          if (textPart && "text" in textPart) {
            copyToClipboard(textPart.text);
          }
        }}
      >
        {isCopied ? <Check /> : <CopyIcon />}
      </Button>
      {/* {role === "user" && (
        <Button variant="ghost" size="smIcon">
          <Pencil />
        </Button>
      )} */}

      {role === "user" && isLastMessage && getError && (
        <Button
          variant="ghost"
          size="smIcon"
          onClick={() => {
            if (reload) {
              reload();
            }
          }}
        >
          <RefreshCw />
        </Button>
      )}
    </div>
  );
}
