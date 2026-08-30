# Contributing

Thanks for looking. The package uses [pnpm](https://pnpm.io) 12 and [Vite+](https://vite.dev) (`vp`).

```bash
pnpm install
pnpm test:watch   # jsdom tests in test/
pnpm check        # lint + format (`pnpm vp check --fix` to apply)
pnpm typecheck
pnpm build        # dist/ via `vp pack`
pnpm site:dev     # the demo and docs site, in site/
```

- Keep the drawer unstyled: it moves itself with inline transforms; how it looks stays the consumer's business.
- Every behaviour change should come with a test in `test/`. jsdom has no layout, so the tests hand the drawer its sizes and build pointer events by hand - `test/drawer.test.tsx` shows how.
- Match Vaul's names and defaults where a feature is Vaul's; note anything that deliberately differs in the README's last section.
- The site's docs page is the README, so a change to the API is a change to `README.md`.

## Releasing

Releases are automated with [release-please](https://github.com/googleapis/release-please). Write commit messages (or squash-merge titles) as [conventional commits](https://www.conventionalcommits.org):

- `fix: ...` - patch release
- `feat: ...` - minor release
- `feat!: ...` or a `BREAKING CHANGE:` footer - minor release while the version is below 1.0
- `docs:`, `chore:`, `ci:`, `refactor:`, `test:` - no release, not in the changelog

On every push to `main`, release-please keeps a `chore(main): release X.Y.Z` pull request open with the version bump and the `CHANGELOG.md` entry. Merging it tags the release and publishes to npm with provenance; nothing needs bumping by hand.
