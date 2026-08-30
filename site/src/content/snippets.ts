/* The code samples the docs show. Kept out of the MDX so a formatter never
   reflows what is inside the template literals. */

export const usage = `import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

<Drawer>
  <DrawerTrigger>Open</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Are you absolutely sure?</DrawerTitle>
      <DrawerDescription>This action cannot be undone.</DrawerDescription>
    </DrawerHeader>
    <DrawerFooter>
      <Button>Submit</Button>
      <DrawerClose>Cancel</DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>`;

export const preview = `import { createSignal, For } from "solid-js";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const data = [400, 300, 200, 300, 200, 278, 189, 239, 300, 200, 278, 189, 349];

export function DrawerDemo() {
  const [goal, setGoal] = createSignal(350);
  const adjust = (by: number) => setGoal((g) => Math.max(200, Math.min(400, g + by)));

  return (
    <Drawer>
      <DrawerTrigger as={Button} variant="outline">Open Drawer</DrawerTrigger>
      <DrawerContent>
        <div class="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Move Goal</DrawerTitle>
            <DrawerDescription>Set your daily activity goal.</DrawerDescription>
          </DrawerHeader>
          <div class="p-4 pb-0">
            <div class="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                class="size-8 rounded-full"
                onClick={() => adjust(-10)}
                disabled={goal() <= 200}
              >
                −
              </Button>
              <div class="flex-1 text-center">
                <div class="text-7xl font-bold tracking-tighter tabular-nums">{goal()}</div>
                <div class="text-muted-foreground text-[0.7rem] uppercase">Calories/day</div>
              </div>
              <Button
                variant="outline"
                size="icon"
                class="size-8 rounded-full"
                onClick={() => adjust(10)}
                disabled={goal() >= 400}
              >
                +
              </Button>
            </div>
            <div class="mt-3 flex h-[120px] items-end gap-1">
              <For each={data}>
                {(v) => (
                  <div class="bg-primary/30 flex-1 rounded-sm" style={{ height: \`\${(v / 400) * 100}%\` }} />
                )}
              </For>
            </div>
          </div>
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose as={Button} variant="outline">Cancel</DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}`;

export const stylesheet = `/* app.css */
@import "tailwindcss";
/* Optional: the handle's look, its 44px hit area, and the background that
   runs on past the drawer's edge when it is pulled beyond open. In a layer,
   so your utilities on the handle win. */
@import "@sinhong2011/solid-drawer/style.css" layer(base);`;

export const stylesheetPlain = `import "@sinhong2011/solid-drawer/style.css";`;

export const snap = `<Drawer snapPoints={["220px", 0.6, 0.92]} fadeFromIndex={2}>
  <DrawerTrigger>Open</DrawerTrigger>
  {/* A drawer with snap points needs a height of its own. */}
  <DrawerContent class="h-[92dvh] max-h-none!">
    <DrawerHeader>
      <DrawerTitle>Snap points</DrawerTitle>
      <DrawerDescription>220px, 60% and 92% of the window.</DrawerDescription>
    </DrawerHeader>
  </DrawerContent>
</Drawer>`;

export const snapControlled = `const [point, setPoint] = createSignal<SnapPoint | null>(0.4);

<Drawer snapPoints={[0.4, 0.9]} activeSnapPoint={point()} setActiveSnapPoint={setPoint}>
  …
</Drawer>`;

export const scroll = `<DrawerContent class="h-[85dvh] max-h-none!">
  <DrawerHeader>…</DrawerHeader>
  {/* touch-pan-y: the list wants the finger back for scrolling; the drawer
      only takes over from the top of it. A side drawer's list: touch-pan-x. */}
  <div class="min-h-0 flex-1 touch-pan-y overflow-y-auto px-4">
    <For each={rows}>{(row) => <Row row={row} />}</For>
  </div>
</DrawerContent>`;

export const nested = `<Drawer>
  <DrawerTrigger>Open</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>First</DrawerTitle>
    </DrawerHeader>
    <DrawerFooter>
      <DrawerNested>
        <DrawerTrigger>Open another</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Second</DrawerTitle>
          </DrawerHeader>
        </DrawerContent>
      </DrawerNested>
    </DrawerFooter>
  </DrawerContent>
</Drawer>`;

export const directions = `<Drawer direction="right">
  <DrawerTrigger>Open</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>From the right</DrawerTitle>
    </DrawerHeader>
  </DrawerContent>
</Drawer>`;

export const nonModal = `<Drawer modal={false}>
  <DrawerTrigger>Open</DrawerTrigger>
  <DrawerContent>…</DrawerContent>
</Drawer>`;

export const scaled = `// The app shell the drawer draws back.
<div data-drawer-wrapper>
  <App />
</div>

<Drawer shouldScaleBackground>
  <DrawerTrigger>Open</DrawerTrigger>
  <DrawerContent>…</DrawerContent>
</Drawer>`;

export const resize = `const [more, setMore] = createSignal(false);

<Drawer transitionResize>
  <DrawerTrigger>Open</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>…</DrawerHeader>
    <Show when={more()}>
      <p>Added after the drawer opened; the drawer grows to fit.</p>
    </Show>
    <DrawerFooter>
      <Button onClick={() => setMore((m) => !m)}>Toggle</Button>
    </DrawerFooter>
  </DrawerContent>
</Drawer>`;

export const dynamic = `const [view, setView] = createSignal<"options" | "key" | "remove">("options");

// The primitives directly: this look has no handle and none of the edge styling.
<Drawer.Root transitionResize onOpenChange={(open) => !open && setView("options")}>
  <Drawer.Trigger>Open</Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Overlay class="fixed inset-0 z-50 bg-black/50" />
    {/* Floating and inset; overflow-hidden clips the content while the height animates. */}
    <Drawer.Content class="bg-card fixed inset-x-4 bottom-4 z-50 mx-auto max-w-[400px] overflow-hidden rounded-[28px] p-5 outline-none">
      <Show when={view() === "options"}>
        <div class="animate-view-in">…</div>
      </Show>
      <Show when={view() === "remove"}>
        <div class="animate-view-in">…</div>
      </Show>
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>`;

export const controlled = `const [open, setOpen] = createSignal(false);

<Button onClick={() => setOpen(true)}>Open</Button>

<Drawer open={open()} onOpenChange={setOpen}>
  <DrawerContent>…</DrawerContent>
</Drawer>`;

export const form = `<Drawer autoFocus>
  <DrawerTrigger>Edit profile</DrawerTrigger>
  <DrawerContent>
    <form class="mx-auto w-full max-w-sm" onSubmit={save}>
      <DrawerHeader>
        <DrawerTitle>Edit profile</DrawerTitle>
        <DrawerDescription>Click save when you're done.</DrawerDescription>
      </DrawerHeader>
      <div class="grid gap-4 px-4">
        {/* data-drawer-no-drag: selecting text in a field never starts a drag. */}
        <Input name="name" data-drawer-no-drag />
        <Input name="username" data-drawer-no-drag />
      </div>
      <DrawerFooter>
        <Button type="submit">Save changes</Button>
        <DrawerClose as={Button} variant="outline">Cancel</DrawerClose>
      </DrawerFooter>
    </form>
  </DrawerContent>
</Drawer>`;

export const handleOnly = `<Drawer handleOnly>
  <DrawerTrigger>Open</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>…</DrawerHeader>
    {/* Nothing here can start a drag; only the handle does. */}
    <input type="range" min="0" max="100" />
    <div class="flex touch-pan-x gap-2 overflow-x-auto">…</div>
  </DrawerContent>
</Drawer>`;

export const nonDismissible = `<Drawer dismissible={false}>
  <DrawerTrigger>Open</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Update required</DrawerTitle>
    </DrawerHeader>
    <DrawerFooter>
      {/* The only way out. */}
      <DrawerClose as={Button}>Got it</DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>`;

export const persistent = `{/* The first snap point is the header's height; dismissible={false} means a
    drag below it springs back, so the header never leaves the screen. */}
<Drawer modal={false} dismissible={false} snapPoints={["76px", 0.5, 0.92]}>
  <DrawerTrigger>Open</DrawerTrigger>
  <DrawerContent class="h-[92dvh] max-h-none!">
    <div class="flex h-13 items-center gap-3 px-4">
      <Art />
      <div class="min-w-0 flex-1">
        <DrawerTitle class="truncate text-sm">Now playing</DrawerTitle>
        <DrawerDescription class="truncate text-xs">Drag up for the queue</DrawerDescription>
      </div>
      {/* Its own button is the way out. */}
      <DrawerClose as={Button} variant="ghost" size="icon-sm">×</DrawerClose>
    </div>
    <div class="min-h-0 flex-1 touch-pan-y overflow-y-auto border-t px-4">…</div>
  </DrawerContent>
</Drawer>`;

export const panel = `const [panel, setPanel] = createSignal<HTMLDivElement | null>(null);

<div class="relative h-[480px] overflow-hidden rounded-xl border" ref={setPanel}>
  <Map />
  <Show when={panel()}>
    {/* Fractions are of the panel, and the Portal mounts into it. */}
    <Drawer container={panel()} modal={false} defaultOpen snapPoints={["120px", 0.5, 0.9]}>
      <DrawerContent class="absolute! inset-x-0 bottom-0 h-[90%] max-h-none!">…</DrawerContent>
    </Drawer>
  </Show>
</div>`;

export const headless = `import { createDrawer, useDrawer } from "@sinhong2011/solid-drawer";

// Inside any part of a drawer:
const drawer = useDrawer();
drawer.openPercentage(); // 0 to 1, past 1 when pulled beyond open
drawer.translate(); // px along the drawer's axis; 0 is fully open
drawer.transitionState(); // "opening" | "closing" | "snapping" | "resizing" | null
drawer.isDragging();
drawer.activeSnapPoint();

// Or the whole thing without elements, for parts of your own:
const ctx = createDrawer(props, null);`;

export const plainCss = `<Drawer.Root>
  <Drawer.Trigger>Open</Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Overlay class="scrim" />
    <Drawer.Content class="sheet">
      <Drawer.Handle />
      <Drawer.Title>Title</Drawer.Title>
      <Drawer.Description>What this is.</Drawer.Description>
      <Drawer.Close>Close</Drawer.Close>
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>`;

export const plainCssStyles = `.scrim {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 0.5);
}
.sheet {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 16px 16px 0 0;
}
/* Every edge, from the attribute the library sets. */
.sheet[data-drawer-direction="right"] {
  inset: 0 0 0 auto;
  width: 75%;
  max-width: 24rem;
  border-radius: 0;
}`;
