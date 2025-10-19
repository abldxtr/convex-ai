"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col font-sans items-center justify-center min-h-screen bg-background text-foreground p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="mb-6 flex justify-center">
          <Image
            src="/404.webp"
            alt="Lost in space"
            width={300}
            height={200}
            className="rounded-lg"
            unoptimized
          />
        </div>

        <h1 className="text-4xl mb-4 text-neutral-800 dark:text-neutral-100 font-syne">
          Page not found
        </h1>
        <p className="text-lg mb-8 text-neutral-600 dark:text-neutral-300">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex justify-center">
          <Link href="/chat" prefetch={true}>
            <Button
              variant="default"
              className="flex items-center gap-2 px-4 py-2 rounded-full"
            >
              <ArrowLeft size={18} />
              <span>Return to chat</span>
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
