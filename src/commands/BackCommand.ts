import { EditCommand } from './EditCommand.ts';
import type { SvgDocument } from '../model/SvgDocument.ts';

export class BackCommand extends EditCommand {
  protected perform(document: SvgDocument, args: string[]) {
    this.arity(args, 1);
    const shape = document.reorder(args[0], 'back');
    return { done: `${shape.label} moved to back`, undo: `${shape.label} order restored` };
  }
}
