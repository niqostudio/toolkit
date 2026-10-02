import { describe, expect, it } from 'vitest';
import { fixSpacing, textIssues } from './text.ts';

describe('文章の書式', () => {
  it('規則に合うコメント', () => {
    expect(textIssues('Notion の日付のみ（YYYY-MM-DD）は UTC 扱い → 更新日時より後にならないよう JST を明示')).toEqual([]);
    expect(textIssues('実装範囲: `prepare().bind().all()` のみ')).toEqual([]);
    expect(textIssues('不足している項目は held')).toEqual([]);
    expect(textIssues('作成日時を使用し、受け渡しは読み込み後')).toEqual([]);
    expect(textIssues('D1 の読み書きと読み取り専用の判定')).toEqual([]);
  });

  it('バージョンの意味の「版」だけを指摘する', () => {
    for (const t of ['版を上げる', '同じ版に上書き', 'タグと版の一致', '最新の版を取得', '版ごとに記録']) expect(textIssues(t)).toContain(`「${t.match(/(同じ|新しい|古い|前の|次の|最新の|各|旧|新)?版(を上げ|が上が|の一致|ごと)?/)![0]}」→ バージョン`);
    for (const t of ['出版社の記事', '初版の発行', 'Web 版と iOS 版', '日本語版のドキュメント', '図版の差し替え']) expect(textIssues(t).filter((i) => i.includes('バージョン'))).toEqual([]);
  });

  it('改名はリネーム', () => {
    expect(textIssues('ファイルを改名する')).toContain('「改名」→ リネーム');
  });

  it('違反を列挙する', () => {
    expect(textIssues('キャッシュを作る。')).toEqual(['末尾に句点を付けない', '「作る」→ 作成']);
    expect(textIssues('上限 (D1) の行')).toEqual(['括弧は全角（コードはバッククォート）']);
    expect(textIssues('A（B（C））')).toEqual(['括弧を入れ子にしない', '括弧の補足は 1 つまで']);
    const spacing = '和欧間のスペース（英字を含む語だけ空け、数字だけの語は詰める）';
    expect(textIssues('ブラウザのUAで再取得')).toEqual([spacing]);
    expect(textIssues('2 段の公開サフィックス')).toEqual([spacing]);
    expect(textIssues('ホワイトリストのホストと 1回だけ再取得')).toEqual([spacing]);
    expect(textIssues('許可リストに登録')).toEqual(['「許可リスト」→ ホワイトリスト']);
    expect(textIssues('本文を取り出す')).toEqual(['「出す」→ 出力・表示・返却・抽出']);
  });

  it('和欧間のスペースは記事と同じ規則で直す', () => {
    expect(fixSpacing('2 段の上限は D1の上限と同じ（30% 以上・1 回）')).toBe('2段の上限は D1 の上限と同じ（30%以上・1回）');
    expect(fixSpacing('`prepare()`の 1 回')).toBe('`prepare()`の1回');
    expect(textIssues('MCP サーバーを束ねる')).toEqual(['「束ね」→ 集約']);
    expect(textIssues('A。B。C')).toEqual(['1 行の文は 2 つまで（3 つ以上は行を分ける）']);
  });

});
