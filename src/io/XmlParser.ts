export interface XmlElement {
  name: string;
  attributes: Record<string, string>;
  children: XmlElement[];
  text: string;
}

export class XmlParser {
  parse(source: string): XmlElement {
    const stack: XmlElement[] = [];
    let root: XmlElement | null = null;
    let position = 0;
    while (position < source.length) {
      const open = source.indexOf('<', position);
      if (open < 0) {
        this.appendText(source.slice(position), stack);
        break;
      }
      this.appendText(source.slice(position, open), stack);
      if (source.startsWith('<!--', open)) {
        const end = source.indexOf('-->', open + 4);
        if (end < 0) throw new Error('unterminated XML comment');
        position = end + 3;
        continue;
      }
      if (source.startsWith('<![CDATA[', open)) {
        const end = source.indexOf(']]>', open + 9);
        if (end < 0) throw new Error('unterminated CDATA');
        if (stack.length) stack[stack.length - 1].text += source.slice(open + 9, end);
        position = end + 3;
        continue;
      }
      if (source.startsWith('<?', open)) {
        const end = source.indexOf('?>', open + 2);
        if (end < 0) throw new Error('unterminated XML declaration');
        position = end + 2;
        continue;
      }
      if (source.startsWith('<!', open)) throw new Error('DTD and declarations are unsupported');
      let end = open + 1, quote = '';
      for (; end < source.length; end++) {
        const ch = source[end];
        if (quote) { if (ch === quote) quote = ''; }
        else if (ch === '"' || ch === "'") quote = ch;
        else if (ch === '>') break;
      }
      if (end >= source.length) throw new Error('unterminated XML tag');
      let raw = source.slice(open + 1, end).trim();
      position = end + 1;
      if (raw.startsWith('/')) {
        const name = raw.slice(1).trim();
        const current = stack.pop();
        if (!current || current.name !== name) throw new Error(`mismatched closing tag: ${name}`);
        continue;
      }
      const selfClosing = raw.endsWith('/');
      if (selfClosing) raw = raw.slice(0, -1).trimEnd();
      const match = /^([\w:.-]+)/.exec(raw);
      if (!match) throw new Error('invalid XML tag');
      const node: XmlElement = { name: match[1], attributes: this.parseAttributes(raw.slice(match[0].length).trimEnd()), children: [], text: '' };
      if (stack.length) stack[stack.length - 1].children.push(node);
      else if (root) throw new Error('multiple XML roots');
      else root = node;
      if (!selfClosing) stack.push(node);
    }
    if (stack.length) throw new Error(`unclosed XML tag: ${stack[stack.length - 1].name}`);
    if (!root) throw new Error('empty XML document');
    return root;
  }
  private appendText(raw: string, stack: XmlElement[]): void {
    if (!stack.length) { if (raw.trim()) throw new Error('text outside XML root'); return; }
    stack[stack.length - 1].text += this.decode(raw);
  }
  private parseAttributes(raw: string): Record<string, string> {
    const result: Record<string, string> = {};
    const pattern = /\s+([\w:.-]+)\s*=\s*("[^"]*"|'[^']*')/y;
    let index = 0;
    while (index < raw.length) {
      pattern.lastIndex = index;
      const match = pattern.exec(raw);
      if (!match) throw new Error(`invalid XML attribute near: ${raw.slice(index).trim()}`);
      if (Object.hasOwn(result, match[1])) throw new Error(`duplicate XML attribute: ${match[1]}`);
      result[match[1]] = this.decode(match[2].slice(1, -1));
      index = pattern.lastIndex;
    }
    return result;
  }
  private decode(value: string): string {
    return value.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[A-Za-z]+);|&/g, (_, entity: string | undefined) => {
      if (!entity) throw new Error('unknown XML entity');
      if (entity === 'amp') return '&';
      if (entity === 'lt') return '<';
      if (entity === 'gt') return '>';
      if (entity === 'quot') return '"';
      if (entity === 'apos') return "'";
      const point = entity.startsWith('#x') ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      if (!Number.isFinite(point) || point > 0x10ffff || (point >= 0xd800 && point <= 0xdfff)) throw new Error('invalid XML character reference');
      return String.fromCodePoint(point);
    });
  }
}
