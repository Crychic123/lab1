import { Group } from '../model/Group.ts';
import { Shape } from '../model/Shape.ts';
import { ShapeFactory } from '../model/ShapeFactory.ts';
import { SvgDocument } from '../model/SvgDocument.ts';
import { XmlParser, type XmlElement } from './XmlParser.ts';

export class SvgReader {
  read(source: string): { document: SvgDocument; warnings: string[] } {
    const root = new XmlParser().parse(source);
    if (this.localName(root.name) !== 'svg') throw new Error('root element must be <svg>');
    const width = this.dimension(root.attributes.width);
    const height = this.dimension(root.attributes.height);
    const document = new SvgDocument(width, height);
    const explicitIds = new Set<string>();
    this.visit(root, element => {
      const id = element.attributes.id;
      if (id) {
        if (explicitIds.has(id)) throw new Error(`id already exists: ${id}`);
        explicitIds.add(id);
      }
    });
    const used = new Set(explicitIds);
    const counters = new Map<string, number>();
    const warnings: string[] = [];
    const factory = new ShapeFactory();
    const add = (element: XmlElement, parent: Group): void => {
      const type = this.localName(element.name);
      let id = element.attributes.id;
      if (!id) {
        let number = counters.get(type) ?? 0;
        do { number++; id = `${type}${number}`; } while (used.has(id));
        counters.set(type, number);
        used.add(id);
        warnings.push(`warning: assigned id ${id} to unnamed <${type}>`);
      }
      const shape = factory.fromSvg(type, id, element.attributes, element.text);
      if (shape.textContent === null && element.text.trim()) throw new Error(`unexpected text in <${type}>`);
      if (shape.textContent !== null && element.children.length) throw new Error('nested SVG text is unsupported');
      document.add(shape, parent);
      if (shape instanceof Group) for (const child of element.children) add(child, shape);
      else if (element.children.length) throw new Error(`<${type}> cannot contain shapes`);
      if (element.attributes.transform) this.applyTransform(shape, element.attributes.transform);
    };
    for (const element of root.children) add(element, document.root);
    return { document, warnings };
  }
  private dimension(value: string | undefined): number {
    const number = Number(value?.replace(/px$/, ''));
    if (!value || !Number.isFinite(number) || number <= 0) throw new Error(`invalid canvas dimension: ${value}`);
    return number;
  }
  private localName(name: string): string { return name.split(':').at(-1)!; }
  private visit(element: XmlElement, action: (element: XmlElement) => void): void {
    for (const child of element.children) { action(child); this.visit(child, action); }
  }
  private applyTransform(shape: Shape, source: string): void {
    const operations: { name: string; values: number[] }[] = [];
    const pattern = /\s*(translate|scale)\s*\(([^)]*)\)\s*/gy;
    let index = 0;
    while (index < source.length) {
      pattern.lastIndex = index;
      const match = pattern.exec(source);
      if (!match) throw new Error(`unsupported transform: ${source}`);
      const values = match[2].trim().split(/[\s,]+/).map(Number);
      if (!values.length || values.some(value => !Number.isFinite(value))) throw new Error(`invalid transform: ${source}`);
      operations.push({ name: match[1], values });
      index = pattern.lastIndex;
    }
    for (const operation of operations.reverse()) {
      if (operation.name === 'translate') {
        if (operation.values.length > 2) throw new Error(`invalid transform: ${source}`);
        shape.move(operation.values[0], operation.values[1] ?? 0);
      } else {
        if (operation.values.length > 2 || (operation.values.length === 2 && operation.values[0] !== operation.values[1]))
          throw new Error(`unsupported transform: ${source}`);
        if (operation.values[0] <= 0) throw new Error(`invalid transform: ${source}`);
        shape.scale(operation.values[0]);
      }
    }
  }
}
