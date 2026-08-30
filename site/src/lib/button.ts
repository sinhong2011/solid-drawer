import { cn } from "./utils";

/* The button, as a class string so an Astro `<a>` and a Solid `<button>`
   can share it. Filled buttons carry a hairline of light along the top and
   settle a pixel when pressed; quiet ones are translucent, so they sit on
   any ground without boxing themselves in. */

const base =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg text-[13px] leading-none font-medium tracking-[-0.006em] whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-150 outline-none select-none focus-visible:ring-[3px] focus-visible:ring-ring/25 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

const variants = {
  default:
    "bg-primary text-primary-foreground border border-primary shadow-[inset_0_1px_0_rgb(255_255_255/0.16),0_1px_2px_rgb(0_0_0/0.24)] hover:bg-primary/90 dark:shadow-[inset_0_-1px_0_rgb(0_0_0/0.1),0_1px_2px_rgb(0_0_0/0.3)]",
  outline:
    "bg-card text-foreground border border-black/10 shadow-[0_1px_2px_rgb(0_0_0/0.05)] hover:bg-black/[0.035] dark:border-white/[0.12] dark:bg-white/[0.06] dark:shadow-none dark:hover:border-white/[0.18] dark:hover:bg-white/[0.1]",
  secondary:
    "bg-black/[0.05] text-foreground border border-transparent hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.12]",
  ghost:
    "text-muted-foreground hover:bg-black/[0.05] hover:text-foreground dark:hover:bg-white/[0.08]",
  brand:
    "bg-brand text-brand-foreground border border-brand shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_1px_2px_rgb(0_0_0/0.2)] hover:bg-brand/90",
  link: "text-foreground underline-offset-4 hover:underline",
} as const;

const sizes = {
  default: "h-9 px-3.5 has-[>svg]:pl-3",
  sm: "h-8 rounded-md px-3 text-xs has-[>svg]:pl-2.5",
  lg: "h-10 rounded-lg px-5 text-sm has-[>svg]:pl-4",
  icon: "size-9",
  "icon-sm": "size-8 rounded-md",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export function buttonVariants(
  options: { variant?: ButtonVariant; size?: ButtonSize; class?: string } = {},
) {
  return cn(
    base,
    variants[options.variant ?? "default"],
    sizes[options.size ?? "default"],
    options.class,
  );
}
