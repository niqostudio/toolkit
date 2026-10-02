# toolkit

複数のリポで共有するパッケージ。npm に public で公開し、各リポは版を指定して依存

## 構成

| パッケージ | 責務 | 公開名 |
| --- | --- | --- |
| [packages/lint](packages/lint) | 日本語の技術文書の文体の規則（語彙・和欧間・句読点・括弧）と検査の CLI。対象 = コメント・README | `@niqostudio/lint` |

## 利用側

| 項目 | 内容 |
| --- | --- |
| 依存 | `"@niqostudio/lint": "^0.1.0"`（devDependencies） |
| 実行 | `niqostudio-lint [パス...] [--summary] [--fix]`。例: `"lint:comments": "niqostudio-lint"` |
| 設定 | 既定値で不要。変更する場合だけリポのルートに `lint.json`（下記） |
| 更新 | Dependabot・Renovate が更新の PR を作成 |

### 設定（`lint.json`）

| キー | 内容 | 既定 |
| --- | --- | --- |
| `paths` | 対象のディレクトリ（git の追跡対象のみ） | `apps`・`packages`・`scripts` |
| `docs` | 同じ規則で検査する Markdown | `README.md`・`CLAUDE.md` |
| `extensions` | 行頭のコメントを検査する拡張子 | `ts`・`tsx`・`astro`・`tf` |
| `skip` | 対象外のパス（正規表現） | `.tmp/`・`worker-configuration.d.ts` |
| `trailingFiles` | 説明を行末コメントで書くファイル（正規表現）。開始位置を統一 | `schema.ts` |
| `vocabulary` | リポ固有の語彙 `{ re, flags?, to }`（共通の語彙に追加） | なし |

## 運用

| コマンド | 内容 |
| --- | --- |
| `pnpm check` | 型・テスト・コメントの検査 |
| `pnpm build` | 各パッケージの `dist` を生成 |
| タグ `<パッケージ名>@<版>` を push | GitHub Actions が check → 版の一致の確認 → npm に公開（trusted publishing・provenance） |

### 公開の手順

1. `packages/<名前>/package.json` の `version` を上げてコミット
2. `git tag lint@0.1.0 && git push --tags`

### 規則を変更しながら利用側で試す

- 利用側の `package.json` を一時的に `"link:<このリポのパス>/packages/lint"` に変更し、`pnpm build` 後に確認
