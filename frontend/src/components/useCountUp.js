import { useEffect, useState } from "react";

const useCountUp = (targetNumber, duration) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = targetNumber;
    const range = end - start;
    let current = start;
    const increment = end / (duration / 50);

    const timer = setInterval(() => {
      current += increment;
      if (current > end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.round(current));
      }
    }, 50);

    return () => clearInterval(timer);
  }, [targetNumber, duration]);

  return count;
};

export default useCountUp;
