# Changelog

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
