# toolkit

複数のリポで共有するパッケージ。npm に public で公開し、各リポは版を指定して依存

## 構成

| パッケージ | 責務 | 公開名 |
| --- | --- | --- |
| [packages/prose-lint](packages/prose-lint) | リポの中の日本語の文章の文体の規則（語彙・和欧間・句読点・括弧）と検査の CLI。対象 = コード中のコメント・git で追跡する Markdown | `@niqostudio/prose-lint` |

## 利用側

| 項目 | 内容 |
| --- | --- |
| 依存 | `"@niqostudio/prose-lint": "^0.1.0"`（devDependencies） |
| 実行 | `prose-lint [パス...] [--summary] [--fix]`。例: `"lint:prose": "prose-lint"` |
| 設定 | 既定値で不要。変更する場合だけリポのルートに `prose-lint.json`（下記） |
| 更新 | Dependabot・Renovate が更新の PR を作成 |

### 設定（`prose-lint.json`）

| キー | 内容 | 既定 |
| --- | --- | --- |
| `paths` | 対象のディレクトリ（git の追跡対象のみ） | `apps`・`packages`・`scripts` |
| `docs` | 検査する Markdown（git の pathspec） | `*.md`（git で追跡するすべての Markdown） |
| `extensions` | 行頭のコメントを検査する拡張子 | `ts`・`tsx`・`astro`・`tf` |
| `skip` | 対象外のパス（正規表現。コード・Markdown 共通） | `.tmp/`・`worker-configuration.d.ts` |
| `trailingFiles` | 説明を行末コメントで書くファイル（正規表現）。開始位置を統一 | `schema.ts` |
| `vocabulary` | リポ固有の語彙 `{ re, flags?, to }`（共通の語彙に追加） | なし |

## 運用

| コマンド | 内容 |
| --- | --- |
| `pnpm check` | 型・テスト・文章の検査 |
| `pnpm build` | 各パッケージの `dist` を生成 |
| タグ `<パッケージ名>@<版>` を push | GitHub Actions が check → 版の一致の確認 → npm に公開（trusted publishing・provenance） |

### 公開の手順

1. `packages/<名前>/package.json` の `version` を上げてコミット
2. `git tag prose-lint@0.1.0 && git push --tags`

### 規則を変更しながら利用側で試す

- 利用側の `package.json` を一時的に `"link:<このリポのパス>/packages/prose-lint"` に変更し、`pnpm build` 後に確認
