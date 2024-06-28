import Plane from "@/components/WebGLScroll/Plane";
import WebGLScrollContainer from "@/components/WebGLScroll/WebGLScrollContainer";

export default function Home() {
  return (
    <main>
      <WebGLScrollContainer>
        <Plane>test</Plane>
        <Plane>test</Plane>
        <Plane>test</Plane>
      </WebGLScrollContainer>
    </main>
  );
}
