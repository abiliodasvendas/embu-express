import { Button } from "@/components/ui/button";
import { ActionItem } from "@/types/actions";
import { cn } from "@/lib/utils";
import { MoreVertical } from "lucide-react";
import React, { useState } from "react";
import { ActionSheet } from "./ActionSheet";

interface ActionsDropdownProps {
  actions: ActionItem[];
  triggerClassName?: string;
  triggerSize?: "sm" | "icon" | "default" | "lg";
  align?: "end" | "center" | "start";
  disabled?: boolean;
  title?: string;
  description?: string;
  header?: React.ReactNode;
  customTrigger?: React.ReactNode;
  children?: React.ReactNode;
}

export function ActionsDropdown({
  actions,
  triggerClassName = "h-8 w-8 p-0",
  triggerSize = "sm",
  disabled = false,
  title,
  description,
  header,
  customTrigger,
  children,
}: ActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerElement = children || customTrigger;

  const visibleActions = actions.filter((a) => !a.hidden);

  if (visibleActions.length === 0 || disabled) {
    if (triggerElement) {
      return (
        <div className="opacity-30 pointer-events-none">
          {triggerElement}
        </div>
      );
    }
    return (
      <Button
        variant="ghost"
        size={triggerSize}
        className={cn(
          "h-8 w-8 rounded-[14px] text-muted-foreground cursor-not-allowed opacity-30",
          triggerClassName
        )}
        disabled
        aria-label="Abrir menu de ações"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <>
      {triggerElement ? (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          className="cursor-pointer"
        >
          {triggerElement}
        </div>
      ) : (
        <Button
          variant="ghost"
          size={triggerSize}
          className={cn(
            "h-8 w-8 rounded-[14px] text-muted-foreground hover:text-foreground hover:bg-surface-alt transition-all cursor-pointer",
            triggerClassName
          )}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          aria-label="Abrir menu de ações"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      )}

      <ActionSheet
        open={isOpen}
        onOpenChange={setIsOpen}
        title={title}
        description={description}
        actions={visibleActions.map((action) => ({
          label: action.label,
          title: action.title,
          description: action.description,
          icon: action.icon,
          onClick: action.onClick,
          disabled: action.disabled,
          isLoading: action.isLoading,
          isLink: action.isLink,
          href: action.href,
          isDestructive: action.isDestructive || action.variant === "destructive",
          className: action.className,
          hasSeparatorAfter: action.hasSeparatorAfter,
        }))}
      >
        {header}
      </ActionSheet>
    </>
  );
}
