import { LockOverlay } from "@/components/common/LockOverlay";
import { useAnimatedNumber } from "@/hooks/ui/useAnimatedNumber";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters/currency";
import React from "react";

interface KPICardProps {
  title: string;
  value: string | number | React.ReactNode;
  count?: number;
  icon: React.ElementType;
  colorClass?: string;
  bgClass?: string;
  className?: string;
  countLabel?: string;
  countVisible?: boolean;
  countText?: React.ReactNode;
  restricted?: boolean;
  onClick?: () => void;
  format?: "currency" | "number";
}

export function KPICard({
  title,
  value,
  count,
  icon: Icon,
  colorClass,
  bgClass,
  className,
  countLabel,
  countVisible = true,
  countText,
  restricted,
  onClick,
  format = "currency",
}: KPICardProps) {
  const isReactNode = React.isValidElement(value);
  
  const animatedValue = !isReactNode && typeof value === "number" 
    ? useAnimatedNumber(value, 1000) 
    : null;
    
  const animatedCount = useAnimatedNumber(count ?? 0, 1000);

  const renderValue = () => {
    if (isReactNode) {
      return value;
    }
    if (animatedValue !== null && typeof animatedValue === "number") {
      const numValue = isNaN(animatedValue) || !isFinite(animatedValue) ? 0 : animatedValue;
      
      if (format === "number") {
         return Math.round(numValue);
      }

      return formatCurrency(numValue);
    }
    if (typeof value === "number") {
      const numValue = isNaN(value) || !isFinite(value) ? 0 : value;
      
      if (format === "number") {
         return numValue;
      }

      return formatCurrency(numValue);
    }
    return String(value ?? "R$ 0,00");
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card p-3 sm:p-4 rounded-[18px] border border-border shadow-xs flex items-center gap-3 sm:gap-4 flex-1 min-w-[140px] relative overflow-hidden",
        onClick && "cursor-pointer transition-all hover:border-foreground/20 hover:shadow-xs",
        className
      )}
    >
      <div
        className={cn(
          "h-8 w-8 sm:h-10 sm:w-10 rounded-[12px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0",
          bgClass
        )}
      >
        <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground", colorClass)} />
      </div>
      <div className="relative z-10 min-w-0">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5 truncate">
          {title}
        </p>
        <div className="text-base sm:text-lg font-bold text-foreground leading-tight">
          {renderValue()}
        </div>
        
        {(count !== undefined || countText) && (
          <div className={cn(
            "text-[10px] font-medium mt-0.5",
            countVisible ? "text-muted-foreground" : "text-muted-foreground blur-xs select-none opacity-60"
          )}>
            {countText ? countText : (
              <>
                {Math.round(animatedCount)}{" "}
                {Math.round(animatedCount) === 1 ? countLabel : `${countLabel}s`}
              </>
            )}
          </div>
        )}
      </div>
      
      {restricted && (
        <LockOverlay className="bottom-2 right-4" />
      )}
    </div>
  );
}
