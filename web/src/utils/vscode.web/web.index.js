import Vscode from './web.vscode';
import Storage from './web.storage';

class MyVscode extends Vscode {
    vaasStart = ({vaasPath, platform, contractPath, contractName, contractVersion}) => {
        return this.post({cmd: `vaasStart`, args: {vaasPath, platform, contractPath, contractName, contractVersion}});
    };
    vaasEnd = ({vaasPath}) => {
        return this.post({cmd: `vaasEnd`, args: {vaasPath}});
    };
    vaasSettingRead = ({path=undefined}) => {
        return this.post({cmd: `vaasSettingRead`, args: {path}});
    };
    vaasSettingUpdate = (items) => {
        return this.post({cmd: `vaasSettingUpdate`, args: items});
    };
}

// vscode
const origin = (_ => {
    try {
        return acquireVsCodeApi();
    } catch (_) {
        return {
            postMessage: () => { console.log("Not Found: 'acquireVsCodeApi'"); },
            setState: () => { console.log("Not Found: 'acquireVsCodeApi'"); },
            getState: () => { console.log("Not Found: 'acquireVsCodeApi'"); }
        };
    }
})();
const vscode = new MyVscode(origin);
window.addEventListener('message', vscode.received);
window.vscode = vscode;
// storage
const storage = new Storage(vscode);
window.storage = storage;

export {vscode, storage};