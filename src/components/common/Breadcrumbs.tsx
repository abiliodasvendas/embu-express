import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn("flex items-center space-x-2 text-sm", className)}>
      <Link
        to="/"
        className="text-gray-400 hover:text-primary transition-colors flex items-center gap-1"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
          {item.href ? (
            <Link
              to={item.href}
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-gray-400 truncate max-w-[200px]">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
