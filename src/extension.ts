import * as vscode from 'vscode';
import { Configuration, OpenAIApi } from 'openai';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('vue3codegenerator.replace',  async () => {

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
	// TODO: 英語にする
	return `# 命令書:
	以下のコードをcompositionAPIを使った書き方に変換してください
	
	# コード：
	${selectedText}
	
	#出力：`;
}

export function deactivate() {}
