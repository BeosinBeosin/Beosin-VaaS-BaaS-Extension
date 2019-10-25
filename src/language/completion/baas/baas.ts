import { GlobalFunctions } from "./baas.global.functions";
import { global_, block, msg, tx, abi } from "./baas.global.variables";
import { CompletionItemKind } from 'vscode-languageserver';

function transferKind(items:[]): [] {
    items.forEach(item => {
        item['kind'] = CompletionItemKind[item['kind']];
    })
    return items;
}

const functions = transferKind(GlobalFunctions())

const variables = {
    global_: transferKind(global_()),
    block: transferKind(block()),
    msg: transferKind(msg()),
    tx: transferKind(tx()),
    abi: transferKind(abi()),
}

const types = (function() {
    const items = [];
    const types = ['identity', 'string', 'bytes', 'byte', 'int', 'uint', 'bool', 'hash'];
    for (let index = 8; index <= 256; index += 8) {
        types.push('int' + index);
        types.push('uint' + index);
        types.push('bytes' + index / 8);
    }
    types.forEach(type => {
        items.push({
            label: type,
            kind: CompletionItemKind.Keyword,
            detail: type + ' type',
        });
    });
    return items;
})();

export {
    functions,
    variables,
    types,
}