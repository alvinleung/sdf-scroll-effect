import CleanupProtocol from "cleanup-protocol";
import { Camera, Mat4, Mesh, Plane, Program, Renderer, Transform, Vec2, Vec3, Vec4 } from "ogl";
import { PointerInfoProvider } from "./PointerInfoProvider";
import { PlaneObjectList } from "./PlaneObjectList";

import { AnimatedValue } from "./AnimatedValue/AnimatedValue";
import { Status } from "status-hud";
import { DebugCursor } from "./DebugCursor";

export interface ScrollCanvasRenderingInfo {
  uMouseWorld: Vec3;
  uScroll: number;
  uMouse: Vec2;
  camera: Camera;
}

interface ScrollCanvasConfig {
  canvas: HTMLCanvasElement;
  items: PlaneObjectList;
  scroll: AnimatedValue;
  contentElm: HTMLDivElement;
}

export class ScrollCanvas implements CleanupProtocol {
  private renderer: Renderer;
  private camera: Camera;
  private scene: Transform;
  private pointer: PointerInfoProvider;
  private items: PlaneObjectList;

  private shouldUpdate = true;
  private animFrame = 0;
  private scroll: AnimatedValue;
  private contentElm: HTMLDivElement;

  constructor({ canvas, items, scroll, contentElm }: ScrollCanvasConfig) {
    this.items = items;
    this.scroll = scroll;
    this.contentElm = contentElm;

    const renderer = new Renderer({ canvas });
    const gl = renderer.gl;
    this.renderer = renderer;

    // init the scene
    const camera = new Camera(gl);
    camera.position.z = this.getCameraPositionThatFillUpTheScreen(camera);
    camera.position.y = -0.5;

    this.camera = camera;
    this.resizeToWindow();

    this.scene = new Transform();

    // add pointer event
    this.pointer = new PointerInfoProvider(canvas);

    this.animFrame = requestAnimationFrame(this.update.bind(this));
  }

  private getCameraPositionThatFillUpTheScreen(camera: Camera) {
    const planeWidth = 1;
    const distance =
      planeWidth / 2 / Math.tan((camera.fov / 2) * (Math.PI / 180));
    return distance;
  }
  resizeToWindow() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    const canvas = this.renderer.gl.canvas;
    this.camera.perspective({
      aspect: canvas.width / canvas.height,
    });
    this.camera.position.z = this.getCameraPositionThatFillUpTheScreen(
      this.camera
    );
  }

  private update(time: number) {
    // prepare scroll value
    const worldScroll = this.screenYToWorldY(
      this.scroll.getCurrent(),
      this.camera.position.z,
      this.camera.fov,
      window.innerHeight
    );


    // prepare mouse-in-world value
    const ndcZ = worldZToNDCZ(this.pointer.positionNormalized, 0, this.camera);
    const pointerWorldPosition = new Vec3(
      this.pointer.positionNormalized.x,
      this.pointer.positionNormalized.y,
      ndcZ
    );
    this.camera.unproject(pointerWorldPosition);

    // assemble the overall-uniforms and render info for plane objects
    const info: ScrollCanvasRenderingInfo = {
      uMouseWorld: pointerWorldPosition,
      uScroll: worldScroll + .5,
      uMouse: this.pointer.positionNormalized,
      camera: this.camera
    }

    this.items.update(this.renderer.gl, this.scene, info);
    this.renderer.render({ scene: this.scene, camera: this.camera });

    // Update the DOM element
    this.contentElm.style.transform = `translateY(${this.scroll.getCurrent()}px)`;

    if (!this.shouldUpdate) return;
    this.animFrame = requestAnimationFrame(this.update.bind(this));
  }

  private screenYToWorldY(
    yScreen: number,
    zWorld: number,
    fovY: number,
    screenHeight: number
  ): number {
    // Convert FOV from degrees to radians
    const fovYRad = (fovY * Math.PI) / 180;

    // Calculate the focal length
    const f = screenHeight / 2 / Math.tan(fovYRad / 2);

    // Adjust screen y to center it (assuming origin at top-left corner)
    const yScreenCentered = yScreen - screenHeight / 2;

    // Apply the perspective transformation formula
    const yWorld = (yScreenCentered * zWorld) / f;

    return yWorld;
  }

  cleanup(): void {
    cancelAnimationFrame(this.animFrame);

    // deinit functions
    this.shouldUpdate = false;
    this.pointer.cleanup();
  }
}


function worldZToNDCZ(ndcPosition2D: Vec2, zWorld: number, camera: Camera): number {
  // Creating a Vector3 in world space
  const point = new Vec3(ndcPosition2D.x, ndcPosition2D.y, zWorld);

  // Transform the point from world space to view space
  point.applyMatrix4(camera.viewMatrix);

  // Now the point is in view space, proceed to transform it to clip space
  const clipSpacePoint = point.clone();
  clipSpacePoint.applyMatrix4(camera.projectionMatrix);

  // Normalize to NDC
  const ndcZ = clipSpacePoint.z / 1.0;

  return ndcZ;
}
