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

1. Update `CHANGELOG.md` and bump `version` in `package.json`.
2. `git tag vX.Y.Z && git push --tags` - the Release workflow publishes to npm with provenance.
