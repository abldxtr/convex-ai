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
  const spacerRef = useRef<HTMLDivElement>(null);
  const [spacerHeight, setSpacerHeight] = useState(0);
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
    return scrollPercent;
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

  // useEffect(() => {
  //   const el = scrollRef.current;
  //   if ((status === "submitted" || status === "streaming") && el) {
  //     el.scrollTop = el.scrollHeight; // اسکرول به پایین‌ترین بخش برای رزرو جا
  //   }
  // }, [status]);

  useEffect(() => {
    if (
      status === "submitted" &&
      messages.length > 0 &&
      messages[messages.length - 1].role === "user"
    ) {
      // مثلاً هر بار 220 پیکسل اضافه کن
      setSpacerHeight((prev) => prev + 220);
    }
  }, [status, messages]);

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
  }, []);

  useEffect(() => {
    const scrollPercent = handleScroll();

    const el = scrollRef.current;
    // if ((status === "submitted" || status === "streaming") && el) {
    //   el.scrollTop = el.scrollHeight; // اسکرول به پایین‌ترین بخش برای رزرو جا
    // }

    if (
      status === "submitted" &&
      endOfMessagesRef?.current &&
      scrollPercent &&
      scrollPercent > 30
    ) {
      endOfMessagesRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    // if (scrollPercent && scrollPercent > 30 && endOfMessagesRef?.current) {
    //   endOfMessagesRef.current.scrollIntoView({
    //     behavior: "smooth",
    //     block: "center",
    //   });
    // }
  }, [messages.at(-1)]);

  return {
    scrollRef,
    showArrow,
    clientHeight,
    scrollHeight,
    offsetHeight,
    spacerRef,
    spacerHeight,
    setSpacerHeight,
  };
}
