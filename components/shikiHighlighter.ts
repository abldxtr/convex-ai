import getHighlighter from "shiki/dist/index.mjs";

// const highlighter = await (shiki as any).getHighlighter({
//   theme: "nord",
// });

const highlighter = await getHighlighter({
  theme: "github-dark",
  langs: ["ts", "js", "bash"],
});

const html = highlighter.codeToHtml("const x = 42", { lang: "ts" });
