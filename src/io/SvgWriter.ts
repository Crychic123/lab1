import { Group } from '../model/Group.ts';
import { SvgDocument } from '../model/SvgDocument.ts';
import { Shape } from '../model/Shape.ts';

export class SvgWriter {
  write(document: SvgDocument): string {
    const header = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${document.width}" height="${document.height}" viewBox="0 0 ${document.width} ${document.height}">`;
    return `${header}\n${document.children.map(shape => this.shape(shape, 1)).join('')}<\/svg>\n`;
  }
  private shape(shape: Shape, depth: number): string {
    const indent = '  '.repeat(depth);
    const attributes = Object.entries({ id: shape.id, ...shape.attributes() })
      .map(([name, value]) => ` ${name}="${this.escape(value)}"`).join('');
    if (shape instanceof Group) {
      if (!shape.children.length) return `${indent}<g${attributes}/>\n`;
      return `${indent}<g${attributes}>\n${shape.children.map(child => this.shape(child, depth + 1)).join('')}${indent}</g>\n`;
    }
    if (shape.textContent !== null)
      return `${indent}<text${attributes}>${this.escape(shape.textContent)}</text>\n`;
    return `${indent}<${shape.type}${attributes}/>\n`;
  }
  private escape(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }
}
