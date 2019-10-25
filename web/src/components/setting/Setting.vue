<template>
    <div id="Setting" v-show="show">
        <div class="item" v-for="(key, index) in Object.keys(settingData)" :key="index">
            <p class="title">{{titleForKey(key)}}</p>
            <!-- {{settingData[key]}} -->
            <div v-if="typeForKey(key) === 'select'">
                <p class="explain" v-show="explainForKey(key)">{{explainForKey(key)}}</p>
                <el-select class="select" v-model="settingData[key]" :placeholder="placeholderForKey(key)">
                    <!-- <i class="el-icon-d-caret"></i> -->
                    <el-option v-for="(item, index) in settingConfig[key].data" :key="index" :label="item.name" :value="item.value">
                    </el-option>
                </el-select>
            </div>
            <div v-else-if="typeForKey(key) === 'radio'">
                <el-switch v-model="settingData[key]" active-color="var(--vscode-button-hoverBackground)" inactive-color="var(--vscode-input-background)" :active-value="1" :inactive-value="0"></el-switch>
                <div style="margin: -20px 0px 0px 50px; line-height: 20px;">{{explainForKey(key)}}</div>
            </div>
            <div v-else-if="typeForKey(key) === 'number'">
                <p class="explain" v-show="explainForKey(key)">{{explainForKey(key)}}</p>
                <el-input-number class="input" v-model="settingData[key]" controls-position="right" :min="minNumberForKey(key)" :max="maxNumberForKey(key)" :placeholder="placeholderForKey(key)"></el-input-number>
            </div>
            <div v-else>
                <p class="explain" v-show="explainForKey(key)">{{explainForKey(key)}}</p>
                <el-input class="input" v-model.trim="settingData[key]" :placeholder="placeholderForKey(key)"></el-input>
            </div>
        </div>
    </div>
</template>

<script>
import path from "path";

export default {
    props: {
        show: Boolean,
    },
    data: function() {
        return {
            vaasPath: undefined,
            settingData: {
                time_limit: 0,
                process_limit: 1,
            },
            settingConfig: {
                time_limit: {
                    title: "Time Limit",
                    explain: "Execution timeout, Unit second.",
                    type: "number",
                    min: 0,
                },
                process_limit: {
                    title: "Process Limit",
                    explain: "The maximum number of processes running simultaneously at runtime.",
                    type: "number",
                    min: 1,
                    // max: window.navigator.hardwareConcurrency,
                },

                // select: {
                //     explain: "Some like things.",
                //     placeholder: "",
                //     type: "select",
                //     data: [{
                //         name: "编程",
                //         value: 0,
                //     }, {
                //         name: "唱歌",
                //         value: 1,
                //     }],
                //     default: 1
                // },
                // radio: {
                //     explain: "If NB.",
                //     type: "radio",
                // }
            }
        };
    },
    computed: {
        vaasSettingPath: function() {
            return path.join(this.vaasPath, 'config');
        }
    },
    watch: {
        show: function(val) {
            if (val) {
                this.vaasPath = window.storage.getItem(`vaasPath`);
                window.vscode.vaasSettingRead({path:this.vaasSettingPath}).then((res) => {
                    if (res && res.data) {
                        this.settingData = res.data;
                    }
                    console.log(`已读取setting: ${this.vaasSettingPath}`);
                });
            } else {
                window.vscode.vaasSettingUpdate(this.settingData).then((res) => {
                    console.log(`已保存setting: ${res.data}`);
                });
            }
        }
    },
    methods: {
        titleForKey: function(key) {
            if (this.settingConfig[key] && this.settingConfig[key].title) {
                return this.settingConfig[key].title;
            }
            const title = key.replace(/_/g, ' ');
            return title.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
        },
        explainForKey: function(key) {
            return this.settingConfig[key] ? this.settingConfig[key].explain : ""
        },
        placeholderForKey: function(key) {
            return this.settingConfig[key] ? (this.settingConfig[key].placeholder || this.settingConfig[key].explain || key) : key;
        },
        typeForKey: function(key) {
            return this.settingConfig[key] ? this.settingConfig[key].type : 0;
        },
        minNumberForKey: function(key) {
            return this.settingConfig[key] && this.settingConfig[key].min !== undefined ? this.settingConfig[key].min : -Infinity;
        },
        maxNumberForKey: function(key) {
            return this.settingConfig[key] && this.settingConfig[key].max !== undefined ? this.settingConfig[key].max : Infinity;
        },
    },
    mounted: function() {
        this.vaasPath = window.storage.getItem(`vaasPath`);
    }
}
</script>

<style lang="scss">
#Setting {
    font-size: var(--vscode-editor-font-size);
    font-weight: var(--vscode-editor-font-weight);
    color: var(--vscode-editor-foreground);

    .item {
        margin: 0px 0px 25px;

        .title {
            font-size: larger;
            font-weight: 550;
            margin: 0px 0px 10px; 
        }
        .explain {
            margin: 0px 0px 12px; 
        }
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
            text-align: left;
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
    .el-switch__core:after {
        background-color: var(--vscode-input-foreground);
    }
    .el-input-number__decrease, .el-input-number__increase {
        color: var(--vscode-input-foreground);
        background-color: rgba(0, 0, 0, 0);//var(--vscode-input-background);
        width: 25px;
        height: 12px;
        line-height: 14px;
        border: none;
    }
}
</style>

