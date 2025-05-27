import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground/70 flex min-h-19.5 w-full rounded-md bg-transparent px-3 py-2 text-sm transition-[color] outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
Textarea.displayName = "Textarea";

export { Textarea };
