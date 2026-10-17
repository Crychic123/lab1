import type { Command } from './Command.ts';
import type { Editor } from '../Editor.ts';

export class UndoCommand implements Command {
  execute(editor: Editor, args: string[]): string {
    if (args.length) throw new Error('usage: undo');
    return editor.undo();
  }
}
