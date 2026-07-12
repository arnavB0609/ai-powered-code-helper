// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { GoogleGenAI } from '@google/genai';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('ai-code-helper.helloWorld', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('No active editor found.');
      return;
    }

    const selectedText = editor.document.getText(editor.selection);
    if (!selectedText) {
      vscode.window.showInformationMessage('No text selected. Highlight some code first.');
      return;
    }

    // Get or prompt for API key — same SecretStorage pattern as before,
    // just a different key name so it doesn't clash if you ever keep both.
    let apiKey = await context.secrets.get('geminiApiKey');
    if (!apiKey) {
      apiKey = await vscode.window.showInputBox({
        prompt: 'Enter your Gemini API key',
        password: true,
      });
      if (!apiKey) {
        vscode.window.showInformationMessage('API key is required.');
        return;
      }
      await context.secrets.store('geminiApiKey', apiKey);
    }

    vscode.window.showInformationMessage('Thinking...');

    try {
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Give a one-sentence hint (not the answer) for this code:\n\n${selectedText}`,
      });

      const responseText = response.text ?? '';
      vscode.window.showInformationMessage(responseText);
      console.log('Gemini response:', responseText);
    } catch (err) {
      vscode.window.showErrorMessage(`API call failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
