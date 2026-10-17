import type { Command } from './Command.ts';
import type { Editor } from '../Editor.ts';
import { SvgDocument } from '../model/SvgDocument.ts';

export class InitCommand implements Command {
  execute(editor: Editor, args: string[]): string {
    if (args.length > 2) throw new Error('usage: init [w] [h]');
    const document = new SvgDocument(args[0] === undefined ? 800 : Number(args[0]), args[1] === undefined ? 600 : Number(args[1]));
    editor.load(document);
    return `canvas ${document.width}x${document.height} created`;
  }
}
