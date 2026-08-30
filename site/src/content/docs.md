# Docs

A drawer for **Solid 2**. [Vaul](https://vaul.emilkowal.ski)'s API and feel — snap points, flings, a handle you can tap, the page scaling back behind a modal sheet, nested drawers — with the good parts of [corvu](https://corvu.dev/docs/primitives/drawer/) folded in: break points between snap points, a transition state you can read, an `openPercentage`, and size changes that animate instead of jump.

Unstyled. The drawer moves itself with inline `transform`/`transition`; where it sits, and what it looks like, is yours.

```bash
pnpm add @sinhong2011/solid-drawer
# or: npm i @sinhong2011/solid-drawer
```

```tsx
import { Drawer } from "@sinhong2011/solid-drawer";
import "@sinhong2011/solid-drawer/style.css"; // optional: the handle's look

function Sheet() {
  return (
    <Drawer.Root>
      <Drawer.Trigger>Open</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay class="fixed inset-0 bg-black/50" />
        <Drawer.Content class="fixed inset-x-0 bottom-0 rounded-t-2xl bg-white">
          <Drawer.Handle />
          <Drawer.Title>Title</Drawer.Title>
          <Drawer.Description>What this is.</Drawer.Description>
          <div style={{ "overflow-y": "auto", "touch-action": "pan-y" }}>…</div>
          <Drawer.Close>Close</Drawer.Close>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

## Snap points

```tsx
<Drawer.Root snapPoints={[0.3, "480px", 0.9]} fadeFromIndex={2}>
  <Drawer.Content class="fixed inset-x-0 bottom-0 h-[90%]">…</Drawer.Content>
</Drawer.Root>
```

A number is a fraction of the **container** — the `container` element if you gave one, else the content's positioned ancestor (a drawer that lives inside a map panel measures against the panel), else the window. A string is pixels. Both mean _how much of the drawer shows_: the content keeps its own height and is translated so that much of it is on screen, so give it a height at least as tall as the largest snap point.

Control it by value, as in Vaul:

```tsx
const [point, setPoint] = createSignal<SnapPoint | null>(0.3);
<Drawer.Root snapPoints={[0.3, 0.9]} activeSnapPoint={point()} setActiveSnapPoint={setPoint} />;
```

`breakPoints` (from corvu) moves the line between two snap points that decides where a dropped drawer goes — one entry per gap, `null` for the midpoint. `snapToSequentialPoint` makes a fling move one point at a time.

## Root props

| Prop                                                                                                                                                                 | Default                                 |                                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`, `defaultOpen`, `onOpenChange`                                                                                                                                |                                         | Controlled or uncontrolled open state.                                                                                                          |
| `modal`                                                                                                                                                              | `true`                                  | Scrim, focus held inside, Escape, page pinned, pointer-outside closes. `false` leaves the page live underneath.                                 |
| `direction`                                                                                                                                                          | `"bottom"`                              | `"top" \| "bottom" \| "left" \| "right"`.                                                                                                       |
| `container`                                                                                                                                                          |                                         | Element the `Portal` mounts into and fractions are measured against.                                                                            |
| `dismissible`                                                                                                                                                        | `true`                                  | Whether a gesture, Escape or a pointer outside may close it. `Drawer.Close` always can.                                                         |
| `handleOnly`                                                                                                                                                         | `false`                                 | Only the `Handle` starts a drag.                                                                                                                |
| `snapPoints`, `activeSnapPoint`, `setActiveSnapPoint` / `onActiveSnapPointChange`, `defaultActiveSnapPoint`, `fadeFromIndex`, `snapToSequentialPoint`, `breakPoints` |                                         | See above.                                                                                                                                      |
| `closeThreshold`                                                                                                                                                     | `0.25`                                  | Fraction of the drawer it must be dragged shut by to close (no snap points).                                                                    |
| `velocityThreshold`                                                                                                                                                  | `0.4` px/ms                             | Faster than this, the direction of the throw wins.                                                                                              |
| `scrollLockTimeout`                                                                                                                                                  | `100` ms                                | After content scrolls, how long a drag is refused.                                                                                              |
| `dampFunction`                                                                                                                                                       | `6·ln(d+1)`                             | Resistance past the furthest rest position.                                                                                                     |
| `shouldScaleBackground`                                                                                                                                              | `false`                                 | Draw the element marked `data-drawer-wrapper` back behind a modal drawer. `setBackgroundColorOnScale` (`true`) paints the body black behind it. |
| `repositionInputs`                                                                                                                                                   | `true`                                  | Lift a bottom drawer above the on-screen keyboard.                                                                                              |
| `disablePreventScroll`, `noBodyStyles`                                                                                                                               | `false`                                 | Leave `document.body` alone.                                                                                                                    |
| `autoFocus`                                                                                                                                                          | `false`                                 | Focus the first focusable element inside on open; otherwise the drawer itself. `restoreFocus` (`true`) gives focus back after.                  |
| `transitionResize`                                                                                                                                                   | `false`                                 | Animate the drawer's size when its content changes size.                                                                                        |
| `transitionDuration`, `transitionEasing`                                                                                                                             | `500`, `cubic-bezier(0.32, 0.72, 0, 1)` | The settle.                                                                                                                                     |
| `onDrag(event, percentageDragged)`, `onRelease(event, open)`, `onAnimationEnd(open)`, `onEscapeKeyDown(event)`, `onPointerDownOutside(event)`                        |                                         | Callbacks; the last two can `preventDefault()`.                                                                                                 |

## Parts

- **`Root`** / **`NestedRoot`** — state. A `NestedRoot` inside another drawer's tree scales that drawer back as it opens and follows its drag.
- **`Portal`** — into `container` or the body. Skip it for a drawer that stays inside its panel.
- **`Overlay`** — opacity follows the drawer (solid from `fadeFromIndex`, fading below it). Position it yourself.
- **`Content`** — `role="dialog"`, labelled by `Title`/`Description`, `touch-action: none`. Position it yourself. Sets `data-state`, `data-drawer-direction`, `data-dragging`, `data-transitioning`, `data-transition-state`, and `--snap-point-height` / `--drawer-translate`.
- **`Handle`** — a 44px tap target; a tap goes to the next snap point (or closes from the last), `preventCycle` turns that off.
- **`Trigger`**, **`Close`**, **`Title`**, **`Description`** — take `as` to render as something else.

Anything inside the content that scrolls should carry `touch-action: pan-y` (or `pan-x` for a side drawer); mark things that must never start a drag with `data-drawer-no-drag`.

## Headless

```tsx
import { createDrawer, useDrawer } from "@sinhong2011/solid-drawer";

const drawer = useDrawer(); // inside any part
drawer.openPercentage();
drawer.isDragging();
drawer.transitionState();
drawer.translate();
```

`createDrawer(props)` is the whole thing without elements, for building your own parts on.

## Differences from Vaul

- Snap point fractions are of the container (as Vaul) but the offset is computed from the drawer's own height, so `"320px"` shows exactly 320px whatever height the content has.
- The gesture is heard on `window` from `pointerdown`, so a quick flick from the handle cannot escape the drawer before it counts.
- `breakPoints`, `transitionResize`, `transitionState`, `openPercentage`, `translate`, `velocityThreshold`, `dampFunction`, `transitionDuration`/`transitionEasing` are additions.
- Not ported: the 500ms "just opened" drag lock, `repositionInputs`' Firefox-on-Android special case, `noBodyStyles` splitting from `setBackgroundColorOnScale`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Issues and pull requests are welcome.

## License

MIT.
