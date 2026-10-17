import { EditCommand } from './EditCommand.ts';
import type { SvgDocument } from '../model/SvgDocument.ts';

export class MoveCommand extends EditCommand {
  protected perform(document: SvgDocument, args: string[]) {
    this.arity(args, 3);
    const shape = document.require(args[0]);
    const dx = this.number(args[1]), dy = this.number(args[2]);
    const old = shape.position();
    shape.move(dx, dy);
    const after = shape.position();
    if (after === null)
      return { done: `${shape.label} moved by (${dx},${dy})`, undo: `${shape.label} moved back by (${-dx},${-dy})` };
    return { done: `${shape.label} moved to ${after}`, undo: `${shape.label} moved back to ${old}` };
  }
}
