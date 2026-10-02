#!/usr/bin/env node
// リポの中の日本語の文章（コメント・Markdown）の文体の検査。違反があれば終了コード1
//   prose-lint [paths...] [--summary] [--fix]
//   prose-lint --commit-msg <file>  コミットメッセージの検査（commit-msg フック）
//   --fix: 和欧間のスペースと、行末コメントの開始位置だけ自動修正（語彙・構造は文脈の判断が必要）
// 設定 = 実行ディレクトリの `prose-lint.json`（なければ既定値）
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { commitMessageIssues } from './commit.ts';
import { alignTrailing, lineComment, markdownTexts, trailingComment } from './comments.ts';
import { fixSpacing, textIssues, VOCABULARY, type Vocabulary } from './text.ts';

type Config = {
  paths: string[]; // 対象のディレクトリ（git の追跡対象のみ）
  docs: string[]; // 検査する Markdown（git の pathspec）
  extensions: string[]; // 行頭のコメントを検査する拡張子。`tf` は `#`、ほかは `//`
  skip: string; // 対象外のパス（正規表現）
  trailingFiles: string; // 1 フィールド 1 行・説明は行末コメントのファイル（正規表現）
  vocabulary: { re: string; flags?: string; to: string }[]; // リポ固有の語彙（共通の語彙に追加）
};

const DEFAULTS: Config = {
  paths: ['apps', 'packages', 'scripts'],
  docs: ['*.md'],
  extensions: ['ts', 'tsx', 'astro', 'tf'],
  skip: '(^|/)(\\.tmp/|worker-configuration\\.d\\.ts)',
  trailingFiles: '(^|/)schema\\.ts$',
  vocabulary: [],
};

const config: Config = { ...DEFAULTS, ...(existsSync('prose-lint.json') ? (JSON.parse(readFileSync('prose-lint.json', 'utf8')) as Partial<Config>) : {}) };
const vocabulary: Vocabulary = [...VOCABULARY, ...config.vocabulary.map((v) => ({ re: new RegExp(v.re, v.flags), to: v.to }))];
const skip = new RegExp(config.skip);
const trailingFiles = new RegExp(config.trailingFiles);
const extension = new RegExp(`\\.(${config.extensions.join('|')})$`);

const { values, positionals } = parseArgs({ allowPositionals: true, options: { summary: { type: 'boolean', default: false }, fix: { type: 'boolean', default: false }, 'commit-msg': { type: 'string' } } });
if (values['commit-msg']) {
  const found = commitMessageIssues(readFileSync(values['commit-msg'], 'utf8'), vocabulary);
  for (const f of found) console.log(`コミットメッセージ ${f.line} 行目: ${f.issues.join(' / ')}
  ${f.text}`);
  process.exit(found.length ? 1 : 0);
}
const targets = positionals.length ? positionals : config.paths;
const files = execFileSync('git', ['ls-files', ...targets], { encoding: 'utf8' })
  .split('\n')
  .filter((f) => extension.test(f) && !skip.test(f));
const docs = execFileSync('git', ['ls-files', '--', ...(positionals.length ? positionals.filter((f) => f.endsWith('.md')) : config.docs)], { encoding: 'utf8' })
  .split('\n')
  .filter((f) => f.endsWith('.md') && !skip.test(f) && existsSync(f));

const counts = new Map<string, number>();
let total = 0;
const report = (where: string, text: string, issues: string[]) => {
  total++;
  for (const issue of issues) {
    const key = issue.replace(/「.*」/, '「…」');
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  if (!values.summary) console.log(`${where}: ${issues.join(' / ')}\n  ${text}`);
};

for (const file of files) {
  const kind = file.endsWith('.tf') ? 'tf' : 'ts';
  const source = readFileSync(file, 'utf8');
  let lines = source.split(/\r?\n/);
  const trailing = trailingFiles.test(file);
  if (values.fix) {
    let fixed = lines.map((line) => {
      const text = lineComment(line, kind);
      return text ? line.slice(0, line.length - text.length) + fixSpacing(text) : line;
    });
    if (trailing) fixed = alignTrailing(fixed, fixSpacing);
    if (fixed.some((x, i) => x !== lines[i])) writeFileSync(file, fixed.join(source.includes('\r\n') ? '\r\n' : '\n'));
    lines = fixed;
  }
  const aligned = trailing ? alignTrailing(lines) : lines;
  lines.forEach((line, i) => {
    const text = lineComment(line, kind) ?? (trailing ? trailingComment(line)?.text : undefined);
    if (!text) return;
    const issues = [...textIssues(text, vocabulary), ...(aligned[i] !== line ? ['行末コメントの開始位置を統一'] : [])];
    if (issues.length) report(`${file}:${i + 1}`, text, issues);
  });
}

for (const file of docs) {
  for (const { line, text } of markdownTexts(readFileSync(file, 'utf8'))) {
    const issues = textIssues(text, vocabulary);
    if (issues.length) report(`${file}:${line}`, text, issues);
  }
}

if (values.summary) for (const [issue, n] of [...counts].sort((a, b) => b[1] - a[1])) console.log(`${String(n).padStart(5)}  ${issue}`);
console.log(total ? `${total} 行` : '問題なし');
process.exitCode = total ? 1 : 0;
