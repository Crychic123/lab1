import { Shape } from './Shape.ts';

export class Circle extends Shape {
  constructor(id: string, public cx: number, public cy: number, public r: number, fill?: string) {
    super(id);
    if (fill !== undefined) this.set('fill', fill);
    this.validate();
  }
  get type(): string { return 'circle'; }
  private validate(): void {
    for (const n of [this.cx, this.cy, this.r]) if (!Number.isFinite(n)) throw new Error('invalid geometry');
    if (this.r < 0) throw new Error('r must be non-negative');
  }
  move(dx: number, dy: number): void { this.cx += dx; this.cy += dy; }
  scale(factor: number): void { this.cx *= factor; this.cy *= factor; this.r *= factor; }
  set(attribute: string, value: string): void {
    if (this.setStyle(attribute, value)) return;
    if (attribute === 'cx' || attribute === 'cy') this[attribute] = this.numeric(value);
    else if (attribute === 'r') this.r = this.positive(value, attribute);
    else this.unknown(attribute);
  }
  attributes(): Record<string, string> { return { cx: `${this.cx}`, cy: `${this.cy}`, r: `${this.r}`, ...this.styles(), ...this.extras() }; }
  summary(): string { return `cx=${this.cx} cy=${this.cy} r=${this.r}${this.styleSummary()}`; }
  position(): string { return `(${this.cx},${this.cy})`; }
  clone(): Shape { const shape = new Circle(this.id, this.cx, this.cy, this.r); this.copyStyle(shape); return shape; }
}
