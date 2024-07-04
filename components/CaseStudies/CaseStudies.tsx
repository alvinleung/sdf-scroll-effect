import React from "react";
import SDF_FRAG from "./sdf.frag";
import Plane from "../WebGLScroll/Plane";

type Props = {};

const CaseStudiues = (props: Props) => {
  return (
    <div className="grid grid-cols-4 w-full gap-2">
      <Plane fragmentShader={SDF_FRAG} className="h-96">1</Plane>
      <Plane fragmentShader={SDF_FRAG} className="h-96">2</Plane>
      <Plane fragmentShader={SDF_FRAG} className="h-96">3</Plane>
      <Plane fragmentShader={SDF_FRAG} className="h-96">4</Plane>
      <Plane fragmentShader={SDF_FRAG} className="h-96">5</Plane>
      <Plane fragmentShader={SDF_FRAG} className="h-96">6</Plane>
      <Plane fragmentShader={SDF_FRAG} className="h-96">7</Plane>
      <Plane fragmentShader={SDF_FRAG} className="h-96">8</Plane>
      <Plane fragmentShader={SDF_FRAG} className="h-96">9</Plane>
    </div>
  );
};

export default CaseStudiues;
