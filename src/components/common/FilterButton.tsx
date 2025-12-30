import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Filter, ListFilter } from "lucide-react";
import * as React from "react";

export interface FilterButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  hasActiveFilters: boolean;
  selectedCount?: number;
  isMobile: boolean;
}

export const FilterButton = React.forwardRef<HTMLButtonElement, FilterButtonProps>(
  ({ hasActiveFilters, selectedCount = 0, isMobile, className, ...props }, ref) => (
    <Button
      {...props}
      ref={ref}
      variant="outline"
      className={cn(
        "h-11 rounded-xl border-gray-200 bg-white gap-2 px-4 md:px-5 font-bold transition-all shadow-sm active:scale-95",
        isMobile && "flex-1 h-11",
        hasActiveFilters
          ? "text-blue-600 border-blue-100 hover:bg-blue-50"
          : "text-slate-600 hover:bg-slate-50",
        className
      )}
    >
      {isMobile ? (
        <Filter className="h-4 w-4 mr-1" />
      ) : (
        <ListFilter className="h-4 w-4" />
      )}
      <span>Filtros</span>
      {hasActiveFilters && (
        selectedCount > 0 ? (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white animate-in zoom-in-50">
            {selectedCount}
          </span>
        ) : (
          <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-in zoom-in-50" />
        )
      )}
    </Button>
  )
);
FilterButton.displayName = "FilterButton";
