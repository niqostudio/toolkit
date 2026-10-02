// 文章の書式の判定と自動修正（技術文書の文体: 漢語・エンジニア語彙・和欧間・句読点・括弧）
import { autoSpace } from './spacing.ts';

// 和語・平易な語 → 漢語・エンジニア語彙。動詞は語幹と活用語尾で照合（「作成」「消費」などの漢語は語尾が不一致）
export type Vocabulary = { re: RegExp; to: string }[];

// 共通の語彙。リポ固有の語彙（コード上の名前で書く語など）は `lint.json` の `vocabulary`
export const VOCABULARY: Vocabulary = [
  { re: /変え[るたてなよ]|変わ[るらりっ]/, to: '変更' },
  { re: /作[るらりれろっ]/, to: '作成' },
  { re: /消[すさしせ]/, to: '削除' },
  { re: /(?<!不)足[すさしせ]/, to: '追加' },
  { re: /分け[るたてな]/, to: '分割・分離' },
  { re: /揃[えうわいっ]/, to: '統一' },
  { re: /確かめ/, to: '確認' },
  { re: /直[すさしせ]/, to: '修正' },
  { re: /入れ[るたてな]/, to: '格納・登録' },
  { re: /読[むまめん]|読み(?!込|書き|取り|にく|やす)/, to: '取得・読み込み' },
  { re: /(?<!受け)渡[すさしせ]/, to: '指定・受け渡し' },
  { re: /使[うわいえっ]/, to: '使用' },
  { re: /束ね/, to: '集約' },
  { re: /(?<![\p{sc=Han}び]|書き)出[すさしせ]/u, to: '出力・表示・返却・抽出' },
  { re: /(?<!\p{sc=Han})外[すさしせ]/u, to: '除外' },
  { re: /落と[すさしせ]/, to: '除外・破棄・reject' },
  { re: /拾[うわいえっ]/, to: '検出・取得' },
  { re: /載せ/, to: '格納・掲載' },
  { re: /足りな/, to: '不足' },
  { re: /並び/, to: '順序・ソート順' },
  { re: /許可リスト/, to: 'ホワイトリスト' },
  { re: /入口/, to: 'エンドポイント・エントリーポイント' },
  { re: /中身/, to: '内容・本体' },
  { re: /見た目/, to: '表示' },
  { re: /置き場/, to: '格納先' },
  { re: /手直し/, to: '修正' },
  { re: /仕組み/, to: '機構・実装' },
  { re: /呼出側|呼び出し側/, to: 'caller' },
  { re: /正本/, to: 'マスタ' },
  { re: /改名/, to: 'リネーム' },
  // バージョンの意味の「版」だけ（「出版」「初版」「Web 版」などのエディションの意味は対象外）
  { re: /(同じ|新しい|古い|前の|次の|最新の|各|旧|新)版|版(を(上げ|固定|指定)|が上が|の(番号|一致|違い)|番号|ごと|間)/, to: 'バージョン' },
];

const JA = /[\p{sc=Han}\p{sc=Hiragana}\p{sc=Katakana}ー]/u;

// バッククォートの中（コード）は判定対象外
const prose = (text: string) => text.replace(/`[^`]*`/g, (m) => ' '.repeat(m.length));

const NBSP = String.fromCharCode(0xa0);

// 和欧間のスペース = `autoSpace`（英字を含む語だけ空け、数字だけの語は詰める）
// 対象外: コード・構造の記号（行頭の `- `・`: `・`, `・` / `・` = `）。autoSpace は `:`・`,`・`-` を語の一部として詰めるため
const KEEP = /(`[^`]*`|^\s*- |: |, | \/ | = )/;
export const fixSpacing = (text: string) =>
  text
    .split(KEEP)
    .map((part, i) => (i % 2 === 1 ? part : autoSpace(part).replaceAll(NBSP, ' ')))
    .join('');

export function textIssues(text: string, vocabulary: Vocabulary = VOCABULARY): string[] {
  const t = prose(text);
  const issues: string[] = [];
  if (/。\s*$/.test(t)) issues.push('末尾に句点を付けない');
  if (JA.test(t) && /[()]/.test(t)) issues.push('括弧は全角（コードはバッククォート）');
  let depth = 0;
  let max = 0;
  let count = 0;
  for (const c of t) {
    if (c === '（') {
      depth++;
      count++;
      max = Math.max(max, depth);
    } else if (c === '）') depth = Math.max(0, depth - 1);
  }
  if (max > 1) issues.push('括弧を入れ子にしない');
  if (count > 1) issues.push('括弧の補足は 1 つまで');
  if ((t.match(/。./g) ?? []).length >= 2) issues.push('1 行の文は 2 つまで（3 つ以上は行を分ける）');
  if (/：/.test(t)) issues.push('コロンは半角（キー: 値）');
  if (fixSpacing(text) !== text) issues.push('和欧間のスペース（英字を含む語だけ空け、数字だけの語は詰める）');
  for (const k of vocabulary) {
    const m = t.match(k.re);
    if (m) issues.push(`「${m[0]}」→ ${k.to}`);
  }
  return issues;
}
