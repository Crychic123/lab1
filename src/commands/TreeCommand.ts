import type { Command } from './Command.ts';
import type { Editor } from '../Editor.ts';
import { Shape } from '../model/Shape.ts';

export class TreeCommand implements Command {
  execute(editor: Editor, args: string[]): string {
    if (args.length > 1) throw new Error('usage: tree [id]');
    const doc = editor.document;
    if (args.length) {
      const root = doc.require(args[0]);
      return [this.describe(root), ...this.children(root.children, '')].join('\n');
    }
    return [`svg (${doc.width}x${doc.height})`, ...this.children(doc.children, '')].join('\n');
  }
  private children(items: readonly Shape[], prefix: string): string[] {
    const lines: string[] = [];
    items.forEach((item, index) => {
      const last = index === items.length - 1;
      lines.push(`${prefix}${last ? '└── ' : '├── '}${this.describe(item)}`);
      lines.push(...this.children(item.children, `${prefix}${last ? '    ' : '│   '}`));
    });
    return lines;
  }
  private describe(shape: Shape): string {
    return `${shape.label}${shape.summary() ? `  ${shape.summary()}` : ''}`;
  }
}
