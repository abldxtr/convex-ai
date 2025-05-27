/* eslint-disable @typescript-eslint/no-unused-vars */
import Link from "next/link";
import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import type {
  Components,
  ReactMarkdownProps,
} from "react-markdown/lib/ast-to-react";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
// import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

const components: Partial<Components> = {
  pre: ({ children, ...props }) => (
    <pre
      className="black:bg-zinc-800/50 my-1.5 overflow-x-auto rounded-lg bg-zinc-100 p-2.5 text-sm dark:bg-zinc-800/50"
      {...props}
    >
      {children}
    </pre>
  ),
  code: ({
    children,
    className,
    ...props
  }: React.HTMLProps<HTMLElement> & { className?: string }) => {
    const match = /language-(\w+)/.exec(className ?? "");
    const isInline = !match && !className;

    if (isInline) {
      return (
        <code
          className="black:bg-zinc-800/50 black:text-zinc-300 rounded-md bg-zinc-100 px-1 py-0.5 font-mono text-[0.9em] text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={cn("block font-mono text-sm", className)} {...props}>
        {children}
      </code>
    );
  },
  ol: ({ children, ...props }: ReactMarkdownProps) => (
    <ol
      className="my-1.5 ml-4 list-outside list-decimal space-y-0.5"
      {...props}
    >
      {children}
    </ol>
  ),
  ul: ({ children, ...props }: ReactMarkdownProps) => (
    <ul className="my-1.5 ml-4 list-outside list-disc space-y-0.5" {...props}>
      {children}
    </ul>
  ),
  li: ({ children, ...props }: ReactMarkdownProps) => (
    <li className="leading-normal" {...props}>
      {children}
    </li>
  ),
  p: ({ children, ...props }: ReactMarkdownProps) => (
    <p className="my-1 leading-relaxed" {...props}>
      {children}
    </p>
  ),
  strong: ({ children, ...props }: ReactMarkdownProps) => (
    <strong className="font-semibold" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }: ReactMarkdownProps) => (
    <em className="italic" {...props}>
      {children}
    </em>
  ),
  blockquote: ({ children, ...props }: ReactMarkdownProps) => (
    <blockquote
      className="black:border-zinc-700 black:text-zinc-400 my-1.5 border-l-2 border-zinc-200 pl-3 text-zinc-600 italic dark:border-zinc-700 dark:text-zinc-400"
      {...props}
    >
      {children}
    </blockquote>
  ),
  a: ({ children, ...props }: ReactMarkdownProps) => (
    <a
      className="black:text-blue-400 black:hover:text-blue-300 text-blue-500 transition-colors hover:text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
      target="_blank"
      rel="noreferrer"
      {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
    >
      {children}
    </a>
  ),
  h1: ({ children, ...props }: ReactMarkdownProps) => (
    <h1
      className="black:text-zinc-200 mt-3 mb-1.5 text-2xl font-semibold text-zinc-800 dark:text-zinc-200"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: ReactMarkdownProps) => (
    <h2
      className="black:text-zinc-200 mt-2.5 mb-1.5 text-xl font-semibold text-zinc-800 dark:text-zinc-200"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: ReactMarkdownProps) => (
    <h3
      className="black:text-zinc-200 mt-2 mb-1 text-lg font-semibold text-zinc-800 dark:text-zinc-200"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: ReactMarkdownProps) => (
    <h4
      className="black:text-zinc-200 mt-2 mb-1 text-base font-semibold text-zinc-800 dark:text-zinc-200"
      {...props}
    >
      {children}
    </h4>
  ),
  h5: ({ children, ...props }: ReactMarkdownProps) => (
    <h5
      className="black:text-zinc-200 mt-2 mb-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200"
      {...props}
    >
      {children}
    </h5>
  ),
  h6: ({ children, ...props }: ReactMarkdownProps) => (
    <h6
      className="black:text-zinc-200 mt-2 mb-0.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200"
      {...props}
    >
      {children}
    </h6>
  ),
  table: ({ children, ...props }: ReactMarkdownProps) => (
    <div className="my-1.5 overflow-x-auto">
      <table
        className="black:divide-zinc-700 min-w-full divide-y divide-zinc-200 dark:divide-zinc-700"
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: ReactMarkdownProps) => (
    <thead
      className="black:bg-zinc-800/50 bg-zinc-50 dark:bg-zinc-800/50"
      {...props}
    >
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }: ReactMarkdownProps) => (
    <tbody
      className="black:divide-zinc-700 black:bg-transparent divide-y divide-zinc-200 bg-white dark:divide-zinc-700 dark:bg-transparent"
      {...props}
    >
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }: ReactMarkdownProps) => (
    <tr
      className="black:hover:bg-zinc-800/30 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
      {...props}
    >
      {children}
    </tr>
  ),
  th: ({ children, ...props }: ReactMarkdownProps) => (
    <th
      className="black:text-zinc-400 px-3 py-1.5 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: ReactMarkdownProps) => (
    <td className="px-3 py-1.5 text-sm" {...props}>
      {children}
    </td>
  ),
  hr: (props: ReactMarkdownProps) => (
    <hr
      className="black:border-zinc-700 my-1.5 border-zinc-200 dark:border-zinc-700"
      {...props}
    />
  ),
};

const remarkPlugins = [remarkGfm];
// const rehypePlugins = [rehypeHighlight];

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={remarkPlugins}
      // rehypePlugins={rehypePlugins}
      components={components}
    >
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
);
