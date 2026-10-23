import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type UnifiedEmptyStateActionVariant = "tonal" | "neutral" | "primary";

export interface UnifiedEmptyStateAction {
  label: string;
  onClick: (e?: React.MouseEvent) => void;
  icon?: LucideIcon;
  variant?: UnifiedEmptyStateActionVariant;
  className?: string;
}

export interface UnifiedEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string | ReactNode;
  action?: UnifiedEmptyStateAction;
  className?: string;
  iconClassName?: string;
}

export function UnifiedEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  iconClassName,
}: UnifiedEmptyStateProps) {
  const variant = action?.variant || "tonal";

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-primary hover:bg-primary-hover text-primary-foreground font-semibold border-none shadow-xs";
      case "neutral":
        return "bg-card text-foreground border border-border hover:bg-surface-alt hover:border-neutral-300 font-medium shadow-xs";
      case "tonal":
      default:
        return "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/15 shadow-2xs font-medium";
    }
  };

  return (
    <Card
      className={cn(
        "rounded-[24px] border border-border bg-card shadow-xs",
        className
      )}
    >
      <CardContent className="flex flex-col items-center justify-center py-10 sm:py-12 text-center p-6 sm:p-8">
        <div className="w-14 h-14 rounded-[18px] bg-surface-alt border border-border flex items-center justify-center mb-4 text-foreground">
          <Icon className={cn("w-7 h-7 text-foreground", iconClassName)} />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight mb-1.5">
          {title}
        </h3>
        <div className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed mb-6">
          {description}
        </div>
        {action && (
          <Button
            type="button"
            onClick={action.onClick}
            className={cn(
              "h-10 sm:h-11 rounded-[18px] text-xs sm:text-sm px-4 sm:px-5 transition-all active:scale-[0.98] cursor-pointer inline-flex items-center gap-2 group",
              getVariantStyles(),
              action.className
            )}
          >
            {action.icon && (
              <action.icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-colors",
                  variant === "neutral"
                    ? "text-muted-foreground"
                    : "text-current"
                )}
              />
            )}
            <span>{action.label}</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
