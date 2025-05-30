import { useLayoutEffect } from "react";

export const useLayoutEffectOwn = (
  chatId: string,
  messages: any,
  currentUser: string,
  firstUnreadRef: any,
  bottomRef: any,
  chatRef: any,
  isScroll: boolean
) => {
  useLayoutEffect(() => {
    const storedScrollPosition = sessionStorage.getItem(`scrollPos-${chatId}`);

    if (!firstUnreadRef.current && messages) {
      if (storedScrollPosition && chatRef.current) {
        chatRef.current.scrollTop = parseInt(storedScrollPosition, 10);
      } else if (bottomRef.current) {
        bottomRef.current.scrollIntoView({
          behavior: "instant",
          block: "center",
        });
      }
    }

    return () => {
      if (chatRef.current && isScroll) {
        sessionStorage.setItem(
          `scrollPos-${chatId}`,
          chatRef.current.scrollTop.toString()
        );
      }
    };
  }, [
    chatId,
    firstUnreadRef.current,
    bottomRef.current,
    chatRef.current,
    isScroll,
  ]);
};
