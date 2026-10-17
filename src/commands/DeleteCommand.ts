import { EditCommand } from './EditCommand.ts';
import type { SvgDocument } from '../model/SvgDocument.ts';

export class DeleteCommand extends EditCommand {
  protected perform(document: SvgDocument, args: string[]) {
    this.arity(args, 1);
    const shape = document.require(args[0]);
    const parent = shape.parent === document.root ? 'svg' : shape.parent!.label;
    const label = shape.label;
    document.delete(args[0]);
    return { done: `${label} deleted`, undo: `${label} restored into ${parent}` };
  }
}
