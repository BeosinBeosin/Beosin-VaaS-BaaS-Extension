'use strict';
import * as solparse from 'solparse';
import {ContractCollection} from './model/contractsCollection';
import { CompletionItem, CompletionItemKind } from 'vscode-languageserver';
import { initialiseProject } from './projectService';
import { BaaS, ETH } from './completion/completion'

// 数据提供者
const provider = BaaS;

export class CompletionService {

    public rootPath: string;

    constructor(rootPath: string) {
        this.rootPath = rootPath;
    }

    public getTypeString(literal: any) {
        const isArray = literal.array_parts.length > 0;
        let isMapping = false;
        const literalType = literal.literal;
        let suffixType = '';

        if (typeof literalType.type !== 'undefined')  {
             isMapping = literalType.type === 'MappingExpression';
             if (isMapping) {
                suffixType = '(' + this.getTypeString(literalType.from) + ' => ' + this.getTypeString(literalType.to) + ')';
            }
        }

        if (isArray) {
            suffixType = suffixType + '[]';
        }

        if (isMapping) {
            return 'mapping' + suffixType;
        }

        return literalType + suffixType;
    }

    public createFunctionParamsSnippet(params: any): string {
        let paramsSnippet = '';
        let counter = 0;
        if (typeof params !== 'undefined' && params !== null) {
            params.forEach( parameterElement => {
               const typeString = this.getTypeString(parameterElement.literal);
               counter = counter + 1;
               const currentParamSnippet = '${' + counter + ':' + parameterElement.id + '}';
                if (paramsSnippet === '') {
                    paramsSnippet = currentParamSnippet;
                } else {
                    paramsSnippet = paramsSnippet + ', ' + currentParamSnippet;
                }
            });
        }
        return paramsSnippet;
    }

    public createParamsInfo(params: any): string {
        let paramsInfo = '';
        if (typeof params !== 'undefined' && params !== null) {
            if (params.hasOwnProperty('params')) {
                params = params.params;
            }
            params.forEach( parameterElement => {
               const typeString = this.getTypeString(parameterElement.literal);
                let currentParamInfo = '';
                if (typeof parameterElement.id !== 'undefined' && parameterElement.id !== null ) { // no name on return parameters
                    currentParamInfo = typeString + ' ' + parameterElement.id;
                } else {
                    currentParamInfo = typeString;
                }
                if (paramsInfo === '') {
                    paramsInfo = currentParamInfo;
                } else {
                    paramsInfo = paramsInfo + ', ' + currentParamInfo;
                }
            });
        }
        return paramsInfo;
    }

    public createFunctionEventCompletionItem(contractElement: any, type: string, contractName: string): CompletionItem {

        const completionItem =  CompletionItem.create(contractElement.name);
        completionItem.kind = CompletionItemKind.Function;
        const paramsInfo = this.createParamsInfo(contractElement.params);
        const paramsSnippet = this.createFunctionParamsSnippet(contractElement.params);
        let returnParamsInfo = this.createParamsInfo(contractElement.returnParams);
        if (returnParamsInfo !== '') {
            returnParamsInfo = ' returns (' + returnParamsInfo + ')';
        }
        completionItem.insertTextFormat = 2;
        completionItem.insertText = contractElement.name + '(' + paramsSnippet + ');';
        const info = '(' + type + ' in ' + contractName + ') ' + contractElement.name + '(' + paramsInfo + ')' + returnParamsInfo;
        completionItem.documentation = info;
        completionItem.detail = info;
        return completionItem;
    }

    public getDocumentCompletionItems(documentText: string): CompletionItem[] {
        const completionItems = [];
        try {
            const result = solparse.parse(documentText);
            // console.log(JSON.stringify(result));
            // TODO struct, modifier
            result.body.forEach(element => {
                if (element.type === 'ContractStatement' ||  element.type === 'LibraryStatement') {
                    const contractName = element.name;
                    if (typeof element.body !== 'undefined' && element.body !== null) {
                        element.body.forEach(contractElement => {
                            if (contractElement.type === 'FunctionDeclaration') {
                                // ignore the constructor TODO add to contract initialiasation
                                if (contractElement.name !== contractName) {
                                    completionItems.push(
                                            this.createFunctionEventCompletionItem(contractElement, 'function', contractName ));
                                }
                            }

                            if (contractElement.type === 'EventDeclaration') {
                                completionItems.push(this.createFunctionEventCompletionItem(contractElement, 'event', contractName ));
                            }

                            if (contractElement.type === 'StateVariableDeclaration') {
                                const completionItem =  CompletionItem.create(contractElement.name);
                                completionItem.kind = CompletionItemKind.Field;
                                const typeString = this.getTypeString(contractElement.literal);
                                completionItem.detail = '(state variable in ' + contractName + ') '
                                                                    + typeString + ' ' + contractElement.name;
                                completionItems.push(completionItem);
                            }
                        });
                    }
                }
            });
        } catch (error) {
          // gracefule catch
          // console.log(error.message);
        }
        // console.log('file completion items' + completionItems.length);
        return completionItems;
    }

    public getAllCompletionItems(documentText: string,
                                documentPath: string,
                                packageDefaultDependenciesDirectory: string,
                                packageDefaultDependenciesContractsDirectory: string): CompletionItem[] {

        if (this.rootPath !== 'undefined' && this.rootPath !== null) {
            const contracts = new ContractCollection();
            contracts.addContractAndResolveImports(
                documentPath,
                documentText,
                initialiseProject(this.rootPath, packageDefaultDependenciesDirectory, packageDefaultDependenciesContractsDirectory));
            let completionItems = [];
            contracts.contracts.forEach(contract => {
                completionItems = completionItems.concat(this.getDocumentCompletionItems(contract.code));
            });
            // console.log('total completion items' + completionItems.length);
            return completionItems;
        } else {
            return this.getDocumentCompletionItems(documentText);
        }
    }
}

export function GetCompletionTypes(): CompletionItem[] {
    return provider.types;
}

function CreateCompletionItem(label: string, kind: CompletionItemKind, detail: string) {
    const completionItem = CompletionItem.create(label);
    completionItem.kind = kind;
    completionItem.detail = detail;
    return completionItem;
}

export function GetCompletionKeywords(): CompletionItem[] {
    const completionItems = [];
    const keywords = [ 'modifier', 'mapping', 'break', 'continue', 'delete', 'else', 'for',
    'if', 'new', 'return', 'returns', 'while', 'using',
    'private', 'public', 'external', 'internal', 'payable', 'view', 'pure', 'case', 'do', 'else', 'finally',
    'in', 'instanceof', 'return', 'throw', 'try', 'typeof', 'yield', 'void'] ;
    keywords.forEach(unit => {
        const completionItem =  CompletionItem.create(unit);
        completionItem.kind = CompletionItemKind.Keyword;
        completionItems.push(completionItem);
    });

    completionItems.push(CreateCompletionItem('contract', CompletionItemKind.Class, null));
    completionItems.push(CreateCompletionItem('library', CompletionItemKind.Class, null));
    completionItems.push(CreateCompletionItem('storage', CompletionItemKind.Field, null));
    completionItems.push(CreateCompletionItem('memory', CompletionItemKind.Field, null));
    completionItems.push(CreateCompletionItem('var', CompletionItemKind.Field, null));
    completionItems.push(CreateCompletionItem('constant', CompletionItemKind.Constant, null));
    completionItems.push(CreateCompletionItem('constructor', CompletionItemKind.Constructor, null));
    completionItems.push(CreateCompletionItem('event', CompletionItemKind.Event, null));
    completionItems.push(CreateCompletionItem('import', CompletionItemKind.Module, null));
    completionItems.push(CreateCompletionItem('enum', CompletionItemKind.Enum, null));
    completionItems.push(CreateCompletionItem('struct', CompletionItemKind.Struct, null));
    completionItems.push(CreateCompletionItem('function', CompletionItemKind.Function, null));

    return completionItems;
}


export function GeCompletionUnits(): CompletionItem[] {
    const completionItems = [];
    const etherUnits = ['wei', 'finney', 'szabo', 'ether'] ;
    etherUnits.forEach(unit => {
        const completionItem =  CompletionItem.create(unit);
        completionItem.kind = CompletionItemKind.Unit;
        completionItem.detail = unit + ': ether unit';
        completionItems.push(completionItem);
    });

    const timeUnits = ['seconds', 'minutes', 'hours', 'days', 'weeks', 'years'];
    timeUnits.forEach(unit => {
        const completionItem =  CompletionItem.create(unit);
        completionItem.kind = CompletionItemKind.Unit;

        if (unit !== 'years') {
            completionItem.detail = unit + ': time unit';
        } else {
            completionItem.detail = 'DEPRICATED: ' + unit + ': time unit';
        }
        completionItems.push(completionItem);
    });

    return completionItems;
}

export function GetGlobalVariables(): CompletionItem[] {
    return provider.variables.global_;
}

export function GetGlobalFunctions(): CompletionItem[] {
    return provider.functions;
}

export function GetContextualAutoCompleteByGlobalVariable(lineText: string, wordEndPosition: number): CompletionItem[] {
    const variables: CompletionItem[] = provider.variables.global_;
    for (let i = 0, length = variables.length; i < length; i++) {
        const variableName = variables[i].label;
        if (isAutocompleteTrigeredByVariableName(variableName, lineText, wordEndPosition)) {
            return provider.variables[variableName];
        }
    }
    return null;
    if (isAutocompleteTrigeredByVariableName('block', lineText, wordEndPosition)) {
        return provider.variables.block;
    }
    if (isAutocompleteTrigeredByVariableName('msg', lineText, wordEndPosition)) {
        return provider.variables.msg;
    }
    if (isAutocompleteTrigeredByVariableName('tx', lineText, wordEndPosition)) {
        return provider.variables.tx;
    }
    if (isAutocompleteTrigeredByVariableName('abi', lineText, wordEndPosition)) {
        return provider.variables.abi;
    }
    return null;
}

function isAutocompleteTrigeredByVariableName(variableName: string, lineText: string, wordEndPosition: number): Boolean {
    const nameLength = variableName.length;
    if (wordEndPosition >= nameLength
        // does it equal our name?
        && lineText.substr(wordEndPosition - nameLength, nameLength) === variableName) {
          return true;
        }
    return false;
}