import CleanupProtocol from "cleanup-protocol";
import { OGLRenderingContext, Program } from "ogl";

export class ShaderRepository implements CleanupProtocol {
  private static _instance: ShaderRepository;
  public static get instance(): ShaderRepository {
    if (!ShaderRepository._instance) {
      // eslint-disable-next-line enforce-cleanup/call-cleanup
      ShaderRepository._instance = new ShaderRepository();
    }
    return ShaderRepository._instance;
  }
  private constructor() {}

  private _compiled: { [key: string]: Program } = {};

  getProgram(
    gl: OGLRenderingContext,
    vertex: string,
    fragment: string,
    uniforms: { [key: string]: { value: any } } = {}
  ): Program {
    const hash = fragment + vertex;
    if (this._compiled[hash]) {
      return this._compiled[hash];
    }
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms,
    });
    this._compiled[hash] = program;
    return program;
  }

  cleanup() {}
}
