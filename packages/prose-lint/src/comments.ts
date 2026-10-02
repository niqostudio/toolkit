// コメントの書式の判定。要否の判断は人・AI、書式の確定はここ
// 対象 = 行頭のコメント（`//`・`#`）。行末のコメントは文字列中の `//` と区別不可 → スキーマのファイルのみ対象
export function lineComment(line: string, kind: 'ts' | 'tf'): string | undefined {
  const m = kind === 'ts' ? line.match(/^\s*\/\/\s?(.*)$/) : line.match(/^\s*#\s?(.*)$/);
  return m?.[1];
}

// フィールドの行（`,`・`;` で終わる）と行末コメント
const FIELD = /^(\s*[^\s/].*?[,;])(?:\s+\/\/ (.*))?$/;
export function trailingComment(line: string): { code: string; text?: string } | undefined {
  const m = line.match(FIELD);
  return m ? { code: m[1]!, ...(m[2] !== undefined ? { text: m[2] } : {}) } : undefined;
}

// 連続するフィールドの行を1ブロックとし、行末コメントの開始位置をブロック内の最長のコードに統一
export function alignTrailing(lines: string[], fix: (text: string) => string = (t) => t): string[] {
  const out = [...lines];
  let i = 0;
  while (i < out.length) {
    if (!trailingComment(out[i]!)) {
      i++;
      continue;
    }
    let j = i;
    while (j < out.length && trailingComment(out[j]!)) j++;
    const block = out.slice(i, j).map((l) => trailingComment(l)!);
    const width = Math.max(...block.filter((b) => b.text !== undefined).map((b) => b.code.length), 0);
    block.forEach((b, k) => {
      if (b.text !== undefined) out[i + k] = `${b.code.padEnd(width)} // ${fix(b.text)}`;
    });
    i = j;
  }
  return out;
}

// Markdown の本文の判定単位: 段落・箇条書き・見出しの行と表のセル。コードブロックは対象外
export function markdownTexts(source: string): { line: number; text: string }[] {
  const out: { line: number; text: string }[] = [];
  let code = false;
  source.split(/\r?\n/).forEach((l, i) => {
    if (l.startsWith('```')) code = !code;
    if (code || l.startsWith('```') || !l.trim()) return;
    const texts = l.startsWith('|') ? l.split(/(?<!\\)\|/).slice(1, -1).map((c) => c.trim()) : [l.replace(/^#+\s+|^\s*(?:[-*]|\d+\.)\s+/, '')];
    // リンクの URL 部分（`](...)`）は判定対象外
    for (const text of texts) if (text && !/^-+$/.test(text)) out.push({ line: i + 1, text: text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') });
  });
  return out;
}
