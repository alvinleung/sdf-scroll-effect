"use client";

import Plane from "@/components/WebGLScroll/Plane";
import WebGLScrollContainer from "@/components/WebGLScroll/WebGLScrollContainer";
import CUSTOM_FRAG from "../components/WebGLScroll/ScrollCanvas/Shaders/Custom.frag";


import { Vec4 } from "ogl";
import { useEffect, useRef } from "react";
import CaseStudies from "@/components/CaseStudies/CaseStudies";

export default function Home() {
  // eslint-disable-next-line enforce-cleanup/call-cleanup
  const colorVal = useRef(new Vec4(1, 1, 0.4, 1));
  useEffect(() => {
    let animFrame = 0;
    function update(t: number) {
      colorVal.current.y = Math.sin(t * 0.001);
      animFrame = requestAnimationFrame(update);
    }
    animFrame = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, []);
  return (
    <WebGLScrollContainer>
      <main>
        <CaseStudies />
      </main>
    </WebGLScrollContainer>
  );
}
