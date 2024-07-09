import CleanupProtocol from "cleanup-protocol";
import { Asset, AssetManager } from "./AssetManager";

export class AudioController implements CleanupProtocol {
  cleanup(): void {}
  private static _isMuted = false;
  public static isMuted() {
    return this._isMuted;
  }

  public static hasInteractedWithDocument() {}
  public static mute() {
    this._isMuted = true;

    // go through all audio asset and mute all
    const assets = AssetManager.getInstance();
    const allAudio = assets.findAll<AudioAsset>((id, asset) => {
      return asset instanceof AudioAsset;
    });

    Object.entries(allAudio).map(([id, audio]) => {
      audio.mute();
    });
  }

  public static unmute() {
    this._isMuted = true;

    const assets = AssetManager.getInstance();
    const allAudio = assets.findAll<AudioAsset>((id, asset) => {
      // console.log(asset instanceof AudioAsset);
      return asset instanceof AudioAsset;
    });
    console.log(allAudio);
    Object.entries(allAudio).map(([id, audio]) => {
      audio.unmute();
    });
  }
}

export class AudioAsset implements Asset, CleanupProtocol {
  private _isloaded = false;
  private _isLoading = false;
  private src: string;
  // eslint-disable-next-line enforce-cleanup/call-cleanup
  private audio = new Audio();

  private isMuted = false;

  constructor(src: string) {
    this.src = src;
  }
  isLoading(): boolean {
    return this._isLoading;
  }

  cleanup(): void {}

  public mute() {
    this.isMuted = true;
    this.audio.volume = 0;
    this.stop();
  }

  public unmute() {
    this.isMuted = false;
    this.audio.volume = 1;
  }

  public getAudio() {
    return this.audio;
  }
  public isLoaded() {
    return this._isloaded;
  }

  public play() {
    if (this.isMuted) return;

    this.audio.currentTime = 0;
    this.audio.play();
  }

  public trigger() {
    console.log(this.isMuted);

    if (this.isMuted) return;

    const newAudio = this.audio.cloneNode() as HTMLAudioElement;
    newAudio.currentTime = 0;
    newAudio.play();
  }

  public loop() {
    this.audio.loop = true;
    this.audio.currentTime = 0;
    this.audio.play();
  }

  public stop() {
    this.audio.pause();
  }

  public load(): Promise<Asset> {
    // start loading
    // eslint-disable-next-line enforce-cleanup/call-cleanup
    return new Promise((resolve, reject) => {
      this._isLoading = true;

      // if we have to pull from the server
      this.audio.ondurationchange = () => {
        this._isloaded = true;
        this._isLoading = false;
        resolve(this);
      };
      this.audio.src = this.src;
      this.audio.preload = "auto";

      // if the browser cached of the image already
      if (this.audio.readyState >= this.audio.HAVE_ENOUGH_DATA) {
        console.log(
          `Audio ${this.src} is loaded already, using the browser cached version`
        );
        this._isloaded = true;
        this._isLoading = false;
        resolve(this);
        return;
      }

      // if not then load the audio
      this.audio.load();
    });
  }
}
