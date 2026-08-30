import { Show, omit } from "solid-js";
import type { JSX } from "@solidjs/web";
import { useDrawer } from "./context";

export interface ContentProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "style" | "ref"> {
  /** Inline styles, merged under the drawer's own transform and transition. */
  style?: JSX.CSSProperties;
  ref?: (el: HTMLDivElement) => void;
}

/**
 * The sheet itself. Position it with your own classes - `fixed inset-x-0
 * bottom-0` for a bottom drawer over the window, `absolute` for one inside a
 * panel - and it moves itself: the transform, the transition, the drag.
 *
 * Anything inside that scrolls should carry `touch-action: pan-y` (or
 * `pan-x` for a side drawer): the drawer takes `touch-action: none` so a
 * finger on it is a drag and not a page scroll, and a scroller has to say
 * it wants the finger back.
 */
export function Content(props: ContentProps): JSX.Element {
  const ctx = useDrawer();
  const rest = omit(props, "class", "style", "children", "ref", "onPointerDown", "onTransitionEnd");
  const snapHeight = () => {
    const index = ctx.activeSnapPointIndex();
    const offset = ctx.snapPointsOffset()[index];
    return offset === undefined ? undefined : `${ctx.contentSize() - Math.abs(offset)}px`;
  };
  return (
    <Show when={ctx.mounted()}>
      <div
        ref={(el) => {
          ctx.setContentEl(el);
          props.ref?.(el);
        }}
        id={ctx.contentId}
        role="dialog"
        aria-modal={ctx.modal() ? "true" : undefined}
        aria-labelledby={ctx.titleId()}
        aria-describedby={ctx.descriptionId()}
        tabindex="-1"
        data-drawer-content=""
        data-state={ctx.open() ? "open" : "closed"}
        data-drawer-direction={ctx.direction()}
        data-drawer-snap-points={ctx.snapPoints()?.length ? "" : undefined}
        data-dragging={ctx.isDragging() ? "" : undefined}
        data-transitioning={ctx.isTransitioning() ? "" : undefined}
        data-transition-state={ctx.transitionState() ?? undefined}
        class={props.class}
        style={{
          ...props.style,
          transform: ctx.contentTransform(),
          transition: ctx.contentTransition(),
          "touch-action": "none",
          "--snap-point-height": snapHeight(),
          "--drawer-translate": `${ctx.translate()}px`,
        }}
        onPointerDown={(event) => {
          ctx.onPress(event);
          if (typeof props.onPointerDown === "function") props.onPointerDown(event);
        }}
        onTransitionEnd={(event) => {
          ctx.onTransitionEnd(event);
          if (typeof props.onTransitionEnd === "function") props.onTransitionEnd(event);
        }}
        {...rest}
      >
        {props.children}
      </div>
    </Show>
  );
}
