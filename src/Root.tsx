import { useContext } from "solid-js";
import type { JSX } from "@solidjs/web";
import { DrawerContext, NestedContext } from "./context";
import { createDrawer } from "./createDrawer";
import type { DrawerRootProps } from "./types";

/** The drawer's state, for every part inside it. */
export function Root(props: DrawerRootProps): JSX.Element {
  const ctx = createDrawer(props, null);
  return (
    <DrawerContext value={ctx}>
      <NestedContext value={ctx}>{props.children}</NestedContext>
    </DrawerContext>
  );
}

/**
 * A drawer inside a drawer. The one it is inside draws back as this one
 * opens, and follows this one's drag, the way a phone stacks its sheets.
 */
export function NestedRoot(props: DrawerRootProps): JSX.Element {
  const parent = useContext(NestedContext);
  const ctx = createDrawer(props, parent);
  return (
    <DrawerContext value={ctx}>
      <NestedContext value={ctx}>{props.children}</NestedContext>
    </DrawerContext>
  );
}
