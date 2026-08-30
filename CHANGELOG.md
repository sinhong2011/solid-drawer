# Changelog

## [0.1.1](https://github.com/sinhong2011/solid-drawer/compare/v0.1.0...v0.1.1) (2026-08-30)


### Bug Fixes

* **site:** serve from /solid-drawer, the project's GitHub Pages path ([8bbb07c](https://github.com/sinhong2011/solid-drawer/commit/8bbb07cab422f51f17f5bcf1b7e7c4fbdb5cdde2))

## 0.1.0

First release.

- `Drawer.Root` / `NestedRoot`, `Portal`, `Overlay`, `Content`, `Handle`, `Trigger`, `Close`, `Title`, `Description`.
- Snap points as container fractions or pixel strings, `breakPoints`, `fadeFromIndex`, `snapToSequentialPoint`.
- Flings, damping past the last rest position, scroll arbitration with a `scrollLockTimeout`.
- Modal drawers pin the page, hold focus, close on Escape and pointer-outside; `shouldScaleBackground` draws the `data-drawer-wrapper` element back.
- `transitionResize`, `transitionState`, `openPercentage`, `translate` for building on.
- `createDrawer` / `useDrawer` headless API.
