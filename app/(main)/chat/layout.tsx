import ChatClient from "./chat-client";

type Params = Promise<{ chatId: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ChatLayout({
  children,
  params,
  searchParams,
}: {
  children: React.ReactNode;
  params: Params;
  searchParams: SearchParams;
}) {
  const { chatId } = await params;
  const searchParam = await searchParams;

  //   const [chat] = await getChatById({ id: chatId });

  return (
    <>
      {/* <ChatClient chatId={chatId} /> */}
      {children}
    </>
  );
}
