import { For, Show, createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";
import { Drawer, useDrawer, type SnapPoint } from "@sinhong2011/solid-drawer";

/* The parts every demo's drawer shares: a scrim, a sheet with a handle,
   a title and a line under it. Positioning and looks come from global.css. */
function Sheet(props: {
  title: string;
  description: string;
  class?: string;
  children?: JSX.Element;
}) {
  return (
    <Drawer.Portal>
      <Drawer.Overlay class="scrim" />
      <Drawer.Content class={`sheet ${props.class ?? ""}`}>
        <Drawer.Handle />
        <Drawer.Title class="sheet-title">{props.title}</Drawer.Title>
        <Drawer.Description class="sheet-desc">{props.description}</Drawer.Description>
        {props.children}
      </Drawer.Content>
    </Drawer.Portal>
  );
}

function CloseRow() {
  return (
    <div class="sheet-actions">
      <Drawer.Close class="btn btn-secondary">Close</Drawer.Close>
    </div>
  );
}

function Basic() {
  return (
    <Drawer.Root>
      <Drawer.Trigger class="btn">Open</Drawer.Trigger>
      <Sheet title="A drawer" description="Drag it down to close, or fling it. Escape works too.">
        <p class="sheet-body">
          Nothing here is styled by the library except the handle. The sheet is a{" "}
          <code>position: fixed</code> box; the drawer only moves it.
        </p>
        <CloseRow />
      </Sheet>
    </Drawer.Root>
  );
}

/* Reads the drawer from inside it, which is what `useDrawer` is for. */
function SnapReadout() {
  const drawer = useDrawer();
  return (
    <p class="readout">
      snap point: {String(drawer.activeSnapPoint())} · open:{" "}
      {Math.round(drawer.openPercentage() * 100)}%{drawer.isDragging() ? " · dragging" : ""}
      {drawer.transitionState() ? ` · ${drawer.transitionState()}` : ""}
    </p>
  );
}

function SnapPoints() {
  return (
    <Drawer.Root snapPoints={["220px", 0.6, 0.92]} fadeFromIndex={2}>
      <Drawer.Trigger class="btn">Open</Drawer.Trigger>
      <Sheet
        class="sheet--tall"
        title="Snap points"
        description="220px, 60% and 92% of the window. Tap the handle to step through them."
      >
        <SnapReadout />
        <p class="sheet-body">
          A number is a fraction of the container, a string is pixels; both say how much of the
          drawer shows. The scrim only fades in below the last one, because of{" "}
          <code>fadeFromIndex</code>.
        </p>
        <CloseRow />
      </Sheet>
    </Drawer.Root>
  );
}

function Scrollable() {
  const rows = Array.from({ length: 40 }, (_, i) => i + 1);
  return (
    <Drawer.Root>
      <Drawer.Trigger class="btn">Open</Drawer.Trigger>
      <Sheet
        class="sheet--tall"
        title="Scrolling content"
        description="The list scrolls; a drag only starts once it is at the top."
      >
        <div class="sheet-scroll">
          <For each={rows}>
            {(n) => (
              <div class="sheet-row">
                <span>{n}</span>
                Row {n} of {rows.length}
              </div>
            )}
          </For>
        </div>
      </Sheet>
    </Drawer.Root>
  );
}

function Nested() {
  return (
    <Drawer.Root>
      <Drawer.Trigger class="btn">Open</Drawer.Trigger>
      <Sheet
        title="Nested drawers"
        description="A drawer inside a drawer; the one behind steps back."
      >
        <p class="sheet-body">
          A <code>NestedRoot</code> inside another drawer's tree scales that drawer back as it opens
          and follows its drag.
        </p>
        <div class="sheet-actions">
          <Drawer.NestedRoot>
            <Drawer.Trigger class="btn">Open another</Drawer.Trigger>
            <Sheet
              title="Second drawer"
              description="Close this one and the first comes forward again."
            >
              <CloseRow />
            </Sheet>
          </Drawer.NestedRoot>
          <Drawer.Close class="btn btn-secondary">Close</Drawer.Close>
        </div>
      </Sheet>
    </Drawer.Root>
  );
}

function Side() {
  return (
    <Drawer.Root direction="right">
      <Drawer.Trigger class="btn">Open</Drawer.Trigger>
      <Sheet
        class="sheet--side"
        title="From the side"
        description='direction="right". Swipe it away.'
      >
        <p class="sheet-body">
          Any of the four edges. A side drawer's content that scrolls should carry{" "}
          <code>touch-action: pan-x</code> instead of <code>pan-y</code>.
        </p>
        <CloseRow />
      </Sheet>
    </Drawer.Root>
  );
}

function NonModal() {
  return (
    <Drawer.Root modal={false}>
      <Drawer.Trigger class="btn">Open</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Content class="sheet">
          <Drawer.Handle />
          <Drawer.Title class="sheet-title">Non-modal</Drawer.Title>
          <Drawer.Description class="sheet-desc">
            No scrim, no focus trap: the page underneath stays live. Scroll it.
          </Drawer.Description>
          <CloseRow />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function Scaled() {
  return (
    <Drawer.Root shouldScaleBackground>
      <Drawer.Trigger class="btn">Open</Drawer.Trigger>
      <Sheet
        title="Scaled background"
        description="The page - the element marked data-drawer-wrapper - draws back behind the sheet."
      >
        <p class="sheet-body">
          As iOS does with its own sheets. <code>setBackgroundColorOnScale</code> paints the body
          black behind it so the corners have something to round against.
        </p>
        <CloseRow />
      </Sheet>
    </Drawer.Root>
  );
}

function Controlled() {
  const [open, setOpen] = createSignal(false);
  const [point, setPoint] = createSignal<SnapPoint | null>(0.4);
  return (
    <>
      <div class="card-actions">
        <button type="button" class="btn" onClick={() => setOpen(true)}>
          Open at 40%
        </button>
        <button
          type="button"
          class="btn btn-secondary"
          onClick={() => {
            setPoint(0.9);
            setOpen(true);
          }}
        >
          Open at 90%
        </button>
      </div>
      <p class="readout">
        open: {String(open())} · point: {String(point())}
      </p>
      <Drawer.Root
        open={open()}
        onOpenChange={setOpen}
        snapPoints={[0.4, 0.9]}
        activeSnapPoint={point()}
        setActiveSnapPoint={setPoint}
      >
        <Sheet
          class="sheet--tall"
          title="Controlled"
          description="Open state and snap point both live outside the drawer."
        >
          <SnapReadout />
          <div class="sheet-actions">
            <button
              type="button"
              class="btn btn-secondary"
              onClick={() => setPoint(point() === 0.9 ? 0.4 : 0.9)}
            >
              Toggle snap point
            </button>
            <Drawer.Close class="btn btn-secondary">Close</Drawer.Close>
          </div>
        </Sheet>
      </Drawer.Root>
    </>
  );
}

const DEMOS: { name: string; blurb: string; demo: () => JSX.Element; actions?: boolean }[] = [
  { name: "Basic", blurb: "A modal sheet. Drag, fling, Escape, tap outside.", demo: Basic },
  {
    name: "Snap points",
    blurb: "Pixel and fraction rest positions, and a scrim that fades in late.",
    demo: SnapPoints,
  },
  {
    name: "Scrolling content",
    blurb: "A list inside the drawer scrolls; the drawer only drags from the top of it.",
    demo: Scrollable,
  },
  {
    name: "Nested",
    blurb: "A drawer opened from a drawer, the first stepping back behind it.",
    demo: Nested,
  },
  {
    name: "Side",
    blurb: "From the right edge; the same gesture, turned ninety degrees.",
    demo: Side,
  },
  {
    name: "Non-modal",
    blurb: "No scrim and no focus trap; the page stays usable underneath.",
    demo: NonModal,
  },
  {
    name: "Scaled background",
    blurb: "The page draws back behind a modal drawer, the way a phone does it.",
    demo: Scaled,
  },
  {
    name: "Controlled",
    blurb: "Open state and the active snap point held in your own signals.",
    demo: Controlled,
    actions: true,
  },
];

export function DemoGallery() {
  return (
    <div class="grid">
      <For each={DEMOS}>
        {(entry) => (
          <div class="card">
            <h3>{entry.name}</h3>
            <p>{entry.blurb}</p>
            <Show when={!entry.actions} fallback={entry.demo()}>
              <div class="card-actions">{entry.demo()}</div>
            </Show>
          </div>
        )}
      </For>
    </div>
  );
}
