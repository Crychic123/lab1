import type { Editor } from '../Editor.ts';
import { SvgDocument } from '../model/SvgDocument.ts';
import type { Command } from './Command.ts';

export abstract class EditCommand implements Command {
  private before!: SvgDocument;
  private after!: SvgDocument;
  private undoneText = 'edit undone';
  private redoneText = 'edit redone';

  execute(editor: Editor, args: string[]): string {
    this.before = editor.document.clone();
    const working = editor.document.clone();
    const result = this.perform(working, args);
    this.after = working;
    this.undoneText = result.undo;
    this.redoneText = result.redo ?? result.done;
    editor.replace(working);
    editor.record(this);
    return result.done;
  }
  undo(editor: Editor): string { editor.replace(this.before.clone()); return this.undoneText; }
  redo(editor: Editor): string { editor.replace(this.after.clone()); return this.redoneText; }
  protected abstract perform(document: SvgDocument, args: string[]): { done: string; undo: string; redo?: string };
  protected arity(args: string[], min: number, max = min): void {
    if (args.length < min || args.length > max) throw new Error('invalid arguments');
  }
  protected number(value: string): number {
    const n = Number(value);
    if (value === undefined || value.trim() === '' || !Number.isFinite(n)) throw new Error(`invalid number: ${value}`);
    return n;
  }
}
