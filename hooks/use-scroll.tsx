import { UIMessage } from "ai";
import {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export function useScroll({
  status,
  endOfMessagesRef,
  messages,
}: {
  status: "streaming" | "ready" | "error" | "submitted";
  endOfMessagesRef: RefObject<HTMLDivElement> | null;
  messages: UIMessage[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showArrow, setShowArrow] = useState(false);
  const [clientHeight, setClientHeight] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(0);
  const [offsetHeight, setOffsetHeight] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight;
    const clientHeight = el.clientHeight;
    const offsetHeight = el.offsetHeight;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

    const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;
    setClientHeight(scrollHeight);
    setScrollHeight(offsetHeight);
    setOffsetHeight(offsetHeight);
    if (scrollPercent > 90) {
      setShowArrow(false);
    }
    if (
      scrollPercent > 10 &&
      scrollPercent < 90 &&
      scrollHeight > offsetHeight * 1.5
    ) {
      setShowArrow(true);
    } else {
      setShowArrow(false);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  useLayoutEffect(() => {
    const storedScrollPosition = sessionStorage.getItem(
      `scrollPos-${messages.at(-1)?.id}`
    );
    // console.log("storedScrollPosition", storedScrollPosition);
    // if (messages) {
    if (storedScrollPosition && scrollRef.current) {
      scrollRef.current.scrollTop = parseInt(storedScrollPosition, 10);
    } else if (endOfMessagesRef?.current) {
      endOfMessagesRef.current.scrollIntoView({
        behavior: "instant",
        block: "center",
      });
    }
    // }

    return () => {
      if (scrollRef.current) {
        sessionStorage.setItem(
          `scrollPos-${messages.at(-1)?.id}`,
          scrollRef.current.scrollTop.toString()
        );
      }
    };
  }, [messages.at(-1)?.id, endOfMessagesRef?.current, scrollRef.current]);

  return { scrollRef, showArrow, clientHeight, scrollHeight, offsetHeight };
}
