import { omit } from "solid-js";
import type { JSX } from "@solidjs/web";
import { useDrawer } from "./context";
import { DRAG_START, LONG_PRESS } from "./helpers";

export interface HandleProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** A tap on the handle does nothing, rather than moving to the next snap point. */
  preventCycle?: boolean;
}

/**
 * The grab bar. What says "this moves" before anything is tried; the only
 * thing that starts a drag under `handleOnly`; and, tapped, the way to the
 * next snap point - or out, from the last one.
 *
 * Its hit area is 44px whatever its size, so it is a target and not a line.
 */
export function Handle(props: HandleProps): JSX.Element {
  const ctx = useDrawer();
  const rest = omit(props, "class", "children", "preventCycle", "onPointerDown", "onClick");
  let pressedAt = 0;
  let pressedX = 0;
  let pressedY = 0;
  return (
    <div
      data-drawer-handle=""
      data-drawer-direction={ctx.direction()}
      class={props.class}
      onPointerDown={(event) => {
        pressedAt = performance.now();
        pressedX = event.clientX;
        pressedY = event.clientY;
        ctx.onPress(event, true);
        if (typeof props.onPointerDown === "function") props.onPointerDown(event);
      }}
      onClick={(event) => {
        if (typeof props.onClick === "function") props.onClick(event);
        if (props.preventCycle) return;
        // Held, or moved: that was a grab, not a tap.
        if (performance.now() - pressedAt > LONG_PRESS) return;
        if (
          Math.abs(event.clientX - pressedX) >= DRAG_START ||
          Math.abs(event.clientY - pressedY) >= DRAG_START
        )
          return;
        ctx.cycleSnapPoints();
      }}
      {...rest}
    >
      <span data-drawer-handle-hitarea="" aria-hidden="true" />
      {props.children}
    </div>
  );
}
