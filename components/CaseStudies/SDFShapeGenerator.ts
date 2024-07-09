export class SDFShapeGenerator {
  private _instance: SDFShapeGenerator | undefined;

  public get instance() {
    if (!this._instance) {
      this._instance = new SDFShapeGenerator();
    }
    return this._instance;
  }

  private constructor() {

  }

  public createRoundedCorner() {

  }
}
