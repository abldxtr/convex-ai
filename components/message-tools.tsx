import { Check, Copy, Pencil, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import type { ChatRequestOptions, UIMessage } from "ai";
import { useDirection } from "@/hooks/use-direction";
// import { useGlobalstate } from "@/context/global-store";
import { useGlobalState } from "@/context/global-state-zus";

import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"; // Removed TooltipProvider as it should be higher up

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
  const { getError } = useGlobalState();

  const textPart = message.parts.find((part) => part.type === "text");
  const messageText = textPart?.text ?? "";
  const direction = useDirection(messageText);

  return (
    <div
      className={cn(
        "mx-auto flex h-[18px] w-full my-2 items-center px-1 opacity-0 transition-all duration-300 containerW group-hover/turn-messages:opacity-100",
        direction !== "rtl"
          ? "flex items-center justify-start"
          : "flex items-center justify-end"
      )}
    >
      {/* Copy Button with Tooltip */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="smIcon"
            onClick={() => {
              if (messageText) {
                copyToClipboard(messageText);
              }
            }}
          >
            {isCopied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isCopied ? "Copied!" : "Copy to clipboard"}
        </TooltipContent>
      </Tooltip>

      {/* Edit Button (commented out in original, but added for completeness with tooltip) */}
      {/* {role === "user" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="smIcon">
              <Pencil className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Edit message
          </TooltipContent>
        </Tooltip>
      )} */}

      {/* Regenerate Button with Tooltip */}
      {role === "user" && isLastMessage && getError && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="smIcon"
              onClick={() => {
                if (reload) {
                  reload();
                }
              }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Regenerate response</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
