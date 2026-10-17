export class Tokenizer {
  tokenize(line: string): string[] {
    const tokens: string[] = [];
    let current = '', quoted = false, active = false;
    for (let index = 0; index < line.length; index++) {
      const char = line[index];
      if (quoted && char === '\\' && (line[index + 1] === '"' || line[index + 1] === '\\')) {
        current += line[++index];
      } else if (char === '"') {
        quoted = !quoted; active = true;
      } else if (!quoted && /\s/.test(char)) {
        if (active) { tokens.push(current); current = ''; active = false; }
      } else {
        current += char; active = true;
      }
    }
    if (quoted) throw new Error('unterminated quoted string');
    if (active) tokens.push(current);
    return tokens;
  }
}
