// "use client";

// import { defineMonacoThemes, LANGUAGE_CONFIG } from "@/_constants";
// // app/page.tsx
// import Editor from "@/components/editor/editor";
// // import { useCodeEditorStore } from "@/lib/useCodeEditorStore";
// import { useEffect } from "react";
// import { useState } from "react";

// export default function VibeCoding() {
//   const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
//   // const { language, theme, fontSize, editor, setFontSize, setEditor } =
//   //   useCodeEditorStore();

//   //   const mounted = useMounted();

//   useEffect(() => {
//     const savedCode = localStorage.getItem(`editor-code-${language}`);
//     const newCode = savedCode || LANGUAGE_CONFIG[language].defaultCode;
//     // if (editor) editor.setValue(newCode);
//   }, [language, editor]);

//   useEffect(() => {
//     const savedFontSize = localStorage.getItem("editor-font-size");
//     if (savedFontSize) setFontSize(parseInt(savedFontSize));
//   }, [setFontSize]);

//   const handleRefresh = () => {
//     const defaultCode = LANGUAGE_CONFIG[language].defaultCode;
//     // if (editor) editor.setValue(defaultCode);
//     localStorage.removeItem(`editor-code-${language}`);
//   };

//   const handleEditorChange = (value: string | undefined) => {
//     if (value) localStorage.setItem(`editor-code-${language}`, value);
//   };

//   const handleFontSizeChange = (newSize: number) => {
//     const size = Math.min(Math.max(newSize, 12), 24);
//     setFontSize(size);
//     localStorage.setItem("editor-font-size", size.toString());
//   };

//   //   if (!mounted) return null;
//   return (
//     <main className="h-screen w-screen">
//       <h1>Monacopilot Next.js Example</h1>

//       {/* <Editor /> */}
//       {/* <Editor
//         language="typescript"
//         onChange={handleEditorChange}
//         theme={theme}
//         beforeMount={defineMonacoThemes}
//         onMount={(editor: any) => setEditor(editor)}
//         options={{
//           minimap: { enabled: false },
//           fontSize,
//           automaticLayout: true,
//           scrollBeyondLastLine: false,
//           padding: { top: 16, bottom: 16 },
//           renderWhitespace: "selection",
//           fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
//           fontLigatures: true,
//           cursorBlinking: "smooth",
//           smoothScrolling: true,
//           contextmenu: true,
//           renderLineHighlight: "all",
//           lineHeight: 1.6,
//           letterSpacing: 0.5,
//           roundedSelection: true,
//           scrollbar: {
//             verticalScrollbarSize: 8,
//             horizontalScrollbarSize: 8,
//           },
//         }}
//       /> */}
//     </main>
//   );
// }

export default function VibeCoding() {
  return <div>VibeCoding</div>;
}
