import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { SortDirection } from "@/hooks/ui/useTableSort";

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentKey: string;
  direction: SortDirection;
  onSort: (key: string) => void;
  align?: "left" | "right" | "center";
  className?: string;
  children?: ReactNode;
}

export function SortableHeader({
  label,
  sortKey,
  currentKey,
  direction,
  onSort,
  align = "left",
  className,
}: SortableHeaderProps) {
  const isActive = currentKey === sortKey;

  return (
    <th
      onClick={() => onSort(sortKey)}
      className={cn(
        "py-3 px-4 cursor-pointer select-none group transition-colors hover:text-foreground",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className
      )}
      aria-sort={isActive ? (direction === "asc" ? "ascending" : "descending") : "none"}
    >
      <div
        className={cn(
          "inline-flex items-center gap-1.5",
          align === "right" && "justify-end flex-row-reverse",
          align === "center" && "justify-center"
        )}
      >
        <span className={cn(isActive && "text-foreground font-semibold")}>{label}</span>
        <span className="shrink-0 text-muted-foreground group-hover:text-foreground transition-colors">
          {isActive ? (
            direction === "asc" ? (
              <ArrowUp className="h-3.5 w-3.5 text-primary stroke-[2.5]" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5 text-primary stroke-[2.5]" />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-80 transition-opacity" />
          )}
        </span>
      </div>
    </th>
  );
}
