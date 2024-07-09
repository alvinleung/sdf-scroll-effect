import { OGLRenderingContext, Texture, TextureOptions } from "ogl";

/**
  * 
  * Lazy init version of the ogl texture,
  * it only init first run in the texture.
  *
  */
// eslint-disable-next-line enforce-cleanup/implement-cleanup
export class LazyTexture {
  private _texture: Texture | undefined;
  private config: Partial<TextureOptions>;
  constructor(options?: Partial<TextureOptions>) {
    this.config = options || {};
  }
  getTexture(gl: OGLRenderingContext) {
    if (!this._texture) {
      this._texture = new Texture(gl, this.config);
    }
    return this._texture;
  }
}
