import { createContext, useContext } from "solid-js";
import type { DrawerContextValue } from "./types";

export const DrawerContext = createContext<DrawerContextValue>();

/** The drawer this is inside: its state, and the things it can be told. */
export function useDrawer(): DrawerContextValue {
  return useContext(DrawerContext);
}

/** The nearest drawer, or nothing - for a root finding out whether it is nested. */
export const NestedContext = createContext<DrawerContextValue | null>(null);
