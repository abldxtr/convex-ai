import React, { useState, useCallback } from "react";
// import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
// import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
// import { motion } from "framer-motion";
import {
  AlignLeft,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Download,
  X,
  ExternalLink,
  Maximize2,
  FileText,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  type TextUIPart,
  type ReasoningUIPart,
  type ToolInvocationUIPart,
  type SourceUIPart,
} from "@ai-sdk/ui-utils";
import {
  MarkdownRenderer,
  preprocessLaTeX,
} from "@/components/markdown-advance";

// Define MessagePart type
type MessagePart =
  | TextUIPart
  | ReasoningUIPart
  | ToolInvocationUIPart
  | SourceUIPart;

interface MessageProps {
  message: any;
  index: number;
  lastUserMessageIndex: number;
  isEditingMessage: boolean;
  editingMessageIndex: number;
  input: string;
  setInput: (value: string) => void;
  setIsEditingMessage: (value: boolean) => void;
  setEditingMessageIndex: (value: number) => void;
  renderPart: (
    part: MessagePart,
    messageIndex: number,
    partIndex: number,
    parts: MessagePart[],
    message: any
  ) => React.ReactNode;
  status: string;
  messages: any[];
  setMessages: (messages: any[]) => void;
  append: (message: any, options?: any) => Promise<string | null | undefined>;
  reload: () => Promise<string | null | undefined>;
  setSuggestedQuestions: (questions: string[]) => void;
  suggestedQuestions: string[];
}

// Max height for collapsed user messages (in pixels)
const USER_MESSAGE_MAX_HEIGHT = 100;

export const Message: React.FC<MessageProps> = ({
  message,
  index,
  lastUserMessageIndex,
  isEditingMessage,
  editingMessageIndex,
  input,
  setInput,
  setIsEditingMessage,
  setEditingMessageIndex,
  renderPart,
  status,
  messages,
  setMessages,
  append,
  reload,
  setSuggestedQuestions,
  suggestedQuestions,
}) => {
  // State for expanding/collapsing long user messages
  const [isExpanded, setIsExpanded] = useState(false);
  // State to track if the message exceeds max height
  const [exceedsMaxHeight, setExceedsMaxHeight] = useState(false);
  // Ref to check content height
  const messageContentRef = React.useRef<HTMLDivElement>(null);
  // Local edit state to avoid conflicts with global input
  const [editContent, setEditContent] = useState("");

  // Check if message content exceeds max height
  React.useEffect(() => {
    if (messageContentRef.current) {
      const contentHeight = messageContentRef.current.scrollHeight;
      setExceedsMaxHeight(contentHeight > USER_MESSAGE_MAX_HEIGHT);
    }
  }, [message.content]);

  // Initialize edit content when editing starts
  React.useEffect(() => {
    if (isEditingMessage && editingMessageIndex === index) {
      setEditContent(message.content);
    }
  }, [isEditingMessage, editingMessageIndex, index, message.content]);

  // Move handlers inside the component
  const handleMessageEdit = useCallback(
    (index: number) => {
      setIsEditingMessage(true);
      setEditingMessageIndex(index);
      setEditContent(messages[index].content);
    },
    [messages, setIsEditingMessage, setEditingMessageIndex]
  );

  const handleMessageUpdate = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (editContent.trim()) {
        // Get the history *before* the message being edited
        const historyBeforeEdit = messages.slice(0, editingMessageIndex);

        // Get the original message to preserve attachments if any
        const originalMessage = messages[editingMessageIndex];

        // Update the hook's message state to remove messages after the edited one
        setMessages(historyBeforeEdit);

        // Clear the input field immediately
        setEditContent("");

        // Reset suggested questions
        setSuggestedQuestions([]);

        // Extract attachments from the original message
        const attachments = originalMessage?.experimental_attachments ?? [];

        // Append the edited message with proper attachments using chatRequestOptions format
        void append(
          {
            role: "user", // Role is always 'user' for edited messages
            content: editContent.trim(),
          },
          {
            experimental_attachments: attachments,
          }
        );

        // Reset editing state
        setIsEditingMessage(false);
        setEditingMessageIndex(-1);
      } else {
        toast.error("Please enter a valid message.");
      }
    },
    [
      editContent,
      messages,
      editingMessageIndex,
      setMessages,
      append,
      setSuggestedQuestions,
      setIsEditingMessage,
      setEditingMessageIndex,
    ]
  );

  const handleCancelEdit = useCallback(() => {
    setIsEditingMessage(false);
    setEditingMessageIndex(-1);
    setEditContent("");
  }, [setIsEditingMessage, setEditingMessageIndex]);

  const handleSuggestedQuestionClick = useCallback(
    async (question: string) => {
      setSuggestedQuestions([]);

      await append({
        content: question.trim(),
        role: "user",
      });
    },
    [append, setSuggestedQuestions]
  );

  const handleRegenerate = useCallback(async () => {
    if (status !== "ready") {
      toast.error("Please wait for the current response to complete!");
      return;
    }

    const lastUserMessage = messages.findLast((m) => m.role === "user");
    if (!lastUserMessage) return;

    // Remove the last assistant message
    const newMessages = messages.slice(0, -1);
    setMessages(newMessages);
    setSuggestedQuestions([]);

    // Resubmit the last user message
    await reload();
  }, [status, messages, setMessages, reload, setSuggestedQuestions]);

  if (message.role === "user") {
    return (
      <div
        // initial={{ opacity: 0, y: 20 }}
        // animate={{ opacity: 1, y: 0 }}
        // transition={{ duration: 0.5 }}
        className="mb-0! px-0"
      >
        <div className="min-w-0 grow">
          {isEditingMessage && editingMessageIndex === index ? (
            <form onSubmit={handleMessageUpdate} className="group w-full">
              <div className="relative">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  autoFocus
                  className="focus:ring-primary min-h-[100px] w-full resize-none rounded-lg border border-neutral-200 bg-white px-4 py-3 pr-14 text-sm leading-relaxed text-neutral-900 focus:ring-1 focus:outline-hidden dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                  placeholder="Edit your message..."
                />

                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-neutral-100 text-neutral-600 shadow-sm hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    disabled={status === "submitted" || status === "streaming"}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleCancelEdit}
                    className="h-8 w-8 rounded-full bg-neutral-100 text-neutral-600 shadow-sm hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    disabled={status === "submitted" || status === "streaming"}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Show attachments in edit mode */}
              {message.experimental_attachments &&
                message.experimental_attachments.length > 0 && (
                  <div className="mt-3">
                    <AttachmentsBadge
                      attachments={message.experimental_attachments}
                    />
                  </div>
                )}
            </form>
          ) : (
            <div className="group relative">
              <div className="relative">
                <div
                  ref={messageContentRef}
                  className={`prose prose-neutral dark:prose-invert prose-p:my-2 prose-pre:my-2 prose-code:before:hidden prose-code:after:hidden relative max-w-none overflow-hidden pr-10 font-normal text-neutral-900 sm:pr-12 dark:text-neutral-100 [&>*]:font-[syne]! [&>*]:text-lg ${!isExpanded && exceedsMaxHeight ? "max-h-[100px]" : ""}`}
                >
                  <MarkdownRenderer
                    content={preprocessLaTeX(message.content)}
                  />

                  {!isExpanded && exceedsMaxHeight && (
                    <div className="from-background pointer-events-none absolute right-0 bottom-0 left-0 h-16 bg-gradient-to-t to-transparent" />
                  )}
                </div>

                {exceedsMaxHeight && (
                  <div className="mt-0.5 flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="h-6 w-6 rounded-full p-0 text-neutral-400 hover:bg-transparent hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300"
                      aria-label={isExpanded ? "Show less" : "Show more"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                )}

                {!isEditingMessage && index === lastUserMessageIndex && (
                  <div className="absolute top-1 -right-2 flex translate-x-2 transform items-center rounded-md border border-neutral-200 bg-white/95 opacity-0 shadow-sm backdrop-blur-sm transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800/95">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMessageEdit(index)}
                      className="hover:text-primary h-7 w-7 rounded-l-md rounded-r-none text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
                      disabled={
                        status === "submitted" || status === "streaming"
                      }
                      aria-label="Edit message"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
                      >
                        <path
                          d="M12.1464 1.14645C12.3417 0.951184 12.6583 0.951184 12.8535 1.14645L14.8535 3.14645C15.0488 3.34171 15.0488 3.65829 14.8535 3.85355L10.9109 7.79618C10.8349 7.87218 10.7471 7.93543 10.651 7.9835L6.72359 9.94721C6.53109 10.0435 6.29861 10.0057 6.14643 9.85355C5.99425 9.70137 5.95652 9.46889 6.05277 9.27639L8.01648 5.34897C8.06455 5.25283 8.1278 5.16507 8.2038 5.08907L12.1464 1.14645ZM12.5 2.20711L8.91091 5.79618L7.87266 7.87267L9.94915 6.83442L13.5382 3.24535L12.5 2.20711ZM8.99997 1.49997C9.27611 1.49997 9.49997 1.72383 9.49997 1.99997C9.49997 2.27611 9.27611 2.49997 8.99997 2.49997H4.49997C3.67154 2.49997 2.99997 3.17154 2.99997 3.99997V11C2.99997 11.8284 3.67154 12.5 4.49997 12.5H11.5C12.3284 12.5 13 11.8284 13 11V6.49997C13 6.22383 13.2238 5.99997 13.5 5.99997C13.7761 5.99997 14 6.22383 14 6.49997V11C14 12.3807 12.8807 13.5 11.5 13.5H4.49997C3.11926 13.5 1.99997 12.3807 1.99997 11V3.99997C1.99997 2.61926 3.11926 1.49997 4.49997 1.49997H8.99997Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Button>
                    <Separator
                      orientation="vertical"
                      className="h-5 bg-neutral-200 dark:bg-neutral-700"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        void navigator.clipboard.writeText(message.content);
                        toast.success("Copied to clipboard");
                      }}
                      className="hover:text-primary h-7 w-7 rounded-l-none rounded-r-md text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
                      aria-label="Copy message"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
              {message.experimental_attachments &&
                message.experimental_attachments.length > 0 && (
                  <AttachmentsBadge
                    attachments={message.experimental_attachments}
                  />
                )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (message.role === "assistant") {
    return (
      <>
        {message.parts?.map((part: MessagePart, partIndex: number) =>
          renderPart(
            part,
            index,
            partIndex,
            message.parts as MessagePart[],
            message
          )
        )}

        {/* Add suggested questions if this is the last message */}
        {suggestedQuestions.length > 0 && (
          <div
            // initial={{ opacity: 0, y: 20 }}
            // animate={{ opacity: 1, y: 0 }}
            // exit={{ opacity: 0, y: 20 }}
            // transition={{ duration: 0.5 }}
            className="mt-6 w-full max-w-xl sm:max-w-2xl"
          >
            <div className="mb-4 flex items-center gap-2">
              <AlignLeft className="text-primary h-5 w-5" />
              <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
                Suggested questions
              </h2>
            </div>
            <div className="flex flex-col space-y-2">
              {suggestedQuestions.map((question, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  className="h-auto w-fit justify-start rounded-2xl bg-neutral-100 p-1 px-4 py-2 text-left font-medium whitespace-normal text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                  onClick={() => handleSuggestedQuestionClick(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

// Export the attachments badge component for reuse
export const AttachmentsBadge = ({ attachments }: { attachments: any[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const fileAttachments = attachments.filter(
    (att) =>
      att.contentType?.startsWith("image/") ||
      att.contentType === "application/pdf"
  );

  if (fileAttachments.length === 0) return null;

  const isPdf = (attachment: any) =>
    attachment.contentType === "application/pdf";

  return (
    <>
      <div className="mt-2 flex flex-wrap gap-2">
        {fileAttachments.map((attachment, i) => {
          // Truncate filename to 15 characters
          const fileName = attachment.name ?? `File ${i + 1}`;
          const truncatedName =
            fileName.length > 15 ? fileName.substring(0, 12) + "..." : fileName;

          const fileExtension = fileName.split(".").pop()?.toLowerCase();
          const isImage = attachment.contentType?.startsWith("image/");

          return (
            <button
              key={i}
              onClick={() => {
                setSelectedIndex(i);
                setIsOpen(true);
              }}
              className="flex max-w-xs items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100 py-1 pr-3 pl-1 transition-colors hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white dark:bg-neutral-900">
                {isPdf(attachment) ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-red-500 dark:text-red-400"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <path d="M9 15v-2h6v2"></path>
                    <path d="M12 18v-5"></path>
                  </svg>
                ) : isImage ? (
                  <img
                    src={attachment.url}
                    alt={fileName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-500 dark:text-blue-400"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                )}
              </div>
              <span className="truncate text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {truncatedName}
                {fileExtension && !isPdf(attachment) && !isImage && (
                  <span className="ml-0.5 text-neutral-500 dark:text-neutral-400">
                    .{fileExtension}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
};
