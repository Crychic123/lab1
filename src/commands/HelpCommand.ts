import type { Command } from './Command.ts';
import type { Editor } from '../Editor.ts';

export class HelpCommand implements Command {
  execute(_editor: Editor, args: string[]): string {
    if (args.length) throw new Error('usage: help');
    return [
      'init [w] [h] | read <file.svg> | save [file.svg] | canvas [w] [h]',
      'create <rect|circle|ellipse|line|text|g> <id> [params] [in <containerId>]',
      'delete <id> | move <id> <dx> <dy> | scale <id> <factor>',
      'set <id> <attr> <value> | group <newGid> <id1> <id2>...',
      'ungroup <gid> | addto <gid> <id> | front <id> | back <id>',
      'tree [id] | show <id> | help | undo | redo'
    ].join('\n');
  }
}
