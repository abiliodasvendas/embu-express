import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface NativeSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ReactNode;
  wrapperClassName?: string;
  error?: boolean;
  variant?: "default" | "white";
}

export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, wrapperClassName, icon, children, disabled, error, variant = "default", ...props }, ref) => {
    const hasCustomPr = typeof className === "string" && /\bpr-\S+/.test(className);
    const isPlaceholder = !props.value || props.value === "";

    const widthClasses = typeof className === "string"
      ? className.split(/\s+/).filter((cls) => /^(w-|min-w-|max-w-|flex-1|flex-auto|flex-initial|flex-none|shrink)/.test(cls)).join(" ")
      : "";
    const cleanClassName = typeof className === "string"
      ? className.split(/\s+/).filter((cls) => !/^(w-|min-w-|max-w-|flex-1|flex-auto|flex-initial|flex-none|shrink)/.test(cls)).join(" ")
      : "";

    return (
      <div className={cn("relative group", widthClasses || "w-full", wrapperClassName)}>
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-primary transition-colors flex items-center justify-center shrink-0 z-10">
            {icon}
          </div>
        )}
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full appearance-none transition-all duration-200 cursor-pointer",
            "h-11 text-sm font-normal",
            isPlaceholder ? "text-muted-foreground" : "text-foreground",
            "[&>option]:text-foreground [&>option[value='']]:text-muted-foreground",
            variant === "white"
              ? "bg-white hover:bg-white focus:bg-white shadow-xs"
              : "bg-background hover:bg-white focus:bg-white",
            "border border-border rounded-[18px]",
            "hover:border-primary hover:text-primary",
            "focus:outline-none focus:border-primary",
            "disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-muted-foreground/90 disabled:border-neutral-300/80 disabled:opacity-100 disabled:select-none",
            "aria-[invalid=true]:border-destructive",
            icon ? "pl-10" : "pl-3.5 sm:pl-4",
            "pr-9 sm:pr-10",
            error && "border-destructive focus:border-destructive",
            cleanClassName,
            icon && "pl-10",
            !hasCustomPr && "pr-9 sm:pr-10"
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none shrink-0" />
      </div>
    );
  }
);

NativeSelect.displayName = "NativeSelect";
