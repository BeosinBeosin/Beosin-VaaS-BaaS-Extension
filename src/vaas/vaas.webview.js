const WebView = require('../vscode/vscode.webview');
const { Executor, Handler } = require('../vscode/vscode.message')
const { vaas } = require('./vaas.utils');

class VaasExecutor extends Executor {
    constructor() {
        super();
        this.vaasStart = vaas.start;
        this.vaasEnd = vaas.end;
        this.vaasSettingRead = vaas.settingRead;
        this.vaasSettingUpdate = vaas.settingUpdate;
    }
}

class VaasWebView extends WebView {
    constructor(name) {
        super(name, new Handler([new VaasExecutor()]));
    }
}

module.exports = VaasWebView;