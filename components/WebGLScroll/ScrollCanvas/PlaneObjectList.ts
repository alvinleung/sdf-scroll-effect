import CleanupProtocol from "cleanup-protocol";
import { PlaneObject } from "./PlaneObject";
import { Mesh, OGLRenderingContext, Plane, Program, Transform } from "ogl";
import { ShaderRepository } from "./ShaderRepository";
import DEFAULT_FRAG from "./Shaders/Default.frag";
import DEFAULT_VERT from "./Shaders/Default.vert";

export class PlaneObjectList implements CleanupProtocol {
  private _planes: PlaneObject[] = [];
  // eslint-disable-next-line enforce-cleanup/call-cleanup
  public static empty = new PlaneObjectList();

  create() {
    // eslint-disable-next-line enforce-cleanup/call-cleanup
    const plane = new PlaneObject();
    this._planes.push(plane);

    return plane;
  }

  update(gl: OGLRenderingContext, scene: Transform) {
    for (let i = 0; i < this._planes.length; i++) {
      this._planes[i].update(gl, scene);
    }
  }
  delete(plane: PlaneObject) {
    plane.cleanup();
    const index = this._planes.findIndex((item) => item === plane);
    if (index === -1) return; // item not found on the list
    this._planes.splice(index, 1);
  }

  cleanup(): void {
    // deinit all planes
    this._planes.forEach((plane) => {
      plane.cleanup();
    });
  }
}
