import { Tokenizer } from './Tokenizer.ts';
import { SvgDocument } from './model/SvgDocument.ts';
import type { Command } from './commands/Command.ts';
import { EditCommand } from './commands/EditCommand.ts';
import { InitCommand } from './commands/InitCommand.ts';
import { ReadCommand } from './commands/ReadCommand.ts';
import { SaveCommand } from './commands/SaveCommand.ts';
import { CanvasCommand } from './commands/CanvasCommand.ts';
import { CreateCommand } from './commands/CreateCommand.ts';
import { DeleteCommand } from './commands/DeleteCommand.ts';
import { MoveCommand } from './commands/MoveCommand.ts';
import { ScaleCommand } from './commands/ScaleCommand.ts';
import { SetCommand } from './commands/SetCommand.ts';
import { GroupCommand } from './commands/GroupCommand.ts';
import { UngroupCommand } from './commands/UngroupCommand.ts';
import { AddToCommand } from './commands/AddToCommand.ts';
import { FrontCommand } from './commands/FrontCommand.ts';
import { BackCommand } from './commands/BackCommand.ts';
import { TreeCommand } from './commands/TreeCommand.ts';
import { ShowCommand } from './commands/ShowCommand.ts';
import { HelpCommand } from './commands/HelpCommand.ts';
import { UndoCommand } from './commands/UndoCommand.ts';
import { RedoCommand } from './commands/RedoCommand.ts';

type CommandConstructor = new () => Command;

export class Editor {
  private current: SvgDocument | null = null;
  private readonly undoStack: EditCommand[] = [];
  private readonly redoStack: EditCommand[] = [];
  private historyBlocked = false;
  private readonly commands = new Map<string, CommandConstructor>([
    ['init', InitCommand], ['read', ReadCommand], ['save', SaveCommand], ['canvas', CanvasCommand],
    ['create', CreateCommand], ['delete', DeleteCommand], ['move', MoveCommand], ['scale', ScaleCommand],
    ['set', SetCommand], ['group', GroupCommand], ['ungroup', UngroupCommand], ['addto', AddToCommand],
    ['front', FrontCommand], ['back', BackCommand], ['tree', TreeCommand], ['show', ShowCommand],
    ['help', HelpCommand], ['undo', UndoCommand], ['redo', RedoCommand]
  ]);
  get document(): SvgDocument {
    if (!this.current) throw new Error("no document. use 'init' or 'read' first");
    return this.current;
  }
  runLine(line: string): string {
    try {
      if (!line.trim() || line.trimStart().startsWith('#')) return '';
      const [name, ...args] = new Tokenizer().tokenize(line);
      const Constructor = this.commands.get(name);
      if (!Constructor) throw new Error(`unknown command: ${name}`);
      return new Constructor().execute(this, args);
    } catch (error) {
      return `error: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
  replace(document: SvgDocument): void { this.current = document; }
  load(document: SvgDocument): void { this.current = document; this.blockHistory(); }
  blockHistory(): void { this.undoStack.length = 0; this.redoStack.length = 0; this.historyBlocked = true; }
  record(command: EditCommand): void { this.undoStack.push(command); this.redoStack.length = 0; this.historyBlocked = false; }
  undo(): string {
    this.document;
    if (this.historyBlocked) throw new Error('undo not allowed after io command');
    const command = this.undoStack.pop();
    if (!command) throw new Error('nothing to undo');
    const output = command.undo(this);
    this.redoStack.push(command);
    return output;
  }
  redo(): string {
    this.document;
    if (this.historyBlocked) throw new Error('undo not allowed after io command');
    const command = this.redoStack.pop();
    if (!command) throw new Error('nothing to redo');
    const output = command.redo(this);
    this.undoStack.push(command);
    return output;
  }
}
