import { NextRequest, NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    // مسیر فایل PDF روی دیسک — اینجا می‌تونی مسیر دقیق فایل رو مشخص کنی
    const filePath = path.join(process.cwd(), "public", "abldxtr.pdf");

    // Loader برای فایل‌های PDF لوکال
    const loader = new PDFLoader(filePath);
    const docs: Document[] = await loader.load();

    // Split به چانک
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunkedDocs = await textSplitter.splitDocuments(docs);

    // فقط متن‌ها رو برای پاسخ می‌فرستیم (نه متادیتا یا چیزای اضافه)
    const contents = chunkedDocs.map((doc) => doc.pageContent);

    return NextResponse.json({ chunks: contents });
  } catch (error) {
    console.error("PDF chunking failed:", error);
    return NextResponse.json(
      { error: "Failed to process PDF" },
      { status: 500 }
    );
  }
}

// import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { Document } from "langchain/document";
// import axios from "axios";

// export type PDFSource = {
//   type: "url" | "local" | "buffer";
//   source: string | Buffer;
// };

// export async function getChunkedDocsFromPDF(pdfSource: PDFSource) {
//   let docs: Document[] = [];

//   try {
//     switch (pdfSource.type) {
//       case "url": {
//         // Download PDF from URL
//         const response = await axios.get(pdfSource.source as string, {
//           responseType: "arraybuffer",
//         });
//         const pdfBlob = new Blob([response.data], { type: "application/pdf" });
//         const loader = new WebPDFLoader(pdfBlob);
//         docs = await loader.load();
//         break;
//       }
//       case "local": {
//         // Handle local file system PDF using PDFLoader
//         const loader = new PDFLoader(pdfSource.source as string);
//         docs = await loader.load();
//         break;
//       }
//       case "buffer": {
//         // Handle Buffer (e.g., from fs.readFile)
//         const pdfBlob = new Blob([pdfSource.source as Buffer], {
//           type: "application/pdf",
//         });
//         const loader = new WebPDFLoader(pdfBlob);
//         docs = await loader.load();
//         break;
//       }
//       default:
//         throw new Error("Unsupported PDF source type");
//     }

//     // Split into chunks
//     const textSplitter = new RecursiveCharacterTextSplitter({
//       chunkSize: 1000,
//       chunkOverlap: 200,
//     });

//     const chunkedDocs = await textSplitter.splitDocuments(docs);
//     return chunkedDocs;
//   } catch (e) {
//     console.error(e);
//     throw new Error("PDF docs chunking failed!");
//   }
// }
