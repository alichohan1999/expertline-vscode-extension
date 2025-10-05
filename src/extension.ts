import { commands, ExtensionContext, window } from "vscode";
import { FindTabPanel } from "./panels";

export function activate(context: ExtensionContext) {
	const FindTabPanelProvider = new FindTabPanel(context.extensionUri);
	context.subscriptions.push(
		window.registerWebviewViewProvider(FindTabPanel.viewType, FindTabPanelProvider)
	);

	context.subscriptions.push(
		commands.registerCommand("expertline.find",
			async () => {
				// Get selected text
				const editor = window.activeTextEditor;
				let selected = "";
				if (editor) {
					selected = editor.document.getText(editor.selection);
				}

				// Focus the panel first
				await commands.executeCommand("FindTabView.focus");

				// Send the text immediately and also after a delay to ensure it gets through
				FindTabPanelProvider.postSelection(selected);
				
				// Also send after a delay in case the webview wasn't ready
				setTimeout(() => {
					FindTabPanelProvider.postSelection(selected);
				}, 150);

				// And one more time after a longer delay for slow loading
				setTimeout(() => {
					FindTabPanelProvider.postSelection(selected);
				}, 500);
			}
		)
	);
}

export function deactivate() {}