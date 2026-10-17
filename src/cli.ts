import { createInterface } from 'node:readline';
import { Editor } from './Editor.ts';

const editor = new Editor();
const terminal = Boolean(process.stdin.isTTY);
const input = createInterface({ input: process.stdin, output: process.stdout, terminal });
console.log("svg-editor 0.1 — type 'help' for commands");
if (terminal) input.setPrompt('svg> ');
if (terminal) input.prompt();
input.on('line', line => {
  const output = editor.runLine(line);
  if (output) console.log(output);
  if (terminal) input.prompt();
});
