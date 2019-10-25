const os = require('os');
const fs = require('fs');
const path = require('path');
const https = require('https');
const URL = require('url');
const vscode = require('vscode');
const utils = require('../vscode/vscode.utils');
const AdmZip = require('adm-zip');
const platform = os.platform();
const Ping = require('ping-lite');

function mkdirP(dir, ppath = undefined) {
    fs.existsSync(dir) || mkdirP(path.dirname(dir), dir);
    ppath && fs.mkdirSync(ppath);
}

function chmodR(ppath, mode = 0o777) {
    fs.chmodSync(ppath, mode);
    if (fs.statSync(ppath).isDirectory()) {
        const files = fs.readdirSync(ppath);
        files.forEach(file => {
            chmodR(path.join(ppath, file), mode);
        });
    };
}

function ping(host) {
    return new Promise((resolve, reject) => {
        var pp = new Ping(host);
        pp.send((error, spent) => {
            if (error) {
                console.log(`ping ${host} failed:${error.toString()}`);
                resolve({ host, error })
            } else {
                console.log(`ping ${host} ok, spent: ${spent}ms`);
                resolve({ host, spent });
            }
        });
    })
}

function activate(solcPackages, title = '') {
    return new Promise((resolve, reject) => {
        const packages = [];
        vaasPackage.isPending && packages.push(vaasPackage);
        packages.push(...solcPackages);
        if (!packages.length) {
            resolve();
            return;
        }
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: title,
            cancellable: false
        }, (progress, token) => {
            return new Promise((oResolve, oReject) => {
                Promise.all(Object.keys(Package.Host).map(k => {
                    return ping(Package.Host[k]);
                })).then(spentRes => {
                    let minSpent = spentRes[0];
                    spentRes.forEach(i => {
                        if (!minSpent.spent || (i.spent && i.spent < minSpent.spent)) {
                            minSpent = i;
                        }
                    });
                    packages.forEach(pkg => {
                        pkg.host = minSpent.host;
                    });
                    Packages.install(progress, ...packages).then(d => {
                        oResolve(d);
                        resolve(d);
                    }).catch(e => {
                        oReject(e);
                        reject(e);
                    });
                });
            });
        });
    });
}

class Packages {
    constructor() {
        this._packages = [new Package()];
        this._packages.splice(0);
    }
    static create(...packages) {
        const ps = new this();
        ps._packages.push(...packages);
        return ps;
    }
    install(progress) {
        const cb = (item = undefined, promiseCb = undefined) => {
            return () => {
                return new Promise((resolve, reject) => {
                    const block = () => {
                        item.install(progress).then(resolve).catch(reject);
                    }
                    promiseCb ? promiseCb().then(() => { block(); }).catch(reject) : block();
                });
            }
        };
        const loadersCb = (packages) => {
            let block = undefined;
            for (let i = 0, len = packages.length; i < len; i++) {
                block = cb(packages[i], block);
            }
            return block ? block() : new Promise((resolve, _) => {
                resolve();
            });
        };
        return loadersCb(this._packages);
    }
    static install(progress, ...packages) {
        return this.create(...packages).install(progress);
    }
}

class Package {
    static get Host() {
        this._host || (this._host = { github: 'github.com', aliyun: 'solc.oss-cn-zhangjiakou.aliyuncs.com' });
        return this._host;
    }
    static get packageDir() {
        this._packageDir || (this._packageDir = path.join(__dirname, '..', '..', '.__PACKAGE__'));
        return this._packageDir;
    }
    static get installDir() {
        this._installDir || (this._installDir = path.join(__dirname, '..', '..', '.__VAAS__'));
        return this._installDir;
    }
    static init() {
        fs.existsSync(this.packageDir) || fs.mkdirSync(this.packageDir);
        fs.existsSync(this.installDir) || fs.mkdirSync(this.installDir);
    }
    static outputAppend(txt, line) {
        utils.Api.showTxt2Output({ txt, line });
    }
    constructor(url, name, version = '', unzipPath = '', unzipedPath = '', packagePath = '') {
        this.url_github = '';
        this.url_aliyun = url || '';
        this.url = this.url_aliyun;
        this.host = Package.Host.aliyun;
        this.name = name || '';
        this.version = version || '';
        this.unzipPath = unzipPath || '';
        this.unzipedPath = unzipedPath || '';
        this.packagePath = packagePath || '';
    }
    install(progress) {
        progress && progress.report({ message: `Installing ${this.name}` });
        return new Promise((resolve, reject) => {
            if (this.isNeedDownloaded) {
                this._download().then(d => {
                    const e = this.isNeedUnzip ? this._unzip() : undefined;
                    e || this._installed();
                    e ? reject(e) : resolve(d);
                }).catch(reject);
            } else {
                const e = this.isNeedUnzip ? this._unzip() : undefined;
                e || this._installed();
                e ? reject(e) : resolve();
            }
        });
    }
    _download() {
        this._downloader = new PackageDownloader();
        let dots = 0;
        this._downloader.onProcessChanged((percentage, sizeFmt) => {
            if (percentage === 0) {
                sizeFmt && utils.Api.showTxt2Output({ txt: `(${sizeFmt})`, line: false });
                return;
            }
            const newDots = Math.ceil(percentage / 10);
            if (newDots > dots) {
                utils.Api.showTxt2Output({ txt: '.'.repeat(newDots - dots), line: newDots === 10 });
                dots = newDots;
            }
        });
        utils.Api.showTxt2Output({ txt: `Downloading ${this.name}`, line: false });
        return new Promise((resolve, reject) => {
            this._downloader.start(this).then(resolve).catch(e => {
                utils.Api.showTxt2Output({ txt: `\n${e.message || e.toString()}` });
                reject(e);
            });
        });
    }
    _unzip() {
        utils.Api.showTxt2Output({ txt: `Unzip ${this.name}...` });
        try {
            const zip = new AdmZip(this.packagePath);
            zip.extractAllTo(this.unzipPath);
            this._chmod();
        } catch (e) {
            utils.Api.showTxt2Output({ txt: `Unzip ${this.name} error: ${e.message || e.toString()}` });
            this.unzipedPath && fs.existsSync(this.unzipedPath) && fs.rmdirSync(this.unzipedPath);
            return e;
        }
    }
    _chmod() {
        if (this.unzipedPath && fs.existsSync(this.unzipedPath)) {
            chmodR(this.unzipedPath);
        }
    }
    _installed() {}
    set host(host) {
        this._host = host;
        this.url = host === Package.Host.github ? this.url_github : this.url_aliyun;
    }
    get host() {
        return this._host;
    }
    set name(name) {
        this._name = name;
    }
    get name() {
        return this._name || (this.url && path.basename(this.url));
    }
    set packagePath(packagePath) {
        this._packagePath = packagePath;
    }
    get packagePath() {
        return this._packagePath || (this.url && path.join(Package.packageDir, path.basename(this.url)));
    }
    get downloader() {
        return this._downloader;
    }
    get isDownloading() {
        return !!(this.downloader && this.downloader.status <= PackageDownloader.Status.loading);
    }
    get isNeedDownloaded() {
        return !!(this.url && this.packagePath && !fs.existsSync(this.packagePath));
    }
    get isNeedUnzip() {
        return !!(this.unzipedPath && !fs.existsSync(this.unzipedPath));
    }
    get isPending() {
        return !!(this.isNeedDownloaded || this.isNeedUnzip);
    }
}
Package.init();

const platformStr = platform === 'darwin' ? 'Darwin' : (platform === 'win32' ? 'Windows' : 'Linux');
const vaasBaseUrl_github = 'https://github.com/BeosinBeosin/Beosin-VaaS-ETH-Extension/raw/solc';
const vaasBaseUrl_aliyun = 'https://solc.oss-cn-zhangjiakou.aliyuncs.com/eth';
class VaasPackage extends Package {
    constructor() {
        super();
        this.name = 'Beosin-VaaS';
        this.url_github = `${vaasBaseUrl_github}/${platformStr}/${this.name}.zip`;
        this.url_aliyun = `${vaasBaseUrl_aliyun}/${platformStr}/${this.name}.zip`;
        this.url = this.url_aliyun;
        this.unzipPath = Package.installDir;
        this.unzipedPath = path.join(this.unzipPath, 'Beosin-VaaS');
        this.packagePath = path.join(Package.packageDir, `${platformStr}-${this.name}.zip`);
        this.executeDir = path.join(this.unzipedPath, 'start');
    }
}
const vaasPackage = new VaasPackage();

class PackageDownloader {
    static get Status() {
        this._status || (this._status = { wait: 1, loading: 2, success: 3, fail: 4 });
        return this._status;
    }
    constructor() {
        this._status = PackageDownloader.Status.wait;
        this._error = undefined;
        this._sizeFmt = '';
        this._percentage = 0;
        this._statusChanged = undefined;
        this._progressChanged = undefined;
    }
    get status() {
        return this._status;
    }
    get error() {
        return this._error;
    }
    get sizeFmt() {
        return this._sizeFmt;
    }
    get percentage() {
        return this._percentage;
    }
    onStatusChanged(callBack) {
        this._statusChanged = callBack;
        return this;
    }
    onProcessChanged(callBack) {
        this._progressChanged = callBack;
        return this;
    }
    _setStatus(status) {
        this._status = status;
        this._statusChanged && this._statusChanged(status);
    }
    start(pkg = new Package()) {
        if (!pkg.isPending) { return; }
        this._setStatus(PackageDownloader.Status.loading);
        const progressChangedHandler = (percentage, sizeFmt) => {
            this._percentage = percentage;
            this._sizeFmt = sizeFmt;
            this._progressChanged && this._progressChanged(percentage, sizeFmt);
        }
        return new Promise((resolve, reject) => {
            PackageDownloader.file(pkg.url, pkg.packagePath, progressChangedHandler).then(d => {
                this._setStatus(PackageDownloader.Status.success);
                resolve(d);
            }).catch(e => {
                this._error = e;
                this._setStatus(PackageDownloader.Status.fail);
                reject(e);
            });
        });
    }
    static file(url, savePath, progressChangedHandler = undefined) {
        const parsedUrl = URL.parse(url);
        const options = { host: parsedUrl.host, path: parsedUrl.path };
        return new Promise((resolve, reject) => {
            const handleHttpResponse = (response) => {
                if (response.statusCode === 301 || response.statusCode === 302) {
                    // Redirect - download from new location
                    const redirectUrl = (typeof response.headers.location === 'string') ? response.headers.location : response.headers.location[0];
                    return resolve(PackageDownloader.file(redirectUrl, savePath, progressChangedHandler));
                } else if (response.statusCode !== 200) {
                    // Download failed - print error message
                    const e = new Error(`HTTP/HTTPS Response Error(${response.statusCode})`);
                    return reject(e);
                } else {
                    // Downloading - hook up events
                    let contentLength = response.headers['content-length'];
                    let pkgSize = 0;
                    let pkgSizeFmt = '';
                    if (contentLength) {
                        contentLength = typeof contentLength === 'string' ? contentLength : contentLength[0];
                        pkgSize = parseInt(contentLength, 10);
                        pkgSizeFmt = `${Math.ceil(pkgSize / 1024)} KB`;
                        progressChangedHandler && progressChangedHandler(0, pkgSizeFmt);
                    }
                    let data = '';
                    response.setEncoding('binary');
                    response.on('data', (chunk) => {
                        data += chunk;
                        pkgSize && progressChangedHandler && progressChangedHandler(Math.ceil(data.length / pkgSize * 100), pkgSizeFmt);
                    });
                    response.on('end', () => {
                        try {
                            fs.writeFileSync(savePath, data, 'binary');
                            return resolve();
                        } catch (e) {
                            return reject(e);
                        }
                    });
                    response.on('error', (error) => {
                        const e = new Error(`HTTP/HTTPS Response Error(${response.statusCode}): \n${error.message || error.toString()}`);
                        return reject(e);
                    });
                }
            };
            let request = https.request(options, handleHttpResponse);
            request.on('error', (error) => {
                const e = new Error(`HTTP/HTTPS Request Error: \n${error.message || error.toString()}`);
                return reject(e);
            });
            // Execute the request
            request.end();
        });
    }
}

module.exports = {
    activate,
    vaasPackage
};