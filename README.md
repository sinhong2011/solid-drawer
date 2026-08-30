# @sinhong2011/solid-drawer

[![npm](https://img.shields.io/npm/v/@sinhong2011/solid-drawer)](https://www.npmjs.com/package/@sinhong2011/solid-drawer) [![CI](https://github.com/sinhong2011/solid-drawer/actions/workflows/ci.yml/badge.svg)](https://github.com/sinhong2011/solid-drawer/actions/workflows/ci.yml)

A drawer for **Solid 2**. Snap points, flings, a handle you can tap, the page scaling back behind a modal sheet, nested drawers, break points between snap points, a transition state you can read, an `openPercentage`, and size changes that animate instead of jump.

Unstyled. The drawer moves itself with inline `transform`/`transition`; where it sits, and what it looks like, is yours.

**[Demos and docs](https://sinhong2011.github.io/solid-drawer/)** — a copy-paste [`drawer.tsx`](https://sinhong2011.github.io/solid-drawer/docs#installation) for Tailwind projects, and live examples of [snap points](https://sinhong2011.github.io/solid-drawer/docs#snap-points), [scrolling content](https://sinhong2011.github.io/solid-drawer/docs#scrolling-content), [forms](https://sinhong2011.github.io/solid-drawer/docs#form), [handle-only dragging](https://sinhong2011.github.io/solid-drawer/docs#handle-only), [non-dismissible sheets](https://sinhong2011.github.io/solid-drawer/docs#not-dismissible), [nested drawers](https://sinhong2011.github.io/solid-drawer/docs#nested-drawers), [all four edges](https://sinhong2011.github.io/solid-drawer/docs#four-edges), [non-modal](https://sinhong2011.github.io/solid-drawer/docs#non-modal), [the scaled background](https://sinhong2011.github.io/solid-drawer/docs#scaled-background), [resize transitions](https://sinhong2011.github.io/solid-drawer/docs#resize-transition), [dynamic height](https://sinhong2011.github.io/solid-drawer/docs#dynamic-height) (the Family wallet drawer), [controlled state](https://sinhong2011.github.io/solid-drawer/docs#controlled), [an always-visible sheet with a minimum height](https://sinhong2011.github.io/solid-drawer/docs#always-visible), and [a drawer inside a panel](https://sinhong2011.github.io/solid-drawer/docs#inside-a-panel).

```bash
pnpm add @sinhong2011/solid-drawer
# or: npm i @sinhong2011/solid-drawer
```

```tsx
import { Drawer } from "@sinhong2011/solid-drawer";
import "@sinhong2011/solid-drawer/style.css"; // optional: the handle, and the bleed past the edge

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

Control it by value:

```tsx
const [point, setPoint] = createSignal<SnapPoint | null>(0.3);
<Drawer.Root snapPoints={[0.3, 0.9]} activeSnapPoint={point()} setActiveSnapPoint={setPoint} />;
```

`breakPoints` moves the line between two snap points that decides where a dropped drawer goes — one entry per gap, `null` for the midpoint. `snapToSequentialPoint` makes a fling move one point at a time.

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

- **`Root`** / **`NestedRoot`** — state; every other part reads it through context. A `NestedRoot` inside another drawer's tree scales that drawer back as it opens and follows its drag.
- **`Portal`** — into `container` or the body. Skip it for a drawer that stays inside its panel.
- **`Overlay`** — opacity follows the drawer (solid from `fadeFromIndex`, fading below it). Position it yourself; `style` merges under the opacity.
- **`Content`** — `role="dialog"`, `aria-modal` when modal, labelled by `Title`/`Description`, `touch-action: none`. Position it yourself; `style` merges under the drawer's own `transform`/`transition`, and `ref` is a callback.
- **`Handle`** — a 44px tap target whatever its size; a tap goes to the next snap point (or closes from the last), `preventCycle` turns that off. Under `handleOnly` it is the only thing that starts a drag.
- **`Trigger`** — toggles the drawer, with `aria-haspopup`, `aria-expanded` and `aria-controls`. **`Close`** closes it, even one that is not `dismissible`. Both are a `button` unless given `as`.
- **`Title`**, **`Description`** — an `h2` and a `p` unless given `as`; register themselves as the dialog's label and description. Pass `id` to use your own.

Anything inside the content that scrolls should carry `touch-action: pan-y` (or `pan-x` for a side drawer); mark things that must never start a drag with `data-drawer-no-drag`.

## Styling

Nothing is styled but the movement. Hook selectors onto the data attributes:

| Part                   | Attributes                                                                                                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Content`              | `data-drawer-content`, `data-state="open" \| "closed"`, `data-drawer-direction`, `data-drawer-snap-points` (present when there are any), `data-dragging`, `data-transitioning`, `data-transition-state` |
| `Overlay`              | `data-drawer-overlay`, `data-state`, `data-drawer-direction`                                                                                                                                            |
| `Handle`               | `data-drawer-handle`, `data-drawer-direction`; the hit area inside is `data-drawer-handle-hitarea`                                                                                                      |
| `Trigger`, `Close`     | `data-drawer-trigger` + `data-state`, `data-drawer-close`                                                                                                                                               |
| `Title`, `Description` | `data-drawer-title`, `data-drawer-description`                                                                                                                                                          |

`data-transition-state` is `"opening"`, `"closing"`, `"snapping"` or `"resizing"` while something is moving, and absent at rest.

`Content` also carries two custom properties: `--drawer-translate`, its offset from fully open in pixels, and `--snap-point-height`, how much of it the active snap point shows — so `height: var(--snap-point-height)` on a scroller inside makes the visible part the scrolling part.

`style.css` is optional and small: the handle's look (light and dark), its tap target, `will-change: transform` on the content, and a `::after` that carries the content's background on past its far edge, so pulling a drawer beyond open shows more drawer and not the page behind it. A drawer on a solid background wants that last part even if the handle is styled by hand.

## Headless

`useDrawer()` inside any part returns the drawer's whole state, the same object the parts are built on:

```tsx
import { useDrawer } from "@sinhong2011/solid-drawer";

const drawer = useDrawer();

// state
drawer.open();
drawer.setOpen(true);
drawer.close(); // close() is refused when not dismissible
drawer.mounted(); // true through the closing animation, for exit styling
drawer.activeSnapPoint();
drawer.setActiveSnapPoint("480px");
drawer.activeSnapPointIndex();
drawer.cycleSnapPoints(); // what a tap on the handle does
drawer.snapPoints();
drawer.snapPointsOffset(); // each point as the drawer's translate at rest there

// motion
drawer.isDragging();
drawer.isTransitioning();
drawer.transitionState();
drawer.translate(); // px from fully open, 0 when open
drawer.openPercentage(); // 0..1, past 1 when pulled beyond open
drawer.overlayOpacity();

// for parts of your own
drawer.contentTransform();
drawer.contentTransition();
drawer.contentSize();
drawer.contentEl();
drawer.setContentEl(el);
drawer.container();
drawer.onPress(event, fromHandle); // start of a possible drag
drawer.onTransitionEnd(event); // how a settle is known to be over
drawer.contentId;
drawer.titleId();
drawer.registerTitle(id); // and the same for the description
```

Everything is a Solid accessor, so it can be read in JSX and effects.

`createDrawer(props, parent?)` is the whole thing without elements — everything `Root` provides, as a primitive for building parts of your own. `parent` is another drawer's context for nesting; put the result in `DrawerContext` so the stock parts can find it:

```tsx
import { createDrawer, DrawerContext, Drawer } from "@sinhong2011/solid-drawer";

function MyRoot(props: DrawerRootProps) {
  const drawer = createDrawer(props);
  return <DrawerContext value={drawer}>{props.children}</DrawerContext>;
}
```

The pieces the drawer is made of are exported for the same purpose: `resolveSnapPoint`, `snapPointOffsets`, `nearestSnapIndex`, `shouldDrag`, `defaultDampFunction`, and the defaults `CLOSE_THRESHOLD`, `VELOCITY_THRESHOLD`, `TRANSITION_DURATION`, `TRANSITION_EASING`. Types: `DrawerRootProps`, `DrawerContextValue`, `DrawerDirection`, `SnapPoint`, `TransitionState`, and a props type per part (`ContentProps`, `OverlayProps`, `HandleProps`, `TriggerProps`, `CloseProps`, `TitleProps`, `DescriptionProps`).

## Coming from Vaul

The props and parts have Vaul's names, so a Vaul drawer moves over as it is. What is different:

- Snap point fractions are of the container (as Vaul) but the offset is computed from the drawer's own height, so `"320px"` shows exactly 320px whatever height the content has.
- The gesture is heard on `window` from `pointerdown`, so a quick flick from the handle cannot escape the drawer before it counts.
- `breakPoints`, `transitionResize`, `transitionState`, `openPercentage`, `translate`, `velocityThreshold`, `dampFunction`, `transitionDuration`/`transitionEasing` are additions.
- Not ported: the 500ms "just opened" drag lock, `repositionInputs`' Firefox-on-Android special case, `noBodyStyles` splitting from `setBackgroundColorOnScale`.

## Credits

The API and feel follow [Vaul](https://vaul.emilkowal.ski). Break points, the resize transition and the readable transition state came from [corvu](https://corvu.dev/docs/primitives/drawer/). The styled component in the docs is a port of [shadcn/ui](https://ui.shadcn.com/docs/components/drawer)'s Drawer.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Issues and pull requests are welcome.

## License

MIT.
