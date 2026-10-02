// コミットメッセージの文体の検査（git の commit-msg フック用）
//   - Conventional Commits の `type(scope)!: ` は対象外（英語の決まった書式）
//   - `#` で始まる行・`--verbose` の差分（切り取り線以降）は git が除去 → 対象外
import { textIssues, VOCABULARY, type Vocabulary } from './text.ts';

const PREFIX = /^[a-z]+(\([^)]*\))?!?: /;
const SCISSORS = /^# -+ >8 -+$/;

export function commitMessageIssues(message: string, vocabulary: Vocabulary = VOCABULARY): { line: number; text: string; issues: string[] }[] {
  const out: { line: number; text: string; issues: string[] }[] = [];
  const lines = message.split(/\r?\n/);
  for (const [i, raw] of lines.entries()) {
    if (SCISSORS.test(raw)) break;
    if (raw.startsWith('#') || !raw.trim()) continue;
    const text = i === 0 ? raw.replace(PREFIX, '') : raw;
    const issues = textIssues(text, vocabulary);
    if (issues.length) out.push({ line: i + 1, text, issues });
  }
  return out;
}
