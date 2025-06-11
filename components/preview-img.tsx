import { XIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  FileWithPreview,
  formatBytes,
  useFileUpload,
} from "@/hooks/use-file-upload";
import { useGlobalstate } from "@/context/global-store";

export default function PreviewImg({
  files,
  removeFile,
  clearFiles,
}: {
  files: FileWithPreview[];
  removeFile: (id: string) => void;
  clearFiles: () => void;
}) {
  const { setFileExists } = useGlobalstate();

  return (
    <>
      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2 absolute -top-12 isolate z-10 bg-white left-14 ">
          {files.map((file) => {
            // console.log(file.preview);
            return (
              <div
                key={file.id}
                className="bg-background flex items-center justify-between gap-2 rounded-lg border  "
              >
                <div className="flex items-center gap-3 ">
                  <div className="bg-accent aspect-square shrink-0 rounded relative ">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent absolute -top-4 -right-2 rounded-full    "
                      onClick={() => {
                        removeFile(file.id);
                        setFileExists(false);
                      }}
                      aria-label="Remove file"
                    >
                      <XIcon aria-hidden="true" color="red" />
                    </Button>
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="size-14 rounded-[inherit] object-cover"
                    />
                  </div>
                  {/* <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="truncate text-[13px] font-medium">
                      {file.file.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatBytes(file.file.size)}
                    </p>
                  </div> */}
                </div>
              </div>
            );
          })}

          {/* Remove all files button */}
          {files.length > 1 && (
            <div>
              <Button size="sm" variant="outline" onClick={clearFiles}>
                Remove all files
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
