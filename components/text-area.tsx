"use client";

import { useId } from "react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TextareaComponent() {
  const id = useId();
  return (
    <div className="*:not-first:mt-2">
      <Label htmlFor={id}>Autogrowing textarea</Label>
    </div>
  );
}
