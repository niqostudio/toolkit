# @niqostudio/prose-lint

A style checker for Japanese technical writing in a repository: code comments, Markdown files, and commit messages.

It reports issues such as:

- Native Japanese words where technical terms are preferred (e.g. `作る` → `作成`)
- Missing or extra spaces between Japanese and alphanumeric words
- Full-width punctuation and parentheses, nested parentheses, sentence-final periods
- Lines that pack in too many sentences

## Install

```sh
pnpm add -D @niqostudio/prose-lint
```

Requires Node.js 24 or later.

## Usage

```sh
prose-lint                 # check comments and all tracked Markdown files
prose-lint src README.md   # check specific paths
prose-lint --summary       # print counts per issue only
prose-lint --fix           # fix spacing and trailing-comment alignment in code comments
```

Exits with code 1 when any issue is found.

Add a script to `package.json`:

```json
{
  "scripts": {
    "lint:prose": "prose-lint"
  }
}
```

## Commit messages

To check commit messages on every commit:

1. Add `.githooks/commit-msg` and make it executable:

   ```sh
   #!/bin/sh
   exec npx --no -- prose-lint --commit-msg "$1"
   ```

2. Enable the hooks directory on install, in `package.json`:

   ```json
   {
     "scripts": {
       "prepare": "git config core.hooksPath .githooks"
     }
   }
   ```

3. Keep LF line endings for hooks on Windows, in `.gitattributes`:

   ```text
   .githooks/* text eol=lf
   ```

The subject (after `type(scope): `) and the body are checked. Lines starting with `#` are ignored.

## Configuration

No configuration is needed. To change the defaults, add `prose-lint.json` to the repository root. Paths are relative to the root, so the result is the same from any subdirectory.

```json
{
  "paths": ["apps", "packages"],
  "extensions": ["ts", "astro"],
  "vocabulary": [{ "re": "同期ブロック", "to": "`synced_block`" }]
}
```

| Key | Description | Default |
| --- | --- | --- |
| `paths` | Paths whose code comments are checked (git pathspec, tracked files only) | `.` (whole repository) |
| `docs` | Markdown files to check (git pathspec) | `*.md` |
| `extensions` | File extensions whose line comments are checked (`tf` uses `#`, others `//`) | `ts`, `tsx`, `mts`, `cts`, `js`, `jsx`, `mjs`, `cjs` |
| `skip` | Paths to skip (regular expression) | none |
| `trailingFiles` | Files whose fields use aligned trailing comments (regular expression) | none |
| `vocabulary` | Extra word rules `{ re, flags?, to }`, added to the built-in ones | none |

## License

MIT
