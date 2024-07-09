import React, { useMemo } from "react";
import SDF_FRAG from "./sdf.frag";
import IMAGE_FRAG from "./image.frag";
import Plane from "../WebGLScroll/Plane";
import { useAssetManager } from "../AssetManager/AssetManagerContext";
import { ImageAsset } from "../AssetManager/ImageAsset";
import { LazyTexture } from "../WebGLScroll/ScrollCanvas/LazyTexture";

type Props = {};

const CaseStudiues = (props: Props) => {
  const { assets, isLoaded } = useAssetManager()

  const tex = useMemo(() => {
    if (!isLoaded) return undefined;
    const texture = new LazyTexture({
      image: assets.get<ImageAsset>("superpower-image").getImage()
    })
    return texture;
  }, [isLoaded])

  return (
    <div>
      <div className="grid grid-cols-3 w-full gap-2 p-2">
        <Plane fragmentShader={IMAGE_FRAG}
          uniforms={{
            uTexture: {
              value: tex
            }
          }}
          className="h-96">4</Plane>
        <Plane fragmentShader={IMAGE_FRAG} uniforms={{
          uTexture: {
            value: tex
          }
        }} className="h-[100vh] col-span-2">6</Plane>
        <Plane fragmentShader={IMAGE_FRAG} uniforms={{
          uTexture: {
            value: tex
          }
        }} className="h-96">6</Plane>
        <Plane fragmentShader={IMAGE_FRAG} uniforms={{
          uTexture: {
            value: tex
          }
        }} className="h-96">6</Plane>
        <Plane fragmentShader={IMAGE_FRAG} uniforms={{
          uTexture: {
            value: tex
          }
        }} className="h-96">6</Plane>
      </div>
    </div>
  );
};

export default CaseStudiues;
