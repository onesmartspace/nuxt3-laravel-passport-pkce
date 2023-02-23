import { AuthStorage } from "./types";
export default class MemoryDriver implements AuthStorage {
    private data;
    getItem(key: string): any;
    setItem(key: string, value: any): void;
}
//# sourceMappingURL=MemoryDriver.d.ts.map