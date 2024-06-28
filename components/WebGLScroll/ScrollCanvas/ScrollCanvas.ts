import CleanupProtocol from "cleanup-protocol";
import { Camera, Mesh, Plane, Program, Renderer, Transform } from "ogl";
import { PointerInfoProvider } from "./PointerInfoProvider";
import { PlaneObject } from "./PlaneObject";
import { PlaneObjectList } from "./PlaneObjectList";

import VERT from "./Shaders/Default.vert";
import FRAG from "./Shaders/Default.frag";
import { ShaderRepository } from "./ShaderRepository";

interface ScrollCanvasConfig {
  canvas: HTMLCanvasElement;
  items: PlaneObjectList;
}

export class ScrollCanvas implements CleanupProtocol {
  private renderer: Renderer;
  private camera: Camera;
  private scene: Transform;
  private pointer: PointerInfoProvider;
  private items: PlaneObjectList;

  private shouldUpdate = true;
  private animFrame = 0;
  constructor({ canvas, items }: ScrollCanvasConfig) {
    this.items = items;
    const renderer = new Renderer({ canvas });
    const gl = renderer.gl;
    this.renderer = renderer;

    // init the scene
    const camera = new Camera(gl);
    camera.position.z = 2;
    this.camera = camera;
    this.resizeToWindow();

    this.scene = new Transform();

    // add pointer event
    this.pointer = new PointerInfoProvider(canvas);

    this.animFrame = requestAnimationFrame(this.update.bind(this));
  }

  resizeToWindow() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    const canvas = this.renderer.gl.canvas;
    this.camera.perspective({
      aspect: canvas.width / canvas.height,
    });
  }

  private update(time: number) {
    this.items.update(this.renderer.gl, this.scene);
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
