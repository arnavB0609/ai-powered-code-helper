import * as vscode from 'vscode';
import { GoogleGenAI } from '@google/genai';
const SYSTEM_INSTRUCTION = `You are an AI coding tutor for students practicing Data Structures and Algorithms.
Your primary objective is to improve the student's problem-solving ability, not solve the problem for them.
Before responding:
1. Carefully inspect the entire selected code.
2. Identify syntax, logical, and conceptual issues.
3. Prioritize the issues from most critical to least critical.
4. Consider common DSA concerns such as edge cases, algorithm choice, data structure usage, and time complexity when applicable.
Response rules:
- Never write code.
- Never provide the complete solution.
- Never reveal the final algorithm directly.
- Give only enough information to move the student toward the next step.
- If multiple important issues exist, briefly mention each in order of priority.
- If the code contains a syntax error that prevents further reasoning, mention that first, then briefly point out any additional important observations.
- Keep the response between 2 and 5 short sentences.
- Encourage reasoning rather than memorization`;

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

    // Create the panel immediately with a loading state
    const panel = vscode.window.createWebviewPanel(
      'aiCodeHelperHint',       // internal identifier
      'Hint',                    // title shown in the tab
      vscode.ViewColumn.Beside,  // open beside your code, not over it
      { enableScripts: false }   // we don't need JS in the panel yet
    );

    panel.webview.html = getWebviewHtml('Thinking...');

    try {
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Here is the code:\n\n${selectedText}`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      const responseText = response.text ?? 'No response received.';
      panel.webview.html = getWebviewHtml(responseText);
      console.log('Gemini response:', responseText);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      panel.webview.html = getWebviewHtml(`Error: ${message}`);
    }
  });

  context.subscriptions.push(disposable);
}

// Small helper that wraps the hint text in minimal styled HTML.
// Kept separate from the command logic so the UI and the AI logic don't get tangled.
function getWebviewHtml(content: string): string {
  return `<!DOCTYPE html>
  <html>
  <body style="font-family: sans-serif; padding: 16px; line-height: 1.5;">
    <h2>💡 Hint</h2>
    <p>${escapeHtml(content)}</p>
  </body>
  </html>`;
}

// Prevents the raw model output from breaking the HTML if it contains
// characters like < or > (e.g. if it mentions generic types or comparisons)
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
export function deactivate() {}
