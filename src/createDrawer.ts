import { createEffect, createMemo, createSignal, createUniqueId, untrack } from "solid-js";
import {
  BORDER_RADIUS,
  CLOSE_THRESHOLD,
  DRAG_START,
  NESTED_DISPLACEMENT,
  SCROLL_LOCK_TIMEOUT,
  SKIP_VELOCITY,
  TRANSITION_DURATION,
  TRANSITION_EASING,
  VELOCITY_CACHE_RESET,
  VELOCITY_THRESHOLD,
  WINDOW_TOP_OFFSET,
  axisTransform,
  clamp,
  closeSign,
  closedTransform,
  currentTranslate,
  defaultDampFunction,
  focusableIn,
  isVertical,
  locationIsDraggable,
  nearestSnapIndex,
  shouldDrag,
  snapPointOffsets,
} from "./helpers";
import type { DrawerContextValue, DrawerRootProps, SnapPoint, TransitionState } from "./types";

/**
 * Drawers that are open right now, in the order they opened. Escape and a
 * pointer outside go to the last one only: with a drawer over a drawer, one
 * key should close one sheet.
 */
const openDrawers: DrawerContextValue[] = [];
const isTop = (ctx: DrawerContextValue) => openDrawers[openDrawers.length - 1] === ctx;

/*
 * The page is pinned once, by the first modal drawer to open, and let go by
 * the last to close. A nested drawer opening over a pinned page must not pin
 * it again: the body is already `position: fixed`, so `scrollY` reads 0 and
 * a second pin would send the page to the top.
 */
let bodyLocks = 0;
let bodyLock: { position: string; top: string; width: string; offset: number } | null = null;

const lockBody = () => {
  if (bodyLocks++ > 0) return;
  const style = document.body.style;
  bodyLock = {
    position: style.position,
    top: style.top,
    width: style.width,
    offset: window.scrollY,
  };
  // Pinned at its offset rather than `overflow: hidden`, which iOS Safari
  // ignores - the page keeps rubber-banding behind the sheet.
  style.position = "fixed";
  style.top = `-${bodyLock.offset}px`;
  style.width = "100%";
};

const unlockBody = () => {
  if (--bodyLocks > 0 || !bodyLock) return;
  const style = document.body.style;
  style.position = bodyLock.position;
  style.top = bodyLock.top;
  style.width = bodyLock.width;
  // Instant whatever `scroll-behavior` the page sets: this is the page being
  // put back where it was, not a scroll.
  window.scrollTo({ top: bodyLock.offset, left: window.scrollX, behavior: "instant" });
  bodyLock = null;
};

/** A recent point on the drag, for the speed it was let go at. */
interface Sample {
  time: number;
  translate: number;
}

interface Press {
  id: number;
  x: number;
  y: number;
  time: number;
  fromHandle: boolean;
  target: Element | null;
  /** Where the drawer was when the drag began, in pixels along its axis. */
  base: number;
}

/**
 * The drawer, without any elements: everything a `Root` provides, as a
 * primitive. Give it the root's props and, for a drawer inside a drawer, the
 * parent's context.
 *
 * Props are read lazily throughout so that every one of them is reactive.
 */
export function createDrawer(
  props: DrawerRootProps,
  parent: DrawerContextValue | null = null,
): DrawerContextValue {
  const modal = () => props.modal ?? true;
  const direction = () => props.direction ?? "bottom";
  const dismissible = () => props.dismissible ?? true;
  const handleOnly = () => props.handleOnly ?? false;
  const snapPoints = () => props.snapPoints;
  const duration = () => props.transitionDuration ?? TRANSITION_DURATION;
  const easing = () => props.transitionEasing ?? TRANSITION_EASING;
  const damp = (distance: number) => (props.dampFunction ?? defaultDampFunction)(distance);
  const sign = () => closeSign(direction());
  const vertical = () => isVertical(direction());
  const container = () => props.container ?? null;
  const contentId = createUniqueId();

  /* ------------------------------------------------------------------ open */

  const [openInternal, setOpenInternal] = createSignal(props.defaultOpen ?? false, {
    ownedWrite: true,
  });
  const open = () => props.open ?? openInternal();
  const setOpen = (next: boolean) => {
    if (props.open === undefined) setOpenInternal(next);
    props.onOpenChange?.(next);
  };
  const close = () => {
    if (dismissible()) setOpen(false);
  };

  /* -------------------------------------------------------------- presence */

  /*
   * Three steps to an open drawer: in the DOM (`mounted`), painted once at its
   * closed position, then moved to its open one (`entered`) so there is a
   * transition to run. Closing is the same in reverse, and the parts leave the
   * DOM only once the closing transition has ended.
   */
  const [mounted, setMounted] = createSignal(untrack(open), { ownedWrite: true });
  const [entered, setEntered] = createSignal(false, { ownedWrite: true });
  const [transitionState, setTransitionState] = createSignal<TransitionState>(null, {
    ownedWrite: true,
  });

  /* ----------------------------------------------------------------- sizes */

  const [contentEl, setContentEl] = createSignal<HTMLElement | null>(null, { ownedWrite: true });
  const [contentSize, setContentSize] = createSignal(0, { ownedWrite: true });
  const [containerSize, setContainerSize] = createSignal(0, { ownedWrite: true });

  /** The box snap point fractions are of. */
  const boxOf = (el: HTMLElement): HTMLElement | null => {
    const given = untrack(container);
    if (given) return given;
    if (getComputedStyle(el).position === "fixed") return null;
    const parent = el.offsetParent;
    return parent instanceof HTMLElement && parent !== document.body ? parent : null;
  };

  const measure = () => {
    const el = untrack(contentEl);
    if (!el) return;
    const v = untrack(vertical);
    setContentSize(v ? el.offsetHeight : el.offsetWidth);
    const box = boxOf(el);
    setContainerSize(
      box ? (v ? box.clientHeight : box.clientWidth) : v ? window.innerHeight : window.innerWidth,
    );
  };

  createEffect(
    () => contentEl(),
    (el) => {
      if (!el) return;
      measure();
      const box = boxOf(el);
      let observer: ResizeObserver | undefined;
      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(measure);
        observer.observe(el);
        if (box) observer.observe(box);
      }
      window.addEventListener("resize", measure);
      // Content that has just scrolled is not about to be dragged.
      const onScroll = () => {
        lastScrollAt = performance.now();
      };
      el.addEventListener("scroll", onScroll, true);
      return () => {
        observer?.disconnect();
        window.removeEventListener("resize", measure);
        el.removeEventListener("scroll", onScroll, true);
      };
    },
  );

  /* ----------------------------------------------------------- snap points */

  const snapPointsOffset = createMemo(() => {
    const points = snapPoints();
    if (!points?.length) return [];
    return snapPointOffsets(points, direction(), contentSize(), containerSize());
  });

  const [activeInternal, setActiveInternal] = createSignal<SnapPoint | null>(null, {
    ownedWrite: true,
  });
  const activeSnapPoint = () =>
    props.activeSnapPoint !== undefined ? props.activeSnapPoint : activeInternal();
  const activeSnapPointIndex = createMemo(() => {
    const points = snapPoints();
    const active = activeSnapPoint();
    if (!points || active === null) return -1;
    return points.indexOf(active);
  });

  const setActiveSnapPoint = (point: SnapPoint | null) => {
    const changed = untrack(activeSnapPoint) !== point;
    if (props.activeSnapPoint === undefined) setActiveInternal(point);
    if (changed) {
      props.setActiveSnapPoint?.(point);
      props.onActiveSnapPointChange?.(point);
    }
    if (point !== null && untrack(entered)) startTransition("snapping");
  };

  /** Where the drawer rests while open, in pixels along its axis. */
  const restTranslate = () => {
    const index = activeSnapPointIndex();
    return index >= 0 ? (snapPointsOffset()[index] ?? 0) : 0;
  };

  /* -------------------------------------------------------------- geometry */

  const [isDragging, setIsDragging] = createSignal(false);
  const [dragTranslate, setDragTranslate] = createSignal(0);
  const [nestedScale, setNestedScale] = createSignal(1);
  const [nestedOffset, setNestedOffset] = createSignal(0);
  const [nestedDragging, setNestedDragging] = createSignal(false);

  const translate = () => {
    if (isDragging()) return dragTranslate();
    if (!entered() || !open()) return sign() * contentSize();
    return restTranslate();
  };

  const openPercentage = () => {
    const size = contentSize();
    if (!size) return open() ? 1 : 0;
    return 1 - (translate() * sign()) / size;
  };

  /**
   * The overlay is solid at the snap point it fades from, gone at the one
   * below it (or at closed, from the first), and in between in between. The
   * one formula also covers a drawer with no snap points, where it fades
   * over the whole travel.
   */
  const overlayOpacity = () => {
    if (!open() || !entered()) return 0;
    const offsets = snapPointsOffset();
    const size = contentSize();
    const t = translate();
    const s = sign();
    if (!offsets.length) return size ? clamp(1 - (t * s) / size, 0, 1) : 1;
    const fade = clamp(props.fadeFromIndex ?? offsets.length - 1, 0, offsets.length - 1);
    const full = offsets[fade] as number;
    const none = fade > 0 ? (offsets[fade - 1] as number) : s * size;
    if (none === full) return 1;
    return clamp((none - t) / (none - full), 0, 1);
  };

  const nestedTransform = () => {
    const scale = nestedScale();
    const offset = nestedOffset();
    if (scale === 1 && offset === 0) return "";
    const away = -sign() * offset;
    const shift = vertical() ? `translate3d(0, ${away}px, 0)` : `translate3d(${away}px, 0, 0)`;
    return `scale(${scale}) ${shift}`;
  };

  const contentTransform = () => {
    const base = entered() ? axisTransform(direction(), translate()) : closedTransform(direction());
    const nested = nestedTransform();
    return nested ? `${nested} ${base}` : base;
  };

  const contentTransition = () => {
    if (isDragging() || nestedDragging()) return "none";
    const settle = `${duration()}ms ${easing()}`;
    const size = props.transitionResize ? `, ${vertical() ? "height" : "width"} ${settle}` : "";
    return `transform ${settle}${size}`;
  };

  /* ----------------------------------------------------------- transitions */

  let endTimer: number | undefined;

  const finishTransition = () => {
    window.clearTimeout(endTimer);
    const state = untrack(transitionState);
    if (!state) return;
    setTransitionState(null);
    if (state === "closing") {
      setMounted(false);
      props.onAnimationEnd?.(false);
    } else if (state === "opening") {
      props.onAnimationEnd?.(true);
    }
  };

  /** Begins a settle, with a clock in case `transitionend` never comes. */
  const startTransition = (state: Exclude<TransitionState, null>) => {
    setTransitionState(state);
    window.clearTimeout(endTimer);
    endTimer = window.setTimeout(finishTransition, untrack(duration) + 50);
  };

  const onTransitionEnd = (event: TransitionEvent) => {
    if (event.target !== untrack(contentEl)) return;
    const state = untrack(transitionState);
    const sizeProperty = untrack(vertical) ? "height" : "width";
    if (
      state === "resizing"
        ? event.propertyName === sizeProperty
        : event.propertyName === "transform"
    )
      finishTransition();
  };

  /* --------------------------------------------------------- open sequence */

  let enterFrame = 0;

  createEffect(
    () => open(),
    (isOpen, wasOpen) => {
      window.cancelAnimationFrame(enterFrame);
      if (isOpen) {
        setMounted(true);
        openDrawers.push(ctx);
        const points = untrack(snapPoints);
        if (points?.length && untrack(activeSnapPoint) === null) {
          setActiveSnapPoint(
            untrack(() => props.defaultActiveSnapPoint) ?? (points[0] as SnapPoint),
          );
        }
        startTransition("opening");
        // The parts mount on this flush and paint closed; the frame after,
        // they are moved, and the browser has a start state to run from.
        enterFrame = window.requestAnimationFrame(() => {
          measure();
          untrack(contentEl)?.getBoundingClientRect();
          setEntered(true);
        });
        parent?.nested.onOpenChange(true);
        return;
      }
      const at = openDrawers.indexOf(ctx);
      if (at >= 0) openDrawers.splice(at, 1);
      if (untrack(mounted)) {
        setEntered(false);
        startTransition("closing");
      }
      if (wasOpen !== undefined) {
        setActiveSnapPoint(null);
        parent?.nested.onOpenChange(false);
      }
    },
  );

  /* ---------------------------------------------------------------- gesture */

  let press: Press | null = null;
  let dragging = false;
  let lastScrollAt = 0;
  let samples: Sample[] = [];

  const along = (event: PointerEvent) => (untrack(vertical) ? event.clientY : event.clientX);
  const across = (event: PointerEvent) => (untrack(vertical) ? event.clientX : event.clientY);

  /*
   * The rest of a gesture is heard on the window, not on the drawer: a quick
   * flick from the handle has left the drawer before its first move arrives.
   * Once the gesture is a drag the pointer is captured, so nothing underneath
   * gets the moves either.
   */
  const listen = () => {
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onRelease);
    window.addEventListener("pointercancel", onRelease);
  };
  const unlisten = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onRelease);
    window.removeEventListener("pointercancel", onRelease);
  };
  const abandon = () => {
    press = null;
    dragging = false;
    unlisten();
  };

  const onPress = (event: PointerEvent, fromHandle = false) => {
    // The handle's press reaches the content too; the first one counts.
    if (press) return;
    if (event.button !== 0 && event.pointerType === "mouse") return;
    if (!dismissible() && !snapPoints()) return;
    if (handleOnly() && !fromHandle) return;
    const target = event.target instanceof Element ? event.target : null;
    // Solid delegates pointer events up the component tree, portals and all,
    // so a press in a nested drawer's content reaches the drawer it is in.
    // It is the innermost content's press, and nobody else's.
    if (target && target.closest("[data-drawer-content]") !== untrack(contentEl)) return;
    if (!fromHandle && !locationIsDraggable(target, untrack(contentEl))) return;
    press = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      time: performance.now(),
      fromHandle,
      target,
      base: 0,
    };
    dragging = false;
    listen();
  };

  /** The speed at release, in pixels per millisecond, positive towards closed. */
  const velocityAt = (now: number, translateNow: number): number => {
    // The newest sample that is old enough to measure against.
    const past = [...samples].reverse().find((sample) => now - sample.time >= 40) ?? samples[0];
    if (!past || now === past.time) return 0;
    return ((translateNow - past.translate) / (now - past.time)) * untrack(sign);
  };

  const onMove = (event: PointerEvent) => {
    if (!press || event.pointerId !== press.id) return;
    const el = untrack(contentEl);
    if (!el) return;
    const delta = along(event) - (untrack(vertical) ? press.y : press.x);
    const s = untrack(sign);

    if (!dragging) {
      const crossDelta = across(event) - (untrack(vertical) ? press.x : press.y);
      if (Math.abs(delta) < DRAG_START && Math.abs(crossDelta) < DRAG_START) return;
      if (Math.abs(crossDelta) > Math.abs(delta)) return abandon();
      if (!press.fromHandle) {
        if (window.getSelection()?.toString()) return abandon();
        const lockout = props.scrollLockTimeout ?? SCROLL_LOCK_TIMEOUT;
        if (lastScrollAt && performance.now() - lastScrollAt < lockout) return abandon();
        const offsets = untrack(snapPointsOffset);
        const canOpenMore =
          offsets.length > 0 && untrack(activeSnapPointIndex) < offsets.length - 1;
        if (!shouldDrag(press.target, el, untrack(direction), delta * s > 0, canOpenMore))
          return abandon();
      }
      dragging = true;
      // Grabbed mid-settle, it starts from wherever it had got to.
      press.base = currentTranslate(el, untrack(direction)) ?? untrack(translate);
      window.clearTimeout(endTimer);
      setTransitionState(null);
      setIsDragging(true);
      setDragTranslate(press.base);
      try {
        el.setPointerCapture(event.pointerId);
      } catch {
        // A synthetic pointer, or one already gone: the window listeners suffice.
      }
      samples = [{ time: performance.now(), translate: press.base }];
    }

    let next = press.base + delta;
    const offsets = untrack(snapPointsOffset);
    if (offsets.length) {
      const mostOpen = offsets[offsets.length - 1] as number;
      const leastOpen = offsets[0] as number;
      if ((next - mostOpen) * s < 0) next = mostOpen - s * damp(Math.abs(next - mostOpen));
      else if (!dismissible() && (next - leastOpen) * s > 0)
        next = leastOpen + s * damp(Math.abs(next - leastOpen));
    } else if (next * s < 0) {
      next = -s * damp(Math.abs(next));
    }
    setDragTranslate(next);

    const now = performance.now();
    samples.push({ time: now, translate: next });
    samples = samples.filter((sample) => now - sample.time <= VELOCITY_CACHE_RESET);

    const visible = Math.max(1, untrack(contentSize) - Math.abs(press.base));
    const percentage = clamp(((next - press.base) * s) / visible, 0, 1);
    props.onDrag?.(event, percentage);
    parent?.nested.onDrag(percentage);
    scaleFollow(percentage);
  };

  const onRelease = (event: PointerEvent) => {
    if (!press || event.pointerId !== press.id) return;
    const el = untrack(contentEl);
    const wasDragging = dragging;
    const base = press.base;
    press = null;
    dragging = false;
    unlisten();
    if (!wasDragging) return;
    try {
      el?.releasePointerCapture(event.pointerId);
    } catch {
      // Never captured; nothing to release.
    }

    const t = untrack(dragTranslate);
    const s = untrack(sign);
    const velocity = velocityAt(performance.now(), t);
    const offsets = untrack(snapPointsOffset);
    const size = untrack(contentSize);
    const threshold = props.velocityThreshold ?? VELOCITY_THRESHOLD;
    const closeThreshold = props.closeThreshold ?? CLOSE_THRESHOLD;
    let stayOpen = true;

    if (offsets.length) {
      const index = untrack(activeSnapPointIndex);
      const last = offsets.length - 1;
      let target: number;
      if (Math.abs(velocity) > threshold) {
        const towardsClosed = velocity > 0;
        if (!props.snapToSequentialPoint && Math.abs(velocity) > SKIP_VELOCITY)
          target = towardsClosed ? -1 : last;
        else target = towardsClosed ? index - 1 : Math.min(last, index + 1);
      } else {
        target = nearestSnapIndex(
          t,
          offsets,
          untrack(direction),
          props.breakPoints,
          size,
          untrack(containerSize),
        );
        // Dropped well under the lowest rest, it was being put away.
        const first = offsets[0] as number;
        const visibleAtFirst = Math.max(1, size - Math.abs(first));
        if ((t - first) * s > visibleAtFirst * closeThreshold) target = -1;
      }
      if (target < 0 && !dismissible()) target = 0;
      setIsDragging(false);
      if (target < 0) {
        stayOpen = false;
        setOpen(false);
      } else {
        const points = untrack(snapPoints) as SnapPoint[];
        setActiveSnapPoint(points[target] as SnapPoint);
        startTransition("snapping");
      }
    } else {
      const closeward = (t - base) * s;
      setIsDragging(false);
      if (dismissible() && (velocity > threshold || closeward >= size * closeThreshold)) {
        stayOpen = false;
        setOpen(false);
      } else {
        startTransition("snapping");
      }
    }

    props.onRelease?.(event, stayOpen);
    parent?.nested.onRelease(stayOpen);
    scaleRelease();
  };

  const cycleSnapPoints = () => {
    const points = untrack(snapPoints);
    if (!points?.length) {
      close();
      return;
    }
    const index = untrack(activeSnapPointIndex);
    if (index < points.length - 1) setActiveSnapPoint(points[index + 1] as SnapPoint);
    else if (dismissible()) setOpen(false);
    else setActiveSnapPoint(points[0] as SnapPoint);
  };

  /* -------------------------------------------------------------- keyboard */

  createEffect(
    () => open(),
    (isOpen) => {
      if (!isOpen) return;
      const onKey = (event: KeyboardEvent) => {
        if (event.key !== "Escape" || !isTop(ctx)) return;
        props.onEscapeKeyDown?.(event);
        if (event.defaultPrevented || !dismissible()) return;
        event.preventDefault();
        setOpen(false);
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    },
  );

  /* --------------------------------------------------------------- outside */

  createEffect(
    () => open() && modal(),
    (on) => {
      if (!on) return;
      const onDown = (event: PointerEvent) => {
        const el = untrack(contentEl);
        const target = event.target instanceof Node ? event.target : null;
        if (!el || !target || el.contains(target) || !isTop(ctx)) return;
        // The trigger toggles; closing here as well would open it straight back.
        if (target instanceof Element && target.closest("[data-drawer-trigger]")) return;
        props.onPointerDownOutside?.(event);
        if (event.defaultPrevented || !dismissible()) return;
        setOpen(false);
      };
      document.addEventListener("pointerdown", onDown, true);
      return () => document.removeEventListener("pointerdown", onDown, true);
    },
  );

  /* ----------------------------------------------------------------- focus */

  createEffect(
    () => entered() && modal(),
    (on) => {
      if (!on) return;
      const el = untrack(contentEl);
      if (!el) return;
      const previous =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const first = untrack(() => props.autoFocus)
        ? (el.querySelector<HTMLElement>("[autofocus]") ?? focusableIn(el)[0] ?? el)
        : el;
      first.focus({ preventScroll: true });
      const onKey = (event: KeyboardEvent) => {
        if (event.key !== "Tab") return;
        const items = focusableIn(el);
        if (!items.length) {
          event.preventDefault();
          el.focus();
          return;
        }
        const head = items[0] as HTMLElement;
        const tail = items[items.length - 1] as HTMLElement;
        const active = document.activeElement;
        if (event.shiftKey && (active === head || active === el)) {
          event.preventDefault();
          tail.focus();
        } else if (!event.shiftKey && active === tail) {
          event.preventDefault();
          head.focus();
        }
      };
      el.addEventListener("keydown", onKey);
      return () => {
        el.removeEventListener("keydown", onKey);
        if (untrack(() => props.restoreFocus) !== false) previous?.focus({ preventScroll: true });
      };
    },
  );

  /* ------------------------------------------------------------- body lock */

  createEffect(
    () => mounted() && modal() && !props.disablePreventScroll && !props.noBodyStyles,
    (lock) => {
      if (!lock) return;
      lockBody();
      return unlockBody;
    },
  );

  /* ------------------------------------------------------ scale background */

  const wrapper = () =>
    props.shouldScaleBackground && untrack(modal)
      ? document.querySelector<HTMLElement>("[data-drawer-wrapper]")
      : null;

  /** The page drawn back by how shut the drawer is, 0 all the way back to 1 as it was. */
  const applyScale = (el: HTMLElement, percentage: number) => {
    const scale = (window.innerWidth - WINDOW_TOP_OFFSET) / window.innerWidth;
    const size = Math.min(scale + percentage * (1 - scale), 1);
    const shift = Math.max(0, 14 - percentage * 14);
    const away = untrack(vertical)
      ? `translate3d(0, calc(env(safe-area-inset-top, 0px) + ${shift}px), 0)`
      : `translate3d(calc(env(safe-area-inset-left, 0px) + ${shift}px), 0, 0)`;
    el.style.transform = `scale(${size}) ${away}`;
    el.style.borderRadius = `${BORDER_RADIUS - percentage * BORDER_RADIUS}px`;
  };

  const scaleFollow = (percentage: number) => {
    const el = wrapper();
    if (!el) return;
    el.style.transition = "none";
    applyScale(el, percentage);
  };
  const scaleRelease = () => {
    const el = wrapper();
    if (!el) return;
    el.style.transition = `transform ${duration()}ms ${easing()}, border-radius ${duration()}ms ${easing()}`;
    applyScale(el, 0);
  };

  createEffect(
    () => open() && Boolean(props.shouldScaleBackground) && modal(),
    (on) => {
      if (!on) return;
      const el = document.querySelector<HTMLElement>("[data-drawer-wrapper]");
      if (!el) return;
      const body = document.body.style;
      const was = {
        background: body.background,
        transition: el.style.transition,
        origin: el.style.transformOrigin,
        overflow: el.style.overflow,
        radius: el.style.borderRadius,
      };
      const paint = untrack(() => props.setBackgroundColorOnScale !== false && !props.noBodyStyles);
      if (paint) body.background = "black";
      const settle = `${untrack(duration)}ms ${untrack(easing)}`;
      el.style.transition = `transform ${settle}, border-radius ${settle}`;
      el.style.transformOrigin = untrack(vertical) ? "center top" : "left center";
      el.style.overflow = "hidden";
      const frame = window.requestAnimationFrame(() => applyScale(el, 0));
      return () => {
        window.cancelAnimationFrame(frame);
        el.style.transform = "";
        el.style.borderRadius = was.radius;
        // The ground and the clip come off once the page has grown back.
        window.setTimeout(() => {
          body.background = was.background;
          el.style.transition = was.transition;
          el.style.transformOrigin = was.origin;
          el.style.overflow = was.overflow;
        }, untrack(duration));
      };
    },
  );

  /* ------------------------------------------------------ reposition inputs */

  createEffect(
    () => open() && (props.repositionInputs ?? true) && direction() === "bottom",
    (on) => {
      const viewport = window.visualViewport;
      if (!on || !viewport) return;
      const el = untrack(contentEl);
      if (!el) return;
      // What the consumer set inline, to give back - not a blank, which
      // would wipe a `max-height` of their own (#9).
      const was = { bottom: el.style.bottom, maxHeight: el.style.maxHeight };
      const restore = () => {
        el.style.bottom = was.bottom;
        el.style.maxHeight = was.maxHeight;
      };
      const onResize = () => {
        const focused = document.activeElement;
        const typing =
          focused instanceof HTMLInputElement ||
          focused instanceof HTMLTextAreaElement ||
          (focused instanceof HTMLElement && focused.isContentEditable);
        const keyboard = window.innerHeight - viewport.height;
        if (keyboard > 60 || (typing && keyboard > 0)) {
          // Lifted above the keyboard, and no taller than what is left.
          el.style.bottom = `${keyboard}px`;
          el.style.maxHeight = `${viewport.height - WINDOW_TOP_OFFSET}px`;
        } else {
          restore();
        }
      };
      viewport.addEventListener("resize", onResize);
      return () => {
        viewport.removeEventListener("resize", onResize);
        restore();
      };
    },
  );

  /* ------------------------------------------------------ transition resize */

  createEffect(
    () => (mounted() && props.transitionResize ? contentEl() : null),
    (el) => {
      if (!el || typeof ResizeObserver === "undefined") return;
      const property = untrack(vertical) ? "height" : "width";
      let last = untrack(vertical) ? el.offsetHeight : el.offsetWidth;
      let resizing = false;
      const observer = new ResizeObserver(() => {
        if (resizing || untrack(isDragging)) return;
        const size = untrack(vertical) ? el.offsetHeight : el.offsetWidth;
        const state = untrack(transitionState);
        // A drawer on its way out is not resized: its size no longer shows,
        // and a resize in place of the close would leave the drawer mounted,
        // its overlay over the page, once the close ended unheard.
        if (state === "closing" || last === 0 || Math.abs(size - last) < 1) {
          last = size;
          return;
        }
        const from = last;
        last = size;
        resizing = true;
        // The consumer's own inline size, if any, comes back afterwards.
        const was = el.style[property];
        // Held at the old size for a paint, then let go to the new one.
        el.style[property] = `${from}px`;
        el.getBoundingClientRect();
        // An opening settle keeps its state: the size animates alongside it,
        // and the open is still reported when the transform ends.
        if (state === null) startTransition("resizing");
        el.style[property] = `${size}px`;
        const done = () => {
          el.removeEventListener("transitionend", onEnd);
          window.clearTimeout(timer);
          el.style[property] = was;
          resizing = false;
          measure();
        };
        const onEnd = (event: TransitionEvent) => {
          if (event.target === el && event.propertyName === property) done();
        };
        el.addEventListener("transitionend", onEnd);
        const timer = window.setTimeout(done, duration() + 50);
      });
      observer.observe(el);
      return () => observer.disconnect();
    },
  );

  /* ---------------------------------------------------------------- nested */

  const nestedScale0 = () => (window.innerWidth - NESTED_DISPLACEMENT) / window.innerWidth;
  const nested = {
    onOpenChange: (isOpen: boolean) => {
      setNestedDragging(false);
      setNestedScale(isOpen ? nestedScale0() : 1);
      setNestedOffset(isOpen ? NESTED_DISPLACEMENT : 0);
    },
    onDrag: (percentage: number) => {
      const scale = nestedScale0();
      setNestedDragging(true);
      setNestedScale(Math.min(scale + percentage * (1 - scale), 1));
      setNestedOffset(Math.max(0, NESTED_DISPLACEMENT - percentage * NESTED_DISPLACEMENT));
    },
    onRelease: (isOpen: boolean) => nested.onOpenChange(isOpen),
  };

  /* -------------------------------------------------------------- labelling */

  const [titleId, setTitleId] = createSignal<string | undefined>(undefined, { ownedWrite: true });
  const [descriptionId, setDescriptionId] = createSignal<string | undefined>(undefined, {
    ownedWrite: true,
  });
  const registerTitle = (id: string) => {
    setTitleId(id);
    return () => setTitleId((current) => (current === id ? undefined : current));
  };
  const registerDescription = (id: string) => {
    setDescriptionId(id);
    return () => setDescriptionId((current) => (current === id ? undefined : current));
  };

  const ctx: DrawerContextValue = {
    open,
    setOpen,
    close,
    mounted,
    modal,
    direction,
    dismissible,
    handleOnly,
    snapPoints,
    snapPointsOffset,
    activeSnapPoint,
    setActiveSnapPoint,
    activeSnapPointIndex,
    cycleSnapPoints,
    isDragging,
    isTransitioning: () => transitionState() !== null,
    transitionState,
    translate,
    openPercentage,
    overlayOpacity,
    contentTransform,
    contentTransition,
    contentSize,
    contentEl,
    setContentEl,
    container,
    contentId,
    titleId,
    descriptionId,
    registerTitle,
    registerDescription,
    onPress,
    onTransitionEnd,
    nested,
  };
  return ctx;
}
