import type { JSX } from "@solidjs/web";

/** The edge of the container the drawer is attached to and slides in from. */
export type DrawerDirection = "top" | "bottom" | "left" | "right";

/**
 * How much of the drawer shows at a rest position.
 *
 * A number is a fraction of the container's size along the drawer's axis -
 * `0.5` is half the window, or half the element the drawer lives in. A string
 * is a CSS pixel length, `"320px"`.
 */
export type SnapPoint = number | string;

/** What the drawer is in the middle of, when it is in the middle of something. */
export type TransitionState = "opening" | "closing" | "snapping" | "resizing" | null;

export interface DrawerRootProps {
  /** Controlled open state. */
  open?: boolean;
  /** Open state to start from, when uncontrolled. */
  defaultOpen?: boolean;
  /** Told when the drawer wants to open or close, by gesture, key, or part. */
  onOpenChange?: (open: boolean) => void;
  /**
   * A modal drawer takes the page: a scrim, focus held inside, Escape to
   * leave, the page pinned behind it, and a pointer outside it closes it. A
   * non-modal one sits over a page that stays live. Default `true`.
   */
  modal?: boolean;
  /** The edge it comes from. Default `"bottom"`. */
  direction?: DrawerDirection;
  /**
   * The element the drawer lives in. The `Portal` mounts into it, and snap
   * point fractions are of its size. Without one, fractions are of the
   * drawer's offset parent when it has one, else of the window.
   */
  container?: HTMLElement | null;
  /**
   * Whether the drawer can be put away by hand - dragged shut, dismissed by
   * Escape or a pointer outside it. `false` leaves only `onOpenChange`.
   * Default `true`.
   */
  dismissible?: boolean;
  /** Only the `Handle` starts a drag; the content is left to scroll. */
  handleOnly?: boolean;
  /**
   * With no snap points: the fraction of the drawer's size it has to be
   * dragged shut by, before letting go closes it. Default `0.25`.
   */
  closeThreshold?: number;
  /**
   * Speed of a fling, in pixels per millisecond, past which the direction of
   * the throw decides where the drawer goes. Default `0.4`.
   */
  velocityThreshold?: number;
  /**
   * After content inside the drawer has scrolled, how long a drag is refused
   * for, in milliseconds, so a scroll that runs out does not turn into a
   * drag. Default `100`.
   */
  scrollLockTimeout?: number;
  /** Rest positions, least to most open. Omit for open-or-closed. */
  snapPoints?: SnapPoint[];
  /**
   * Where between two snap points a released drawer goes up rather than
   * down, one entry per gap; `null` keeps the midpoint. From corvu.
   */
  breakPoints?: (SnapPoint | null)[];
  /** Controlled active snap point, by value. `null` while closed. */
  activeSnapPoint?: SnapPoint | null;
  /** The snap point to open at, when uncontrolled. Default: the first. */
  defaultActiveSnapPoint?: SnapPoint;
  /** Told when the drawer comes to rest at a snap point. Vaul's name. */
  setActiveSnapPoint?: (snapPoint: SnapPoint | null) => void;
  /** The same, under corvu's name. */
  onActiveSnapPointChange?: (snapPoint: SnapPoint | null) => void;
  /**
   * The snap point the overlay is fully visible from; below it the overlay
   * fades out. Default: the last one.
   */
  fadeFromIndex?: number;
  /**
   * A fling moves one snap point at a time rather than to the end of the
   * throw. Default `false`.
   */
  snapToSequentialPoint?: boolean;
  /**
   * How far the drawer follows a finger pulling it past its furthest rest
   * position, from the distance the finger has gone. Default
   * `6 * Math.log(distance + 1)`, from corvu.
   */
  dampFunction?: (distance: number) => number;
  /**
   * Scale the page back behind a modal drawer, the way a phone does with its
   * own sheets. Needs the app shell marked `data-drawer-wrapper`.
   */
  shouldScaleBackground?: boolean;
  /** With `shouldScaleBackground`, paint the body black behind the shell. Default `true`. */
  setBackgroundColorOnScale?: boolean;
  /**
   * When the on-screen keyboard opens on an input inside a bottom drawer,
   * shrink the drawer so the input stays in view. Default `true`.
   */
  repositionInputs?: boolean;
  /** Leave the page scrollable behind a modal drawer. */
  disablePreventScroll?: boolean;
  /** Never touch `document.body`'s styles. */
  noBodyStyles?: boolean;
  /** Move focus to the first focusable thing inside when opened. Default `false`: the drawer itself takes focus. */
  autoFocus?: boolean;
  /** Give focus back to where it was, once closed. Default `true`. */
  restoreFocus?: boolean;
  /**
   * Animate the drawer's size when its content changes size, rather than
   * jumping. From corvu. Default `false`.
   */
  transitionResize?: boolean;
  /** How long a settle takes, in milliseconds. Default `500`. */
  transitionDuration?: number;
  /** The easing of a settle. Default `cubic-bezier(0.32, 0.72, 0, 1)`. */
  transitionEasing?: string;
  /** While being dragged: the pointer event, and how far shut it is, 0 to 1. */
  onDrag?: (event: PointerEvent, percentageDragged: number) => void;
  /** When let go: the pointer event, and whether it is staying open. */
  onRelease?: (event: PointerEvent, open: boolean) => void;
  /** After an open or close has finished animating. */
  onAnimationEnd?: (open: boolean) => void;
  /** Escape was pressed. `preventDefault()` keeps the drawer open. */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /** A pointer went down outside a modal drawer. `preventDefault()` keeps it open. */
  onPointerDownOutside?: (event: PointerEvent) => void;
  children?: JSX.Element;
}

/** Everything a part - or a consumer of `useDrawer` - can read and do. */
export interface DrawerContextValue {
  /** Whether the drawer is meant to be open. */
  open: () => boolean;
  setOpen: (open: boolean) => void;
  /** Ask to close; refused if not dismissible. */
  close: () => void;
  /**
   * Whether the drawer's parts are in the DOM. Stays true through the
   * closing animation.
   */
  mounted: () => boolean;
  modal: () => boolean;
  direction: () => DrawerDirection;
  dismissible: () => boolean;
  handleOnly: () => boolean;
  snapPoints: () => SnapPoint[] | undefined;
  /** Each snap point, as the drawer's transform at rest there, in pixels. */
  snapPointsOffset: () => number[];
  activeSnapPoint: () => SnapPoint | null;
  setActiveSnapPoint: (snapPoint: SnapPoint | null) => void;
  /** Index of the active snap point, or -1. */
  activeSnapPointIndex: () => number;
  /** Move to the next snap point, or close from the last. What the handle does when tapped. */
  cycleSnapPoints: () => void;
  isDragging: () => boolean;
  isTransitioning: () => boolean;
  transitionState: () => TransitionState;
  /** The drawer's transform along its axis right now, in pixels; 0 is fully open. */
  translate: () => number;
  /** How much of the drawer is on screen, 0 to 1 - past 1 when pulled beyond open. */
  openPercentage: () => number;
  /** What the overlay's opacity should be, from where the drawer is. */
  overlayOpacity: () => number;
  /** The CSS `transform` the content should carry. */
  contentTransform: () => string;
  /** The CSS `transition` the content should carry. */
  contentTransition: () => string;
  /** The drawer's size along its axis, in pixels. */
  contentSize: () => number;
  contentEl: () => HTMLElement | null;
  setContentEl: (el: HTMLElement | null) => void;
  container: () => HTMLElement | null;
  contentId: string;
  titleId: () => string | undefined;
  descriptionId: () => string | undefined;
  registerTitle: (id: string) => () => void;
  registerDescription: (id: string) => () => void;
  /** Start of a possible drag. `fromHandle` is what `handleOnly` looks for. */
  onPress: (event: PointerEvent, fromHandle?: boolean) => void;
  /** The content's `transitionend`, which is how a settle is known to be over. */
  onTransitionEnd: (event: TransitionEvent) => void;
  /** A parent drawer's hooks, when this one is nested inside it. */
  nested: {
    onOpenChange: (open: boolean) => void;
    onDrag: (percentageDragged: number) => void;
    onRelease: (open: boolean) => void;
  };
}
