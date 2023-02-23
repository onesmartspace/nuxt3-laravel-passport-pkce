import { AuthStorage } from "./types";

export default class MemoryDriver implements AuthStorage {
  private data: any;

  public getItem(key: string): any {
    return this.data?.hasOwnProperty(key) ? this.data[key] : null;
  }

  public setItem(key: string, value: any): void {
    this.data[key] = value;
  }
}
