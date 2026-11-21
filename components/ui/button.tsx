import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-t from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30 border border-indigo-400 hover:brightness-110",
        blue:
          "bg-gradient-to-t from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/40 border border-blue-400 hover:brightness-110",
        dark:
          "bg-gradient-to-t from-neutral-900 to-neutral-700 text-white shadow-lg shadow-neutral-900/40 border border-neutral-700 hover:brightness-110",
        outline:
          "border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 shadow-xs dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900 dark:text-neutral-100",
        ghost:
          "hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
        pillSwitch:
          "rounded-full bg-gradient-to-t from-blue-500 via-blue-400 to-blue-600 border-2 border-blue-500 text-white shadow-sm shadow-blue-500",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-14 rounded-2xl px-8 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
