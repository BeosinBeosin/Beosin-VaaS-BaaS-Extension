const fs = require('fs');
const path = require('path');

function Storage (name='storage.json') {
    this.dir = path.join(__dirname, 'file');
    fs.existsSync(this.dir) || fs.mkdirSync(this.dir);
    this.path = name ? path.join(this.dir, name) : undefined;
    this.pathError = "Storage path error.";
    this.cache = {};
    this.setItem = (key, value, archive=undefined) => {
        this.cache[key] = archive ? archive(value) : value;
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
    this.updateItems = (items) => {
        for (const key in items) {
            this.setItem(key, items[key]);
        }
    };
    this.read = (name=undefined) => {
        name && (this.path = path.join(this.dir, name));
        if (!this.path || !fs.existsSync(this.path)) {return this.pathError;}
        let cache = fs.readFileSync(this.path).toString();
        let err = undefined;
        if (cache) {
            try {
                cache = JSON.parse(cache);
                cache && (this.updateItems(cache));
            } catch(e) {
                err = `${e}`;
            }
        }
        return err;
    };
    this.write = (complete=undefined) => {   
        if (!this.path) {
            complete && complete(this.pathError);
            return;
        }
        fs.writeFile(this.path, JSON.stringify(this.cache, undefined, 4), (err) => {
            if (err && typeof err !== 'string') {
                err = err['message'] || err.toString();
            }
            complete && complete({error: err});
        });
    };
}

module.exports = Storage;