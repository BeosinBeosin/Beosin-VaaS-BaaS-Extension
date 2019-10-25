<template>
    <div id="home">
        <div id="header" v-show="index >= 0" style="height: 60px;">
            <p style="font-size:22px; font-weight:700; margin:17px 0px 17px;"> {{index === undefined ? '' : items[index].name}}</p>
        </div>
        <div id="main">
            <Start :show="items[0].active"></Start>
            <Setting :show="items[1].active"></Setting>
        </div>
        <div id="side" ref="side">
            <el-button v-for="(item, index) in items" :key="index" class="item" @click="switchItem(index);" :disabled="item.active" type="primary" size="small" :icon="item.icon" style="margin: 0px;"></el-button>
        </div>
    </div>
</template>

<script>
import path from "path";
import Start from "../start/Start";
import Setting from "../setting/Setting"

export default {
    data: function() {
        return {
            index: undefined,
            items: [{
                name: 'Start',
                active: false,
                icon: "el-icon-s-promotion",
            }, {
                name: 'Setting',
                active: false,
                icon: "el-icon-s-tools",
            }]
        }
    },
    methods: {
        switchItem: function(index) {
            if (this.index === index && this.items[index].active) {
                return;
            }
            // 未选择vaas路径不能进入设置页
            if (index === 1 && !window.storage.getItem(`vaasPath`)) {
                window.vscode.showError({txt: 'Please select Beosin-VaaS path, first.'});
                return;
            }
            this.index = index;
            for(let i = 0; i < this.items.length; i++) {
                this.items[i].active = index==i;
            }
        }
    },
    mounted: function() {
        this.switchItem(0); 
    },
    components: {
        Start,
        Setting,
    }
}
</script>

<style lang="scss">

#home {
    #main {
        // overflow-y: visible;
        // border-color: #ff0000;
        // border-width: 1px;
        // border-style: dashed;
    }
    #side {
        width: 40px;
        position: fixed;
        top: 20px;
        left: calc(100% - 40px);
        // background-color: var(--vscode-titleBar-activeBackground);//var(--vscode-editorGroupHeader-tabsBackground);
        
        .item {
            font-size: 12px;
            font-weight: 500;
            color: var(--vscode-titleBar-activeForeground);//var(--vscode-editor-foreground);
            background-color: var(--vscode-titleBar-activeBackground);//var(--vscode-editorGroupHeader-background);
            border-radius: 0px;
            line-height: 35px;
            height: 35px;
            width: 100%;
            border: 0px;
            outline: none;
            outline-color: rgba(255,255,255,0);
            margin-bottom: 1em;
            padding: 0px;
            // padding-left: 10px;
            // text-align: left;
        }
        .el-button.is-disabled, .el-button.is-disabled:focus, .el-button.is-disabled:hover {
            cursor: default;
            background-color: rgba(255,255,255,0);//var(--vscode-editor-background);
        }
        .el-button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
    }
    .project-name {
        text-align: center;
        font-weight: 700;
        font-size: 18px;
        margin-bottom: 30px;
    }
    .el-button--primary:focus {
        color: var(--vscode-button-foreground);
        border-color: var(--vscode-button-background);
        background-color: var(--vscode-button-background);
    }
    ::-webkit-input-placeholder { /* WebKit browsers */
        color: var(--vscode-input-placeholderForeground);
    }
    ::-moz-placeholder { /* Mozilla Firefox 19+ */
        color: var(--vscode-input-placeholderForeground);
    }
    :-ms-input-placeholder { /* Internet Explorer 10+ */
        color: var(--vscode-input-placeholderForeground);
    }
}
</style>

