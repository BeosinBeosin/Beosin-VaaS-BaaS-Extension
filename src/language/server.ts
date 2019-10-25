'use strict';
import Linter from './linter/linter';
import SolhintService from './linter/solhint';
import SoliumService from './linter/solium';
// import {CompilerError} from './solErrorsToDiagnostics';
import {CompletionService, GetCompletionTypes,
        GetContextualAutoCompleteByGlobalVariable, GeCompletionUnits,
        GetGlobalFunctions, GetGlobalVariables, GetCompletionKeywords} from './completionService';
import {SolidityDefinitionProvider} from './definitionProvider';
import {
    createConnection, IConnection,
    IPCMessageReader, IPCMessageWriter,
    TextDocuments, InitializeResult,
    Files, Diagnostic,
    TextDocumentPositionParams,
    CompletionItem, Location, SignatureHelp,
} from 'vscode-languageserver';

interface Settings {
    solidity: SoliditySettings;
}

interface SoliditySettings {
    lint: LintSetting,
    packageDefaultDependenciesDirectory: string;
    packageDefaultDependenciesContractsDirectory: string;
}

interface LintSetting {
    enabled: boolean;
    type: string;
    soliumRules: any;
    solhintRules: any;
    validationDelay: number;
}


// import * as path from 'path';
// Create a connection for the server
const connection: IConnection = createConnection(
    new IPCMessageReader(process),
    new IPCMessageWriter(process)
);

console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);

const documents: TextDocuments = new TextDocuments();

let rootPath: string;
let linter: Linter = null;

let solhintDefaultRules = {};
let soliumDefaultRules = {};
let validationDelay = 1500;

// flags to avoid trigger concurrent validations (compiling is slow)
let validatingDocument = false;
let validatingAllDocuments = false;
let packageDefaultDependenciesDirectory = 'lib';
let packageDefaultDependenciesContractsDirectory = 'src';

function validate(document) {
    return;
/* 
    try {
        validatingDocument = true;
        const uri = document.uri;
        const filePath = Files.uriToFilePath(uri);

        const documentText = document.getText();
        let linterDiagnostics: Diagnostic[] = [];
        const compileErrorDiagnostics: Diagnostic[] = [];
        try {
            if (linter !== null) {
                linterDiagnostics = linter.validate(filePath, documentText);
            }
        } catch {
            // gracefull catch
        }
        // 编译错误
        // try {
        //     if (enabledAsYouTypeErrorCheck) {
        //         const errors: CompilerError[] = solcCompiler
        //             .compileSolidityDocumentAndGetDiagnosticErrors(filePath, documentText,
        //                                         packageDefaultDependenciesDirectory,
        //                                         packageDefaultDependenciesContractsDirectory);
        //         errors.forEach(errorItem => {
        //             const uriCompileError = Uri.file(errorItem.fileName);
        //             if (uriCompileError.toString() === uri) {
        //                 compileErrorDiagnostics.push(errorItem.diagnostic);
        //             }
        //         });
        //     }
        // } catch {
        //     // gracefull catch
        // }

        const diagnostics = linterDiagnostics.concat(compileErrorDiagnostics);

        console.log(uri);
        connection.sendDiagnostics({diagnostics, uri});
    } finally {
        validatingDocument = false;
    } 
*/
}

connection.onSignatureHelp((): SignatureHelp => {
    return null;
});

connection.onCompletion((textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
    // The pass parameter contains the position of the text document in
    // which code complete got requested. For the example we ignore this
    // info and always provide the same completion items
    let completionItems = [];
    try {
        const document = documents.get(textDocumentPosition.textDocument.uri);
        const documentPath = Files.uriToFilePath(textDocumentPosition.textDocument.uri);
        const documentText = document.getText();
        const lines = documentText.split(/\r?\n/g);
        const position = textDocumentPosition.position;

        let start = 0;
        let triggeredByDot = false;
        for (let i = position.character; i >= 0; i--) {
            if (lines[position.line[i]] === ' ') {
                triggeredByDot = false;
                i = 0;
                start = 0;
            }
            if (lines[position.line][i] === '.') {
                start = i;
                i = 0;
                triggeredByDot = true;
            }
        }

        if (triggeredByDot) {
            const globalVariableContext = GetContextualAutoCompleteByGlobalVariable(lines[position.line], start);
            if (globalVariableContext != null) {
                completionItems = completionItems.concat(globalVariableContext);
            }
            return completionItems;
        }

        const service = new CompletionService(rootPath);
        completionItems = completionItems.concat(
                service.getAllCompletionItems(documentText,
                                             documentPath,
                                             packageDefaultDependenciesDirectory,
                                             packageDefaultDependenciesContractsDirectory));

    } catch (error) {
        // graceful catch
       // console.log(error);
    } finally {
        console.log(GetGlobalFunctions());
        completionItems = completionItems.concat(GetCompletionTypes());
        completionItems = completionItems.concat(GetCompletionKeywords());
        completionItems = completionItems.concat(GeCompletionUnits());
        completionItems = completionItems.concat(GetGlobalFunctions());
        completionItems = completionItems.concat(GetGlobalVariables());
    }
    return completionItems;
});

connection.onDefinition((handler: TextDocumentPositionParams): Thenable<Location | Location[]> => {
    const provider = new SolidityDefinitionProvider(
        rootPath,
        packageDefaultDependenciesDirectory,
        packageDefaultDependenciesContractsDirectory,
    );
    return provider.provideDefinition(documents.get(handler.textDocument.uri), handler.position);
});


// This handler resolve additional information for the item selected in
// the completion list.
 // connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
 //   item.
 // });
function validateAllDocuments() {
    if (!validatingAllDocuments) {
        try {
            validatingAllDocuments = true;
            documents.all().forEach(document => validate(document));
        } finally {
            validatingAllDocuments = false;
        }
    }
}

function startValidation() {
    validateAllDocuments();
}

documents.onDidChangeContent(event => {
    const document = event.document;

    if (!validatingDocument && !validatingAllDocuments) {
        validatingDocument = true; // control the flag at a higher level
        // slow down, give enough time to type (1.5 seconds?)
        setTimeout(() =>  validate(document), validationDelay);
    }
});

// remove diagnostics from the Problems panel when we close the file
documents.onDidClose(event => connection.sendDiagnostics({
    diagnostics: [],
    uri: event.document.uri,
}));

documents.listen(connection);

connection.onInitialize((result): InitializeResult => {
    rootPath = result.rootPath;

    return {
        capabilities: {
            completionProvider: {
                resolveProvider: false,
                triggerCharacters: [ '.' ],
            },
           definitionProvider: true,
           textDocumentSync: documents.syncKind,
        },
    };
});

connection.onDidChangeConfiguration((change) => {
    return;
    /* const settings = <SoliditySettings>change.settings.solidity;
    solhintDefaultRules = settings.lint.solhintRules;
    soliumDefaultRules = settings.lint.soliumRules;
    validationDelay = settings.lint.validationDelay;
    // packageDefaultDependenciesContractsDirectory = settings.packageDefaultDependenciesContractsDirectory;
    // packageDefaultDependenciesDirectory = settings.packageDefaultDependenciesDirectory;

    let rule = null;
    if (settings.lint.enabled) {
        switch (settings.lint.type) {
            case 'solhint': {
                linter = new SolhintService(rootPath, solhintDefaultRules);
                rule = solhintDefaultRules;
                break;
            }
            case 'solium': {
                linter = new SoliumService(rootPath, soliumDefaultRules, connection);
                rule = soliumDefaultRules;
                break;
            }
            default: {
                linter = null;
            }
        }
    } else {
        linter = null;
    }

    if (linter !== null && rule !== null) {
        linter.setIdeRules(rule);
    }

    startValidation(); */
});

connection.listen();
