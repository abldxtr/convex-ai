import { motion } from "framer-motion";
import { useGlobalstate } from "@/context/global-store";
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
  const { direction } = useGlobalstate();
  return (
    <div
      className={cn(
        "group/turn-messages mx-auto max-w-(--thread-content-max-width) [--thread-content-max-width:32rem] @[34rem]:[--thread-content-max-width:40rem] @[64rem]:[--thread-content-max-width:48rem] lg:[--thread-content-max-width:52rem]  ",
        direction === "rtl" ? "flex items-end" : "flex items-start"
      )}
    >
      {/* <div className="group/turn-messages mx-auto max-w-(--thread-content-max-width) [--thread-content-max-width:48rem] @[48rem]:[--thread-content-max-width:48rem] @[64rem]:[--thread-content-max-width:48rem]"></div> */}
      <div
        className="gap-4 rounded-3xl px-5  text-base focus-visible:outline-hidden md:gap-5 lg:gap-6"
        dir="auto"
      >
        <div dir="auto" className="relative ">
          <motion.div
            className="size-4 rounded-full bg-black inline-flex shrink-0 absolute top-1 right-0 "
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
