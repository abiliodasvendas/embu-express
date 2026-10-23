import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-[18px] border border-border bg-background px-3.5 py-2.5 text-sm font-normal text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus:border-primary transition-colors",
          "disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-muted-foreground/90 disabled:border-neutral-300/80 disabled:opacity-100 disabled:select-none",
          "read-only:not(.cursor-pointer):cursor-not-allowed read-only:not(.cursor-pointer):bg-neutral-200 read-only:not(.cursor-pointer):text-muted-foreground/90 read-only:not(.cursor-pointer):border-neutral-300/80",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
