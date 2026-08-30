# Changelog

## 0.1.0

First release.

- `Drawer.Root` / `NestedRoot`, `Portal`, `Overlay`, `Content`, `Handle`, `Trigger`, `Close`, `Title`, `Description`.
- Snap points as container fractions or pixel strings, `breakPoints`, `fadeFromIndex`, `snapToSequentialPoint`.
- Flings, damping past the last rest position, scroll arbitration with a `scrollLockTimeout`.
- Modal drawers pin the page, hold focus, close on Escape and pointer-outside; `shouldScaleBackground` draws the `data-drawer-wrapper` element back.
- `transitionResize`, `transitionState`, `openPercentage`, `translate` for building on.
- `createDrawer` / `useDrawer` headless API.
