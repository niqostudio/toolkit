# toolkit

Shared packages for NIQO STUDIO repositories, published to npm under `@niqostudio`.

## Packages

| Package | Description |
| --- | --- |
| [`@niqostudio/prose-lint`](packages/prose-lint) | Style checker for Japanese technical writing (comments, Markdown, commit messages) |

## Development

```sh
pnpm install   # also enables the commit-msg hook
pnpm check     # type check, tests, and prose-lint on this repository
pnpm build     # build dist/ for each package
```

## Publishing

Publishing runs on GitHub Actions when a tag `<package>@<version>` is pushed. It uses npm trusted publishing with provenance, so no npm token is stored.

1. Bump `version` in `packages/<package>/package.json` and commit.
2. Tag and push:

   ```sh
   git tag <package>@<version>
   git push origin <package>@<version>
   ```

The workflow runs `pnpm check`, verifies that the tag matches `version`, and publishes the package.

## License

MIT
