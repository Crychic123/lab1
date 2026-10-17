import { Circle } from './Circle.ts';
import { Ellipse } from './Ellipse.ts';
import { Group } from './Group.ts';
import { Line } from './Line.ts';
import { Rect } from './Rect.ts';
import { Shape } from './Shape.ts';
import { Text } from './Text.ts';

type Maker = (id: string, args: string[]) => Shape;

export class ShapeFactory {
  private readonly makers = new Map<string, Maker>([
    ['rect', (id, a) => { this.arity(a, 4, 5); return new Rect(id, this.num(a[0]), this.num(a[1]), this.num(a[2]), this.num(a[3]), a[4]); }],
    ['circle', (id, a) => { this.arity(a, 3, 4); return new Circle(id, this.num(a[0]), this.num(a[1]), this.num(a[2]), a[3]); }],
    ['ellipse', (id, a) => { this.arity(a, 4, 5); return new Ellipse(id, this.num(a[0]), this.num(a[1]), this.num(a[2]), this.num(a[3]), a[4]); }],
    ['line', (id, a) => { this.arity(a, 4, 5); return new Line(id, this.num(a[0]), this.num(a[1]), this.num(a[2]), this.num(a[3]), a[4]); }],
    ['text', (id, a) => { this.arity(a, 3, 3); return new Text(id, this.num(a[0]), this.num(a[1]), a[2]); }],
    ['g', (id, a) => { this.arity(a, 0, 0); return new Group(id); }]
  ]);
  create(type: string, id: string, args: string[]): Shape {
    const maker = this.makers.get(type);
    if (!maker) throw new Error(`unknown shape type: ${type} (is the plugin loaded?)`);
    return maker(id, args);
  }
  fromSvg(type: string, id: string, attributes: Record<string, string>, content: string): Shape {
    const fields = new Map<string, string[]>([
      ['rect', ['x', 'y', 'width', 'height']],
      ['circle', ['cx', 'cy', 'r']],
      ['ellipse', ['cx', 'cy', 'rx', 'ry']],
      ['line', ['x1', 'y1', 'x2', 'y2']],
      ['text', ['x', 'y']],
      ['g', []]
    ]);
    const geometry = fields.get(type);
    if (!geometry) throw new Error(`unsupported SVG element: ${type}`);
    const values = geometry.map(field => attributes[field] ?? '0');
    if (type === 'text') values.push(content);
    const shape = this.create(type, id, values);
    for (const field of ['fill', 'stroke', 'stroke-width']) {
      if (attributes[field] !== undefined) shape.set(field, attributes[field]);
    }
    const extras = ['font-size', 'font-family', 'font-weight', 'text-anchor', 'opacity', 'stroke-linecap', 'stroke-linejoin'];
    for (const [field, value] of Object.entries(attributes)) {
      if (field === 'id' || field === 'transform' || geometry.includes(field) || ['fill', 'stroke', 'stroke-width'].includes(field)) continue;
      if (!extras.includes(field)) throw new Error(`unsupported SVG attribute: ${field}`);
      shape.importAttribute(field, value);
    }
    return shape;
  }
  private num(value: string): number {
    const n = Number(value);
    if (value === undefined || value.trim() === '' || !Number.isFinite(n)) throw new Error(`invalid number: ${value}`);
    return n;
  }
  private arity(args: string[], minimum: number, maximum: number): void {
    if (args.length < minimum || args.length > maximum) throw new Error('invalid create arguments');
  }
}
