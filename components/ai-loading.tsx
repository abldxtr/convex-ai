import { motion } from "framer-motion";
// import { useGlobalstate } from "@/context/global-store";
import { useGlobalState } from "@/context/global-state-zus";

import { cn } from "@/lib/utils";
export default function AiLoading() {
  return (
    <motion.div
      className="size-4 rounded-full bg-black inline-flex shrink-0 absolute top-1 right-0  "
      animate={{
        scale: [1, 1.3, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatType: "loop",
      }}
    />
  );
}

export function AiLoading2() {
  const { direction } = useGlobalState();
  return (
    <div
      className={cn("group/turn-messages mx-auto containerW h-2.5 w-full  ")}
    >
      <div
        className="gap-4 rounded-3xl px-5 w-full  text-base focus-visible:outline-hidden md:gap-5 lg:gap-6"
        dir="auto"
      >
        <div dir="auto" className="relative w-full ">
          <motion.div
            className={cn(
              "size-4 rounded-full bg-black inline-flex shrink-0 absolute top-1 ",
              direction === "rtl" ? "right-0" : "left-0"
            )}
            animate={{
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />
        </div>
      </div>
      {/* <div className="h-[34px]" /> */}
    </div>
  );
}
