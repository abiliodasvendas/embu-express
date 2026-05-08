import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ActionItem } from "@/types/actions";
import { MoreVertical } from "lucide-react";
import { useIsMobile } from "@/hooks/ui/use-mobile";

interface ActionsDropdownProps {
  actions: ActionItem[];
  triggerClassName?: string;
  triggerSize?: "sm" | "icon" | "default" | "lg";
  align?: "end" | "center" | "start";
  disabled?: boolean;
  children?: React.ReactNode;
}

export function ActionsDropdown({
  actions,
  triggerClassName = "h-8 w-8 p-0",
  triggerSize = "sm",
  align = "end",
  disabled = false,
  children,
}: ActionsDropdownProps) {
  const isMobile = useIsMobile();
  
  // Filter out hidden actions
  const visibleActions = actions.filter((a) => !a.hidden);

  if (visibleActions.length === 0 || disabled) {
    return (
      <Button
        variant="ghost"
        size={triggerSize}
        className={cn("text-gray-300 cursor-not-allowed", triggerClassName)}
        disabled
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
    );
  }

  // --- Render logic for Desktop ---
  const renderDesktop = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size={triggerSize}
            className={cn("text-gray-400 hover:text-gray-600", triggerClassName)}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={align}
        className="min-w-[180px] p-2 bg-white/95 backdrop-blur-sm border-gray-100 rounded-2xl shadow-xl shadow-gray-200/50 animate-in fade-in zoom-in duration-200"
      >
        {visibleActions.map((action, idx) => (
          <DropdownMenuItem
            key={`${action.label}-${idx}`}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
            }}
            disabled={action.disabled}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer outline-none focus:bg-gray-50",
              action.isDestructive || action.variant === "destructive"
                ? "text-rose-600 focus:bg-rose-50"
                : "text-gray-700 focus:text-gray-900"
            )}
            title={action.title}
          >
            {action.icon && (
              <span className={cn(
                "h-4 w-4 flex items-center justify-center transition-transform",
                action.isDestructive || action.variant === "destructive" ? "text-rose-600" : "text-gray-400"
              )}>
                {action.icon}
              </span>
            )}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // --- Render logic for Mobile ---
  // Note: Per user request, we are using Dropdown for both mobile and desktop for now.
  // In the future, this can be easily switched to a Sheet/Drawer.
  const renderMobile = () => renderDesktop();

  return isMobile ? renderMobile() : renderDesktop();
}

