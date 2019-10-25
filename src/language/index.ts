'use strict';
import * as path from 'path';
import * as vscode from 'vscode';
import {LanguageClient, LanguageClientOptions, ServerOptions, TransportKind, RevealOutputChannelOn, WorkspaceChange} from 'vscode-languageclient';
// tslint:disable-next-line:no-duplicate-imports
import { workspace, WorkspaceFolder } from 'vscode';

export function activate(context: vscode.ExtensionContext, diagnosticCollection: vscode.DiagnosticCollection) {

    const serverModule = context.asAbsolutePath(path.join('src', 'language_out', 'server.js'));// path.join(__dirname, 'server.js')

    const serverOptions: ServerOptions = {
        debug: {
            module: serverModule,
            options: {
                execArgv: ['--nolazy', '--inspect=6009'],
            },
            transport: TransportKind.ipc,
        },
        run: {
            module: serverModule,
            transport: TransportKind.ipc,
        },
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [
            { language: 'solidity', scheme: 'file' },
            { language: 'solidity', scheme: 'untitled' },
        ],
        revealOutputChannelOn: RevealOutputChannelOn.Never,
        synchronize: {
                    // Synchronize the setting section 'solidity' to the server
                    configurationSection: 'solidity',
                    // Notify the server about file changes to '.sol.js files contain in the workspace (TODO node, linter)
                    // fileEvents: vscode.workspace.createFileSystemWatcher('**/.sol.js'),
                },
    };

    const ws: WorkspaceFolder[] | undefined = workspace.workspaceFolders;

    let clientDisposable;
    if (ws) {
        clientDisposable = new LanguageClient(
            'solidity',
            'Solidity Language Server',
            serverOptions,
            clientOptions).start();
    }

    // Push the disposable to the context's subscriptions so that the
    // client can be deactivated on extension deactivation
    context.subscriptions.push(clientDisposable);
}