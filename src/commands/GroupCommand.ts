import { EditCommand } from './EditCommand.ts';
import type { SvgDocument } from '../model/SvgDocument.ts';

export class GroupCommand extends EditCommand {
  protected perform(document: SvgDocument, args: string[]) {
    this.arity(args, 2, 99);
    const group = document.group(args[0], args.slice(1));
    return { done: `${group.label} created with ${group.children.length} children`, undo: `${group.label} undone` };
  }
}
