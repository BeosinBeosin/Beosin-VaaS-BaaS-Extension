import MessageCenter from './web.message';

class Vscode {
    constructor(origin) {
        // 原vscodeApi
        this.origin = origin;
        // 消息中心
        this.messageCenter = new MessageCenter(this.origin);
        this.received = this.messageCenter.received;
        this.post = this.messageCenter.post;
        this.on = this.messageCenter.on;
        this.off = this.messageCenter.off;
    }
    updateStorage = (items) => {
        this.post({cmd: `updateStorage`, args: items, reply: false});
    }
    onUpdateStorage = (callBack, times=1) => {
        this.on(`updateStorage`, callBack, times);
    }
    platform = () => {
        return this.post({cmd: `platform`});
    }
    showTxt2Output = ({txt, preserveFocus=true}) => {
        return this.post({cmd: `showTxt2Output`, args: {txt, preserveFocus}});
    }
    showTextDocument = ({filePath, viewColumn=0, preserveFocus=false, preview=false}) => {
        const args = {filePath};
        viewColumn && (args.viewColumn = viewColumn);
        preserveFocus && (args.preserveFocus = preserveFocus);
        preview && (args.preview = preview);
        return this.post({cmd: `showTextDocument`, args, reply: false});
    }
    showOpenDialog = ({canSelectFiles=true, canSelectFolders=false, canSelectMany=false, defaultUri=undefined, filters=undefined}) => {
        return this.post({cmd: `showOpenDialog`, args: {canSelectFiles, canSelectFolders, canSelectMany, defaultUri, filters}});
    }
    showMessage = ({txt, btns=undefined}) => {
        return this.post({cmd: `showMessage`, args: {txt, btns}, reply: btns});
    }
    showError = ({txt, btns=undefined}) => {
        return this.post({cmd: `showError`, args: {txt, btns}, reply: btns});
    }
    showWarn = ({txt, btns=undefined}) => {
        return this.post({cmd: `showWarn`, args: {txt, btns}, reply: btns});
    }
    readFile = ({path, options=undefined}) => {
        return this.post({cmd: `readFile`, args: {path, options}});
    }
    writeFile = ({path, options=undefined}) => {
        return this.post({cmd: `writeFile`, args: {path, options}});
    }
}

export default Vscode;