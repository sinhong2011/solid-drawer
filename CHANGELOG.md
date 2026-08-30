# Changelog

## [0.1.1](https://github.com/sinhong2011/solid-drawer/compare/v0.1.0...v0.1.1) (2026-08-30)


### Documentation

* bring the README up to the API ([2af5e1c](https://github.com/sinhong2011/solid-drawer/commit/2af5e1ca3fcf527f7c62272d05f4993b2205291b))
* bring the README up to the API ([5d25963](https://github.com/sinhong2011/solid-drawer/commit/5d25963e481c9b417fd5b06eb78ba6a46512d431))


### Miscellaneous

* release 0.1.1 ([1c204f0](https://github.com/sinhong2011/solid-drawer/commit/1c204f055f9016f78e6fbc583277f8ee6e328a88))

## 0.1.0

First release.

- `Drawer.Root` / `NestedRoot`, `Portal`, `Overlay`, `Content`, `Handle`, `Trigger`, `Close`, `Title`, `Description`.
- Snap points as container fractions or pixel strings, `breakPoints`, `fadeFromIndex`, `snapToSequentialPoint`.
- Flings, damping past the last rest position, scroll arbitration with a `scrollLockTimeout`.
- Modal drawers pin the page, hold focus, close on Escape and pointer-outside; `shouldScaleBackground` draws the `data-drawer-wrapper` element back.
- `transitionResize`, `transitionState`, `openPercentage`, `translate` for building on.
- `createDrawer` / `useDrawer` headless API.
