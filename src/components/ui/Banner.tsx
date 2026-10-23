import React, { ReactNode } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronRight, Info, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type BannerVariant = "info" | "warning" | "neutral" | "success" | "danger" | "destructive";

export interface BannerAction {
  label: string;
  onClick: (e?: React.MouseEvent) => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export interface BannerProps {
  variant?: BannerVariant;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode | React.ComponentType<{ className?: string }> | null;
  action?: BannerAction;
  onClick?: (e?: React.MouseEvent) => void;
  onDismiss?: (e?: React.MouseEvent) => void;
  onClose?: (e?: React.MouseEvent) => void;
  dismissPosition?: "default" | "floating";
  className?: string;
  contentClassName?: string;
  hideIconBox?: boolean;
}

const VARIANT_CONFIG: Record<
  BannerVariant,
  {
    container: string;
    iconBox: string;
    title: string;
    description: string;
    chevron: string;
    defaultIcon: ReactNode;
    actionButton: string;
    dismissButton: string;
  }
> = {
  info: {
    container: "bg-sky-500/[0.08] hover:bg-sky-500/[0.11] border-sky-500/25 text-foreground",
    iconBox: "bg-sky-500/15 text-sky-700 border border-sky-500/20",
    title: "text-[#0a0a0a] font-semibold",
    description: "text-slate-600",
    chevron: "text-sky-600/70 group-hover:text-sky-600",
    defaultIcon: <Info className="w-4 h-4 shrink-0" />,
    actionButton: "bg-white text-[#0a0a0a] border border-[#e5e5e5] hover:bg-[#fafafa] shadow-xs",
    dismissButton: "text-sky-600/60 hover:text-sky-700 hover:bg-sky-500/10",
  },
  warning: {
    container: "bg-amber-500/[0.08] hover:bg-amber-500/[0.11] border-amber-500/25 text-foreground",
    iconBox: "bg-amber-500/15 text-amber-700 border border-amber-500/20",
    title: "text-[#0a0a0a] font-semibold",
    description: "text-slate-600",
    chevron: "text-amber-600/70 group-hover:text-amber-600",
    defaultIcon: <AlertTriangle className="w-4 h-4 shrink-0" />,
    actionButton: "bg-white text-[#0a0a0a] border border-[#e5e5e5] hover:bg-[#fafafa] shadow-xs",
    dismissButton: "text-amber-600/60 hover:text-amber-700 hover:bg-amber-500/15",
  },
  neutral: {
    container: "bg-[#f5f5f5] hover:bg-[#eeeeee] border-[#e5e5e5] text-foreground",
    iconBox: "bg-white text-[#737373] border border-[#e5e5e5] shadow-2xs",
    title: "text-[#0a0a0a] font-semibold",
    description: "text-[#737373]",
    chevron: "text-muted-foreground group-hover:text-foreground",
    defaultIcon: <Info className="w-4 h-4 shrink-0" />,
    actionButton: "bg-white text-[#0a0a0a] border border-[#e5e5e5] hover:bg-[#fafafa] shadow-xs",
    dismissButton: "text-muted-foreground hover:text-foreground hover:bg-black/5",
  },
  success: {
    container: "bg-emerald-500/[0.08] hover:bg-emerald-500/[0.11] border-emerald-500/25 text-foreground",
    iconBox: "bg-emerald-500/15 text-emerald-700 border border-emerald-500/20",
    title: "text-[#0a0a0a] font-semibold",
    description: "text-slate-600",
    chevron: "text-emerald-600/70 group-hover:text-emerald-600",
    defaultIcon: <CheckCircle2 className="w-4 h-4 shrink-0" />,
    actionButton: "bg-white text-[#0a0a0a] border border-[#e5e5e5] hover:bg-[#fafafa] shadow-xs",
    dismissButton: "text-emerald-600/60 hover:text-emerald-700 hover:bg-emerald-500/15",
  },
  danger: {
    container: "bg-destructive/[0.08] hover:bg-destructive/[0.11] border-destructive/25 text-foreground",
    iconBox: "bg-[#e7000b]/15 text-[#e7000b] border border-[#e7000b]/20",
    title: "text-[#0a0a0a] font-semibold",
    description: "text-slate-600",
    chevron: "text-destructive/70 group-hover:text-destructive",
    defaultIcon: <AlertCircle className="w-4 h-4 shrink-0" />,
    actionButton: "bg-white text-destructive border border-destructive/25 hover:bg-destructive/10 shadow-xs",
    dismissButton: "text-destructive/60 hover:text-destructive hover:bg-destructive/15",
  },
  destructive: {
    container: "bg-destructive/[0.08] hover:bg-destructive/[0.11] border-destructive/25 text-foreground",
    iconBox: "bg-[#e7000b]/15 text-[#e7000b] border border-[#e7000b]/20",
    title: "text-[#0a0a0a] font-semibold",
    description: "text-slate-600",
    chevron: "text-destructive/70 group-hover:text-destructive",
    defaultIcon: <AlertCircle className="w-4 h-4 shrink-0" />,
    actionButton: "bg-white text-destructive border border-destructive/25 hover:bg-destructive/10 shadow-xs",
    dismissButton: "text-destructive/60 hover:text-destructive hover:bg-destructive/15",
  },
};

export function Banner({
  variant = "info",
  title,
  description,
  children,
  icon,
  action,
  onClick,
  onDismiss,
  onClose,
  dismissPosition = "default",
  className,
  contentClassName,
  hideIconBox = false,
}: BannerProps) {
  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.info;
  const dismissHandler = onDismiss || onClose;

  let renderedIcon: ReactNode = null;
  if (icon === undefined) {
    renderedIcon = config.defaultIcon;
  } else if (icon === null) {
    renderedIcon = null;
  } else if (React.isValidElement(icon)) {
    renderedIcon = icon;
  } else if (typeof icon === "function" || (typeof icon === "object" && icon !== null && "render" in icon)) {
    const IconComp = icon as React.ComponentType<{ className?: string }>;
    renderedIcon = <IconComp className="w-4 h-4 shrink-0" />;
  }

  const isClickable = !action && Boolean(onClick);

  const content = (
    <>
      <div
        className={cn(
          "flex items-start gap-3 sm:gap-3.5 flex-1 min-w-0",
          contentClassName
        )}
      >
        {renderedIcon !== null && (
          hideIconBox ? (
            <div className="shrink-0 mt-0.5 flex items-center justify-center">
              {renderedIcon}
            </div>
          ) : (
            <div
              className={cn(
                "w-8 h-8 sm:w-9 sm:h-9 rounded-[12px] sm:rounded-[14px] flex items-center justify-center shrink-0 mt-0.5",
                config.iconBox
              )}
            >
              {renderedIcon}
            </div>
          )
        )}

        <div className="flex-1 min-w-0 pt-0.5">
          {title && (
            <p className={cn("text-xs sm:text-[13px] font-semibold tracking-tight leading-snug", config.title)}>
              {title}
            </p>
          )}
          {description && (
            <div className={cn("text-xs sm:text-[13px] leading-relaxed font-normal", title && "mt-0.5", config.description)}>
              {description}
            </div>
          )}
          {children}
        </div>
      </div>

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          disabled={action.disabled || action.isLoading}
          className={cn(
            "w-full sm:w-auto h-9 sm:h-8 px-4 sm:px-3.5 text-xs font-medium rounded-[18px] transition-all shrink-0 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed self-stretch sm:self-center mt-0.5 sm:mt-0",
            config.actionButton,
            action.className
          )}
        >
          {action.isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            action.label
          )}
        </button>
      )}

      {dismissHandler && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            dismissHandler(e);
          }}
          title="Fechar aviso"
          className={cn(
            dismissPosition === "floating"
              ? "absolute right-2 top-2 p-1 rounded-md transition-colors cursor-pointer"
              : "shrink-0 p-1 -mr-1 -mt-0.5 rounded-md transition-colors cursor-pointer self-start",
            config.dismissButton
          )}
        >
          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      )}

      {isClickable && (
        <div className="shrink-0 pl-0.5 self-center flex items-center">
          <ChevronRight className={cn("w-4 h-4 transition-all duration-200 group-hover:translate-x-0.5", config.chevron)} />
        </div>
      )}
    </>
  );

  const containerClasses = cn(
    "relative p-3.5 sm:py-3.5 sm:px-4 rounded-[18px] border transition-all text-xs sm:text-[13px]",
    action
      ? "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
      : "flex flex-row items-start justify-between gap-2.5 sm:gap-3",
    isClickable && "cursor-pointer group text-left w-full active:scale-[0.99]",
    config.container,
    className
  );

  if (isClickable) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        className={containerClasses}
      >
        {content}
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {content}
    </div>
  );
}
