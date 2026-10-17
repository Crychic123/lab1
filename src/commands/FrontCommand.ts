import { EditCommand } from './EditCommand.ts';
import type { SvgDocument } from '../model/SvgDocument.ts';

export class FrontCommand extends EditCommand {
  protected perform(document: SvgDocument, args: string[]) {
    this.arity(args, 1);
    const shape = document.reorder(args[0], 'front');
    return { done: `${shape.label} moved to front`, undo: `${shape.label} order restored` };
  }
}
