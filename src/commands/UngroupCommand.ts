import { EditCommand } from './EditCommand.ts';
import type { SvgDocument } from '../model/SvgDocument.ts';

export class UngroupCommand extends EditCommand {
  protected perform(document: SvgDocument, args: string[]) {
    this.arity(args, 1);
    const count = document.ungroup(args[0]);
    return { done: `g#${args[0]} ungrouped (${count} children)`, undo: `g#${args[0]} restored` };
  }
}
