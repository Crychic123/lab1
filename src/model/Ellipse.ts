import { Shape } from './Shape.ts';

export class Ellipse extends Shape {
  constructor(id: string, public cx: number, public cy: number, public rx: number, public ry: number, fill?: string) {
    super(id);
    if (fill !== undefined) this.set('fill', fill);
    this.validate();
  }
  get type(): string { return 'ellipse'; }
  private validate(): void {
    for (const n of [this.cx, this.cy, this.rx, this.ry]) if (!Number.isFinite(n)) throw new Error('invalid geometry');
    if (this.rx < 0 || this.ry < 0) throw new Error('radius must be non-negative');
  }
  move(dx: number, dy: number): void { this.finite(this.cx + dx, this.cy + dy); this.cx += dx; this.cy += dy; }
  scale(factor: number): void { this.finite(this.cx * factor, this.cy * factor, this.rx * factor, this.ry * factor); this.cx *= factor; this.cy *= factor; this.rx *= factor; this.ry *= factor; }
  set(attribute: string, value: string): void {
    if (this.setStyle(attribute, value)) return;
    if (attribute === 'cx' || attribute === 'cy') this[attribute] = this.numeric(value);
    else if (attribute === 'rx' || attribute === 'ry') this[attribute] = this.positive(value, attribute);
    else this.unknown(attribute);
  }
  attributes(): Record<string, string> { return { cx: `${this.cx}`, cy: `${this.cy}`, rx: `${this.rx}`, ry: `${this.ry}`, ...this.styles(), ...this.extras() }; }
  summary(): string { return `cx=${this.cx} cy=${this.cy} rx=${this.rx} ry=${this.ry}${this.styleSummary()}`; }
  position(): string { return `(${this.cx},${this.cy})`; }
  clone(): Shape { const shape = new Ellipse(this.id, this.cx, this.cy, this.rx, this.ry); this.copyStyle(shape); return shape; }
}
