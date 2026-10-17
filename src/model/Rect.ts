import { Shape } from './Shape.ts';

export class Rect extends Shape {
  constructor(id: string, public x: number, public y: number, public width: number, public height: number, fill?: string) {
    super(id);
    if (fill !== undefined) this.set('fill', fill);
    this.validate();
  }
  get type(): string { return 'rect'; }
  private validate(): void {
    for (const n of [this.x, this.y, this.width, this.height]) if (!Number.isFinite(n)) throw new Error('invalid geometry');
    if (this.width < 0 || this.height < 0) throw new Error('size must be non-negative');
  }
  move(dx: number, dy: number): void { this.x += dx; this.y += dy; }
  scale(factor: number): void { this.x *= factor; this.y *= factor; this.width *= factor; this.height *= factor; }
  set(attribute: string, value: string): void {
    if (this.setStyle(attribute, value)) return;
    if (attribute === 'x' || attribute === 'y') this[attribute] = this.numeric(value);
    else if (attribute === 'width' || attribute === 'height') this[attribute] = this.positive(value, attribute);
    else this.unknown(attribute);
  }
  attributes(): Record<string, string> { return { x: `${this.x}`, y: `${this.y}`, width: `${this.width}`, height: `${this.height}`, ...this.styles(), ...this.extras() }; }
  summary(): string { return `x=${this.x} y=${this.y} w=${this.width} h=${this.height}${this.styleSummary()}`; }
  position(): string { return `(${this.x},${this.y})`; }
  clone(): Shape { const shape = new Rect(this.id, this.x, this.y, this.width, this.height); this.copyStyle(shape); return shape; }
}
