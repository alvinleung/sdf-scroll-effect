import CleanupProtocol from "cleanup-protocol";
import { Mesh, OGLRenderingContext, Plane, Program, Transform } from "ogl";
import { PlaneObjectList } from "./PlaneObjectList";
import DEFAULT_FRAG from "./Shaders/Default.frag";
import DEFAULT_VERT from "./Shaders/Default.vert";
import { ShaderRepository } from "./ShaderRepository";

export interface PlaneDOMDimension {
  left: number;
  top: number;
  width: number;
  height: number;
}
interface ProgramSource {
  vertex: string;
  fragment: string;
}

let sceneRef: any;
export class PlaneObject implements CleanupProtocol {
  private _needUpdateMesh: boolean = true;
  private _needUpdateShader: boolean = true;
  private _mesh: Mesh | undefined;
  private _program: Program | undefined;

  private _domDimension: PlaneDOMDimension = {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  };

  private _fragment: string = DEFAULT_FRAG;
  private _vertex: string = DEFAULT_VERT;

  setProgram({ vertex, fragment }: Partial<ProgramSource>) {
    if (vertex) this._vertex = vertex;
    if (fragment) this._fragment = fragment;
    this._needUpdateShader = true;
  }

  setPlaneDOMDimension(planeDimensionInfo: PlaneDOMDimension) {
    this._domDimension = planeDimensionInfo;
    this._needUpdateMesh = true;
  }

  update(gl: OGLRenderingContext, scene: Transform) {
    if (this._needUpdateShader) {
      this._program = ShaderRepository.instance.getProgram(
        gl,
        this._vertex,
        this._fragment
      );
      this._needUpdateShader = false;
    }

    if (this._needUpdateMesh && this._program) {
      // if mesh alread exist, remove the previous copy
      this._mesh && scene.removeChild(this._mesh);

      // // make mesh and add it to the scene
      const geometry = new Plane(gl);
      this._mesh = new Mesh(gl, { geometry, program: this._program });
      this._mesh.setParent(scene);

      // switch the update flag off so that it won't run on next loop
      this._needUpdateMesh = false;
    }
  }

  cleanup(): void {}
}
