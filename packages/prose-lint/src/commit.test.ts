import { describe, expect, it } from 'vitest';
import { commitMessageIssues } from './commit.ts';

describe('コミットメッセージ', () => {
  it('type・scope を除いた本文を検査する', () => {
    expect(commitMessageIssues('feat(site): OG 画像に和欧間のアキを追加する\n')).toEqual([]);
    expect(commitMessageIssues('fix: ファイルを改名する。')).toEqual([{ line: 1, text: 'ファイルを改名する。', issues: ['末尾に句点を付けない', '「改名」→ リネーム'] }]);
  });

  it('git が除去する行は対象外', () => {
    const message = 'chore: 依存を更新する\n\n# 変更をコミットするには…。\n# ------------------------ >8 ------------------------\n- 版を上げる。\n';
    expect(commitMessageIssues(message)).toEqual([]);
  });
});
