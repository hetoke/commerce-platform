import { useEffect, useState } from "react";

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  showCursor?: boolean;
}

function Typewriter({
  text,
  speed = 35,
  delay = 0,
  className = "",
  showCursor = true,
}: TypewriterProps) {
  const [display, setDisplay] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setDisplay(text);
      setDone(true);
      return () => {};
    }

    setDisplay("");
    setDone(false);

    timeoutId = setTimeout(() => {
      let index = 0;
      intervalId = setInterval(() => {
        if (!isMounted) return;
        index += 1;
        setDisplay(text.slice(0, index));
        if (index >= text.length) {
          clearInterval(intervalId);
          setDone(true);
        }
      }, speed);
    }, delay);

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, speed, delay]);

  return (
    <span className={className}>
      {display}
      {showCursor && !done ? <span className="tw-cursor">_</span> : null}
    </span>
  );
}

export default Typewriter;
