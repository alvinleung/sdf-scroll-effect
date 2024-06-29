"use client";

import React, { MutableRefObject, RefObject, useEffect, useRef } from "react";
import { PlaneObject } from "./ScrollCanvas";
import { useScrollItemList } from "./WebGLScrollContainer";
import { useVirtualScroll } from "./VirtualScroll";
import { useWindowSize } from "usehooks-ts";

type Props = {
  vertexShader?: string;
  fragmentShader?: string;
  uniforms?: {
    [key: string]: {
      value: any;
    };
  };
};

const Plane = ({
  fragmentShader,
  vertexShader,
  uniforms,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & Props) => {
  const itemRef = useRef() as RefObject<HTMLDivElement>;
  const scrollItems = useScrollItemList();
  const { width, height } = useWindowSize();
  const { scroll } = useVirtualScroll();
  const planeObject = useRef() as MutableRefObject<PlaneObject>;

  useEffect(() => {
    planeObject.current = scrollItems.create();
    return () => {
      scrollItems.delete(planeObject.current);
    };
  }, [scrollItems]);

  useEffect(() => {
    if (!planeObject.current) return;
    planeObject.current.setProgram({
      vertex: vertexShader,
      fragment: fragmentShader,
    });
  }, [vertexShader, fragmentShader]);

  useEffect(() => {
    if (!itemRef.current) return;
    const bounds = itemRef.current.getBoundingClientRect();
    planeObject.current.setPlaneDOMDimension({
      width: bounds.width,
      height: bounds.height,
      left: bounds.left,
      top: bounds.top - scroll.getCurrent(),
    });
  }, [width, height, scroll]);

  useEffect(() => {
    if (!planeObject.current || !uniforms) return;
    planeObject.current.setUniforms(uniforms);
  }, [uniforms]);

  return (
    <div ref={itemRef} {...props}>
      {children}
    </div>
  );
};

export default Plane;
