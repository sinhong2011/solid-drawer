import { Portal as SolidPortal } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { useDrawer } from "./context";

/**
 * Takes the overlay and content out of the page's flow, into the root's
 * `container` or the body. Leave it out for a drawer that belongs to one
 * panel and should stay inside it.
 */
export function Portal(props: { children: JSX.Element }): JSX.Element {
  const ctx = useDrawer();
  return <SolidPortal mount={ctx.container() ?? undefined}>{props.children}</SolidPortal>;
}
