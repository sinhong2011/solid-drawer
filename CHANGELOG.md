# Changelog

## [0.1.3](https://github.com/sinhong2011/solid-drawer/compare/v0.1.2...v0.1.3) (2026-08-30)


### Bug Fixes

* give back a consumer's inline max-height and bottom after repositioning for the keyboard ([89bb9aa](https://github.com/sinhong2011/solid-drawer/commit/89bb9aa0a4f3413b44d4acc18fd322090f8bf3e7)), closes [#9](https://github.com/sinhong2011/solid-drawer/issues/9)

## [0.1.2](https://github.com/sinhong2011/solid-drawer/compare/v0.1.1...v0.1.2) (2026-08-30)


### Bug Fixes

* keep a resize from swallowing the close transition ([d472d46](https://github.com/sinhong2011/solid-drawer/commit/d472d4604dd57d5bfddcaa1460c41acd6fbf37ec))

## [0.1.1](https://github.com/sinhong2011/solid-drawer/compare/v0.1.0...v0.1.1) (2026-08-30)


### Documentation

* a new demo and docs site: Tailwind, a copy-paste shadcn/ui-style `drawer.tsx`, and live examples for snap points, forms, handle-only dragging, non-dismissible and always-visible sheets, nested drawers, all four edges, dynamic height, and a drawer inside a panel ([cb2f49f](https://github.com/sinhong2011/solid-drawer/commit/cb2f49fa23dd6065ca155154e95f72c9ffa015f7))
* bring the README up to the API ([5d25963](https://github.com/sinhong2011/solid-drawer/commit/5d25963e481c9b417fd5b06eb78ba6a46512d431))

### Bug Fixes

* pin the page once, however many drawers are open over it: a nested drawer no longer sends the page to the top ([cb2f49f](https://github.com/sinhong2011/solid-drawer/commit/cb2f49fa23dd6065ca155154e95f72c9ffa015f7))
* put the page back where it was instantly on close, whatever `scroll-behavior` the page sets ([cb2f49f](https://github.com/sinhong2011/solid-drawer/commit/cb2f49fa23dd6065ca155154e95f72c9ffa015f7))
* read props inside effect callbacks untracked, so Solid 2 no longer warns `STRICT_READ_UNTRACKED` on every open ([cb2f49f](https://github.com/sinhong2011/solid-drawer/commit/cb2f49fa23dd6065ca155154e95f72c9ffa015f7))

## 0.1.0

First release.

- `Drawer.Root` / `NestedRoot`, `Portal`, `Overlay`, `Content`, `Handle`, `Trigger`, `Close`, `Title`, `Description`.
- Snap points as container fractions or pixel strings, `breakPoints`, `fadeFromIndex`, `snapToSequentialPoint`.
- Flings, damping past the last rest position, scroll arbitration with a `scrollLockTimeout`.
- Modal drawers pin the page, hold focus, close on Escape and pointer-outside; `shouldScaleBackground` draws the `data-drawer-wrapper` element back.
- `transitionResize`, `transitionState`, `openPercentage`, `translate` for building on.
- `createDrawer` / `useDrawer` headless API.
