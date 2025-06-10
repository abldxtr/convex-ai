import { XIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  FileWithPreview,
  formatBytes,
  useFileUpload,
} from "@/hooks/use-file-upload";

export default function PreviewImg({
  files,
  removeFile,
  clearFiles,
}: {
  files: FileWithPreview[];
  removeFile: (id: string) => void;
  clearFiles: () => void;
}) {
  return (
    <>
      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => {
            // console.log(file.preview);
            return (
              <div
                key={file.id}
                className="bg-background flex items-center justify-between gap-2 rounded-lg border p-2 pe-3 mb-2 "
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-accent aspect-square shrink-0 rounded">
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="size-10 rounded-[inherit] object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="truncate text-[13px] font-medium">
                      {file.file.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatBytes(file.file.size)}
                    </p>
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
                  onClick={() => removeFile(file.id)}
                  aria-label="Remove file"
                >
                  <XIcon aria-hidden="true" />
                </Button>
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
