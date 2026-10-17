import { Shape } from './Shape.ts';

export class Group extends Shape {
  private items: Shape[] = [];
  get type(): string { return 'g'; }
  override get children(): readonly Shape[] { return this.items; }

  insert(shape: Shape, index = this.items.length): void {
    if (shape.parent) throw new Error(`shape already belongs to a group: ${shape.id}`);
    this.items.splice(index, 0, shape);
    shape.setParent(this);
  }
  remove(shape: Shape): number {
    const index = this.items.indexOf(shape);
    if (index < 0) throw new Error(`no such shape: ${shape.id}`);
    this.items.splice(index, 1);
    shape.setParent(null);
    return index;
  }
  indexOf(shape: Shape): number { return this.items.indexOf(shape); }
  move(dx: number, dy: number): void { for (const child of this.items) child.move(dx, dy); }
  scale(factor: number): void { for (const child of this.items) child.scale(factor); }
  set(attribute: string, value: string): void {
    if (!this.setStyle(attribute, value)) this.unknown(attribute);
  }
  attributes(): Record<string, string> { return { ...this.styles(), ...this.extras() }; }
  summary(): string { return this.styleSummary().trim(); }
  position(): null { return null; }
  clone(): Shape {
    const group = new Group(this.id);
    this.copyStyle(group);
    for (const child of this.items) group.insert(child.clone());
    return group;
  }
}
