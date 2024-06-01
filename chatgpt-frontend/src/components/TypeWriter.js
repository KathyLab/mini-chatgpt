import React, { useState, useEffect, useCallback } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

const TypeWriter = ({ text, streaming }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);
  const [typing, setTyping] = useState(false);

  const computedSpeed = useCallback(() => {
    const speed = Math.floor(2000 / text.length);
    if (speed > 200) {
      return 200;
    }
    return speed;
  }, [text]);

  useEffect(() => {
    if (index < text.length) {
      setTyping(true);
      const speed = computedSpeed();
      const timeoutId = setTimeout(() => {
        setDisplayedText((prev) => prev + text.charAt(index));
        setIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeoutId); // 清除超时以避免内存泄漏
    }

    if (index >= text.length && !streaming) {
      setTyping(() => false);
    }
  }, [index, text, computedSpeed, streaming]);

  return (
    <div>
      <MarkdownRenderer
        markdown={displayedText}
        streaming={typing}
      ></MarkdownRenderer>
    </div>
  );
};

export default TypeWriter;
