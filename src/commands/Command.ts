import type { Editor } from '../Editor.ts';

export interface Command {
  execute(editor: Editor, args: string[]): string;
}
