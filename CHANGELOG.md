# Changelog

## [0.1.2](https://github.com/sinhong2011/solid-drawer/compare/v0.1.1...v0.1.2) (2026-08-30)


### Bug Fixes

* keep a resize from swallowing the close transition ([646a1c6](https://github.com/sinhong2011/solid-drawer/commit/646a1c69522e29165463c3e28791477d9b35dc12))
* keep a resize from swallowing the close transition ([d472d46](https://github.com/sinhong2011/solid-drawer/commit/d472d4604dd57d5bfddcaa1460c41acd6fbf37ec))

## [0.1.1](https://github.com/sinhong2011/solid-drawer/compare/v0.1.0...v0.1.1) (2026-08-30)


### Documentation

* bring the README up to the API ([5d25963](https://github.com/sinhong2011/solid-drawer/commit/5d25963e481c9b417fd5b06eb78ba6a46512d431))

## 0.1.0

First release.

- `Drawer.Root` / `NestedRoot`, `Portal`, `Overlay`, `Content`, `Handle`, `Trigger`, `Close`, `Title`, `Description`.
- Snap points as container fractions or pixel strings, `breakPoints`, `fadeFromIndex`, `snapToSequentialPoint`.
- Flings, damping past the last rest position, scroll arbitration with a `scrollLockTimeout`.
- Modal drawers pin the page, hold focus, close on Escape and pointer-outside; `shouldScaleBackground` draws the `data-drawer-wrapper` element back.
- `transitionResize`, `transitionState`, `openPercentage`, `translate` for building on.
- `createDrawer` / `useDrawer` headless API.
