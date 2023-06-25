// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Configuration, OpenAIApi } from 'openai';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vue3codegenerator" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vue3codegenerator.helloWorld',  async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user

		const conf = vscode.workspace.getConfiguration("vue3codegenerator");
		const apiKey = conf.get('apiKey') as string;
		const openai = new OpenAIApi(new Configuration({ apiKey }));
		const selection = vscode.window.activeTextEditor?.selection;
		const selectedText = vscode.window.activeTextEditor?.document.getText(selection) || '';

		if (selection === undefined || selectedText === '') {
			vscode.window.showInformationMessage('Please select the text.');
			return;	
		}
		const prompt = createPrompt(selectedText);
		let response: string;

		try {
			const completion = await openai.createChatCompletion({
				model: 'gpt-3.5-turbo',
				messages: [{ role: "user", content: prompt }]
			});
			response = completion.data.choices[0].message?.content || '';
		} catch (error: any) {
			let e = '';
			if (error.response) {
				e = `${error.response.status} ${error.response.data.message}`;
			} else {
				e = error.message;
			}
			vscode.window.showInformationMessage(`[ERROR] ${e}`);
		}

		vscode.window.activeTextEditor?.edit(async edit => {
			edit.replace(selection, response);
		});
	});

	context.subscriptions.push(disposable);
}

function createPrompt(selectedText: string) {
	return `# 命令書:
	以下のコードをcompositionAPIを使った書き方に変換してください
	
	# コード：
	${selectedText}
	
	#出力：
	`;
}

// This method is called when your extension is deactivated
export function deactivate() {}
