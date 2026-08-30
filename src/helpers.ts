import type { DrawerDirection, SnapPoint } from "./types";

/** Vaul's settle: half a second, most of it in the first tenth. */
export const TRANSITION_DURATION = 500;
export const TRANSITION_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";
/** A fling, in pixels per millisecond. */
export const VELOCITY_THRESHOLD = 0.4;
/** A fling fast enough to skip every snap point on the way. */
export const SKIP_VELOCITY = 2;
export const CLOSE_THRESHOLD = 0.25;
export const SCROLL_LOCK_TIMEOUT = 100;
/** Past this many pixels a touch is a drag, not a tap on something inside. */
export const DRAG_START = 4;
/** How long a velocity sample is kept before a fresh one replaces it. */
export const VELOCITY_CACHE_RESET = 200;
/** A tap on the handle held longer than this is a grab, not a tap. */
export const LONG_PRESS = 250;
export const BORDER_RADIUS = 8;
export const NESTED_DISPLACEMENT = 16;
export const WINDOW_TOP_OFFSET = 26;

export const isVertical = (direction: DrawerDirection) =>
  direction === "top" || direction === "bottom";

/** +1 where moving the drawer along its axis in the positive direction closes it. */
export const closeSign = (direction: DrawerDirection) =>
  direction === "bottom" || direction === "right" ? 1 : -1;

/** The transform that takes a drawer entirely out of its container. */
export function closedTransform(direction: DrawerDirection): string {
  switch (direction) {
    case "bottom":
      return "translate3d(0, 100%, 0)";
    case "top":
      return "translate3d(0, -100%, 0)";
    case "right":
      return "translate3d(100%, 0, 0)";
    case "left":
      return "translate3d(-100%, 0, 0)";
  }
}

export function axisTransform(direction: DrawerDirection, px: number): string {
  return isVertical(direction) ? `translate3d(0, ${px}px, 0)` : `translate3d(${px}px, 0, 0)`;
}

/** corvu's resistance: far enough to feel, never far enough to leave. */
export const defaultDampFunction = (distance: number) => 6 * Math.log(distance + 1);

/** The visible size a snap point asks for, in pixels. */
export function resolveSnapPoint(point: SnapPoint, containerSize: number): number {
  if (typeof point === "string") {
    const px = Number.parseFloat(point);
    return Number.isFinite(px) ? px : 0;
  }
  return point * containerSize;
}

/**
 * Each snap point as the drawer's translate at rest there. The drawer's far
 * edge sits on the container's edge, so showing `visible` pixels of it means
 * moving it by the rest of its size.
 */
export function snapPointOffsets(
  points: SnapPoint[],
  direction: DrawerDirection,
  contentSize: number,
  containerSize: number,
): number[] {
  const sign = closeSign(direction);
  return points.map((point) => {
    const visible = resolveSnapPoint(point, containerSize);
    return sign * Math.max(0, contentSize - visible);
  });
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Where a dropped drawer comes to rest.
 *
 * Between two snap points the midpoint decides, unless a break point was
 * given for that gap. Offsets are compared as distances from open, so the
 * same code serves every direction.
 */
export function nearestSnapIndex(
  translate: number,
  offsets: number[],
  direction: DrawerDirection,
  breakPoints: (SnapPoint | null)[] | undefined,
  contentSize: number,
  containerSize: number,
): number {
  if (offsets.length === 0) return -1;
  const sign = closeSign(direction);
  // Distances from fully open: larger is more closed. Offsets run most
  // closed (index 0) to most open (last).
  const here = translate * sign;
  const dist = offsets.map((offset) => offset * sign);
  for (let i = dist.length - 1; i > 0; i--) {
    const upper = dist[i] as number;
    const lower = dist[i - 1] as number;
    if (here <= upper) return i;
    if (here >= lower) continue;
    const point = breakPoints?.[i - 1];
    // The break point is a visible size; more visible is a smaller distance.
    const cut =
      point === null || point === undefined
        ? (upper + lower) / 2
        : contentSize - resolveSnapPoint(point, containerSize);
    return here <= cut ? i : i - 1;
  }
  return 0;
}

/** Whether a press here may become a drag, from Vaul and corvu's lists. */
export function locationIsDraggable(target: Element | null, boundary: Element | null): boolean {
  let el: Element | null = target;
  while (el && el !== boundary) {
    if (el.hasAttribute("data-drawer-no-drag")) return false;
    if (el.tagName === "SELECT") return false;
    if (el instanceof HTMLInputElement && el.type === "range") return false;
    el = el.parentElement;
  }
  return true;
}

/** Whether `el` scrolls along an axis - by its overflow, and by having more than fits. */
function scrolls(el: Element, vertical: boolean): boolean {
  const style = getComputedStyle(el);
  const overflow = vertical ? style.overflowY : style.overflowX;
  if (overflow !== "auto" && overflow !== "scroll") return false;
  return vertical ? el.scrollHeight > el.clientHeight : el.scrollWidth > el.clientWidth;
}

/**
 * Whether the drag should win over the content's own scrolling.
 *
 * A finger moving the drawer shut must find every scroller between it and
 * the drawer at its start, or it is scrolling. A finger moving the drawer
 * open is opening it while there is somewhere more open to go, and past that
 * it is scrolling if the scroller has anywhere to go.
 */
export function shouldDrag(
  target: Element | null,
  boundary: Element | null,
  direction: DrawerDirection,
  closeward: boolean,
  canOpenMore: boolean,
): boolean {
  const vertical = isVertical(direction);
  // The drawer's near edge is the scroller's start for bottom/right, its end
  // for top/left: pulling a top drawer shut means dragging up, which is the
  // scroller's "end" direction.
  const towardsStart = closeward === (direction === "bottom" || direction === "right");
  let el: Element | null = target;
  while (el && el !== boundary) {
    if (scrolls(el, vertical)) {
      const position = vertical ? el.scrollTop : el.scrollLeft;
      const size = vertical ? el.clientHeight : el.clientWidth;
      const total = vertical ? el.scrollHeight : el.scrollWidth;
      const atStart = position <= 0;
      const atEnd = position + size >= total - 1;
      if (closeward) {
        if (!(towardsStart ? atStart : atEnd)) return false;
      } else {
        if (canOpenMore) return true;
        if (!(towardsStart ? atStart : atEnd)) return false;
      }
    }
    el = el.parentElement;
  }
  return true;
}

/** The element's current transform along the axis, for a grab mid-animation. */
export function currentTranslate(el: HTMLElement, direction: DrawerDirection): number | null {
  const transform = getComputedStyle(el).transform;
  if (!transform || transform === "none") return null;
  let match = transform.match(/^matrix3d\((.+)\)$/);
  if (match) {
    const parts = (match[1] as string).split(", ");
    return Number.parseFloat(parts[isVertical(direction) ? 13 : 12] as string);
  }
  match = transform.match(/^matrix\((.+)\)$/);
  if (match) {
    const parts = (match[1] as string).split(", ");
    return Number.parseFloat(parts[isVertical(direction) ? 5 : 4] as string);
  }
  return null;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

export function focusableIn(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute("inert") && el.getClientRects().length > 0,
  );
}
