import CleanupProtocol from "cleanup-protocol";
import { Camera, Vec3, Plane, Program, Renderer, Transform, Vec2 } from "ogl";
import { PointerInfoProvider } from "./PointerInfoProvider";
import { PlaneObjectList } from "./PlaneObjectList";

import { AnimatedValue } from "./AnimatedValue/AnimatedValue";

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
    const worldScroll = this.screenYToWorldY(
      this.scroll.getCurrent(),
      this.camera.position.z,
      0,
      this.camera.fov,
      window.innerHeight
    );

    this.items.update(this.renderer.gl, this.scene, worldScroll + 0.5);
    this.renderer.render({ scene: this.scene, camera: this.camera });

    // Update the DOM element
    this.contentElm.style.transform = `translateY(${this.scroll.getCurrent()}px)`;

    if (!this.shouldUpdate) return;
    this.animFrame = requestAnimationFrame(this.update.bind(this));
  }

  private screenYToWorldY(
    yScreen: number,
    zWorld: number,
    zCamera: number,
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
