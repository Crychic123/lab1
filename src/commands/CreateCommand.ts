import { EditCommand } from './EditCommand.ts';
import { ShapeFactory } from '../model/ShapeFactory.ts';
import type { SvgDocument } from '../model/SvgDocument.ts';

export class CreateCommand extends EditCommand {
  protected perform(document: SvgDocument, args: string[]) {
    this.arity(args, 2, 99);
    const [type, id, ...rest] = args;
    let parent = document.root;
    const inIndex = rest.lastIndexOf('in');
    if (inIndex >= 0 && inIndex === rest.length - 2) {
      parent = document.container(rest[inIndex + 1]);
      rest.splice(inIndex);
    }
    const shape = new ShapeFactory().create(type, id, rest);
    document.add(shape, parent);
    const message = `${shape.label} created${parent === document.root ? '' : ` in ${parent.label}`}`;
    return { done: message, undo: `${shape.label} removed`, redo: message };
  }
}
