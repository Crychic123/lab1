import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { Editor } from '../src/Editor.ts';
import { SvgReader } from '../src/io/SvgReader.ts';

test('typical edit session keeps composite operations and undo units', () => {
  const editor = new Editor();
  assert.equal(editor.runLine('init 800 600'), 'canvas 800x600 created');
  assert.equal(editor.runLine('create g flow'), 'g#flow created');
  assert.equal(editor.runLine('create g node in flow'), 'g#node created in g#flow');
  assert.equal(editor.runLine('create rect box 120 100 160 60 #4a90d9 in node'), 'rect#box created in g#node');
  assert.equal(editor.runLine('create text label 155 135 "开始" in node'), 'text#label created in g#node');
  assert.equal(editor.runLine('move node 0 100'), 'g#node moved by (0,100)');
  assert.match(editor.runLine('tree'), /rect#box  x=120 y=200/);
  assert.match(editor.runLine('tree'), /text#label  \(155,235\) "开始"/);
  assert.equal(editor.runLine('undo'), 'g#node moved back by (0,-100)');
  assert.match(editor.runLine('tree'), /rect#box  x=120 y=100/);
  assert.equal(editor.runLine('redo'), 'g#node moved by (0,100)');
  assert.equal(editor.runLine('set label text "处理 数据"'), 'text#label updated: text="处理 数据"');
  assert.equal(editor.runLine('undo'), 'text#label updated: text="开始"');
  assert.equal(editor.runLine('create circle c 10 20 5'), 'circle#c created');
  assert.equal(editor.runLine('redo'), 'error: nothing to redo');
});

test('failed edits are atomic and group rejects ancestor with descendant', () => {
  const editor = new Editor();
  editor.runLine('init');
  editor.runLine('create g parent');
  editor.runLine('create rect child 0 0 10 10 in parent');
  const before = editor.runLine('tree');
  assert.equal(editor.runLine('group bad child parent'), 'error: cannot group a container into its own descendant: parent');
  assert.equal(editor.runLine('tree'), before);
  assert.equal(editor.runLine('addto parent parent'), 'error: cannot move a container into its own descendant: parent');
  assert.equal(editor.runLine('set child width -1'), 'error: width must be non-negative');
  assert.equal(editor.runLine('scale parent 0'), 'error: scale factor must be positive');
  assert.equal(editor.runLine('create box n1 0 0 10 10 "A"'), 'error: unknown shape type: box (is the plugin loaded?)');
  assert.equal(editor.runLine('tree'), before);
  assert.equal(editor.runLine('undo'), 'rect#child removed');
});

test('group, ungroup, z-order and deletion restore on undo', () => {
  const editor = new Editor();
  for (const line of ['init', 'create g outer', 'create rect a 0 0 1 1 in outer', 'create circle b 2 2 1 in outer', 'create line c 0 0 1 1 in outer']) editor.runLine(line);
  assert.equal(editor.runLine('group inner b a'), 'g#inner created with 2 children');
  assert.match(editor.runLine('tree'), /g#inner\n    │   ├── rect#a[\s\S]*circle#b/);
  assert.equal(editor.runLine('ungroup inner'), 'g#inner ungrouped (2 children)');
  assert.equal(editor.runLine('front a'), 'rect#a moved to front');
  assert.match(editor.runLine('tree'), /line#c[\s\S]*rect#a/);
  assert.equal(editor.runLine('delete outer'), 'g#outer deleted');
  assert.equal(editor.runLine('undo'), 'g#outer restored into svg');
  assert.match(editor.runLine('tree'), /rect#a/);
  assert.equal(editor.runLine('ungroup outer'), 'error: cannot ungroup top-level container: outer');
});

test('SVG read assigns missing ids, preserves supported attributes and round trips', () => {
  const dir = mkdtempSync(join(tmpdir(), 'svg-editor-'));
  try {
    const source = join(dir, 'input.svg'), output = join(dir, 'output.svg');
    writeFileSync(source, '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect x="0" y="0" width="10" height="20"/><g id="g1" transform="translate(10,20) scale(2)"><text id="t1" x="5" y="6" font-size="12">A &amp; B</text></g></svg>');
    const editor = new Editor();
    assert.match(editor.runLine(`read "${source}"`), /warning: assigned id rect1 to unnamed <rect>/);
    assert.match(editor.runLine('tree'), /text#t1  \(20,32\) "A & B"/);
    assert.match(editor.runLine('show t1'), /font-size=12/);
    assert.equal(editor.runLine(`save "${output}"`), `saved to ${output} (3 elements)`);
    const parsed = new SvgReader().read(readFileSync(output, 'utf8'));
    assert.equal(parsed.document.count(), 3);
    assert.equal(parsed.document.find('rect1')?.type, 'rect');
    assert.equal(editor.runLine('undo'), 'error: undo not allowed after io command');
    assert.equal(editor.runLine('create g more'), 'g#more created');
    assert.equal(editor.runLine('undo'), 'g#more removed');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('invalid read and malformed commands preserve the active document', () => {
  const dir = mkdtempSync(join(tmpdir(), 'svg-editor-'));
  try {
    const source = join(dir, 'bad.svg');
    writeFileSync(source, '<svg width="10" height="10"><rect id="x"/><rect id="x"/></svg>');
    const editor = new Editor();
    editor.runLine('init');
    editor.runLine('create circle kept 10 10 2');
    assert.equal(editor.runLine(`read "${source}"`), 'error: id already exists: x');
    assert.match(editor.runLine('tree'), /circle#kept/);
    assert.equal(editor.runLine('create text t 1 2 "unterminated'), 'error: unterminated quoted string');
    assert.equal(editor.runLine('set kept unknown x'), 'error: unknown attribute: unknown');
    assert.equal(editor.runLine('create rect no 1 2 nope 4'), 'error: invalid number: nope');
    assert.equal(editor.runLine('undo'), 'circle#kept removed');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('all built-in shapes support scaling and attribute validation', () => {
  const editor = new Editor();
  for (const line of [
    'init 100 100',
    'create rect r 1 2 3 4',
    'create circle c 5 6 7',
    'create ellipse e 8 9 10 11',
    'create line l 1 2 3 4',
    'create text t 7 8 "a b"',
    'group shapes r c e l t'
  ]) assert.doesNotMatch(editor.runLine(line), /^error:/);
  assert.equal(editor.runLine('scale shapes 2'), 'g#shapes scaled by 2');
  const tree = editor.runLine('tree shapes');
  assert.match(tree, /rect#r  x=2 y=4 w=6 h=8/);
  assert.match(tree, /circle#c  cx=10 cy=12 r=14/);
  assert.match(tree, /ellipse#e  cx=16 cy=18 rx=20 ry=22/);
  assert.match(tree, /line#l  \(2,4\) -> \(6,8\)/);
  assert.match(tree, /text#t  \(14,16\) "a b"/);
  assert.equal(editor.runLine('set c stroke-width -2'), 'error: stroke-width must be non-negative');
  assert.equal(editor.runLine('set shapes x 1'), 'error: unknown attribute: x');
  assert.equal(editor.runLine('undo'), 'g#shapes scale undone');
  assert.match(editor.runLine('tree shapes'), /circle#c  cx=5 cy=6 r=7/);
  assert.equal(editor.runLine('canvas 200 300'), 'canvas resized to 200x300');
  assert.equal(editor.runLine('redo'), 'error: undo not allowed after io command');
  assert.equal(editor.runLine('canvas 250'), 'canvas resized to 250x300');
  assert.equal(editor.runLine('init 50'), 'canvas 50x600 created');
});
