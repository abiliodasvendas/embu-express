import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  hidePickerIndicator?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onClick, hidePickerIndicator, ...props }, ref) => {
    const hasPl = typeof className === "string" && /\bpl-\S+/.test(className);
    const hasPr = typeof className === "string" && /\bpr-\S+/.test(className);
    const hasPx = typeof className === "string" && /\bpx-\S+/.test(className);

    const isPickerType = type === "date" || type === "time" || type === "datetime-local";
    const shouldHideIndicator = hidePickerIndicator ?? (isPickerType && (hasPl || hasPr));

    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
      onClick?.(e);
      if (isPickerType && !props.readOnly && !props.disabled) {
        try {
          e.currentTarget.showPicker?.();
        } catch {
        }
      }
    };

    return (
      <input
        type={type}
        onClick={handleClick}
        className={cn(
          "flex h-11 w-full rounded-[18px] border border-border bg-background py-2 text-sm font-normal text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus:border-primary focus:bg-white transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-muted-foreground/90 disabled:border-neutral-300/80 disabled:opacity-100 disabled:select-none",
          "read-only:not(.cursor-pointer):not([type='button']):not([type='submit']):cursor-not-allowed read-only:not(.cursor-pointer):not([type='button']):not([type='submit']):bg-neutral-200 read-only:not(.cursor-pointer):not([type='button']):not([type='submit']):text-muted-foreground/90 read-only:not(.cursor-pointer):not([type='button']):not([type='submit']):border-neutral-300/80",
          !hasPx && !hasPl && !hasPr && "px-3.5",
          !hasPx && hasPl && !hasPr && "pr-3.5",
          !hasPx && !hasPl && hasPr && "pl-3.5",
          shouldHideIndicator && "[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none cursor-pointer",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

