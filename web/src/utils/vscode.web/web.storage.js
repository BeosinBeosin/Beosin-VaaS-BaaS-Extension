function Storage(vscode) {
    this.cache = {};
    this.setItem = (key, value, isSync=true, archive=undefined) => {
        archive && (value = archive(value));
        this.cache[key] = value;
        const items = {};
        items[key] = value;
        isSync && (this.sync(items));
    };
    this.getItem = (key, unarchive=undefined) => {
        return unarchive ? unarchive(this.cache[key]) : this.cache[key];
    };
    this.removeItem = (key) => {
        this.cache[key] = undefined;
    };
    this.clearItem = () => {
        this.cache = {};
    };
    this.updateItems = (items, isSync=true) => {
        for (const key in items) {
            this.setItem(key, items[key], undefined, false);
        }
        isSync && this.sync(items);
    };
    // 同步更新拓展的缓存
    this.sync = (items) => {
        vscode.updateStorage(items);
    };
    // 更新来自拓展的缓存
    vscode && vscode.onUpdateStorage && vscode.onUpdateStorage((message) => {
        if (message.data) {
            this.updateItems(message.data, false);
        }
    }, 0);
}

export default Storage;