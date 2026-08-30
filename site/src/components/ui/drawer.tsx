import { omit, type ComponentProps } from "solid-js";
import type { JSX } from "@solidjs/web";
import { Drawer as DrawerPrimitive } from "@sinhong2011/solid-drawer";

import { cn } from "@/lib/utils";

/* shadcn/ui's Drawer, for Solid 2, on @sinhong2011/solid-drawer. The
   library sets `data-drawer-direction` on the content, the overlay and the
   handle; everything below is classes on that. */

const Drawer = DrawerPrimitive.Root;
const DrawerNested = DrawerPrimitive.NestedRoot;
const DrawerTrigger = DrawerPrimitive.Trigger;
const DrawerPortal = DrawerPrimitive.Portal;
const DrawerClose = DrawerPrimitive.Close;

function DrawerOverlay(props: ComponentProps<typeof DrawerPrimitive.Overlay>) {
  const rest = omit(props, "class");
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      class={cn("fixed inset-0 z-50 bg-black/50", props.class)}
      {...rest}
    />
  );
}

function DrawerContent(props: ComponentProps<typeof DrawerPrimitive.Content>) {
  const rest = omit(props, "class", "children");
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        class={cn(
          "group/drawer-content bg-card text-card-foreground fixed z-50 flex h-auto flex-col outline-none",
          "data-[drawer-direction=top]:inset-x-0 data-[drawer-direction=top]:top-0 data-[drawer-direction=top]:max-h-[80vh] data-[drawer-direction=top]:rounded-b-xl data-[drawer-direction=top]:border-b",
          "data-[drawer-direction=bottom]:inset-x-0 data-[drawer-direction=bottom]:bottom-0 data-[drawer-direction=bottom]:max-h-[80vh] data-[drawer-direction=bottom]:rounded-t-xl data-[drawer-direction=bottom]:border-t",
          "data-[drawer-direction=right]:inset-y-0 data-[drawer-direction=right]:right-0 data-[drawer-direction=right]:w-3/4 data-[drawer-direction=right]:border-l data-[drawer-direction=right]:sm:max-w-sm",
          "data-[drawer-direction=left]:inset-y-0 data-[drawer-direction=left]:left-0 data-[drawer-direction=left]:w-3/4 data-[drawer-direction=left]:border-r data-[drawer-direction=left]:sm:max-w-sm",
          props.class,
        )}
        {...rest}
      >
        <DrawerPrimitive.Handle class="bg-muted-foreground/30 mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full opacity-100 group-data-[drawer-direction=bottom]/drawer-content:block" />
        {props.children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

function DrawerHeader(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const rest = omit(props, "class");
  return (
    <div
      data-slot="drawer-header"
      class={cn(
        "flex flex-col gap-0.5 p-4 group-data-[drawer-direction=bottom]/drawer-content:text-center group-data-[drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left",
        props.class,
      )}
      {...rest}
    />
  );
}

function DrawerFooter(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const rest = omit(props, "class");
  return (
    <div
      data-slot="drawer-footer"
      class={cn("mt-auto flex flex-col gap-2 p-4", props.class)}
      {...rest}
    />
  );
}

function DrawerTitle(props: ComponentProps<typeof DrawerPrimitive.Title>) {
  const rest = omit(props, "class");
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      class={cn("text-foreground font-semibold", props.class)}
      {...rest}
    />
  );
}

function DrawerDescription(props: ComponentProps<typeof DrawerPrimitive.Description>) {
  const rest = omit(props, "class");
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      class={cn("text-muted-foreground text-sm", props.class)}
      {...rest}
    />
  );
}

export {
  Drawer,
  DrawerNested,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
