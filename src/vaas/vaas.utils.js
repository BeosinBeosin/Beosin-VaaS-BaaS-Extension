const os = require('os');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const Storage = require('../vscode/vscode.storage/storage');
const utils = require('../vscode/vscode.utils');
const pkg = require('./vaas.package');

class Vaas {
    constructor() {
        // 执行
        this._win = os.platform() === 'win32';
        this._start_program = this._win ? 'start.exe' : './start';
        this.vaas_process = undefined;
        this.stdout = undefined;
        this.stderr = undefined;
        this.exit = undefined;
        this._vaas_identifier = undefined;
        this._platform = undefined;
        this._contractPath = undefined;
        this._contractName = undefined;
        this.start = ({ vaasPath, platform, contractPath, contractName, contractVersion }) => {
            this._start && this._start();
            return new Promise((resolve) => {
                this.kill_process();
                this._vaas_identifier = Date.parse(new Date()).toString();
                this._platform = platform;
                this._contractPath = contractPath;
                this._contractName = contractName;
                const args = ['-p', platform, '-f', contractPath, '-n', contractName, '-v', contractVersion, '-m', '2', '-c', this.vaas_identifier];
                this.create_process({ vaasPath, args }, (res) => {
                    this._vaas_identifier = undefined;
                    utils.Api.showError({ txt: res.error });
                    resolve(res);
                });
                this.onStdout();
                this.onStderr();
                this.onExit(resolve);
            })
        };
        this.end = ({ vaasPath }) => {
            return new Promise((resolve) => {
                this.removeStd();
                if (!this.vaas_identifier) {
                    this.kill_process();
                    resolve({ code: -1, error: `Identifier is null, failed to get result.` });
                    return;
                }
                // windows需要手动杀进程
                this._win && this.kill_process();
                // -m 3 ==> 输出当前检测的结果，非windows下还会杀掉进程.
                const args = ['-m', '3', '-p', this._platform, '-c', this.vaas_identifier, '-f', this._contractPath, '-n', this._contractName];
                this.create_process({ vaasPath, args }, resolve, false);
                this.onStdout();
                this.onStderr();
                this.onExit(resolve);
            });
        };
        // 设置
        this.setting = new Storage();
        this.setting.pathError = 'Setting path error.'
        this.settingRead = ({ path = undefined }) => {
            return new Promise((resolve) => {
                this.setting.path = path;
                const error = this.setting.read();
                error && (utils.Api.showError({ txt: error }));
                resolve(this.setting.cache);
            });
        };
        this.settingUpdate = (items) => {
            return new Promise((resolve) => {
                this.setting.updateItems(items);
                this.setting.write((error) => {
                    error.error && (utils.Api.showError({ txt: error.error }));
                    resolve(error);
                });
            });
        };
    }
    get vaas_identifier() {
        return this._vaas_identifier;
    }
    onStart(val) {
        this._start = val;
    }
    onResult(val) {
        const resultStr = [];
        this._result = !val ? undefined : ((data) => {
            data && (data = data.replace(/---result---/g, ''));
            const separator = '---json---';
            if (data.includes(separator)) {
                let result = [];
                let strs = data.split(separator);
                if (strs.length === 2) { // 包含一个 ---json---
                    if (resultStr.length >= 1) {
                        resultStr.push(data);
                        data = resultStr.join('');
                        strs = data.split(separator);
                        resultStr.splice(0);
                    } else {
                        resultStr.push(data);
                    }
                } else {
                    resultStr.length && resultStr.splice(0);
                }
                try {
                    result = JSON.parse(strs.splice(1, 1)[0]);
                } catch (_) {}
                val(result);
                return strs.join('');
            }
            if (resultStr.length >= 1) {
                resultStr.push(data);
                return '';
            }
            return data;
        });
    }
    get result() {
        return this._result;
    }
    create_process({ vaasPath = undefined, cmd = this._start_program, args = [] }, pathErrorBack = undefined, printPid = true) {
        vaasPath || (vaasPath = utils.storage.getItem('vaasPath'));
        // utils.Api.showTxt2Output({txt: `\nCWD: ${vaasPath}\nCMD: ${cmd} ${args.join(' ')}`});
        if (!fs.existsSync(path.join(vaasPath, cmd))) {
            pathErrorBack && pathErrorBack({ code: -1, error: `Not found executor.` });
            return;
        }
        this.vaas_process = child_process.spawn(cmd, args, {
            cwd: vaasPath
        });
        printPid && utils.Api.showTxt2Output({ txt: `PID: ${this.vaas_process.pid}\n` });
        return this.vaas_process;
    }
    kill_process() {
        if (this.vaas_process) {
            // 防止进程继续输出
            this.removeStd();
            if (os.platform() === 'win32') {
                child_process.spawn('taskkill', ['/PID', this.vaas_process.pid, '-t', '-f']);
            } else if (!this.vaas_process.killed) {
                this.vaas_process.kill();
                this.vaas_process = undefined;
            }
        }
    }
    onStdout(callBack = undefined) {
        if (!this.vaas_process) { return; }
        this.vaas_process.__stdout__ = (data) => {
            if (data && data.toString) {
                data = data.toString();
            }
            this.result && (data = this.result(data));
            this.stdout && (this.stdout(data));
            callBack ? callBack(data) : utils.Api.showTxt2Output({ txt: data, line: false });
        };
        this.vaas_process.stdout.on('data', this.vaas_process.__stdout__);
    }
    onStderr(callBack = undefined) {
        if (!this.vaas_process) { return; }
        this.vaas_process.__stderr__ = (data) => {
            if (data && data.toString) {
                data = data.toString();
            }
            this.stderr && (this.stderr(data));
            callBack ? callBack(data) : utils.Api.showTxt2Output({ txt: data, line: false });
        };
        this.vaas_process.stderr.on('data', this.vaas_process.__stderr__);
    }
    removeStd() {
        if (!this.vaas_process) { return; }
        if (this.vaas_process.__stdout__) {
            this.vaas_process.stdout.removeListener('data', this.vaas_process.__stdout__);
            this.vaas_process.__stdout__ = undefined;
        }
        if (this.vaas_process.__stderr__) {
            this.vaas_process.stderr.removeListener('data', this.vaas_process.__stderr__);
            this.vaas_process.__stderr__ = undefined;
        }
    }
    onExit(callBack = undefined) {
        this.vaas_process && this.vaas_process.on('exit', (code, signal) => {
            if (signal && signal.toString) {
                signal = signal.toString();
            }
            this.exit && (this.exit(code, signal));
            callBack && callBack({ code: code, signal: signal });
        });
    }
}
const vaas = new Vaas();

let extName = '';
const installVaas = (name = '') => {
    name && (extName = name);
    return new Promise((resolve, reject) => {
        pkg.activate([]).then(resolve).catch(reject);
    });
}

module.exports = {
    vaas,
    installVaas
};