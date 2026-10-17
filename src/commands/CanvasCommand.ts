import type { Command } from './Command.ts';
import type { Editor } from '../Editor.ts';

export class CanvasCommand implements Command {
  execute(editor: Editor, args: string[]): string {
    const document = editor.document;
    if (args.length === 0) return `canvas ${document.width}x${document.height}`;
    if (args.length > 2) throw new Error('usage: canvas [w] [h]');
    document.resize(Number(args[0]), args[1] === undefined ? document.height : Number(args[1]));
    editor.blockHistory();
    return `canvas resized to ${document.width}x${document.height}`;
  }
}
