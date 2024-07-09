import CleanupProtocol from "cleanup-protocol";
import {
  Mesh,
  OGLRenderingContext,
  Plane,
  Program,
  Transform,
  Vec2,
} from "ogl";
import DEFAULT_FRAG from "./Shaders/Default.frag";
import DEFAULT_VERT from "./Shaders/Default.vert";
import { ShaderRepository } from "./ShaderRepository";
import { ScrollCanvasRenderingInfo } from "./ScrollCanvas";
import { LazyTexture } from "./LazyTexture";

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

const VERBOSE = false;

export class PlaneObject implements CleanupProtocol {
  private static planeObjectCount = 0;

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
      value: new Vec2(0, 0),
    },
    uScroll: {
      value: 0,
    },
    uMouse: {
      value: new Vec2(0, 0),
    },
    uMouseUv: {
      value: new Vec2(0, 0),
    },
    uPlaneAspect: {
      value: 1,
    },
    uResolution: {
      value: new Vec2(0, 0),
    }
  };

  private id = 0;
  constructor() {
    this.id = PlaneObject.planeObjectCount;
    PlaneObject.planeObjectCount++;
  }

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

  update(
    gl: OGLRenderingContext,
    scene: Transform,
    info: ScrollCanvasRenderingInfo
  ) {
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

    // load texture into the program

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
        (offsetXVW + planeVW / 2 - 0.5) * screenAspect,
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
          const uniform = this._customUniforms[key];
          if (!uniform) {
            VERBOSE && console.warn(`Uniform ${key} is empty`);
            continue;
          }
          if (typeof uniform.value === "undefined") {
            VERBOSE && console.warn(`Rendering with empty uniform "${key}"`);
            continue;
          }
          // Lazy init the texture
          if (uniform.value instanceof LazyTexture) {
            shaderUniforms[key].value = uniform.value.getTexture(gl);
            continue;
          }
          shaderUniforms[key] = uniform;
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
    this._planeUniforms.uScroll.value = info.uScroll;
    this._planeUniforms.uMouse.value = info.uMouse;
    this._planeUniforms.uPlaneAspect.value =
      this._domDimension.width / this._domDimension.height;
    this._planeUniforms.uResolution.value.x = window.innerWidth;
    this._planeUniforms.uResolution.value.y = window.innerHeight;

    const screenAspect = window.innerWidth / window.innerHeight;
    const planeOffset: Vec2 = this._planeUniforms.uPlaneOffset.value;
    const planeVW = this._domDimension.width / window.innerWidth;
    const planeVH = this._domDimension.height / window.innerHeight;
    const uMouseUv: Vec2 = this._planeUniforms.uMouseUv.value;

    const UVToWorldWidthScale = 1 / planeVW / screenAspect;
    const UVToWorldHeightScale = 1 / planeVH;
    uMouseUv.x = (planeOffset.x - info.uMouseWorld.x) * UVToWorldWidthScale;
    uMouseUv.y =
      (planeOffset.y - info.uMouseWorld.y - info.uScroll) *
      UVToWorldHeightScale;
  }

  cleanup(): void { }
}
