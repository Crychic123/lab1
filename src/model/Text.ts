import { Shape } from './Shape.ts';

export class Text extends Shape {
  constructor(id: string, public x: number, public y: number, public content: string) {
    super(id);
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error('invalid geometry');
  }
  get type(): string { return 'text'; }
  override get textContent(): string { return this.content; }
  move(dx: number, dy: number): void { this.finite(this.x + dx, this.y + dy); this.x += dx; this.y += dy; }
  scale(factor: number): void { this.finite(this.x * factor, this.y * factor); this.x *= factor; this.y *= factor; }
  set(attribute: string, value: string): void {
    if (this.setStyle(attribute, value)) return;
    if (attribute === 'x' || attribute === 'y') this[attribute] = this.numeric(value);
    else if (attribute === 'text') this.content = value;
    else this.unknown(attribute);
  }
  attributes(): Record<string, string> { return { x: `${this.x}`, y: `${this.y}`, ...this.styles(), ...this.extras() }; }
  summary(): string { return `(${this.x},${this.y}) "${this.content}"${this.styleSummary()}`; }
  position(): string { return `(${this.x},${this.y})`; }
  clone(): Shape { const shape = new Text(this.id, this.x, this.y, this.content); this.copyStyle(shape); return shape; }
}
