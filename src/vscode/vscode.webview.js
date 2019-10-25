const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const utils = require('./vscode.utils');
const { Message, Handler } = require('./vscode.message');

class WebView {
    constructor(name, handler = new Handler()) {
        this.name = name;
        this.handler = handler;
        this.panel = undefined;
    }
    set name(n) {
        this._name = n;
        utils.setExtensionName(n);
    }
    get name() {
        return this._name;
    }
    showPanel(context, htmlPath, viewType = this.name, title = this.name, viewColumn = vscode.ViewColumn.Three, enableScripts = true, retainContextWhenHidden = true) {
        if (this.panel) {
            this.panel.reveal(viewColumn);
        } else {
            this.panel = vscode.window.createWebviewPanel(
                viewType, // viewType
                title, // 视图标题
                viewColumn, // 显示在编辑器的哪个部位，从左往右依次
                {
                    enableScripts, // 启用JS，默认禁用
                    retainContextWhenHidden, // webview被隐藏时保持状态，避免被重置
                    localResourceRoots: [vscode.Uri.file(path.dirname(htmlPath))], // 允许本地加载资源的路径
                }
            );
            // html
            this.panel.webview.html = WebView.getHtml4Path(htmlPath);
            // webview被关掉时调用
            this.panel.onDidDispose(_ => this.onDidDispose(), undefined, context.subscriptions);
            // webview可见性变化，或位置移动时调用
            this.panel.onDidChangeViewState(state => this.onDidChangeViewState(state), undefined, context.subscriptions);
            // 接收来自webview的消息
            this.panel.webview.onDidReceiveMessage(message => this.onDidReceiveMessage(message), undefined, context.subscriptions);
        }
    }
    onDidReceiveMessage(message) {
        this.handler && this.handler.received && this.handler.received(this.panel.webview, message);
        console.log(`Extension(${this.name}) received message: ${message.cmd}`);
    }
    onDidChangeViewState(state) {
        // const p = state.panel;
        console.log(`Webview(${this.name}) did changeView state.`);
    }
    onDidDispose() {
        this.panel = undefined;
        WebView.writeStorage();
        console.log(`Webview(${this.name}) did dispose.`);
    }
    activate(context, uri, htmlPath = path.join(__dirname, '..', '..', 'web', 'dist', 'index.html')) {
        this.showPanel(context, htmlPath);
        WebView.syncStorage(this.panel.webview, uri);
    }
    deactivate() {
        WebView.writeStorage();
    }
    static syncStorage(poster, uri) {
        utils.storage.read();
        utils.storage.setItem('rootPath', utils.Api.toWinPath(vscode.workspace.rootPath));
        utils.storage.setItem('startPath', utils.Api.toWinPath(uri ? uri.path : vscode.workspace.rootPath));
        poster.postMessage(Message.updateStorage(utils.storage.cache));
    }
    static writeStorage() {
        utils.storage.write((error) => {
            if (error) {
                console.log(`Local storage write error: ${error}.`)
            } else {
                console.log(`Local storage writed.`)
            }
        });
    }
    static getHtml4Path(htmlPath) {
        const dirPath = path.dirname(htmlPath);
        let html = fs.readFileSync(htmlPath, 'utf-8');
        html = html.replace(/(href=|src=)(.+?)(\ |>)/g, (m, $1, $2, $3) => {
            let uri = $2;
            uri = uri.replace('"', '').replace("'", '');
            uri.indexOf('/static') === 0 && (uri = `.${uri}`); // 兼容vue打包
            if (uri.substring(0, 1) == ".") {
                uri = `${$1}${vscode.Uri.file(path.resolve(dirPath, uri)).with({ scheme: 'vscode-resource' }).toString()}${$3}`
                return uri.replace('%22', '');
            }
            return m;
        });
        return html;
    }
}

module.exports = WebView;