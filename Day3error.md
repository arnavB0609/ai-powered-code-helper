I need you to act as a senior TypeScript/VS Code Extension engineer and perform a root-cause analysis instead of suggesting quick fixes.

Context:
- This project is a VS Code extension generated using the latest `yo code` TypeScript template.
- Bundler: esbuild
- The extension was working correctly earlier today. I successfully integrated the Gemini API and received responses from the model.
- The only changes I made afterwards were:
  1. Improving the system prompt.
  2. Adding a Webview (`getWebviewHtml`) to display the hint.
- Neither of these changes should affect module resolution or project configuration.

Current setup:
- TypeScript: 6.0.3
- @google/genai: 2.11.0
- esbuild bundles with:
    - bundle: true
    - format: "cjs"
    - platform: "node"
    - external: ["vscode"]

The compile errors are now:

1.
TS2307:
Cannot find module '@modelcontextprotocol/sdk/client/index.js'
Referenced inside:
node_modules/@google/genai/dist/node/node.d.ts

2.
TS2552:
Cannot find name 'ErrorEvent'
Referenced inside:
node_modules/@google/genai/dist/node/node.d.ts

3.
TS1479:
The current file is a CommonJS module whose imports will produce 'require' calls; however, @google/genai is an ECMAScript module and cannot be imported with require.

Important observations:
- The first two errors originate inside node_modules, not in my code.
- The third error appears in my extension.ts import statement.
- My esbuild configuration already bundles dependencies and only marks 'vscode' as external.
- Since the project worked previously, I suspect this is a dependency compatibility issue rather than a mistake in my extension logic.

What I want you to do:

1. Identify the true root cause.
2. Explain WHY these three errors are connected.
3. Determine whether this is:
   - a TypeScript 6 compatibility issue,
   - a @google/genai version issue,
   - a missing dependency,
   - a VS Code extension template issue,
   - or something else.
4. Recommend the industry-standard solution rather than a workaround.
5. If the best solution is pinning versions, explain why and recommend the exact stable versions.
6. If project configuration must change, explain why that is preferable to other options.
7. Do not immediately suggest converting the entire project to ESM unless that is genuinely the recommended approach for VS Code extensions in 2026.

Please reason through the diagnosis step by step before proposing any code changes.