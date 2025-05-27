// "use client";

// import { api } from "convex/_generated/api";
// import { useMutation, useQuery } from "convex/react";
// import { useState } from "react";
// import { ServerMessage } from "./use-stream-component";

// export default function ConvexChatStream() {
//   const createChat = useMutation(api.chat.createChat);
//   const [drivenIds, setDrivenIds] = useState<Set<string>>(new Set());
//   const [start, setStart] = useState(false);
//   const message = useQuery(api.chat.getChat, {});

//   const [inputValue, setInputValue] = useState("");
//   const formSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const chatId = await createChat({
//       prompt: inputValue,
//     });
//     setDrivenIds((prev) => {
//       prev.add(chatId);
//       return prev;
//     });
//     setTimeout(() => {
//       setStart(true);
//     }, 1000);
//   };

//   return (
//     <div className="flex flex-col">
//       <form onSubmit={formSubmit}>
//         <input
//           type="text"
//           value={inputValue}
//           onChange={(e) => setInputValue(e.target.value)}
//         />
//         <button type="submit">Start</button>
//       </form>
//       {start &&
//         message !== undefined &&
//         message.length > 0 &&
//         message?.[0] !== undefined && (
//           <ServerMessage message={message?.[0]} isDriven={true} />
//         )}
//     </div>
//   );
// }
