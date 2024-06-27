import { useEffect, useRef } from "react";
import { AnimatedValue } from "./AnimatedValue";

export function useAnimatedValue(initial = 0) {
  // eslint-disable-next-line enforce-cleanup/call-cleanup
  const scrollValue = useRef(new AnimatedValue(initial)).current;
  useEffect(() => {
    () => {
      scrollValue.cleanup();
    };
  }, [scrollValue]);
  return scrollValue;
}
