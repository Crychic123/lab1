import { EditCommand } from './EditCommand.ts';
import type { SvgDocument } from '../model/SvgDocument.ts';

export class SetCommand extends EditCommand {
  protected perform(document: SvgDocument, args: string[]) {
    this.arity(args, 3);
    const shape = document.require(args[0]);
    const old = args[1] === 'text' ? shape.textContent : shape.attributes()[args[1]];
    shape.set(args[1], args[2]);
    const value = args[1] === 'text' ? shape.textContent : shape.attributes()[args[1]];
    const display = (v: string | null | undefined) => args[1] === 'text' ? `"${v ?? ''}"` : `${v ?? '(unset)'}`;
    return { done: `${shape.label} updated: ${args[1]}=${display(value)}`, undo: `${shape.label} updated: ${args[1]}=${display(old)}` };
  }
}
