import CleanupProtocol from "cleanup-protocol";
import { Vec2 } from "ogl";

export class PointerInfoProvider implements CleanupProtocol {
  private _isMouseDown = false;
  private _mousePosition = new Vec2();
  private _mousePositionNormalized = new Vec2();
  private _canvas: HTMLCanvasElement;
  private _canvasWidth: number = 0;
  private _canvasHeight: number = 0;
  private _canvasLeft: number = 0;
  private _canvasTop: number = 0;
  private _resizeObserver: ResizeObserver;

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    this.updateCanvasDimensions();

    window.addEventListener("pointerdown", this.handlePointerDown.bind(this));
    window.addEventListener("pointerup", this.handlePointerUp.bind(this));
    window.addEventListener("pointermove", this.handlePointerMove.bind(this));

    // eslint-disable-next-line enforce-cleanup/call-cleanup
    this._resizeObserver = new ResizeObserver(this.handleResize.bind(this));
    this._resizeObserver.observe(this._canvas);
  }

  private updateCanvasDimensions() {
    const rect = this._canvas.getBoundingClientRect();
    this._canvasWidth = rect.width;
    this._canvasHeight = rect.height;
    this._canvasLeft = rect.left;
    this._canvasTop = rect.top;
  }

  private handlePointerDown() {
    this._isMouseDown = true;
  }

  private handlePointerUp() {
    this._isMouseDown = false;
  }

  private handlePointerMove(e: MouseEvent) {
    this._mousePosition.x = e.clientX - this._canvasLeft;
    this._mousePosition.y = e.clientY - this._canvasTop;

    this._mousePositionNormalized.x = (this._mousePosition.x / window.innerWidth) * 2 - 1;
    this._mousePositionNormalized.y = -(this._mousePosition.y / window.innerHeight) * 2 + 1;
  }

  private handleResize() {
    this.updateCanvasDimensions();
    // Recalculate normalized position based on the new size if needed
    this._mousePositionNormalized.x = (this._mousePosition.x / window.innerWidth) * 2 - 1;
    this._mousePositionNormalized.y = -(this._mousePosition.y / window.innerHeight) * 2 + 1;
  }

  get isMouseDown() {
    return this._isMouseDown;
  }

  get position() {
    return this._mousePosition;
  }

  get positionNormalized() {
    return this._mousePositionNormalized;
  }

  cleanup(): void {
    window.removeEventListener("pointerdown", this.handlePointerDown);
    window.removeEventListener("pointerup", this.handlePointerUp);
    window.removeEventListener("pointermove", this.handlePointerMove);
    this._resizeObserver.disconnect();
  }
}
