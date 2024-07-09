import CleanupProtocol from "cleanup-protocol";
import { Asset } from "./AssetManager";

export class TextureAsset implements Asset, CleanupProtocol {
  private _isloaded = false;
  private _isLoading = false;
  private src: string;
  private image = document.createElement("img");

  constructor(src: string) {
    this.src = src;
  }
  cleanup(): void {}
  isLoading(): boolean {
    return this._isLoading;
  }
  public getImage() {
    return this.image;
  }
  public isLoaded() {
    return this._isloaded;
  }
  public load(): Promise<Asset> {
    // eslint-disable-next-line enforce-cleanup/call-cleanup
    return new Promise((resolve, reject) => {
      this._isLoading = true;

      // if we have to pull from the server
      this.image.onload = () => {
        //image loaded
        resolve(this);
        this._isloaded = true;
        this._isLoading = false;
      };
      this.image.src = this.src;

      // if the browser cached of the image already
      if (this.image.complete) {
        console.log(
          `Image ${this.src} is loaded already, using the browser cached version`
        );
        this._isloaded = true;
        this._isLoading = false;
        resolve(this);
        return;
      }
    });
  }
}
