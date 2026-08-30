import { Root, NestedRoot } from "./Root";
import { Content } from "./Content";
import { Overlay } from "./Overlay";
import { Handle } from "./Handle";
import { Portal } from "./Portal";
import { Close, Description, Title, Trigger } from "./parts";

export { Root, NestedRoot, Content, Overlay, Handle, Portal, Trigger, Close, Title, Description };
export type { ContentProps } from "./Content";
export type { OverlayProps } from "./Overlay";
export type { HandleProps } from "./Handle";
export type { CloseProps, DescriptionProps, TitleProps, TriggerProps } from "./parts";
export { useDrawer, DrawerContext } from "./context";
export { createDrawer } from "./createDrawer";
export {
  CLOSE_THRESHOLD,
  TRANSITION_DURATION,
  TRANSITION_EASING,
  VELOCITY_THRESHOLD,
  defaultDampFunction,
  nearestSnapIndex,
  resolveSnapPoint,
  shouldDrag,
  snapPointOffsets,
} from "./helpers";
export type {
  DrawerContextValue,
  DrawerDirection,
  DrawerRootProps,
  SnapPoint,
  TransitionState,
} from "./types";

/** Every part, under one name: `<Drawer.Root>`, `<Drawer.Content>`, and so on. */
export const Drawer = {
  Root,
  NestedRoot,
  Portal,
  Overlay,
  Content,
  Handle,
  Trigger,
  Close,
  Title,
  Description,
};
