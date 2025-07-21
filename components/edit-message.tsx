import { ChatRequestOptions, UIMessage } from "ai";
import { MessageTools } from "./message-tools";
import { PreviewAttachment } from "./preview-attachment";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import { Textarea } from "./ui/textarea";
import { useDirection } from "@/hooks/use-direction";
// import { useGlobalState } from "@/context/global-store";
import { useGlobalState } from "@/context/global-state-zus";

import TooltipContainer from "./tooltip-container";
import { toast } from "sonner";
import { ModelSwitcher } from "./models";

export default function EditMessage({
  message,
  handleSubmit,
}: {
  message: UIMessage;
  handleSubmit?: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions
  ) => void;
}) {
  const textPart = message.parts.find((part) => part.type === "text");
  const [input, setInput] = useState(textPart ? textPart.text : "");
  const { direction, setDirection } = useGlobalState();
  // Handle keyboard submission
  const handleKeyboardSubmit = useCallback(
    async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        if (status !== "ready") {
          toast.error("Please wait for the previous message to be sent");
        } else {
          // setInput("");
          //   setActive(true);
          //   if (files.length > 0) {
          //     try {
          //       const result = await convert(files[0].file as File);
          //       handleSubmit(undefined, {
          //         experimental_attachments: [
          //           {
          //             url: result,
          //             name: files[0].file.name,
          //             contentType: files[0].file.type,
          //           },
          //         ],
          //       });
          //     //   clearFiles();
          //     } catch (err) {
          //       toast.error("خطا در تبدیل فایل به base64");
          //     }
          //     // setAttachments([]);
          //   } else {
          //   handleSubmit();
          //   }
        }
      }
    },
    [status, handleSubmit]
  );

  // Handle click submission
  const handleClickSubmit = useCallback(async () => {
    // setActive(true);
    // if (files.length > 0) {
    //   try {
    //     const result = await convert(files[0].file as File);
    //     handleSubmit(undefined, {
    //       experimental_attachments: [
    //         {
    //           url: result,
    //           name: files[0].file.name,
    //           contentType: files[0].file.type,
    //         },
    //       ],
    //     });
    //     // clearFiles();
    //   } catch (err) {
    //     toast.error("خطا در تبدیل فایل به base64");
    //   }
    //   // setAttachments([]);
    // } else {
    // handleSubmit();
    // }
  }, [input, setInput]);
  // }, [input, setInput, setActive, router, idChat, attachments]);

  return (
    <div
      className="group/turn-messages mx-auto containerW justify-end flex  "
      dir="auto"
    >
      <div
        className={cn(
          "w-full gap-4 text-base focus-visible:outline-hidden md:gap-5 lg:gap-6 break-words break-all "
          //   direction !== "rtl"
          //     ? "flex items-center justify-start"
          //     : "flex items-center justify-end"
        )}
        // dir="auto"
      >
        <div
          className="flex w-full max-w-full break-words rounded-3xl bg-[#e9e9e980] p-1  flex-col"
          //   dir={direction}
        >
          {message.experimental_attachments &&
            message.experimental_attachments.length > 0 && (
              <div
                data-testid={`message-attachments`}
                className="w-full  h-auto "
              >
                {message.experimental_attachments.map((attachment) => {
                  // console.log("attachment", attachment);
                  return (
                    <PreviewAttachment
                      key={attachment.url}
                      attachment={attachment}
                    />
                  );
                })}
              </div>
            )}

          <div
            // dir="auto"
            // className="flex w-fit max-w-full break-words rounded-3xl bg-[#e9e9e980] px-5 py-2.5 "
            className="flex w-full gap-2  p-3 flex-col "
          >
            {/* {part.text} */}
            <Textarea
              //   id={id}
              value={input}
              autoFocus
              placeholder=""
              className={cn(
                "field-sizing-content max-h-29.5 min-h-0 w-full resize-none text-[16px] text-[#0d0d0d] placeholder:text-[16px] disabled:opacity-50"
                // files.length > 0 && "mb-2"
              )}
              onChange={(e) => {
                const direction = useDirection(e.target.value);
                setDirection(direction);
                setInput(e.target.value);
              }}
              disabled={status === "streaming" || status === "submitted"}
              onKeyDown={handleKeyboardSubmit}
            />
            {/* Tools and actions */}
            <div className="flex h-[36px] items-center justify-between gap-2">
              {/* Model switcher */}
              <div className="flex items-center gap-2">
                <div>
                  {/* <ModelSwitcher
                    selectedModel={
                      files.length > 0 && !visionModel
                        ? "mmd-google/gemini-2.0-flash-exp:free"
                        : selectedModel.length > 0
                          ? selectedModel
                          :"mmd-gpt-4o"
                    }
                    setSelectedModel={setSelectedModel}
                    showExperimentalModels={showExperimentalModels}
                    attachments={[]}
                    messages={messages}
                    status={status}
                    onModelSelect={(model) => {
                      // Show additional info about image attachments for vision models
                      const isVisionModel = model.vision === true;
                    }}
                  /> */}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 justify-end ">
                <button className=" bg-[#f9f9f9] rounded-[3.40282e+38px] border border-[#00000026] text-[#0d0d0d] text-[.875rem] min-h-[calc(var(--spacing)*9)] px-[calc(var(--spacing)*3)] cursor-pointer   ">
                  Cancel
                </button>
                <button className=" bg-[#0d0d0d] rounded-[3.40282e+38px] border border-[#00000026] text-[#fff] text-[.875rem] min-h-[calc(var(--spacing)*9)] px-[calc(var(--spacing)*3)] cursor-pointer ">
                  Send
                </button>
                {/* {searchTools.map((tool) => {
                  const isStreaming =
                    status === "streaming" || status === "submitted";
                  const isInputEmpty = input.trim().length === 0;

                  // فقط upload و ActionButton را نمایش بده
                  if (tool.name === "StopButton") return null;

                  // تغییر آیکن دکمه ActionButton در حالت استریم
                  const Icon =
                    tool.name === "ActionButton"
                      ? isStreaming
                        ? searchTools.find((t) => t.name === "StopButton")
                            ?.icon || tool.icon
                        : tool.icon
                      : tool.icon;

                  // اصلاح شده: فقط وقتی ورودی خالی باشه و در حالت idle باشیم دکمه غیرفعاله
                  const isDisabled =
                    (tool.name === "upload" && isStreaming) ||
                    (tool.name === "ActionButton" &&
                      isInputEmpty &&
                      !isStreaming);

                  const handleClick = () => {
                    // if (tool.name === "upload" && !isStreaming) {
                    //   openFileDialog();
                    // }

                    if (tool.name === "ActionButton") {
                      if (isStreaming) {
                        stop();
                      } else if (!isInputEmpty) {
                        handleClickSubmit();
                      }
                    }
                  };

                  return (
                    <TooltipContainer
                      key={tool.name}
                      tooltipContent={
                        isStreaming && tool.name === "ActionButton"
                          ? "Stopping..."
                          : tool.description
                      }
                    >
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-300 fill-[#5d5d5d]",
                          tool.name === "upload" && "hover:bg-gray-100",
                          tool.name === "ActionButton" && "bg-black fill-white",
                          isDisabled &&
                            "opacity-50 pointer-events-none hover:cursor-not-allowed",
                          !isDisabled && "hover:cursor-pointer"
                        )}
                        onClick={handleClick}
                      >
                        <Icon />
                      </div>
                    </TooltipContainer>
                  );
                })} */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <MessageTools
        message={message}
        role="user"
        isLastMessage={isLastMessage}
        reload={reload}
      /> */}
    </div>
  );
}
