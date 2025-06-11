import ChatClient from "./chat-client";
import ChatClientCopy from "./chat-client copy";
import ChatClientWithoutId from "./chat-client-without-id";

type Params = Promise<{ chatId: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Chat(
  {
    // searchParams,
  }: {
    // searchParams: SearchParams;
  }
) {
  // const searchparams = await searchParams;
  // const chatId = searchparams.chatId as string | undefined;

  // if (!chatId) {
  //   return <div>chatId not found in query params</div>;
  // }

  return (
    <>
      {/* <ChatClient /> */}
      {/* <ChatClientCopy /> */}
      <ChatClientWithoutId
      // id={crypto.randomUUID()}
      // idChat={crypto.randomUUID()}
      />
    </>
  );
}
