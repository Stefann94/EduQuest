import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

// Butoane „de apăsat”, ca într-un joc: au o umbră plină dedesubt care dispare la click.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer select-none items-center justify-center whitespace-nowrap rounded-2xl border-2 border-transparent font-bold font-heading tracking-wide outline-none transition-[transform,box-shadow,background-color,filter] duration-100 focus-visible:ring-4 focus-visible:ring-ring/40 active:translate-y-[3px] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg:not([class*='size-'])]:size-5 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_4px_0_0_var(--primary-shadow)] hover:brightness-105 active:shadow-[0_1px_0_0_var(--primary-shadow)]",
        outline:
          "border-border bg-card text-foreground shadow-[0_4px_0_0_var(--border)] hover:bg-muted active:shadow-[0_1px_0_0_var(--border)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_4px_0_0_color-mix(in_oklch,var(--secondary),black_12%)] hover:brightness-[1.02] active:shadow-[0_1px_0_0_color-mix(in_oklch,var(--secondary),black_12%)]",
        ghost:
          "text-foreground hover:bg-secondary active:translate-y-0 aria-expanded:bg-secondary",
        destructive:
          "bg-destructive text-white shadow-[0_4px_0_0_color-mix(in_oklch,var(--destructive),black_22%)] active:shadow-none",
        link: "font-sans text-primary underline-offset-4 hover:underline active:translate-y-0",
      },
      size: {
        default: "h-11 gap-2 px-5 text-base",
        xs: "h-7 gap-1 rounded-xl px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-9 gap-1.5 rounded-xl px-3.5 text-sm [&_svg:not([class*='size-'])]:size-4",
        lg: "h-13 gap-2 px-7 text-lg",
        icon: "size-11",
        "icon-xs": "size-7 rounded-xl [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-9 rounded-xl",
        "icon-lg": "size-13",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
