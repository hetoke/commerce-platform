import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

const Typewriter = ({
  text,
  speed = 35,
  delay = 0,
  className,
  showCursor = true,
}) => {
  const [display, setDisplay] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let timeoutId;
    let intervalId;

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
};

Typewriter.propTypes = {
  text: PropTypes.string.isRequired,
  speed: PropTypes.number,
  delay: PropTypes.number,
  className: PropTypes.string,
  showCursor: PropTypes.bool,
};

Typewriter.defaultProps = {
  speed: 35,
  delay: 0,
  className: "",
  showCursor: true,
};

export default Typewriter;
