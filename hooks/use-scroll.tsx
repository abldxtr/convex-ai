import { useCallback, useEffect, useRef, useState } from "react";

export function useScroll() {
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

  return { scrollRef, showArrow, clientHeight, scrollHeight, offsetHeight };
}
