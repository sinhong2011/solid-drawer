import { render } from "@solidjs/web";
import { untrack } from "solid-js";

type Component = (props: Record<string, unknown>) => unknown;

/**
 * Mounts a Solid 2 island. The default slot, if any, arrives as HTML and is
 * handed to the component as a real element.
 */
export default (element: HTMLElement) =>
  (Component: Component, props: Record<string, unknown>, slotted: Record<string, string>) => {
    let children: HTMLElement | undefined;
    if (slotted.default) {
      children = document.createElement("astro-slot");
      children.innerHTML = slotted.default;
    }
    const dispose = render(() => untrack(() => Component({ ...props, children })), element);
    element.addEventListener("astro:unmount", () => dispose(), { once: true });
  };
