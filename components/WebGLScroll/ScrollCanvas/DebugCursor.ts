import CleanupProtocol from "cleanup-protocol";
import { Mesh, OGLRenderingContext, Plane, Program, Transform, Vec2, Vec3 } from "ogl";
import DEFAULT_FRAG from "./Shaders/Default.frag";
import CURSOR_VERT from "./Shaders/Cursor.vert";
import { PointerInfoProvider } from "./PointerInfoProvider";

export class DebugCursor implements CleanupProtocol {

  private cursorMesh: Mesh;
  private scene: Transform;

  constructor(gl: OGLRenderingContext, scene: Transform) {
    this.scene = scene;

    /// add debug cursor mesh
    const defaultGeom = new Plane(gl, { width: .05, height: .05 });
    const defaultProgram = new Program(gl, {
      fragment: DEFAULT_FRAG, vertex: CURSOR_VERT, uniforms: {
        uMouseWorld: {
          value: new Vec2()
        }
      }
    })
    this.cursorMesh = new Mesh(gl, { program: defaultProgram, geometry: defaultGeom })
    this.cursorMesh.setParent(this.scene);
  }

  update(pointerWorldPosition: Vec3) {
    this.cursorMesh.program.uniforms.uMouseWorld.value = pointerWorldPosition;
  }
  cleanup(): void {
  }

}
