// @vitest-environment jsdom
import { describe, expect, it } from "vite-plus/test";
import {
  closedTransform,
  locationIsDraggable,
  nearestSnapIndex,
  resolveSnapPoint,
  shouldDrag,
  snapPointOffsets,
} from "../src/helpers";

describe("resolveSnapPoint", () => {
  it("takes a fraction of the container and a pixel string as is", () => {
    expect(resolveSnapPoint(0.5, 800)).toBe(400);
    expect(resolveSnapPoint("120px", 800)).toBe(120);
    expect(resolveSnapPoint("nonsense", 800)).toBe(0);
  });
});

describe("snapPointOffsets", () => {
  it("moves the drawer by what should not show, towards its edge", () => {
    // A 900px drawer in a 1000px window, showing 300px and 900px of itself.
    expect(snapPointOffsets([0.3, 0.9], "bottom", 900, 1000)).toEqual([600, 0]);
    expect(snapPointOffsets([0.3, 0.9], "top", 900, 1000)).toEqual([-600, -0]);
    expect(snapPointOffsets(["300px"], "right", 900, 1000)).toEqual([600]);
    expect(snapPointOffsets(["300px"], "left", 900, 1000)).toEqual([-600]);
  });

  it("never asks a drawer to show more of itself than it has", () => {
    expect(snapPointOffsets([1.5], "bottom", 500, 1000)).toEqual([0]);
  });
});

describe("nearestSnapIndex", () => {
  const offsets = [600, 300, 0]; // bottom drawer: closed-ish, half, open

  it("rests at the nearest point, the midpoint deciding", () => {
    expect(nearestSnapIndex(560, offsets, "bottom", undefined, 900, 1000)).toBe(0);
    expect(nearestSnapIndex(440, offsets, "bottom", undefined, 900, 1000)).toBe(1);
    expect(nearestSnapIndex(140, offsets, "bottom", undefined, 900, 1000)).toBe(2);
    expect(nearestSnapIndex(160, offsets, "bottom", undefined, 900, 1000)).toBe(1);
  });

  it("goes to the most open point when pulled past it", () => {
    expect(nearestSnapIndex(-40, offsets, "bottom", undefined, 900, 1000)).toBe(2);
  });

  it("goes to the least open point when pushed past it", () => {
    expect(nearestSnapIndex(800, offsets, "bottom", undefined, 900, 1000)).toBe(0);
  });

  it("lets a break point move the line between two rests", () => {
    // Between 300px visible (offset 600) and 600px visible (offset 300), go
    // up as soon as 350px shows - i.e. once translate is under 550.
    const breakPoints = ["350px", null];
    expect(nearestSnapIndex(560, offsets, "bottom", breakPoints, 900, 1000)).toBe(0);
    expect(nearestSnapIndex(540, offsets, "bottom", breakPoints, 900, 1000)).toBe(1);
  });

  it("reads the same for a drawer on the other side", () => {
    const top = [-600, -300, -0];
    expect(nearestSnapIndex(-560, top, "top", undefined, 900, 1000)).toBe(0);
    expect(nearestSnapIndex(-140, top, "top", undefined, 900, 1000)).toBe(2);
  });
});

describe("closedTransform", () => {
  it("takes the drawer entirely out of view on its own side", () => {
    expect(closedTransform("bottom")).toContain("100%");
    expect(closedTransform("top")).toContain("-100%");
    expect(closedTransform("left")).toBe("translate3d(-100%, 0, 0)");
  });
});

function scroller(vertical: boolean, position: number, size: number, total: number) {
  const el = document.createElement("div");
  el.style.overflowY = vertical ? "auto" : "visible";
  el.style.overflowX = vertical ? "visible" : "auto";
  Object.defineProperties(el, {
    scrollTop: { value: vertical ? position : 0, writable: true },
    scrollLeft: { value: vertical ? 0 : position, writable: true },
    clientHeight: { value: vertical ? size : 0 },
    clientWidth: { value: vertical ? 0 : size },
    scrollHeight: { value: vertical ? total : 0 },
    scrollWidth: { value: vertical ? 0 : total },
  });
  return el;
}

describe("shouldDrag", () => {
  it("drags a bottom drawer shut only from the top of its scroller", () => {
    const boundary = document.createElement("div");
    const list = scroller(true, 0, 200, 1000);
    const row = document.createElement("div");
    list.append(row);
    boundary.append(list);
    expect(shouldDrag(row, boundary, "bottom", true, false)).toBe(true);
    list.scrollTop = 40;
    expect(shouldDrag(row, boundary, "bottom", true, false)).toBe(false);
  });

  it("opens the drawer further before scrolling, and scrolls once it cannot", () => {
    const boundary = document.createElement("div");
    const list = scroller(true, 0, 200, 1000);
    boundary.append(list);
    expect(shouldDrag(list, boundary, "bottom", false, true)).toBe(true);
    expect(shouldDrag(list, boundary, "bottom", false, false)).toBe(false);
    // Scrolled to the end, there is nothing left to scroll: pull past open.
    const ended = scroller(true, 800, 200, 1000);
    boundary.append(ended);
    expect(shouldDrag(ended, boundary, "bottom", false, false)).toBe(true);
  });

  it("reads a top drawer the other way round", () => {
    const boundary = document.createElement("div");
    const list = scroller(true, 800, 200, 1000);
    boundary.append(list);
    // Shutting a top drawer is dragging up, which the scroller at its end lets go.
    expect(shouldDrag(list, boundary, "top", true, false)).toBe(true);
    list.scrollTop = 0;
    expect(shouldDrag(list, boundary, "top", true, false)).toBe(false);
  });

  it("ignores anything that does not actually scroll", () => {
    const boundary = document.createElement("div");
    const box = scroller(true, 0, 200, 100);
    boundary.append(box);
    expect(shouldDrag(box, boundary, "bottom", true, false)).toBe(true);
  });
});

describe("locationIsDraggable", () => {
  it("leaves selects, range inputs and opted-out elements alone", () => {
    const boundary = document.createElement("div");
    const select = document.createElement("select");
    const range = document.createElement("input");
    range.type = "range";
    const opted = document.createElement("div");
    opted.setAttribute("data-drawer-no-drag", "");
    const inside = document.createElement("span");
    opted.append(inside);
    const plain = document.createElement("p");
    boundary.append(select, range, opted, plain);
    expect(locationIsDraggable(select, boundary)).toBe(false);
    expect(locationIsDraggable(range, boundary)).toBe(false);
    expect(locationIsDraggable(inside, boundary)).toBe(false);
    expect(locationIsDraggable(plain, boundary)).toBe(true);
  });
});
