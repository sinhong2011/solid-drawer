/* The Root's props, one row each, as the docs table shows them. Mirrors
   `DrawerRootProps` in src/types.ts; backticks in a description become code. */

export type PropRow = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

export const rootProps: PropRow[] = [
  { name: "open", type: "boolean", description: "Controlled open state." },
  {
    name: "defaultOpen",
    type: "boolean",
    default: "false",
    description: "Open state to start from, when uncontrolled.",
  },
  {
    name: "onOpenChange",
    type: "(open: boolean) => void",
    description: "Told when the drawer wants to open or close - by gesture, key, or part.",
  },
  {
    name: "modal",
    type: "boolean",
    default: "true",
    description:
      "A scrim, focus held inside, Escape to leave, the page pinned, a pointer outside closes. `false` leaves the page live underneath.",
  },
  {
    name: "direction",
    type: '"top" | "bottom" | "left" | "right"',
    default: '"bottom"',
    description: "The edge the drawer is attached to and slides in from.",
  },
  {
    name: "container",
    type: "HTMLElement | null",
    description:
      "The element the drawer lives in: the `Portal` mounts into it and snap point fractions are of its size. Without one, fractions are of the content's positioned ancestor, else the window.",
  },
  {
    name: "dismissible",
    type: "boolean",
    default: "true",
    description:
      "Whether a drag, Escape or a pointer outside may close it. `DrawerClose` always can.",
  },
  {
    name: "handleOnly",
    type: "boolean",
    default: "false",
    description: "Only the `Handle` starts a drag; the content is left to scroll.",
  },
  {
    name: "snapPoints",
    type: "SnapPoint[]",
    description:
      "Rest positions, least to most open. A number is a fraction of the container, a string is pixels; either says how much of the drawer shows. Omit for open-or-closed.",
  },
  {
    name: "activeSnapPoint",
    type: "SnapPoint | null",
    description: "Controlled active snap point, by value. `null` while closed.",
  },
  {
    name: "defaultActiveSnapPoint",
    type: "SnapPoint",
    default: "the first",
    description: "The snap point to open at, when uncontrolled.",
  },
  {
    name: "setActiveSnapPoint",
    type: "(point: SnapPoint | null) => void",
    description:
      "Told when the drawer comes to rest at a snap point. `onActiveSnapPointChange` is the same callback under corvu's name.",
  },
  {
    name: "fadeFromIndex",
    type: "number",
    default: "the last",
    description:
      "The snap point the overlay is fully visible from; below it the overlay fades out.",
  },
  {
    name: "snapToSequentialPoint",
    type: "boolean",
    default: "false",
    description: "A fling moves one snap point at a time rather than to the end of the throw.",
  },
  {
    name: "breakPoints",
    type: "(SnapPoint | null)[]",
    default: "midpoints",
    description:
      "Where between two snap points a released drawer goes up rather than down, one entry per gap; `null` keeps the midpoint.",
  },
  {
    name: "closeThreshold",
    type: "number",
    default: "0.25",
    description:
      "With no snap points: the fraction of the drawer's size it has to be dragged shut by before letting go closes it.",
  },
  {
    name: "velocityThreshold",
    type: "number",
    default: "0.4",
    description:
      "Speed of a fling in px/ms, past which the direction of the throw decides where the drawer goes.",
  },
  {
    name: "scrollLockTimeout",
    type: "number",
    default: "100",
    description:
      "After content inside has scrolled, how long a drag is refused for, in ms, so a scroll that runs out does not turn into a drag.",
  },
  {
    name: "dampFunction",
    type: "(distance: number) => number",
    default: "6·ln(d+1)",
    description: "How far the drawer follows a finger pulling it past its furthest rest position.",
  },
  {
    name: "shouldScaleBackground",
    type: "boolean",
    default: "false",
    description:
      "Draw the element marked `data-drawer-wrapper` back behind a modal drawer, the way a phone does with its own sheets.",
  },
  {
    name: "setBackgroundColorOnScale",
    type: "boolean",
    default: "true",
    description: "With `shouldScaleBackground`, paint the body black behind the shell.",
  },
  {
    name: "repositionInputs",
    type: "boolean",
    default: "true",
    description:
      "When the on-screen keyboard opens on an input inside a bottom drawer, lift the drawer so the input stays in view.",
  },
  {
    name: "disablePreventScroll",
    type: "boolean",
    default: "false",
    description: "Leave the page scrollable behind a modal drawer.",
  },
  {
    name: "noBodyStyles",
    type: "boolean",
    default: "false",
    description: "Never touch `document.body`'s styles.",
  },
  {
    name: "autoFocus",
    type: "boolean",
    default: "false",
    description:
      "Move focus to the first focusable thing inside when opened; otherwise the drawer itself takes focus.",
  },
  {
    name: "restoreFocus",
    type: "boolean",
    default: "true",
    description: "Give focus back to where it was, once closed.",
  },
  {
    name: "transitionResize",
    type: "boolean",
    default: "false",
    description: "Animate the drawer's size when its content changes size, rather than jumping.",
  },
  {
    name: "transitionDuration",
    type: "number",
    default: "500",
    description: "How long a settle takes, in ms.",
  },
  {
    name: "transitionEasing",
    type: "string",
    default: "cubic-bezier(0.32, 0.72, 0, 1)",
    description: "The easing of a settle.",
  },
  {
    name: "onDrag",
    type: "(event: PointerEvent, percentageDragged: number) => void",
    description: "While being dragged: the pointer event, and how far shut it is, 0 to 1.",
  },
  {
    name: "onRelease",
    type: "(event: PointerEvent, open: boolean) => void",
    description: "When let go: the pointer event, and whether it is staying open.",
  },
  {
    name: "onAnimationEnd",
    type: "(open: boolean) => void",
    description: "After an open or close has finished animating.",
  },
  {
    name: "onEscapeKeyDown",
    type: "(event: KeyboardEvent) => void",
    description: "Escape was pressed. `preventDefault()` keeps the drawer open.",
  },
  {
    name: "onPointerDownOutside",
    type: "(event: PointerEvent) => void",
    description: "A pointer went down outside a modal drawer. `preventDefault()` keeps it open.",
  },
];

export const dataAttributes: PropRow[] = [
  {
    name: "data-state",
    type: '"open" | "closed"',
    description: "On the content, the overlay and the trigger.",
  },
  {
    name: "data-drawer-direction",
    type: '"top" | "bottom" | "left" | "right"',
    description:
      "On the content, the overlay and the handle. What the component styles each edge from.",
  },
  {
    name: "data-drawer-snap-points",
    type: "present",
    description: "On the content, when there are snap points.",
  },
  { name: "data-dragging", type: "present", description: "On the content, while a finger has it." },
  { name: "data-transitioning", type: "present", description: "On the content, during a settle." },
  {
    name: "data-transition-state",
    type: '"opening" | "closing" | "snapping" | "resizing"',
    description: "On the content, during a settle.",
  },
  {
    name: "--snap-point-height",
    type: "px",
    description: "CSS variable on the content: the height the active snap point shows.",
  },
  {
    name: "--drawer-translate",
    type: "px",
    description: "CSS variable on the content: the drawer's transform along its axis.",
  },
];
