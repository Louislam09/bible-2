import { useState, useEffect } from "react";

interface UseReadingTimeProps {
  text: string;
  wordsPerMinute?: number;
}

function useReadingTime({
  text,
  wordsPerMinute = 200,
}: UseReadingTimeProps): number {
  const [readingTime, setReadingTime] = useState<number>(0);

  useEffect(() => {
    if (text) {
      const wordCount = text.trim().split(/\s+/).length;
      const time = Math.ceil(wordCount / wordsPerMinute);
      setReadingTime(time);
    }
  }, [text, wordsPerMinute]);

  return readingTime;
}

export default useReadingTime;
