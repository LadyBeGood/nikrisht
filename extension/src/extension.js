//@ts-check

import * as vscode from 'vscode';
import { run } from "../../cli/run.js"

/**
 * @param {vscode.ExtensionContext} context 
 */
export function activate(context) {
    const outputChannel = vscode.window.createOutputChannel("Nikrisht");
    context.subscriptions.push(outputChannel);

    context.subscriptions.push(
        vscode.commands.registerCommand("nikrisht.run", async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage("No active editor");
                return;
            }

            const source = editor.document.getText();
            const path = editor.document.isUntitled
                ? "untitled"
                : editor.document.uri.fsPath;

            outputChannel.clear();
            outputChannel.show(true); // true = preserve focus on editor

            const interpreter = run(source, path, {
                logger: (message) => outputChannel.appendLine(message),
            });
        })
    );
}

export function deactivate() {}