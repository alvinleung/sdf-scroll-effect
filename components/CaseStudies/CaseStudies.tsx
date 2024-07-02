import React from 'react'
import SDF_FRAG from "./sdf.frag";
import Plane from '../WebGLScroll/Plane';

type Props = {}

const CaseStudiues = (props: Props) => {
  return (
    <div className="flex w-full gap-2">
      <Plane fragmentShader={SDF_FRAG}>
        test fdsafdjskafdsa
      </Plane>
      <Plane fragmentShader={SDF_FRAG}>
        test
      </Plane>
      <Plane fragmentShader={SDF_FRAG}>
        test
      </Plane>
    </div>
  )
}

export default CaseStudiues
