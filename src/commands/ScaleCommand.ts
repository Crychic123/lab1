import { EditCommand } from './EditCommand.ts';
import type { SvgDocument } from '../model/SvgDocument.ts';

export class ScaleCommand extends EditCommand {
  protected perform(document: SvgDocument, args: string[]) {
    this.arity(args, 2);
    const shape = document.require(args[0]);
    const factor = this.number(args[1]);
    if (factor <= 0) throw new Error('scale factor must be positive');
    shape.scale(factor);
    return { done: `${shape.label} scaled by ${factor}`, undo: `${shape.label} scale undone` };
  }
}
