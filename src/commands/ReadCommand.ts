import { readFileSync } from 'node:fs';
import type { Command } from './Command.ts';
import type { Editor } from '../Editor.ts';
import { SvgReader } from '../io/SvgReader.ts';

export class ReadCommand implements Command {
  execute(editor: Editor, args: string[]): string {
    if (args.length !== 1) throw new Error('usage: read <file.svg>');
    let source: string;
    try { source = readFileSync(args[0], 'utf8'); }
    catch { throw new Error(`cannot read file: ${args[0]}`); }
    const { document, warnings } = new SvgReader().read(source);
    document.path = args[0];
    editor.load(document);
    return [...warnings, `read ${args[0]} (${document.count()} elements)`].join('\n');
  }
}
