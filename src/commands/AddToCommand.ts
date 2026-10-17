import { EditCommand } from './EditCommand.ts';
import type { SvgDocument } from '../model/SvgDocument.ts';

export class AddToCommand extends EditCommand {
  protected perform(document: SvgDocument, args: string[]) {
    this.arity(args, 2);
    const shape = document.addTo(args[0], args[1]);
    return { done: `${shape.label} added to g#${args[0]}`, undo: `${shape.label} moved back` };
  }
}
