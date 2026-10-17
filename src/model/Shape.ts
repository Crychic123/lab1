import type { Group } from './Group.ts';

export abstract class Shape {
  private owner: Group | null = null;

  constructor(public readonly id: string) {}

  get parent(): Group | null { return this.owner; }
  setParent(parent: Group | null): void { this.owner = parent; }
  abstract get type(): string;
  abstract move(dx: number, dy: number): void;
  abstract scale(factor: number): void;
  abstract set(attribute: string, value: string): void;
  abstract attributes(): Record<string, string>;
  abstract summary(): string;
  abstract clone(): Shape;
  abstract position(): string | null;

  get children(): readonly Shape[] { return []; }
  get textContent(): string | null { return null; }
  get label(): string { return `${this.type}#${this.id}`; }

  protected numeric(value: string): number {
    const number = Number(value);
    if (value.trim() === '' || !Number.isFinite(number)) throw new Error(`invalid number: ${value}`);
    return number;
  }
  protected finite(...values: number[]): void {
    if (values.some(value => !Number.isFinite(value))) throw new Error('geometry exceeds numeric range');
  }

  protected positive(value: string, attribute: string): number {
    const number = this.numeric(value);
    if (number < 0) throw new Error(`${attribute} must be non-negative`);
    return number;
  }

  protected style: Record<string, string> = {};
  private imported: Record<string, string> = {};
  importAttribute(attribute: string, value: string): void { this.imported[attribute] = value; }
  protected extras(): Record<string, string> { return { ...this.imported }; }
  protected setStyle(attribute: string, value: string): boolean {
    if (!['fill', 'stroke', 'stroke-width'].includes(attribute)) return false;
    if (attribute === 'stroke-width') this.positive(value, attribute);
    this.style[attribute] = value;
    return true;
  }
  protected styles(): Record<string, string> { return { ...this.style }; }
  protected styleSummary(): string {
    return Object.entries(this.style).map(([key, value]) => ` ${key}=${value}`).join('');
  }
  protected copyStyle(to: Shape): void { to.style = { ...this.style }; to.imported = { ...this.imported }; }
  protected unknown(attribute: string): never { throw new Error(`unknown attribute: ${attribute}`); }
}
