import type { Attachment } from "ai";

import { LoaderIcon } from "./icons";

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
}: {
  attachment: Attachment;
  isUploading?: boolean;
}) => {
  const { name, url, contentType } = attachment;
  // console.log("ddddddddddddddddddddddddddddddd");

  return (
    <div data-testid="input-attachment-preview" className=" w-full ">
      <div className="w-full max-w-80 aspect-video bg-muted rounded-md relative ">
        {contentType ? (
          contentType.startsWith("image") ? (
            // NOTE: it is recommended to use next/image for images
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt={name ?? "An image attachment"}
              className="rounded-md size-full object-cover"
            />
          ) : (
            <div className="" />
          )
        ) : (
          <div className="" />
        )}

        {isUploading && (
          <div
            data-testid="input-attachment-loader"
            className="animate-spin absolute text-zinc-500"
          >
            <LoaderIcon />
          </div>
        )}
      </div>
      {/* <div className="text-xs text-zinc-500 max-w-16 truncate">{name}</div> */}
    </div>
  );
};
