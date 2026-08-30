import { For, Show, createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  Drawer as Primitive,
  useDrawer,
  type DrawerDirection,
  type SnapPoint,
} from "@sinhong2011/solid-drawer";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerNested,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { buttonVariants } from "@/lib/button";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ hero
   A drawer inside a phone-sized frame - the frame is its `container`, so
   the snap point fractions are of the frame - with a rule beside it marking
   the snap points and a cursor at the sheet's edge, and the drawer's own
   numbers under it. Everything shown is read from `useDrawer()`. */

const HERO_SNAPS: SnapPoint[] = ["168px", 0.55, 0.92];

export function HeroDemo() {
  const [frame, setFrame] = createSignal<HTMLDivElement | null>(null);
  return (
    <div class="grid grid-cols-[auto_auto] items-start justify-center gap-x-3 gap-y-5 [grid-template-areas:'frame_ruler'_'readout_readout'] max-lg:justify-start">
      <div
        class="border-bezel bg-secondary relative h-[564px] w-[292px] touch-none overflow-hidden rounded-[42px] border-8 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.45)] [grid-area:frame] max-[26rem]:h-[calc((100vw-8.5rem)*1.93)] max-[26rem]:w-[calc(100vw-8.5rem)]"
        ref={setFrame}
      >
        <div class="from-card to-secondary absolute inset-0 bg-linear-to-b p-4" aria-hidden="true">
          <div class="text-muted-foreground mb-6 flex justify-between font-mono text-[0.7rem]">
            <span>09:41</span>
            <span>●●●</span>
          </div>
          <h4 class="mb-4 text-[1.35rem] tracking-[-0.03em]">Library</h4>
          <div class="[mask-image:linear-gradient(to_bottom,black_55%,transparent_95%)]">
            <For each={[72, 58, 80, 64, 50, 70, 60]}>
              {(width, i) => (
                <div class="mb-3 grid grid-cols-[2.25rem_1fr] items-center gap-3">
                  <i class="bg-border block h-9 rounded-lg" />
                  <div>
                    <b class="bg-border block h-2 rounded-sm" style={{ width: `${width}%` }} />
                    <b
                      class="bg-border mt-1.5 block h-2 rounded-sm opacity-60"
                      style={{ width: `${width - 25 + (i() % 3) * 5}%` }}
                    />
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
      <Show when={frame()}>
        <Primitive.Root
          container={frame()}
          modal={false}
          defaultOpen
          snapPoints={HERO_SNAPS}
          defaultActiveSnapPoint={0.55}
          fadeFromIndex={2}
        >
          <Primitive.Portal>
            <Primitive.Overlay class="absolute inset-0 bg-black/50" />
            <Primitive.Content
              class="bg-card text-card-foreground absolute inset-x-0 bottom-0 flex h-[92%] flex-col rounded-t-[22px] px-4 pb-4 shadow-[0_-12px_48px_rgb(15_18_23/0.2)] outline-none"
              aria-label="Live demo drawer"
            >
              <Primitive.Handle class="bg-muted-foreground/30 mx-auto mt-2.5 mb-3 opacity-100" />
              <Primitive.Title class="text-[1.05rem] font-semibold">Snap points</Primitive.Title>
              <Primitive.Description class="text-muted-foreground mt-0.5 mb-3 text-sm">
                Three rest positions. Drag between them, or tap the handle to step.
              </Primitive.Description>
              <HeroSnapList />
            </Primitive.Content>
          </Primitive.Portal>
          <Ruler />
          <Readout />
          <Reopen />
        </Primitive.Root>
      </Show>
    </div>
  );
}

function HeroSnapList() {
  const drawer = useDrawer();
  return (
    <div class="grid gap-2 text-sm">
      <For each={HERO_SNAPS}>
        {(point, i) => (
          <div
            class="group flex justify-between border-t py-2"
            data-active={drawer.activeSnapPoint() === point ? "" : undefined}
          >
            <span>{i() === 0 ? "Peek" : i() === 1 ? "Half" : "Full"}</span>
            <code class="text-muted-foreground group-data-[active]:text-marker font-mono">
              {typeof point === "number" ? point.toFixed(2) : point}
            </code>
          </div>
        )}
      </For>
    </div>
  );
}

/* The rule: the frame's height, zero at the bottom, a tick per snap point at
   the height it shows, and a cursor at how much of the sheet is on screen. */
function Ruler() {
  const drawer = useDrawer();
  const visible = () => Math.max(0, drawer.contentSize() - drawer.translate());
  // The ticks, remembered from the last time the sheet was measured, so the
  // rule still reads while the sheet is away.
  let remembered: { px: number; point: SnapPoint | undefined }[] = [];
  const ticks = () => {
    if (drawer.mounted() && drawer.contentSize() > 0) {
      remembered = drawer.snapPointsOffset().map((offset, i) => ({
        px: drawer.contentSize() - Math.abs(offset),
        point: drawer.snapPoints()?.[i],
      }));
    }
    return remembered;
  };
  return (
    <div
      class="border-input text-muted-foreground relative my-2 w-19 self-stretch border-l font-mono text-[0.7rem] transition-opacity duration-300 [grid-area:ruler] data-[away]:opacity-40"
      data-away={drawer.mounted() ? undefined : ""}
      aria-hidden="true"
    >
      <For each={ticks()}>
        {(tick) => (
          <div
            class="border-input data-[active]:text-foreground absolute left-0 h-0 w-3 border-t"
            style={{ bottom: `${tick.px}px` }}
            data-active={
              drawer.mounted() && drawer.activeSnapPoint() === tick.point ? "" : undefined
            }
          >
            <span class="absolute -top-[0.65em] left-4 whitespace-nowrap">
              {String(tick.point)}
            </span>
          </div>
        )}
      </For>
      <div
        class="bg-marker before:bg-marker absolute bottom-0 -left-[5px] h-0.5 w-8 rounded-[1px] will-change-transform before:absolute before:-top-[3px] before:left-0 before:size-2 before:rounded-full before:content-['']"
        style={{
          transform: `translateY(${drawer.mounted() ? -visible() : 0}px)`,
          transition: drawer.isDragging() ? "none" : drawer.contentTransition(),
        }}
      />
      <div class="border-input absolute -bottom-px left-0 w-3 border-t" />
    </div>
  );
}

function Readout() {
  const drawer = useDrawer();
  const moving = () => drawer.isDragging() || drawer.isTransitioning();
  const cell = "min-w-0";
  const label = "text-muted-foreground block truncate font-mono text-[0.66rem]";
  const value =
    "wide data-[live]:text-marker block text-xl font-semibold tracking-tight whitespace-nowrap tabular-nums";
  return (
    <div
      class="grid grid-cols-4 gap-3 border-t pt-3 [grid-area:readout] max-[26rem]:grid-cols-2"
      aria-live="off"
    >
      <div class={cell}>
        <small class={label}>openPercentage()</small>
        <strong class={value} data-live={moving() ? "" : undefined}>
          {Math.round(drawer.openPercentage() * 100)}%
        </strong>
      </div>
      <div class={cell}>
        <small class={label}>translate()</small>
        <strong class={value} data-live={moving() ? "" : undefined}>
          {Math.round(drawer.translate())}px
        </strong>
      </div>
      <div class={cell}>
        <small class={label}>activeSnapPoint()</small>
        <strong class={value}>{String(drawer.activeSnapPoint())}</strong>
      </div>
      <div class={cell}>
        <small class={label}>transitionState()</small>
        <strong class={value} data-live={moving() ? "" : undefined}>
          {drawer.isDragging() ? "dragging" : (drawer.transitionState() ?? "null")}
        </strong>
      </div>
    </div>
  );
}

function Reopen() {
  const drawer = useDrawer();
  return (
    <Show when={!drawer.mounted()}>
      <Primitive.Trigger
        class={buttonVariants({
          variant: "brand",
          class:
            "animate-view-in z-10 mb-7 h-10 gap-2 self-end justify-self-center rounded-full px-4 [grid-area:frame]",
        })}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m18 15-6-6-6 6" />
        </svg>
        Open the sheet
      </Primitive.Trigger>
    </Show>
  );
}

/* ---------------------------------------------------------------- demos
   Every demo opens the shadcn/ui-shaped drawer from components/ui/drawer. */

const body = "text-foreground/80 px-4 text-sm [&_p]:mb-3";
const tall = "h-[92dvh] max-h-none!";

function Sheet(props: {
  title: string;
  description: string;
  class?: string;
  children?: JSX.Element;
  footer?: JSX.Element;
}) {
  return (
    <DrawerContent class={props.class}>
      <DrawerHeader>
        <DrawerTitle>{props.title}</DrawerTitle>
        <DrawerDescription>{props.description}</DrawerDescription>
      </DrawerHeader>
      {props.children}
      <DrawerFooter>
        {props.footer}
        <DrawerClose class={buttonVariants({ variant: "outline" })}>Close</DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  );
}

/* The trigger every row uses. */
function Open(props: { label?: string }) {
  return (
    <DrawerTrigger class={buttonVariants({ variant: "outline" })}>
      {props.label ?? "Open"}
    </DrawerTrigger>
  );
}

function Basic() {
  return (
    <Drawer>
      <Open />
      <Sheet title="A drawer" description="Drag it down to close, or fling it. Escape works too.">
        <div class={body}>
          <p>
            Nothing here is styled by the library except the handle. The sheet is a{" "}
            <code>position: fixed</code> box; the drawer only moves it.
          </p>
        </div>
      </Sheet>
    </Drawer>
  );
}

/* Reads the drawer from inside it, which is what `useDrawer` is for. */
function SnapReadout() {
  const drawer = useDrawer();
  return (
    <p class="text-muted-foreground [&_b]:text-marker mb-3 font-mono text-xs [&_b]:font-medium">
      activeSnapPoint <b>{String(drawer.activeSnapPoint())}</b> · openPercentage{" "}
      <b>{Math.round(drawer.openPercentage() * 100)}%</b>
      {drawer.isDragging() ? " · dragging" : ""}
      {drawer.transitionState() ? ` · ${drawer.transitionState()}` : ""}
    </p>
  );
}

function SnapPoints() {
  return (
    <Drawer snapPoints={["220px", 0.6, 0.92]} fadeFromIndex={2}>
      <Open />
      <Sheet
        class={tall}
        title="Snap points"
        description="220px, 60% and 92% of the window. Tap the handle to step through them."
      >
        <div class={body}>
          <SnapReadout />
          <p>
            A number is a fraction of the container, a string is pixels; both say how much of the
            drawer shows. The scrim only fades in below the last one, because of{" "}
            <code>fadeFromIndex</code>.
          </p>
        </div>
      </Sheet>
    </Drawer>
  );
}

function Scrollable() {
  const rows = Array.from({ length: 40 }, (_, i) => i + 1);
  return (
    <Drawer>
      <Open />
      <Sheet
        class={tall}
        title="Scrolling content"
        description="The list scrolls; a drag only starts once it is at the top."
      >
        <div class="min-h-0 flex-1 touch-pan-y overflow-y-auto px-4">
          <For each={rows}>
            {(n) => (
              <div class="flex items-center gap-3 border-b py-2.5 text-sm">
                <span class="bg-muted text-muted-foreground grid size-7 place-items-center rounded-md font-mono text-xs">
                  {n}
                </span>
                Row {n} of {rows.length}
              </div>
            )}
          </For>
        </div>
      </Sheet>
    </Drawer>
  );
}

function Nested() {
  return (
    <Drawer>
      <Open />
      <Sheet
        title="Nested drawers"
        description="A drawer inside a drawer; the one behind steps back."
        footer={
          <DrawerNested>
            <DrawerTrigger class={buttonVariants()}>Open another</DrawerTrigger>
            <Sheet
              title="Second drawer"
              description="Close this one and the first comes forward again."
            />
          </DrawerNested>
        }
      >
        <div class={body}>
          <p>
            A <code>DrawerNested</code> inside another drawer's tree scales that drawer back as it
            opens and follows its drag.
          </p>
        </div>
      </Sheet>
    </Drawer>
  );
}

const DIRECTIONS: DrawerDirection[] = ["top", "right", "bottom", "left"];

function Directions() {
  return (
    <For each={DIRECTIONS}>
      {(direction) => (
        <Drawer direction={direction}>
          <DrawerTrigger class={buttonVariants({ variant: "outline", size: "sm" })}>
            {direction}
          </DrawerTrigger>
          <Sheet title={`From the ${direction}`} description={`direction="${direction}"`}>
            <div class={body}>
              <p>
                The same gesture, turned to the edge. A side drawer's content that scrolls should
                carry <code>touch-action: pan-x</code> instead of <code>pan-y</code>.
              </p>
            </div>
          </Sheet>
        </Drawer>
      )}
    </For>
  );
}

function NonModal() {
  return (
    <Drawer modal={false}>
      <Open />
      <Sheet
        title="Non-modal"
        description="No scrim, no focus trap: the page underneath stays live. Scroll it."
      />
    </Drawer>
  );
}

function Scaled() {
  return (
    <Drawer shouldScaleBackground>
      <Open />
      <Sheet
        title="Scaled background"
        description="The page - the element marked data-drawer-wrapper - draws back behind the sheet."
      >
        <div class={body}>
          <p>
            As iOS does with its own sheets. <code>setBackgroundColorOnScale</code> paints the body
            black behind it so the corners have something to round against.
          </p>
        </div>
      </Sheet>
    </Drawer>
  );
}

function Resize() {
  const [more, setMore] = createSignal(false);
  return (
    <Drawer transitionResize>
      <Open />
      <Sheet
        title="Resize transition"
        description="When the content changes height, the drawer animates to the new size."
        footer={
          <button type="button" class={buttonVariants()} onClick={() => setMore((m) => !m)}>
            {more() ? "Show less" : "Show more"}
          </button>
        }
      >
        <div class={body}>
          <p>
            Without <code>transitionResize</code> a sheet jumps when a step of a form appears. With
            it, the bottom edge stays put and the top edge moves.
          </p>
          <Show when={more()}>
            <p>
              This paragraph was added after the drawer opened, and the drawer grew to fit it rather
              than snapping. Press the button again and it shrinks back the same way.
            </p>
            <p>The transition uses the same duration and easing as a settle.</p>
          </Show>
        </div>
      </Sheet>
    </Drawer>
  );
}

/* The Family wallet drawer: a floating sheet whose views change, the sheet
   animating to each view's height. `transitionResize` does the height; the
   view's own entrance is one keyframe. The primitives are used directly here
   because this look has no handle and none of the component's edge styling. */
type WalletView = "options" | "key" | "remove";

function Dynamic() {
  const [view, setView] = createSignal<WalletView>("options");
  const row =
    "flex h-14 w-full items-center gap-4 rounded-2xl bg-secondary px-4 text-left text-[17px] font-medium transition-colors hover:bg-accent active:scale-[0.99]";
  const Close = () => (
    <Primitive.Close
      class="bg-secondary text-muted-foreground hover:text-foreground grid size-8 place-items-center rounded-full transition-colors"
      aria-label="Close"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        class="size-4"
        aria-hidden="true"
      >
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    </Primitive.Close>
  );
  return (
    <Primitive.Root transitionResize onOpenChange={(open) => !open && setView("options")}>
      <Open />
      <Primitive.Portal>
        <Primitive.Overlay class="fixed inset-0 z-50 bg-black/50" />
        <Primitive.Content
          class="bg-card text-card-foreground fixed inset-x-4 bottom-4 z-50 mx-auto max-w-[400px] overflow-hidden rounded-[28px] p-5 shadow-2xl outline-none"
          aria-label="Wallet options"
        >
          <Show when={view() === "options"}>
            <div class="animate-view-in">
              <div class="mb-4 flex items-center justify-between border-b pb-4">
                <Primitive.Title class="text-[22px] font-semibold tracking-tight">
                  Options
                </Primitive.Title>
                <Close />
              </div>
              <div class="grid gap-3">
                <button type="button" class={row} onClick={() => setView("key")}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="text-muted-foreground size-5"
                    aria-hidden="true"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  View Private Key
                </button>
                <button type="button" class={row} onClick={() => setView("key")}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="text-muted-foreground size-5"
                    aria-hidden="true"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M6 10h4M6 14h8" />
                  </svg>
                  View Recovery Phrase
                </button>
                <button
                  type="button"
                  class={cn(
                    row,
                    "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-950",
                  )}
                  onClick={() => setView("remove")}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="size-5"
                    aria-hidden="true"
                  >
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                    <path d="M12 9v4M12 17h.01" />
                  </svg>
                  Remove Wallet
                </button>
              </div>
            </div>
          </Show>
          <Show when={view() === "key"}>
            <div class="animate-view-in">
              <div class="mb-4 flex items-center justify-between border-b pb-4">
                <Primitive.Title class="text-[22px] font-semibold tracking-tight">
                  Private Key
                </Primitive.Title>
                <Close />
              </div>
              <Primitive.Description class="text-muted-foreground mb-4 text-[15px]">
                Your private key is the only way to recover your wallet. Keep it somewhere safe and
                never share it.
              </Primitive.Description>
              <div class="bg-secondary mb-4 rounded-2xl p-4 font-mono text-sm break-all">
                0x4f3a9c1e7b2d8f0a5c6e1b9d3a7f2c8e4b0d6a1f9c3e5b7d2a8f4c0e6b1d3a9f
              </div>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  class={cn(row, "justify-center")}
                  onClick={() => setView("options")}
                >
                  Back
                </button>
                <Primitive.Close
                  class={cn(
                    row,
                    "bg-primary text-primary-foreground justify-center hover:bg-primary/90",
                  )}
                >
                  Done
                </Primitive.Close>
              </div>
            </div>
          </Show>
          <Show when={view() === "remove"}>
            <div class="animate-view-in">
              <div class="mb-4 flex items-center justify-between border-b pb-4">
                <Primitive.Title class="text-[22px] font-semibold tracking-tight">
                  Are you sure?
                </Primitive.Title>
                <Close />
              </div>
              <Primitive.Description class="text-muted-foreground mb-4 text-[15px]">
                You have not backed up your wallet. Removing it now loses it for good.
              </Primitive.Description>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  class={cn(row, "justify-center")}
                  onClick={() => setView("options")}
                >
                  Cancel
                </button>
                <Primitive.Close
                  class={cn(row, "justify-center bg-red-600 text-white hover:bg-red-700")}
                >
                  Remove
                </Primitive.Close>
              </div>
            </div>
          </Show>
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  );
}

function Controlled() {
  const [open, setOpen] = createSignal(false);
  const [point, setPoint] = createSignal<SnapPoint | null>(0.4);
  return (
    <>
      <button
        type="button"
        class={buttonVariants({ variant: "outline" })}
        onClick={() => setOpen(true)}
      >
        Open at 40%
      </button>
      <button
        type="button"
        class={buttonVariants({ variant: "outline" })}
        onClick={() => {
          setPoint(0.9);
          setOpen(true);
        }}
      >
        Open at 90%
      </button>
      <p class="text-muted-foreground m-0 w-full font-mono text-xs md:text-right">
        open={String(open())} activeSnapPoint={String(point())}
      </p>
      <Drawer
        open={open()}
        onOpenChange={setOpen}
        snapPoints={[0.4, 0.9]}
        activeSnapPoint={point()}
        setActiveSnapPoint={setPoint}
      >
        <Sheet
          class={tall}
          title="Controlled"
          description="Open state and snap point both live outside the drawer."
          footer={
            <button
              type="button"
              class={buttonVariants()}
              onClick={() => setPoint(point() === 0.9 ? 0.4 : 0.9)}
            >
              Go to {point() === 0.9 ? "40%" : "90%"}
            </button>
          }
        >
          <div class={body}>
            <SnapReadout />
          </div>
        </Sheet>
      </Drawer>
    </>
  );
}

/* A form: inputs inside a sheet. `autoFocus` puts the caret in the first
   field; on a phone the drawer lifts above the keyboard (`repositionInputs`,
   on by default). Fields carry `data-drawer-no-drag` so selecting text in
   them never starts a drag. */
function FormDemo() {
  const field =
    "border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30 dark:bg-card";
  return (
    <Drawer autoFocus>
      <Open />
      <DrawerContent>
        <form class="mx-auto w-full max-w-sm" onSubmit={(event) => event.preventDefault()}>
          <DrawerHeader>
            <DrawerTitle>Edit profile</DrawerTitle>
            <DrawerDescription>
              Make changes to your profile here. Click save when you're done.
            </DrawerDescription>
          </DrawerHeader>
          <div class="grid gap-4 px-4">
            <label class="grid gap-1.5 text-sm font-medium">
              Name
              <input class={field} value="Pedro Duarte" data-drawer-no-drag />
            </label>
            <label class="grid gap-1.5 text-sm font-medium">
              Username
              <input class={field} value="@peduarte" data-drawer-no-drag />
            </label>
            <label class="grid gap-1.5 text-sm font-medium">
              Bio
              <textarea class={`${field} h-20 resize-none py-2`} data-drawer-no-drag>
                Builds sheets that snap.
              </textarea>
            </label>
          </div>
          <DrawerFooter>
            <DrawerClose class={buttonVariants()}>Save changes</DrawerClose>
            <DrawerClose class={buttonVariants({ variant: "outline" })}>Cancel</DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}

/* Only the handle drags. Everything else in the sheet - a slider, a row of
   chips that scrolls sideways - keeps its own gestures. */
function HandleOnly() {
  const [value, setValue] = createSignal(40);
  const chips = ["Pop", "Hip-hop", "Jazz", "Ambient", "Classical", "Techno", "Folk", "Soul"];
  return (
    <Drawer handleOnly>
      <Open />
      <DrawerContent>
        <div class="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Handle only</DrawerTitle>
            <DrawerDescription>
              Drag the bar at the top. The slider and the chips are yours to move.
            </DrawerDescription>
          </DrawerHeader>
          <div class="grid gap-5 px-4">
            <label class="grid gap-2 text-sm font-medium">
              <span class="flex justify-between">
                Volume <span class="text-muted-foreground font-mono tabular-nums">{value()}</span>
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={value()}
                onInput={(event) => setValue(Number(event.currentTarget.value))}
                class="accent-brand w-full"
              />
            </label>
            <div class="-mx-4 flex touch-pan-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
              <For each={chips}>
                {(chip) => (
                  <button
                    type="button"
                    class={buttonVariants({
                      variant: "outline",
                      size: "sm",
                      class: "rounded-full",
                    })}
                  >
                    {chip}
                  </button>
                )}
              </For>
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose class={buttonVariants({ variant: "outline" })}>Close</DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/* Cannot be dragged shut, dismissed by Escape or a tap outside. Only its own button lets it go. */
function NotDismissible() {
  return (
    <Drawer dismissible={false}>
      <Open />
      <DrawerContent>
        <div class="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Update required</DrawerTitle>
            <DrawerDescription>
              Try dragging it down, pressing Escape, or tapping the page: nothing.{" "}
              <code>DrawerClose</code> still works.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <DrawerClose class={buttonVariants()}>Got it</DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/* A minimum height: the first snap point is the height of the header and
   `dismissible={false}` means a drag below it springs back, so the header
   never leaves the screen. Non-modal, so the page stays live under it. Its
   own button is the way to put it away. */
function Persistent() {
  const [playing, setPlaying] = createSignal(true);
  const queue = [
    "Weightless",
    "Open Eye Signal",
    "Avril 14th",
    "Xtal",
    "Rhubarb",
    "Kid A",
    "Sea Calls Me Home",
  ];
  return (
    <Drawer modal={false} dismissible={false} snapPoints={["76px", 0.5, 0.92]}>
      <Open />
      <DrawerContent class="h-[92dvh] max-h-none!">
        {/* The header: 24px of handle, 52px of row. The first snap point shows exactly this. */}
        <div class="flex h-13 items-center gap-3 px-4">
          <div
            class="from-brand to-marker size-10 shrink-0 rounded-md bg-linear-to-br"
            aria-hidden="true"
          />
          <div class="min-w-0 flex-1">
            <DrawerTitle class="truncate text-sm">Now playing · Weightless</DrawerTitle>
            <DrawerDescription class="truncate text-xs">
              Marconi Union · drag up for the queue
            </DrawerDescription>
          </div>
          <button
            type="button"
            class={buttonVariants({ variant: "outline", size: "icon-sm", class: "rounded-full" })}
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing() ? "Pause" : "Play"}
            data-drawer-no-drag
          >
            <Show
              when={playing()}
              fallback={
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              }
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
              </svg>
            </Show>
          </button>
          <DrawerClose
            class={buttonVariants({ variant: "ghost", size: "icon-sm" })}
            aria-label="Close player"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </DrawerClose>
        </div>
        <div class="min-h-0 flex-1 touch-pan-y overflow-y-auto border-t px-4 pt-3">
          <p class="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
            Up next
          </p>
          <For each={queue}>
            {(track, i) => (
              <div class="flex items-center gap-3 border-b py-2.5 text-sm">
                <span class="text-muted-foreground w-5 font-mono text-xs">{i() + 1}</span>
                {track}
              </div>
            )}
          </For>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/* A drawer that lives inside a panel: the panel is its `container`, so the
   Portal mounts into it and the snap fractions are of its height. */
function Panel() {
  const [panel, setPanel] = createSignal<HTMLDivElement | null>(null);
  const places = [
    ["Blue Bottle", "0.2 km"],
    ["Tartine", "0.4 km"],
    ["Sightglass", "0.7 km"],
    ["Ritual", "1.1 km"],
    ["Dandelion", "1.3 km"],
    ["Four Barrel", "1.6 km"],
  ];
  return (
    <div
      class="bg-secondary relative h-[420px] w-full overflow-hidden rounded-xl border [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:32px_32px]"
      ref={setPanel}
    >
      <div
        class="bg-brand ring-brand/20 absolute top-[38%] left-1/2 size-4 -translate-x-1/2 rounded-full ring-8"
        aria-hidden="true"
      />
      <Show when={panel()}>
        <Primitive.Root
          container={panel()}
          modal={false}
          defaultOpen
          snapPoints={["88px", 0.5, 0.9]}
          defaultActiveSnapPoint={0.5}
          fadeFromIndex={2}
        >
          <Primitive.Portal>
            <Primitive.Overlay class="absolute inset-0 bg-black/30" />
            <Primitive.Content
              class="bg-card text-card-foreground absolute inset-x-0 bottom-0 flex h-[90%] flex-col rounded-t-2xl shadow-[0_-8px_30px_rgb(0_0_0/0.15)] outline-none"
              aria-label="Nearby places"
            >
              <Primitive.Handle class="bg-muted-foreground/30 mx-auto mt-3 mb-2 opacity-100" />
              <Primitive.Title class="px-4 text-base font-semibold">Nearby</Primitive.Title>
              <Primitive.Description class="text-muted-foreground px-4 text-xs">
                88px, half, and 90% of the panel. Tap the handle to step.
              </Primitive.Description>
              <div class="mt-3 min-h-0 flex-1 touch-pan-y overflow-y-auto px-4">
                <For each={places}>
                  {([name, distance]) => (
                    <div class="flex items-center justify-between border-t py-2.5 text-sm">
                      <span>{name}</span>
                      <span class="text-muted-foreground font-mono text-xs">{distance}</span>
                    </div>
                  )}
                </For>
              </div>
            </Primitive.Content>
          </Primitive.Portal>
          <PanelReopen />
        </Primitive.Root>
      </Show>
    </div>
  );
}

function PanelReopen() {
  const drawer = useDrawer();
  return (
    <Show when={!drawer.mounted()}>
      <Primitive.Trigger
        class={buttonVariants({ class: "absolute bottom-4 left-1/2 -translate-x-1/2" })}
      >
        Show nearby
      </Primitive.Trigger>
    </Show>
  );
}

/* shadcn/ui's own drawer example, so the docs' preview is the familiar one. */
export function DocsPreview() {
  const [goal, setGoal] = createSignal(350);
  const adjust = (by: number) => setGoal((g) => Math.max(200, Math.min(400, g + by)));
  const bars = [400, 300, 200, 300, 200, 278, 189, 239, 300, 200, 278, 189, 349];
  const round = buttonVariants({
    variant: "outline",
    size: "icon",
    class: "size-8 shrink-0 rounded-full",
  });
  return (
    <Drawer>
      <DrawerTrigger class={buttonVariants({ variant: "outline" })}>Open Drawer</DrawerTrigger>
      <DrawerContent>
        <div class="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Move Goal</DrawerTitle>
            <DrawerDescription>Set your daily activity goal.</DrawerDescription>
          </DrawerHeader>
          <div class="p-4 pb-0">
            <div class="flex items-center justify-center gap-2">
              <button
                type="button"
                class={round}
                onClick={() => adjust(-10)}
                disabled={goal() <= 200}
                aria-label="Decrease"
              >
                −
              </button>
              <div class="flex-1 text-center">
                <div class="text-7xl font-bold tracking-tighter tabular-nums">{goal()}</div>
                <div class="text-muted-foreground text-[0.7rem] uppercase">Calories/day</div>
              </div>
              <button
                type="button"
                class={round}
                onClick={() => adjust(10)}
                disabled={goal() >= 400}
                aria-label="Increase"
              >
                +
              </button>
            </div>
            <div class="mt-3 flex h-[120px] items-end gap-1" aria-hidden="true">
              <For each={bars}>
                {(value) => (
                  <div
                    class="bg-brand/40 flex-1 rounded-sm"
                    style={{ height: `${(value / 400) * 100}%` }}
                  />
                )}
              </For>
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose class={buttonVariants()}>Submit</DrawerClose>
            <DrawerClose class={buttonVariants({ variant: "outline" })}>Cancel</DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

const DEMOS: {
  key: string;
  name: string;
  props: string;
  blurb: string;
  demo: () => JSX.Element;
  /** Needs room of its own: on the docs page, not in the index. */
  docsOnly?: boolean;
}[] = [
  {
    key: "basic",
    name: "Basic",
    props: "<Drawer>",
    blurb: "A full-width modal sheet. Drag, fling, Escape, tap outside.",
    demo: Basic,
  },
  {
    key: "snap",
    name: "Snap points",
    props: 'snapPoints={["220px", 0.6, 0.92]} fadeFromIndex={2}',
    blurb: "Pixel and fraction rest positions, and a scrim that fades in late.",
    demo: SnapPoints,
  },
  {
    key: "scroll",
    name: "Scrolling content",
    props: "touch-pan-y on the list",
    blurb: "A list inside the drawer scrolls; the drawer only drags from the top of it.",
    demo: Scrollable,
  },
  {
    key: "nested",
    name: "Nested",
    props: "<DrawerNested>",
    blurb: "A drawer opened from a drawer, the first stepping back behind it.",
    demo: Nested,
  },
  {
    key: "directions",
    name: "Four edges",
    props: 'direction="top" | "right" | "bottom" | "left"',
    blurb: "The same gesture from any edge. Side drawers are 75% wide, capped at 24rem.",
    demo: Directions,
  },
  {
    key: "nonmodal",
    name: "Non-modal",
    props: "modal={false}",
    blurb: "No scrim and no focus trap; the page stays usable underneath.",
    demo: NonModal,
  },
  {
    key: "scaled",
    name: "Scaled background",
    props: "shouldScaleBackground",
    blurb: "The page draws back behind a modal drawer, the way a phone does it.",
    demo: Scaled,
  },
  {
    key: "resize",
    name: "Resize",
    props: "transitionResize",
    blurb: "Content that changes height moves the drawer's edge instead of jumping it.",
    demo: Resize,
  },
  {
    key: "dynamic",
    name: "Dynamic height",
    props: "transitionResize, and your own classes on Content",
    blurb: "A floating sheet whose views change; the drawer animates to each view's height.",
    demo: Dynamic,
  },
  {
    key: "form",
    name: "Form",
    props: "autoFocus, data-drawer-no-drag on the fields",
    blurb: "Inputs in a sheet. On a phone the drawer lifts above the keyboard.",
    demo: FormDemo,
  },
  {
    key: "handleonly",
    name: "Handle only",
    props: "handleOnly",
    blurb: "Only the handle drags; a slider and a sideways-scrolling row keep their gestures.",
    demo: HandleOnly,
  },
  {
    key: "nondismissible",
    name: "Not dismissible",
    props: "dismissible={false}",
    blurb: "No drag-to-close, Escape or tap-outside; only its own button lets it go.",
    demo: NotDismissible,
  },
  {
    key: "persistent",
    name: "Always visible",
    props: 'snapPoints={["76px", 0.5, 0.92]} dismissible={false} modal={false}',
    blurb: "A minimum height: the header is the first snap point and a drag below it springs back.",
    demo: Persistent,
  },
  {
    key: "panel",
    name: "Inside a panel",
    props: "container={panel()} modal={false}",
    blurb: "A drawer that lives in a panel: fractions of its height, portal into it.",
    demo: Panel,
    docsOnly: true,
  },
  {
    key: "controlled",
    name: "Controlled",
    props: "open={} onOpenChange={} activeSnapPoint={} setActiveSnapPoint={}",
    blurb: "Open state and the active snap point held in your own signals.",
    demo: Controlled,
  },
];

export function DemoGallery() {
  return (
    <div class="border-t">
      <For each={DEMOS.filter((d) => !d.docsOnly)}>
        {(entry) => (
          <article class="grid items-center gap-x-8 gap-y-3 border-b py-4 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)_auto]">
            <div>
              <h3 class="mb-1 text-[1.05rem]">{entry.name}</h3>
              <code class="text-muted-foreground block font-mono text-[0.74rem] wrap-anywhere">
                {entry.props}
              </code>
            </div>
            <p class="text-foreground/80 m-0 text-[0.95rem] text-pretty">{entry.blurb}</p>
            <div class="flex flex-wrap items-center gap-2 md:justify-end">{entry.demo()}</div>
          </article>
        )}
      </For>
    </div>
  );
}

/* One demo, in a box, for the docs. */
export function DocsExample(props: { name: string }) {
  const entry = () => DEMOS.find((d) => d.key === props.name);
  return (
    <div class="not-prose bg-card/60 flex min-h-[220px] flex-wrap items-center justify-center gap-2 rounded-lg border p-8">
      <Show
        when={entry()}
        fallback={<p class="text-muted-foreground text-sm">No demo named {props.name}.</p>}
      >
        {entry()!.demo()}
      </Show>
    </div>
  );
}
