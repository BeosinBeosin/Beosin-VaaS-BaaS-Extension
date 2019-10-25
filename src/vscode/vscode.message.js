const { Api } = require('./vscode.utils');

class Message {
    static create(cmd, data) {
        return {cmd, data};
    }
    static updateStorage(data) {
        return {cmd: `updateStorage`, data};
    }
}

class Executor {    
    constructor () {
        for (const key in Api) {
            if (Api.hasOwnProperty(key)) {
                this[key] = Api[key];
            }
        }
    }
    get(key) {
        return this[key];
    }
}

class Handler {
    constructor(executors=[new Executor()]) {
        this.executors = executors;
        this.received = (poster, message) => {
            const cmd = message.cmd;
            const args = message.args;
            const func = (_ => {
                for(var i = 0,len = this.executors.length; i < len; i++){
                    if (this.executors[i].get(cmd)) {
                        return this.executors[i].get(cmd);
                    }
                }
                return undefined;
            })();
            if (func) {
                const p = func(args);
                if (message.reply && poster) {
                    if (p) {
                        p.then(data => {
                            message.data = data;
                            poster.postMessage(message);
                        });
                    } else {
                        poster.postMessage(message);
                    }
                }
            }
        }
    }
}

module.exports = {
    Message,
    Executor, 
    Handler
};