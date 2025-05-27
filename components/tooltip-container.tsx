import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function TooltipContainer({
  children,
  tooltipContent,
}: {
  children: React.ReactNode;
  tooltipContent: React.ReactNode;
}) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          className="bg-black px-2 py-1 text-xs text-white [&>[data-arrow]]:hidden"
          align="center"
          arrowPadding={100}
          side="bottom"
        >
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
