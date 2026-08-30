import { createUniqueId, omit, onSettled } from "solid-js";
import { Dynamic } from "@solidjs/web";
import type { JSX, ValidComponent } from "@solidjs/web";
import { useDrawer } from "./context";

type Polymorphic<T extends ValidComponent, P> = P & {
  /** Render as another element or component; a `button` by default. */
  as?: T;
};

export type TriggerProps = Polymorphic<ValidComponent, JSX.ButtonHTMLAttributes<HTMLButtonElement>>;

/** Opens the drawer, or closes it again. */
export function Trigger(props: TriggerProps): JSX.Element {
  const ctx = useDrawer();
  const rest = omit(props, "as", "onClick");
  return (
    <Dynamic
      component={props.as ?? "button"}
      type={props.as === undefined || props.as === "button" ? "button" : undefined}
      aria-haspopup="dialog"
      aria-expanded={ctx.open() ? "true" : "false"}
      aria-controls={ctx.contentId}
      data-drawer-trigger=""
      data-state={ctx.open() ? "open" : "closed"}
      onClick={(event: MouseEvent) => {
        if (typeof props.onClick === "function") (props.onClick as (e: MouseEvent) => void)(event);
        ctx.setOpen(!ctx.open());
      }}
      {...rest}
    />
  );
}

export type CloseProps = TriggerProps;

/** Closes the drawer - even one that is not dismissible by hand. */
export function Close(props: CloseProps): JSX.Element {
  const ctx = useDrawer();
  const rest = omit(props, "as", "onClick");
  return (
    <Dynamic
      component={props.as ?? "button"}
      type={props.as === undefined || props.as === "button" ? "button" : undefined}
      data-drawer-close=""
      onClick={(event: MouseEvent) => {
        if (typeof props.onClick === "function") (props.onClick as (e: MouseEvent) => void)(event);
        ctx.setOpen(false);
      }}
      {...rest}
    />
  );
}

export type TitleProps = Polymorphic<ValidComponent, JSX.HTMLAttributes<HTMLHeadingElement>>;

/** The drawer's name, which the dialog is labelled by. */
export function Title(props: TitleProps): JSX.Element {
  const ctx = useDrawer();
  const id = createUniqueId();
  const rest = omit(props, "as", "id");
  const own = () => {
    const given = props.id;
    return typeof given === "string" ? given : id;
  };
  onSettled(() => ctx.registerTitle(own()));
  return <Dynamic component={props.as ?? "h2"} id={own()} data-drawer-title="" {...rest} />;
}

export type DescriptionProps = Polymorphic<
  ValidComponent,
  JSX.HTMLAttributes<HTMLParagraphElement>
>;

/** A line under the name, which the dialog is described by. */
export function Description(props: DescriptionProps): JSX.Element {
  const ctx = useDrawer();
  const id = createUniqueId();
  const rest = omit(props, "as", "id");
  const own = () => {
    const given = props.id;
    return typeof given === "string" ? given : id;
  };
  onSettled(() => ctx.registerDescription(own()));
  return <Dynamic component={props.as ?? "p"} id={own()} data-drawer-description="" {...rest} />;
}
