import { writeFileSync } from 'node:fs';
import type { Command } from './Command.ts';
import type { Editor } from '../Editor.ts';
import { SvgWriter } from '../io/SvgWriter.ts';

export class SaveCommand implements Command {
  execute(editor: Editor, args: string[]): string {
    if (args.length > 1) throw new Error('usage: save [file.svg]');
    const path = args[0] ?? editor.document.path;
    if (!path) throw new Error('save requires a path');
    try { writeFileSync(path, new SvgWriter().write(editor.document), 'utf8'); }
    catch { throw new Error(`cannot write file: ${path}`); }
    editor.document.path = path;
    editor.blockHistory();
    return `saved to ${path} (${editor.document.count()} elements)`;
  }
}
