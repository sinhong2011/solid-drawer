// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { Drawer } from "../src";
import type { SnapPoint } from "../src";

/*
 * jsdom has no layout and no pointers, so both are stood in for: the drawer
 * and its window are given sizes, and pointer events are built by hand.
 */

if (typeof PointerEvent === "undefined") {
  class FakePointerEvent extends MouseEvent {
    pointerId: number;
    pointerType: string;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, { bubbles: true, cancelable: true, ...init });
      this.pointerId = init.pointerId ?? 1;
      this.pointerType = init.pointerType ?? "touch";
    }
  }
  Object.assign(globalThis, { PointerEvent: FakePointerEvent });
}

const CONTENT = 900;
const WINDOW = 1000;

let host: HTMLDivElement;
let dispose: (() => void) | undefined;

beforeEach(() => {
  host = document.createElement("div");
  document.body.append(host);
  Object.defineProperty(window, "innerHeight", { value: WINDOW, configurable: true });
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get() {
      return this.hasAttribute("data-drawer-content") ? CONTENT : 0;
    },
  });
});

afterEach(() => {
  dispose?.();
  dispose = undefined;
  host.remove();
});

/** A frame for the open sequence, or the whole of a 10ms settle plus its safety margin. */
const tick = () =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      flush();
      resolve();
    }, 100);
  });

const content = () => document.querySelector<HTMLElement>("[data-drawer-content]");

function pointer(type: string, target: EventTarget, y: number, extra: PointerEventInit = {}) {
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: 100,
      clientY: y,
      pointerId: 1,
      button: 0,
      ...extra,
    }),
  );
}

/** A finger that goes down on the drawer, moves up or down, and lets go. */
async function drag(from: number, to: number, steps = 6, pause = 0) {
  const el = content() as HTMLElement;
  pointer("pointerdown", el, from);
  for (let i = 1; i <= steps; i++) {
    pointer("pointermove", window, from + ((to - from) * i) / steps);
    if (pause) await new Promise((resolve) => setTimeout(resolve, pause));
  }
  flush();
  pointer("pointerup", window, to);
  flush();
}

function mount(node: () => JSX.Element) {
  dispose = render(node, host);
  flush();
}

describe("Drawer", () => {
  it("mounts a labelled dialog that leaves after closing", async () => {
    const [open, setOpen] = createSignal(true);
    mount(() => (
      <Drawer.Root open={open()} onOpenChange={setOpen} transitionDuration={10}>
        <Drawer.Content>
          <Drawer.Title>Stops</Drawer.Title>
          <Drawer.Description>Every one</Drawer.Description>
        </Drawer.Content>
      </Drawer.Root>
    ));
    await tick();
    const el = content() as HTMLElement;
    expect(el.getAttribute("role")).toBe("dialog");
    expect(el.getAttribute("aria-modal")).toBe("true");
    expect(document.getElementById(el.getAttribute("aria-labelledby") as string)?.textContent).toBe(
      "Stops",
    );
    expect(el.getAttribute("data-state")).toBe("open");
    expect(el.style.transform).toBe("translate3d(0, 0px, 0)");

    setOpen(false);
    flush();
    expect(content()?.getAttribute("data-state")).toBe("closed");
    expect(content()?.style.transform).toBe("translate3d(0, 100%, 0)");
    await tick();
    expect(content()).toBeNull();
  });

  it("closes on Escape, unless it is not dismissible", async () => {
    const onOpenChange = vi.fn();
    const [dismissible, setDismissible] = createSignal(true);
    mount(() => (
      <Drawer.Root open onOpenChange={onOpenChange} dismissible={dismissible()}>
        <Drawer.Content />
      </Drawer.Root>
    ));
    await tick();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    onOpenChange.mockClear();
    setDismissible(false);
    flush();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("pins the page behind a modal drawer and lets it go after", async () => {
    const [open, setOpen] = createSignal(true);
    mount(() => (
      <Drawer.Root open={open()} onOpenChange={setOpen} transitionDuration={10}>
        <Drawer.Content />
      </Drawer.Root>
    ));
    await tick();
    expect(document.body.style.position).toBe("fixed");
    setOpen(false);
    await tick();
    expect(document.body.style.position).toBe("");
  });

  it("pins the page once, however many drawers are open over it", async () => {
    Object.defineProperty(window, "scrollY", { value: 300, configurable: true });
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const [open, setOpen] = createSignal(true);
    const [inner, setInner] = createSignal(false);
    mount(() => (
      <Drawer.Root open={open()} onOpenChange={setOpen} transitionDuration={10}>
        <Drawer.Content>
          <Drawer.NestedRoot open={inner()} onOpenChange={setInner} transitionDuration={10}>
            <Drawer.Content />
          </Drawer.NestedRoot>
        </Drawer.Content>
      </Drawer.Root>
    ));
    await tick();
    expect(document.body.style.top).toBe("-300px");

    // The body is already fixed, so scrollY now reads 0; the nested drawer must not re-pin at 0.
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
    setInner(true);
    await tick();
    expect(document.body.style.top).toBe("-300px");

    setInner(false);
    await tick();
    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.top).toBe("-300px");
    expect(scrollTo).not.toHaveBeenCalled();

    setOpen(false);
    await tick();
    expect(document.body.style.position).toBe("");
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 300 }));
    scrollTo.mockRestore();
  });

  it("opens at the first snap point and rests at the one it is pulled to", async () => {
    const changes: (SnapPoint | null)[] = [];
    mount(() => (
      <Drawer.Root
        open
        snapPoints={[0.3, 0.9]}
        onActiveSnapPointChange={(point) => changes.push(point)}
        transitionDuration={10}
      >
        <Drawer.Content />
      </Drawer.Root>
    ));
    await tick();
    const el = content() as HTMLElement;
    // 300px of a 900px drawer showing: moved 600px towards its edge.
    expect(el.style.transform).toBe("translate3d(0, 600px, 0)");
    expect(el.style.getPropertyValue("--snap-point-height")).toBe("300px");
    expect(changes).toEqual([0.3]);

    // Pulled slowly up to 250px from the top and dropped: nearer 0.9.
    await drag(700, 250, 8, 20);
    await tick();
    expect(changes.at(-1)).toBe(0.9);
    expect(el.style.transform).toBe("translate3d(0, 0px, 0)");
  });

  it("follows the finger while dragging, and resists past the last snap point", async () => {
    mount(() => (
      <Drawer.Root open snapPoints={[0.3, 0.9]} transitionDuration={10}>
        <Drawer.Content />
      </Drawer.Root>
    ));
    await tick();
    const el = content() as HTMLElement;
    pointer("pointerdown", el, 700);
    pointer("pointermove", window, 650);
    flush();
    expect(el.hasAttribute("data-dragging")).toBe(true);
    expect(el.style.transition).toBe("none");
    expect(el.style.transform).toBe("translate3d(0, 550px, 0)");
    // 700px up would be 100px past open; damped to a few pixels.
    pointer("pointermove", window, 0);
    flush();
    const past = Number.parseFloat(el.style.transform.match(/, (-?[\d.]+)px/)?.[1] ?? "0");
    expect(past).toBeLessThan(0);
    expect(past).toBeGreaterThan(-40);
    pointer("pointerup", window, 0);
    flush();
    expect(el.hasAttribute("data-dragging")).toBe(false);
  });

  it("is put away by a fling down", async () => {
    const onOpenChange = vi.fn();
    mount(() => (
      <Drawer.Root open snapPoints={[0.3, 0.9]} onOpenChange={onOpenChange}>
        <Drawer.Content />
      </Drawer.Root>
    ));
    await tick();
    await drag(700, 900, 4);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("with no snap points, closes past the threshold and springs back before it", async () => {
    const onOpenChange = vi.fn();
    mount(() => (
      <Drawer.Root open onOpenChange={onOpenChange}>
        <Drawer.Content />
      </Drawer.Root>
    ));
    await tick();
    // 100px of 900 is under a quarter, and slow: back it goes.
    await drag(100, 200, 5, 30);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(content()?.style.transform).toBe("translate3d(0, 0px, 0)");
    // 300px of 900 is past it.
    await drag(100, 400, 5, 30);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not move when the drag starts in a scrolled list", async () => {
    mount(() => (
      <Drawer.Root open snapPoints={[0.3, 0.9]} defaultActiveSnapPoint={0.9}>
        <Drawer.Content>
          <div id="list" style={{ "overflow-y": "auto" }}>
            <p id="row">row</p>
          </div>
        </Drawer.Content>
      </Drawer.Root>
    ));
    await tick();
    const list = document.getElementById("list") as HTMLElement;
    Object.defineProperties(list, {
      scrollTop: { value: 40 },
      clientHeight: { value: 100 },
      scrollHeight: { value: 500 },
    });
    const row = document.getElementById("row") as HTMLElement;
    pointer("pointerdown", row, 300);
    pointer("pointermove", window, 400);
    flush();
    expect(content()?.hasAttribute("data-dragging")).toBe(false);
  });

  it("the handle cycles snap points on a tap, and closes from the last", async () => {
    const onOpenChange = vi.fn();
    const changes: (SnapPoint | null)[] = [];
    mount(() => (
      <Drawer.Root
        open
        snapPoints={[0.3, 0.9]}
        onActiveSnapPointChange={(point) => changes.push(point)}
        onOpenChange={onOpenChange}
      >
        <Drawer.Content>
          <Drawer.Handle />
        </Drawer.Content>
      </Drawer.Root>
    ));
    await tick();
    const handle = document.querySelector("[data-drawer-handle]") as HTMLElement;
    const tap = () => {
      pointer("pointerdown", handle, 700);
      pointer("pointerup", window, 700);
      handle.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 100, clientY: 700 }));
      flush();
    };
    tap();
    expect(changes.at(-1)).toBe(0.9);
    tap();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("takes a controlled snap point from its parent", async () => {
    const [point, setPoint] = createSignal<SnapPoint | null>(0.3);
    mount(() => (
      <Drawer.Root
        open
        snapPoints={[0.3, 0.9]}
        activeSnapPoint={point()}
        setActiveSnapPoint={setPoint}
      >
        <Drawer.Content />
      </Drawer.Root>
    ));
    await tick();
    expect(content()?.style.transform).toBe("translate3d(0, 600px, 0)");
    setPoint(0.9);
    flush();
    expect(content()?.style.transform).toBe("translate3d(0, 0px, 0)");
  });

  it("fades the overlay in from the snap point it is told to", async () => {
    const [point, setPoint] = createSignal<SnapPoint | null>(0.3);
    mount(() => (
      <Drawer.Root
        open
        snapPoints={[0.3, 0.6, 0.9]}
        fadeFromIndex={2}
        activeSnapPoint={point()}
        setActiveSnapPoint={setPoint}
      >
        <Drawer.Overlay />
        <Drawer.Content />
      </Drawer.Root>
    ));
    await tick();
    const overlay = () => document.querySelector<HTMLElement>("[data-drawer-overlay]");
    expect(overlay()?.style.opacity).toBe("0");
    setPoint(0.6);
    flush();
    expect(overlay()?.style.opacity).toBe("0");
    setPoint(0.9);
    flush();
    expect(overlay()?.style.opacity).toBe("1");
  });

  it("the trigger opens and the close part closes, whatever dismissible says", async () => {
    mount(() => (
      <Drawer.Root dismissible={false} transitionDuration={10}>
        <Drawer.Trigger>open</Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Close>close</Drawer.Close>
        </Drawer.Content>
      </Drawer.Root>
    ));
    const trigger = document.querySelector("[data-drawer-trigger]") as HTMLButtonElement;
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(content()).toBeNull();
    trigger.click();
    await tick();
    expect(content()).not.toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-controls")).toBe(content()?.id);
    (document.querySelector("[data-drawer-close]") as HTMLButtonElement).click();
    await tick();
    expect(content()).toBeNull();
  });

  it("slides from the side it is given", async () => {
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      get() {
        return this.hasAttribute("data-drawer-content") ? CONTENT : 0;
      },
    });
    Object.defineProperty(window, "innerWidth", { value: WINDOW, configurable: true });
    mount(() => (
      <Drawer.Root open direction="right" snapPoints={["300px"]}>
        <Drawer.Content />
      </Drawer.Root>
    ));
    await tick();
    expect(content()?.getAttribute("data-drawer-direction")).toBe("right");
    expect(content()?.style.transform).toBe("translate3d(600px, 0, 0)");
  });

  it("still leaves when its content changes size on the way out", async () => {
    // jsdom has no ResizeObserver; one that is fired by hand stands in.
    const callbacks: (() => void)[] = [];
    class FakeResizeObserver {
      constructor(callback: () => void) {
        callbacks.push(callback);
      }
      observe() {}
      disconnect() {}
    }
    const real = (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
    Object.assign(globalThis, { ResizeObserver: FakeResizeObserver });
    let height = CONTENT;
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
      configurable: true,
      get() {
        return this.hasAttribute("data-drawer-content") ? height : 0;
      },
    });
    try {
      const [open, setOpen] = createSignal(true);
      mount(() => (
        <Drawer.Root open={open()} onOpenChange={setOpen} transitionResize transitionDuration={10}>
          <Drawer.Overlay />
          <Drawer.Content />
        </Drawer.Root>
      ));
      await tick();
      expect(document.body.style.position).toBe("fixed");

      // The view inside resets as the drawer closes, and the sheet gets shorter.
      setOpen(false);
      flush();
      expect(content()?.getAttribute("data-transition-state")).toBe("closing");
      height = 300;
      for (const callback of callbacks) callback();
      flush();
      expect(content()?.getAttribute("data-transition-state")).toBe("closing");

      await tick();
      expect(content()).toBeNull();
      expect(document.querySelector("[data-drawer-overlay]")).toBeNull();
      expect(document.body.style.position).toBe("");
    } finally {
      Object.assign(globalThis, { ResizeObserver: real });
    }
  });
});
