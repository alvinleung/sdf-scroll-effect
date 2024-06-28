"use client";

import React, {
  MutableRefObject,
  RefObject,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useWindowSize } from "usehooks-ts";
import { VirtualScrollProvider, useVirtualScroll } from "./VirtualScroll";
import { ScrollCanvas } from "./ScrollCanvas";
import { PlaneObjectList } from "./ScrollCanvas/PlaneObjectList";

type Props = {
  children: React.ReactNode;
};

const ScrollItemContext = createContext<PlaneObjectList>(PlaneObjectList.empty);
export const useScrollItemList = () => useContext(ScrollItemContext);

const WebGLScrollContainer = ({ children }: Props) => {
  const scrollContentRef = useRef() as RefObject<HTMLDivElement>;
  const canvasRef = useRef() as RefObject<HTMLCanvasElement>;
  const { width, height } = useWindowSize({ initializeWithValue: false });
  const { scroll } = useVirtualScroll();

  const items = useMemo(() => {
    // eslint-disable-next-line enforce-cleanup/call-cleanup
    return new PlaneObjectList();
  }, []);
  const scrollCanvas = useRef() as MutableRefObject<ScrollCanvas>;

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;
    scrollCanvas.current = new ScrollCanvas({ canvas, items });

    return () => {
      scrollCanvas.current.cleanup();
    };
  }, [canvasRef, scrollContentRef, scroll, items]);

  useEffect(() => {
    if (!scrollCanvas.current) return;
    scrollCanvas.current.resizeToWindow();
  }, [width, height]);

  return (
    <ScrollItemContext.Provider value={items}>
      <VirtualScrollProvider contentRef={scrollContentRef}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="fixed w-screen h-svh inset-0"
        />
        <div className="fixed w-screen h-svh inset-0 touch-none">
          <div ref={scrollContentRef}>{children}</div>
        </div>
      </VirtualScrollProvider>
    </ScrollItemContext.Provider>
  );
};

export default WebGLScrollContainer;
