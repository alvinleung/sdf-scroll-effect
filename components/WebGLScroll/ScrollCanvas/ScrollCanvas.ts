import CleanupProtocol from "cleanup-protocol";
import { Camera, Mesh, Plane, Program, Renderer, Transform } from "ogl";
import { PointerInfoProvider } from "./PointerInfoProvider";
import { PlaneObjectList } from "./PlaneObjectList";

import { AnimatedValue } from "./AnimatedValue/AnimatedValue";

interface ScrollCanvasConfig {
  canvas: HTMLCanvasElement;
  items: PlaneObjectList;
  scroll: AnimatedValue;
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

  constructor({ canvas, items, scroll }: ScrollCanvasConfig) {
    this.items = items;
    this.scroll = scroll;

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
    this.items.update(this.renderer.gl, this.scene, this.scroll);
    this.renderer.render({ scene: this.scene, camera: this.camera });

    if (!this.shouldUpdate) return;
    this.animFrame = requestAnimationFrame(this.update.bind(this));
  }

  cleanup(): void {
    cancelAnimationFrame(this.animFrame);

    // deinit functions
    this.shouldUpdate = false;
    this.pointer.cleanup();
  }
}
