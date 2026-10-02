import { describe, expect, it } from 'vitest';
import { markdownTexts } from './comments.ts';

describe('Markdown の検査対象', () => {
  it('コードブロック・HTML のコメント・front matter は対象外', () => {
    const source = ['---', 'title: 作る', '---', '本文を作る', '- 手順', '  ```sh', '  作る', '  ```', '~~~', '作る', '~~~', '<!-- 作る', '作る -->', '最後'].join('\n');
    expect(markdownTexts(source).map((t) => t.text)).toEqual(['本文を作る', '手順', '最後']);
  });
});
