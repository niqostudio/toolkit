# toolkit

複数のリポで共有するパッケージ。npm に public で公開し、各リポはバージョンを指定して依存

## Structure

| パッケージ | 責務 | 公開名 |
| --- | --- | --- |
| [packages/prose-lint](packages/prose-lint) | リポの中の日本語の文章の文体の規則（語彙・和欧間・句読点・括弧）と検査の CLI。対象 = コード中のコメント・git で追跡する Markdown | `@niqostudio/prose-lint` |

## Usage

| 項目 | 内容 |
| --- | --- |
| 依存 | `"@niqostudio/prose-lint": "^0.1.0"`（devDependencies） |
| 実行 | `prose-lint [paths...] [--summary] [--fix]`。例: `"lint:prose": "prose-lint"` |
| コミットメッセージ | commit-msg フックで `prose-lint --commit-msg "$1"`（下記） |
| 設定 | 既定値で不要。変更する場合だけリポのルートに `prose-lint.json`（下記） |
| 更新 | Dependabot・Renovate が更新の PR を作成 |

### Commit messages

- `.githooks/commit-msg`: `#!/bin/sh` の後に `exec npx --no -- prose-lint --commit-msg "$1"`
- `package.json` の `scripts`: `"prepare": "git config core.hooksPath .githooks"`（`pnpm install` 時にフックを有効化）
- 対象: 件名（`type(scope): ` を除く）と本文。`#` の行は対象外

### Configuration (`prose-lint.json`)

| キー | 内容 | 既定 |
| --- | --- | --- |
| `paths` | 対象のディレクトリ（git の追跡対象のみ） | `apps`・`packages`・`scripts` |
| `docs` | 検査する Markdown（git の pathspec） | `*.md`（git で追跡するすべての Markdown） |
| `extensions` | 行頭のコメントを検査する拡張子 | `ts`・`tsx`・`astro`・`tf` |
| `skip` | 対象外のパス（正規表現。コード・Markdown 共通） | `.tmp/`・`worker-configuration.d.ts` |
| `trailingFiles` | 説明を行末コメントで書くファイル（正規表現）。開始位置を統一 | `schema.ts` |
| `vocabulary` | リポ固有の語彙 `{ re, flags?, to }`（共通の語彙に追加） | なし |

## Operations

| コマンド | 内容 |
| --- | --- |
| `pnpm check` | 型・テスト・文章の検査 |
| `pnpm build` | 各パッケージの `dist` を生成 |
| `git tag <package>@<version> && git push origin <package>@<version>` | GitHub Actions が check → バージョンの一致の確認 → npm に公開（trusted publishing・provenance） |

### Publishing

1. `packages/<name>/package.json` の `version` を上げてコミット
2. `git tag prose-lint@0.3.0 && git push origin prose-lint@0.3.0`

### Testing changes in a consuming repo

- 利用側の `package.json` を一時的に `"link:<path-to-toolkit>/packages/prose-lint"` に変更し、`pnpm build` 後に確認
