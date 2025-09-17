"use client";

import React, { useMemo, useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { Components } from "react-markdown";
import type { HTMLAttributes } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import "highlight.js/styles/github.css";

interface MarkdownRendererProps {
  content: string;
}

const CopyButton: React.FC<{ code: string }> = React.memo(({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopied(true);
      toast.success("Code copied to clipboard!");

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy code");
    }
  }, [code]);

  return (
    <div className="absolute inset-0 top-10 pointer-events-none">
      <button
        onClick={handleCopy}
        className={cn(
          "sticky top-2 z-10 flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-all",
          "bg-white/90 text-zinc-800 hover:bg-white dark:bg-zinc-800/90 dark:text-zinc-200 dark:hover:bg-zinc-800",
          "mt-[-35px] ml-2 pointer-events-auto"
        )}
        title={copied ? "Copied!" : "Copy code"}
      >
        {copied ? (
          <>
            <Check className="h-3 w-3" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  );
});

CopyButton.displayName = "CopyButton";

const MarkdownRenderer: React.FC<MarkdownRendererProps> = React.memo(
  ({ content }) => {
    const extractTextFromChildren = useCallback(
      (children: React.ReactNode): string => {
        if (typeof children === "string") return children;
        if (typeof children === "number") return String(children);

        if (React.isValidElement(children)) {
          // @ts-ignore
          return extractTextFromChildren(children.props.children);
        }

        if (Array.isArray(children)) {
          return children.map(extractTextFromChildren).join("");
        }

        return "";
      },
      []
    );

    const components = useMemo<Partial<Components>>(
      () => ({
        code({ className, children, ...props }) {
          return (
            <code
              className={cn(
                className,
                "relative rounded-md bg-zinc-100 px-1 py-1 text-sm dark:bg-zinc-800"
              )}
              {...props}
              dir="ltr"
            >
              {children}
            </code>
          );
        },

        pre({ children, ...props }) {
          const codeText = extractTextFromChildren(children);

          return (
            <div className="group relative my-4 isolate" dir="ltr">
              <CopyButton code={codeText} />
              <pre
                className={cn(
                  "overflow-x-auto rounded-lg p-3 mt-4 text-sm z-10 bg-transparent",
                  "border border-zinc-200 dark:border-zinc-700"
                )}
                {...props}
              >
                {children}
              </pre>
            </div>
          );
        },

        ol({ children, ...props }) {
          return (
            <ol className="ml-6 list-decimal space-y-1" {...props}>
              {children}
            </ol>
          );
        },

        ul({ children, ...props }) {
          return (
            <ul className="ml-6 list-disc space-y-1" {...props}>
              {children}
            </ul>
          );
        },

        li({ children, ...props }) {
          return (
            <li
              className="leading-relaxed !text-[14px] md:!text-[15px] py-1"
              {...props}
            >
              {children}
            </li>
          );
        },

        p({ children, ...props }) {
          return (
            <p
              className="my-2 leading-relaxed !text-[14px] md:!text-[15px]"
              {...props}
            >
              {children}
            </p>
          );
        },

        strong({ children, ...props }) {
          return (
            <strong
              className="font-semibold text-zinc-900 dark:text-zinc-100"
              {...props}
            >
              {children}
            </strong>
          );
        },

        em({ children, ...props }) {
          return (
            <em className="italic text-zinc-700 dark:text-zinc-300" {...props}>
              {children}
            </em>
          );
        },

        blockquote({ children, ...props }) {
          return (
            <blockquote
              className={cn(
                "border-l-4 border-zinc-300 pl-4 italic my-3",
                "text-zinc-600 dark:border-zinc-600 dark:text-zinc-400"
              )}
              {...props}
            >
              {children}
            </blockquote>
          );
        },

        a({ children, ...props }) {
          return (
            <a
              className={cn(
                "text-blue-600 underline-offset-2 transition-colors",
                "hover:text-blue-700 hover:underline",
                "dark:text-blue-400 dark:hover:text-blue-300"
              )}
              target="_blank"
              rel="noreferrer"
              {...(props as HTMLAttributes<HTMLAnchorElement>)}
            >
              {children}
            </a>
          );
        },

        h1({ children, ...props }) {
          return (
            <h1
              className="my-4 text-3xl font-bold text-zinc-900 dark:text-zinc-100"
              {...props}
            >
              {children}
            </h1>
          );
        },

        h2({ children, ...props }) {
          return (
            <h2
              className="my-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-100"
              {...props}
            >
              {children}
            </h2>
          );
        },

        h3({ children, ...props }) {
          return (
            <h3
              className="my-2 !text-[16px] font-semibold text-zinc-900 dark:text-zinc-100"
              {...props}
            >
              {children}
            </h3>
          );
        },

        h4({ children, ...props }) {
          return (
            <h4
              className="my-2 !text-[15px] font-semibold text-zinc-900 dark:text-zinc-100"
              {...props}
            >
              {children}
            </h4>
          );
        },

        h5({ children, ...props }) {
          return (
            <h5
              className="my-2 text-base font-semibold text-zinc-900 dark:text-zinc-100"
              {...props}
            >
              {children}
            </h5>
          );
        },

        h6({ children, ...props }) {
          return (
            <h6
              className="my-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              {...props}
            >
              {children}
            </h6>
          );
        },

        table({ children, ...props }) {
          return (
            <div className="overflow-x-auto my-2">
              <table
                className="min-w-full divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-700 dark:border-zinc-700"
                {...props}
              >
                {children}
              </table>
            </div>
          );
        },

        thead({ children, ...props }) {
          return (
            <thead
              className="bg-zinc-50 dark:bg-zinc-800/50"
              {...props}
              dir="auto"
            >
              {children}
            </thead>
          );
        },

        tbody({ children, ...props }) {
          return (
            <tbody
              className="divide-y divide-zinc-200 bg-white dark:divide-zinc-700 dark:bg-transparent"
              {...props}
              dir="auto"
            >
              {children}
            </tbody>
          );
        },

        tr({ children, ...props }) {
          return (
            <tr
              className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
              {...props}
              dir="auto"
            >
              {children}
            </tr>
          );
        },

        th({ children, ...props }) {
          return (
            <th
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
              {...props}
              dir="auto"
            >
              {children}
            </th>
          );
        },

        td({ children, ...props }) {
          return (
            <td
              className="px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100"
              {...props}
              dir="auto"
            >
              {children}
            </td>
          );
        },

        hr(props) {
          return (
            <hr
              className="my-4 border-zinc-200 dark:border-zinc-700"
              {...props}
            />
          );
        },
      }),
      [extractTextFromChildren]
    );

    const memoizedMarkdown = useMemo(
      () => (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      ),
      [content, components]
    );

    return memoizedMarkdown;
  }
);

MarkdownRenderer.displayName = "MarkdownRenderer";

export default MarkdownRenderer;
