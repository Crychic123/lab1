import type { Command } from './Command.ts';
import type { Editor } from '../Editor.ts';

export class ShowCommand implements Command {
  execute(editor: Editor, args: string[]): string {
    if (args.length !== 1) throw new Error('usage: show <id>');
    const shape = editor.document.require(args[0]);
    const parent = shape.parent === editor.document.root ? 'svg' : shape.parent!.label;
    const attributes = Object.entries(shape.attributes()).map(([key, value]) => `  ${key}=${value}`);
    if (shape.textContent !== null) attributes.push(`  text="${shape.textContent}"`);
    return [`${shape.label}  parent=${parent}`, ...attributes].join('\n');
  }
}
