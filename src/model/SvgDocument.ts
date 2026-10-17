import { Group } from './Group.ts';
import { Shape } from './Shape.ts';

export class SvgDocument {
  readonly root = new Group('__svg_root__');
  constructor(public width: number, public height: number, public path: string | null = null) {
    this.resize(width, height);
  }
  get children(): readonly Shape[] { return this.root.children; }
  resize(width: number, height: number): void {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0)
      throw new Error('canvas dimensions must be positive');
    this.width = width; this.height = height;
  }
  *all(): Iterable<Shape> {
    function* visit(shape: Shape): Iterable<Shape> {
      yield shape;
      for (const child of shape.children) yield* visit(child);
    }
    for (const child of this.children) yield* visit(child);
  }
  find(id: string): Shape | undefined { return [...this.all()].find(shape => shape.id === id); }
  require(id: string): Shape {
    const shape = this.find(id);
    if (!shape) throw new Error(`no such shape: ${id}`);
    return shape;
  }
  container(id: string): Group {
    const shape = this.find(id);
    if (!shape) throw new Error(`no such container: ${id}`);
    if (!(shape instanceof Group)) throw new Error(`not a container: ${id}`);
    return shape;
  }
  add(shape: Shape, parent: Group = this.root, index?: number): void {
    if (!shape.id || /\s/.test(shape.id)) throw new Error(`invalid id: ${shape.id}`);
    if (this.find(shape.id)) throw new Error(`id already exists: ${shape.id}`);
    parent.insert(shape, index);
  }
  delete(id: string): Shape {
    const shape = this.require(id);
    shape.parent!.remove(shape);
    return shape;
  }
  addTo(groupId: string, id: string): Shape {
    const target = this.container(groupId);
    const shape = this.require(id);
    if (shape === target || this.isAncestor(shape, target))
      throw new Error(`cannot move a container into its own descendant: ${shape.id}`);
    shape.parent!.remove(shape);
    target.insert(shape);
    return shape;
  }
  group(id: string, ids: string[]): Group {
    if (ids.length < 2) throw new Error('group requires at least two shapes');
    if (!id || /\s/.test(id)) throw new Error(`invalid id: ${id}`);
    if (this.find(id)) throw new Error(`id already exists: ${id}`);
    const selected = ids.map(item => this.require(item));
    if (new Set(ids).size !== ids.length) throw new Error('duplicate shape in group');
    for (const shape of selected) for (const other of selected) {
      if (shape !== other && this.isAncestor(shape, other))
        throw new Error(`cannot group a container into its own descendant: ${shape.id}`);
    }
    const ordered = [...this.all()].filter(shape => selected.includes(shape));
    const first = ordered[0];
    const destination = first.parent!;
    const position = destination.indexOf(first);
    for (const shape of ordered) shape.parent!.remove(shape);
    const group = new Group(id);
    destination.insert(group, Math.min(position, destination.children.length));
    for (const shape of ordered) group.insert(shape);
    return group;
  }
  ungroup(id: string): number {
    const shape = this.require(id);
    if (!(shape instanceof Group)) throw new Error(`not a container: ${id}`);
    if (shape.parent === this.root) throw new Error(`cannot ungroup top-level container: ${id}`);
    const parent = shape.parent!;
    const index = parent.remove(shape);
    const children = [...shape.children];
    children.forEach((child, offset) => { shape.remove(child); parent.insert(child, index + offset); });
    return children.length;
  }
  reorder(id: string, where: 'front' | 'back'): Shape {
    const shape = this.require(id);
    const parent = shape.parent!;
    parent.remove(shape);
    parent.insert(shape, where === 'front' ? parent.children.length : 0);
    return shape;
  }
  count(): number { return [...this.all()].length; }
  clone(): SvgDocument {
    const copy = new SvgDocument(this.width, this.height, this.path);
    for (const shape of this.children) copy.root.insert(shape.clone());
    return copy;
  }
  private isAncestor(ancestor: Shape, descendant: Shape): boolean {
    for (let cursor = descendant.parent; cursor; cursor = cursor.parent) if (cursor === ancestor) return true;
    return false;
  }
}
