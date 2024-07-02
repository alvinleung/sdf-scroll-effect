import CleanupProtocol from "cleanup-protocol";
import {
  Mesh,
  OGLRenderingContext,
  Plane,
  Program,
  Transform,
  Vec2,
} from "ogl";
import { PlaneObjectList } from "./PlaneObjectList";
import DEFAULT_FRAG from "./Shaders/Default.frag";
import DEFAULT_VERT from "./Shaders/Default.vert";
import { ShaderRepository } from "./ShaderRepository";
import { AnimatedValue } from "./AnimatedValue/AnimatedValue";

export interface PlaneDOMDimension {
  left: number;
  top: number;
  width: number;
  height: number;
}
interface ProgramSource {
  vertex: string;
  fragment: string;
  uniforms?: Uniforms;
}

type Uniforms = {
  [key: string]: {
    value: any;
  };
};
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

  private _customUniforms: Uniforms = {};
  private _planeUniforms: Uniforms = {
    uPlaneOffset: {
      // eslint-disable-next-line enforce-cleanup/call-cleanup
      value: new Vec2(0, 0),
    },
    uScroll: {
      value: 0
    }
  };

  setProgram({
    vertex = DEFAULT_VERT,
    fragment = DEFAULT_FRAG,
    uniforms = {},
  }: Partial<ProgramSource>) {
    this._vertex = vertex;
    this._fragment = fragment;
    this._customUniforms = uniforms;
    this._needUpdateShader = true;
  }

  setUniforms(uniforms: Uniforms) {
    for (const key in uniforms) {
      this._customUniforms[key] = uniforms[key];
    }
  }
  setPlaneDOMDimension(planeDimensionInfo: PlaneDOMDimension) {
    this._domDimension = planeDimensionInfo;
    this._needUpdateMesh = true;
  }

  update(gl: OGLRenderingContext, scene: Transform, scroll: number) {
    // ========================================================================
    // COMPILE SHADERS
    // ========================================================================
    if (this._needUpdateShader) {
      this._program = ShaderRepository.instance.getProgram(
        gl,
        this._vertex,
        this._fragment,
        { ...this._customUniforms, ...this._planeUniforms }
      );
      this._needUpdateShader = false;
    }

    if (this._program === undefined) {
      throw "Program is not initiated";
    }

    // ========================================================================
    // Build Mesh
    // ========================================================================
    if (this._needUpdateMesh) {
      // if mesh alread exist, remove the previous copy
      this._mesh && scene.removeChild(this._mesh);

      // make mesh and add it to the scene
      // step 1 - calculate the plane dimension in world
      const planeAspect = this._domDimension.width / this._domDimension.height;
      const screenAspect = gl.canvas.width / gl.canvas.height;

      // by default, the camera screen space matches 1 unit height in world coord,
      // so we want to stretch the plane world width according to the screen aspect ratio
      // to get it fill up the screen.
      const planeVW = this._domDimension.width / window.innerWidth;
      const geomWorldWidth = planeVW * screenAspect;
      const geomWorldHeight = geomWorldWidth / planeAspect;

      const offsetYVH = this._domDimension.top / window.innerHeight;
      const offsetXVW = this._domDimension.left / window.innerWidth;

      this._planeUniforms.uPlaneOffset.value = new Vec2(
        (offsetXVW + planeVW / 2 - .5) * screenAspect,
        -offsetYVH - geomWorldHeight / 2
      );

      const geometry = new Plane(gl, {
        width: geomWorldWidth,
        height: geomWorldHeight,
      });

      this._mesh = new Mesh(gl, { geometry, program: this._program });
      this._mesh.setParent(scene);

      this._mesh.onBeforeRender((renderInfo) => {
        // swap out uniform before render
        const shaderUniforms = renderInfo.mesh.program.uniforms;
        for (const key in this._customUniforms) {
          shaderUniforms[key] = this._customUniforms[key];
        }
        // inject the offset uniforms
        for (const key in this._planeUniforms) {
          shaderUniforms[key] = this._planeUniforms[key];
        }
      });

      // switch the update flag off so that it won't run on next loop
      this._needUpdateMesh = false;
    }

    // make sure scroll is updated to the latest scroll
    this._planeUniforms.uScroll.value = scroll;
  }

  cleanup(): void { }
}
