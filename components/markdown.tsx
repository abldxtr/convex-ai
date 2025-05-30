import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { Components } from "react-markdown";
import type { ReactNode, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";
import "highlight.js/styles/github.css";

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const components = useMemo<Partial<Components>>(
    () => ({
      code({ className, children, ...props }) {
        return (
          <code
            className={cn(className, "rounded-md px-1 pb-0.5 pt-1.5")}
            {...props}
            dir="ltr"
          >
            {children}
          </code>
        );
      },
      pre({ children, ...props }) {
        const code = children as React.ReactElement;
        // console.log(code);

        // const handleCopy = () => {
        //   let textToCopy = "";

        //   if (React.isValidElement(code)) {
        //     const childrenArray = React.Children.toArray(code.props.children);
        //     textToCopy = childrenArray
        //       .map((child) => {
        //         if (typeof child === "string") return child;
        //         if (typeof child === "number") return String(child);
        //         return ""; // نادیده گرفتن باقی موارد
        //       })
        //       .join("");
        //   }

        //   navigator.clipboard.writeText(textToCopy.trim());
        // };

        return (
          <div className="relative group my-1.5 isolate " dir="ltr">
            <button
              // onClick={handleCopy}
              className=" sticky bg-white   left-0 top-0 rounded-md  px-2 py-1 text-xs text-zinc-800 transition-opacity hover:bg-zinc-300  dark:bg-zinc-700 z-[22] block   "
            >
              Copy
            </button>
            <pre
              className="overflow-x-auto rounded-lg bg-zinc-100 p-2 text-sm dark:bg-zinc-800/50"
              {...props}
            >
              {children}
            </pre>
          </div>
        );
      },
      ol({ children, ...props }) {
        return (
          <ol className="my-1.5 ml-4 list-decimal space-y-0.5" {...props}>
            {children}
          </ol>
        );
      },
      ul({ children, ...props }) {
        return (
          <ul className="my-1.5 ml-4 list-disc space-y-0.5" {...props}>
            {children}
          </ul>
        );
      },
      li({ children, ...props }) {
        return (
          <li className="leading-normal" {...props}>
            {children}
          </li>
        );
      },
      p({ children, ...props }) {
        return (
          <p className="my-1 leading-relaxed" {...props}>
            {children}
          </p>
        );
      },
      strong({ children, ...props }) {
        return (
          <strong className="font-semibold" {...props}>
            {children}
          </strong>
        );
      },
      em({ children, ...props }) {
        return (
          <em className="italic" {...props}>
            {children}
          </em>
        );
      },
      blockquote({ children, ...props }) {
        return (
          <blockquote
            className="my-1.5 border-l-2 border-zinc-200 pl-3 text-zinc-600 italic dark:border-zinc-700 dark:text-zinc-400"
            {...props}
          >
            {children}
          </blockquote>
        );
      },
      a({ children, ...props }) {
        return (
          <a
            className="text-blue-500 transition-colors hover:text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
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
            className="mt-3 mb-1.5 text-2xl font-semibold text-zinc-800 dark:text-zinc-200"
            {...props}
          >
            {children}
          </h1>
        );
      },
      h2({ children, ...props }) {
        return (
          <h2
            className="mt-2.5 mb-1.5 text-xl font-semibold text-zinc-800 dark:text-zinc-200"
            {...props}
          >
            {children}
          </h2>
        );
      },
      h3({ children, ...props }) {
        return (
          <h3
            className="mt-2 mb-1 text-lg font-semibold text-zinc-800 dark:text-zinc-200"
            {...props}
          >
            {children}
          </h3>
        );
      },
      h4({ children, ...props }) {
        return (
          <h4
            className="mt-2 mb-1 text-base font-semibold text-zinc-800 dark:text-zinc-200"
            {...props}
          >
            {children}
          </h4>
        );
      },
      h5({ children, ...props }) {
        return (
          <h5
            className="mt-2 mb-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200"
            {...props}
          >
            {children}
          </h5>
        );
      },
      h6({ children, ...props }) {
        return (
          <h6
            className="mt-2 mb-0.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200"
            {...props}
          >
            {children}
          </h6>
        );
      },
      table({ children, ...props }) {
        return (
          <div className="my-1.5 overflow-x-auto">
            <table
              className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700"
              {...props}
            >
              {children}
            </table>
          </div>
        );
      },
      thead({ children, ...props }) {
        return (
          <thead className="bg-zinc-50 dark:bg-zinc-800/50" {...props}>
            {children}
          </thead>
        );
      },
      tbody({ children, ...props }) {
        return (
          <tbody
            className="divide-y divide-zinc-200 bg-white dark:divide-zinc-700 dark:bg-transparent"
            {...props}
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
          >
            {children}
          </tr>
        );
      },
      th({ children, ...props }) {
        return (
          <th
            className="px-3 py-1.5 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            {...props}
          >
            {children}
          </th>
        );
      },
      td({ children, ...props }) {
        return (
          <td className="px-3 py-1.5 text-sm" {...props}>
            {children}
          </td>
        );
      },
      hr(props) {
        return (
          <hr
            className="my-1.5 border-zinc-200 dark:border-zinc-700"
            {...props}
          />
        );
      },
    }),
    []
  );

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
