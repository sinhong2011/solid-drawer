import { Show, omit } from "solid-js";
import type { JSX } from "@solidjs/web";
import { useDrawer } from "./context";
import { TRANSITION_DURATION, TRANSITION_EASING } from "./helpers";

export interface OverlayProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "style"> {
  style?: JSX.CSSProperties;
}

/**
 * The scrim. Its opacity follows the drawer - solid at the snap point it
 * fades from, gone below it - so it can be styled as a plain dark layer.
 * Position it yourself, `fixed inset-0` as a rule.
 */
export function Overlay(props: OverlayProps): JSX.Element {
  const ctx = useDrawer();
  const rest = omit(props, "class", "style", "onClick");
  return (
    <Show when={ctx.mounted()}>
      <div
        data-drawer-overlay=""
        data-state={ctx.open() ? "open" : "closed"}
        data-drawer-direction={ctx.direction()}
        aria-hidden="true"
        class={props.class}
        style={{
          ...props.style,
          opacity: ctx.overlayOpacity(),
          transition: ctx.isDragging()
            ? "none"
            : `opacity ${TRANSITION_DURATION}ms ${TRANSITION_EASING}`,
          "pointer-events": ctx.modal() ? undefined : "none",
        }}
        onClick={(event) => {
          if (typeof props.onClick === "function") props.onClick(event);
          // A modal drawer already hears the pointer outside itself.
          if (!ctx.modal()) ctx.close();
        }}
        {...rest}
      />
    </Show>
  );
}
