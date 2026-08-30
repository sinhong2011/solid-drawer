# Contributing

Thanks for looking. The package uses [Bun](https://bun.sh) and [Vite+](https://vite.dev) (`vp`).

```bash
bun install
bun run test:watch   # jsdom tests in test/
bun run check        # lint + format (`vp check --fix` to apply)
bun run typecheck
bun run build        # dist/ via `vp pack`
```

- Keep the drawer unstyled: it moves itself with inline transforms; how it looks stays the consumer's business.
- Every behaviour change should come with a test in `test/`. jsdom has no layout, so the tests hand the drawer its sizes and build pointer events by hand - `test/drawer.test.tsx` shows how.
- Match Vaul's names and defaults where a feature is Vaul's; note anything that deliberately differs in the README's last section.

## Releasing

1. Update `CHANGELOG.md` and bump `version` in `package.json`.
2. `git tag vX.Y.Z && git push --tags` - the Release workflow publishes to npm with provenance.
