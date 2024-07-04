import CleanupProtocol from "cleanup-protocol";

export class InfoLogger implements CleanupProtocol {
  private static _instance: InfoLogger;

  private container: HTMLDivElement;
  private parent: HTMLElement;

  private constructor(parent: HTMLElement) {
    this.parent = parent;
    this.container = document.createElement("div");
    this.container.style.position = "fixed";
    this.container.style.fontFamily = "monospace";
    this.container.style.bottom = "0px";
    this.container.style.left = "0px";

    parent.appendChild(this.container);
  }

  cleanup(): void {
    this.parent.removeChild(this.container);
  }

  private infos = new Map<string, RecordElement>();

  public static get instance(): InfoLogger {
    if (!InfoLogger._instance) {
      // eslint-disable-next-line enforce-cleanup/call-cleanup
      InfoLogger._instance = new InfoLogger(document.body);
    }
    return InfoLogger._instance;
  }

  public log(id: string, value: any) {
    let record = this.infos.get(id);
    if (!record) {
      record = new RecordElement(id, value, this.container);
      this.infos.set(id, record);
    }
    record.updateValue(value);
  }

}

class RecordElement implements CleanupProtocol {

  private elm: HTMLDivElement;

  private parent: HTMLElement;
  private id: string;

  constructor(id: string, value: string, parent: HTMLElement) {
    this.elm = document.createElement("div");
    this.elm.innerHTML = `${id}: ${value}`;
    this.id = id;

    this.parent = parent;
    this.parent.appendChild(this.elm);
  }

  updateValue(value: string) {
    this.elm.innerHTML = `${this.id}: ${value}`
  }

  cleanup(): void {
    this.parent.removeChild(this.elm)
  }

}
