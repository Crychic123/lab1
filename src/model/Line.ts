import { Shape } from './Shape.ts';

export class Line extends Shape {
  constructor(id: string, public x1: number, public y1: number, public x2: number, public y2: number, stroke?: string) {
    super(id);
    if (stroke !== undefined) this.set('stroke', stroke);
    for (const n of [x1, y1, x2, y2]) if (!Number.isFinite(n)) throw new Error('invalid geometry');
  }
  get type(): string { return 'line'; }
  move(dx: number, dy: number): void { this.finite(this.x1 + dx, this.x2 + dx, this.y1 + dy, this.y2 + dy); this.x1 += dx; this.x2 += dx; this.y1 += dy; this.y2 += dy; }
  scale(factor: number): void { this.finite(this.x1 * factor, this.y1 * factor, this.x2 * factor, this.y2 * factor); this.x1 *= factor; this.y1 *= factor; this.x2 *= factor; this.y2 *= factor; }
  set(attribute: string, value: string): void {
    if (this.setStyle(attribute, value)) return;
    if (attribute === 'x1' || attribute === 'y1' || attribute === 'x2' || attribute === 'y2') this[attribute] = this.numeric(value);
    else this.unknown(attribute);
  }
  attributes(): Record<string, string> { return { x1: `${this.x1}`, y1: `${this.y1}`, x2: `${this.x2}`, y2: `${this.y2}`, ...this.styles(), ...this.extras() }; }
  summary(): string { return `(${this.x1},${this.y1}) -> (${this.x2},${this.y2})${this.styleSummary()}`; }
  position(): string { return `(${this.x1},${this.y1})`; }
  clone(): Shape { const shape = new Line(this.id, this.x1, this.y1, this.x2, this.y2); this.copyStyle(shape); return shape; }
}
