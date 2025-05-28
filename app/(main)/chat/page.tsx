import ChatClient from "./chat-client";

type Params = Promise<{ chatId: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Chat({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const searchparams = await searchParams;
  const chatId = searchparams.chatId as string | undefined;

  // if (!chatId) {
  //   return <div>chatId not found in query params</div>;
  // }

  return <ChatClient />;
}
