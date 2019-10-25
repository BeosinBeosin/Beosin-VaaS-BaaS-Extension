const vscode = require('vscode');
const Storage = require('./vscode.storage/storage')
const fs = require('fs');
const os = require('os');

const iswin = os.platform() === 'win32';
// name
let extensionName = 'Extension';
const setExtensionName = (name) => {
    extensionName = name;
}
// 全局缓存
const storage = new Storage();
// Api
class _Api {
    constructor () {
        // 更新
        this.updateStorage = (items) => {
            return new Promise((resolve, _) => {
                storage.updateItems(items);
                resolve();
            });
        }
        // Platform
        this.platform = () => {
            return new Promise((resolve, _) => {
                resolve(os.platform());
            });
        }
        // Message
        this.showMessage = ({txt, btns=undefined}) => {
            txt = `[${extensionName}] ${txt}`;
            return vscode.window.showInformationMessage(txt, btns||[]);
            // .then(btn => {})
        }
        // Error
        this.showError = ({txt, btns=undefined}) => {
            txt = `[${extensionName}] ${txt}`;
            return vscode.window.showErrorMessage(txt, btns||[]);
            // .then(btn => {})
        }
        // Warn
        this.showWarn = ({txt, btns=undefined}) => {
            txt = `[${extensionName}] ${txt}`;
            return vscode.window.showWarningMessage(txt, btns||[]);
            // .then(btn => {})
        }
        // 选择本地文件
        // vscode的bug，在ubuntu下既选文件又选文件夹会很诡异，据官方文档windows也会出现诡异情况，https://code.visualstudio.com/api/references/vscode-api#OpenDialogOptions
        // 在ubuntu和windows下不要 canSelectFiles 和 canSelectFolders 同时为 true
        this.showOpenDialog = ({canSelectFiles=true, canSelectFolders=false, canSelectMany=false, defaultUri=undefined, filters=undefined, openLabel=undefined}) => {
            // canSelectFiles:true, // 是否可选文件
            // canSelectFolders:false, // 是否可选文件夹
            // canSelectMany:true, // 是否可以选择多个
            // defaultUri:undefined, // 默认打开本地路径
            // filters:undefined, // 筛选器，例如：{'Images': ['png', 'jpg'], 'TypeScript': ['ts', 'tsx']}
            // openLabel:undefined // 按钮文字
            const options = {};
            options.canSelectFiles = canSelectFiles;
            options.canSelectFolders = canSelectFolders;
            options.canSelectMany = canSelectMany;
            defaultUri ? options.defaultUri = vscode.Uri.file(defaultUri) : undefined;
            filters ? options.filters = filters : undefined;
            openLabel ? options.openLabel = openLabel : undefined;
            return vscode.window.showOpenDialog(options);
            // .then(function(msg){ console.log(msg.path);})
        }
        // 选择框（原生下拉选择框，貌似在webview中没用）
        this.showQuickPick = ({items, canPickMany=false, ignoreFocusOut=true, matchOnDescription=true, matchOnDetail=true, placeHolder=undefined}) => {
            // canPickMany:false,  // 是否可多选，如果为true，则结果是一个选择数组
            // ignoreFocusOut:true, // 默认false，设置为true时鼠标点击别的地方输入框不会消失
            // matchOnDescription:false, // 过滤选择时包含描述的可选标志
            // matchOnDetail:true, // 过滤选择时包含细节的可选标志
            // placeHolder:undefined, // 输入框内的提示
            const options = {};
            options.canPickMany = canPickMany;
            options.ignoreFocusOut = ignoreFocusOut;
            options.matchOnDescription = matchOnDescription;
            options.matchOnDetail = matchOnDetail;
            placeHolder ? options.placeHolder = placeHolder : undefined;
            return vscode.window.showQuickPick(items, options)
            // .then(function(msg) { console.log(msg);})
        }
        // show file
        this.showTextDocument = ({filePath, viewColumn=vscode.ViewColumn.One, preserveFocus=false, preview=false, selection=undefined}) => {
            vscode.window.visibleTextEditors.find(te => {
                return te.document.uri.path === filePath;
            }) || vscode.window.showTextDocument(vscode.Uri.file(filePath), {viewColumn, preserveFocus, preview, selection});
        }
        // 输出
        this.showTxt2Output = ({txt, preserveFocus=true, line=true}) => {
            if (line) {
                this.output.appendLine(txt);
            } else {
                this.output.append(txt);
            }
            this.output.show(preserveFocus);
        }
        // terminal
        this.sendCmd2Terminal = ({text, addNewLine=true, preserveFocus=true}) => {
            this.terminal.sendText(text, addNewLine);
            this.terminal.show(preserveFocus);
        }
        // 读取文件
        this.readFile = ({path, options=undefined}) => {
            return new Promise((resolve, _) => {
                fs.readFile(path, options, (err, data) => {
                    resolve({error: err, data});
                });
            });
        }
        // 写文件
        this.writeFile = ({path, data, options=undefined}) => {
            return new Promise((resolve, _) => {
                fs.writeFile(path, data, options, (err) => {
                    resolve({error: err});
                });
            });
        }
    }
    get output() {
        this._output || (this._output = vscode.window.createOutputChannel(extensionName));
        return this._output;
    }
    get terminal() {
        this._terminal || (this._terminal = vscode.window.createTerminal(extensionName));
        return this._terminal;
    }
    toWinPath(path) {
        return typeof path === 'string' && iswin ? path.slice(1) : path;
    }
}
const Api = new _Api();

module.exports = {
    setExtensionName,
    extensionName,
    storage,
    Api,
}