<template>
    <div id="Start" v-show="show">
        <div class="base-div">
            <p class="title">Select Contract:</p>
            <el-input class="input" v-model="contractPath" @click.native="selectedContract" :readonly="true" placeholder="Please select a file"></el-input>
        </div>
        <div class="base-div">
            <p class="title">Enter Contract Name:</p>
            <el-input class="input" v-model.trim="contractName" placeholder="Please enter the contract name"></el-input>
        </div>
        <div class="base-div">
            <p class="title">Select Compiler Version:</p>
            <el-select class="select" v-model="contractVersion" placeholder="Please select Compiler Version" size="mini">
                <el-option v-for="(item, index) in compilers" :key="index" :label="item" :value="item">
                </el-option>
            </el-select>
        </div>
        <div style="padding: 0px;">
            <el-button style="margin: 0px 0px 25px;" @click="start" :loading="starting" type="primary" size="small" class="button">{{starting?"":"Start"}}</el-button>
            <el-button style="margin: 0px 0px 25px;" v-show="starting" @click="end" :loading="ending" type="primary" size="small" class="button">{{ending?"":"End"}}</el-button>
        </div>
    </div>
</template>

<script>
import path from "path";

export default {
    name: 'Start',
    props: {
        show: Boolean
    },
    data: function() {
        return {
            isWin: false,
            vaasPath: '',
            platform: 'baas',
            compilers: [`0.4.23`],
            contractPath: '',
            contractName: '',
            contractVersion: '0.4.23',
            starting: false,
            ending: false
        };
    },
    watch: {
        vaasPath: function(val) {
            window.storage.setItem(`vaasPath`, val, false);
        },
        contractPath: function(val) {
            val && window.vscode.showTextDocument({filePath: val});
            this.contractName = path.basename(val, path.extname(val));
        }
    },
    methods: {
        selectedContract: function() {
            const defaultUri = (this.contractPath || window.storage.getItem(`startPath`));
            let canSelectFiles = true;
            let canSelectFolders = false;
            window.vscode.showOpenDialog({canSelectFiles, canSelectFolders, canSelectMany: false, defaultUri, filters: {'solidity': ['sol']}}).then((args) => {
                if (args.data) { // 点击取消时，args.data === undefined
                    if (this.isWin && args.data[0].path.startsWith('/')) {
                        this.contractPath = args.data[0].path.slice(1);
                    } else {
                        this.contractPath = args.data[0].path;
                    };
                }
            });
        },
        start: function() {
            if (!this.platform || !this.contractPath || !this.contractName || !this.contractVersion) {
                let txt;
                if (!this.platform) {
                    txt = 'Please select Platform.';
                } else if (!this.contractPath) {
                    txt = 'Please select Contract.';
                } else if (!this.contractName) {
                    txt = 'Please enter the contract name.';
                } else {
                    txt = 'Please select Compiler Version.';
                }
                window.vscode.showError({txt: txt});
                return;
            }
            this.starting = true;
            window.vscode.vaasStart({
                    vaasPath: this.vaasPath,
                    platform: this.platform,
                    contractPath: this.contractPath,
                    contractName: this.contractName,
                    contractVersion: this.contractVersion
                    }).then(() => {
                        this.starting = false;
                    }).catch(() => {
                        this.starting = false;
                    });
        },
        end: function() {
            this.ending = true;
            window.vscode.vaasEnd({vaasPath: this.vaasPath}).then(() => {
                this.starting = false;
                this.ending = false;
            }).catch(() => {
                this.starting = false;
                this.ending = false;
            });
        }
    },
    mounted: function() {
        window.vscode.platform().then((msg) => {
            this.isWin = msg.data === 'win32';
        });
        window.vscode.onUpdateStorage((message) => {
            if (message.data) {
                message.data.vaasPath && (this.vaasPath = message.data.vaasPath);
                message.data.startPath && message.data.startPath.endsWith('.sol') && (this.contractPath = message.data.startPath);
            }
        });
    }
};
</script>

<style lang="scss">
#Start {
    height: 100%;
    width: 100%;
    font-size: var(--vscode-editor-font-size);
    font-weight: var(--vscode-editor-font-weight);
    color: var(--vscode-editor-foreground);

    .base-div {
        margin: 0px 0px 25px;

        .title {
            font-size: larger;
            font-weight: 550;
            margin: 0px 0px 15px;
        }
    }
    .button {
        font-size: smaller;//var(--vscode-editor-font-size);
        font-weight: 500;
        color: var(--vscode-button-foreground);
        background-color: var(--vscode-button-background);
        border-radius: 2px;
        line-height: 25px;
        height: 25px;
        width: 100%;
        border: 0px;
        outline: none;
        outline-color: rgba(255,255,255,0);
        margin-bottom: 1em;
        cursor: pointer;
        padding: 0px;
    }
    .select,.input {
        border-radius: 2px;
        font-size: var(--vscode-editor-font-size);
        height: 24px;
        line-height: 24px;
        color: var(--vscode-input-foreground);
        background-color: var(--vscode-input-background);
        width: 100%;
        margin-bottom: 0px;

        .el-input__inner {
            border-radius: 2px;
            font-size: smaller;//var(--vscode-editor-font-size);
            height: 24px;
            line-height: 24px;
            color: var(--vscode-input-foreground);
            background-color: var(--vscode-input-background);
            border-color: var(--vscode-settings-textInputBorder, var(--vscode-input-background));
            padding: 0px 5px;
        }
        .el-input__inner:focus {
            border-color: var(--vscode-button-hoverBackground);
        }
        .el-input__icon {
            line-height: 24px;
        }
        .el-input .el-select__caret {
            color: var(--vscode-input-foreground);
        }
    }
    .el-button.is-loading:before {
        background-color: rgba(0, 0, 0, 0);
    }
    .el-button--primary:focus {
        color: var(--vscode-button-foreground);
        border-color: var(--vscode-button-background);
        background-color: var(--vscode-button-background);
    }
    .el-button:hover {
        background-color: var(--vscode-button-hoverBackground);
    }
}

</style>