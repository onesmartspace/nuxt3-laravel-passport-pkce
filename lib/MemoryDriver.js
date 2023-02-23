export default class MemoryDriver {
    data;
    getItem(key) {
        return this.data.hasOwnProperty(key) ? this.data[key] : null;
    }
    setItem(key, value) {
        this.data[key] = value;
    }
}
//# sourceMappingURL=MemoryDriver.js.map