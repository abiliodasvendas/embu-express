import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

const bannerVariants = cva(
  "relative w-full rounded-2xl border p-4 flex items-start gap-3 text-sm transition-all",
  {
    variants: {
      variant: {
        info: "border-blue-200 bg-blue-50/80 text-blue-900 [&>svg]:text-blue-600",
        warning: "border-amber-200 bg-amber-50/90 text-amber-900 [&>svg]:text-amber-600",
        destructive: "border-red-200 bg-red-50/90 text-red-900 [&>svg]:text-red-600",
        success: "border-emerald-200 bg-emerald-50/80 text-emerald-900 [&>svg]:text-emerald-600",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

const defaultIcons = {
  info: Info,
  warning: AlertTriangle,
  destructive: AlertCircle,
  success: CheckCircle2,
};

export interface BannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bannerVariants> {
  title?: string;
  description?: string;
  onClose?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export function Banner({
  className,
  variant = "info",
  title,
  description,
  children,
  onClose,
  icon: CustomIcon,
  ...props
}: BannerProps) {
  const IconComponent = CustomIcon || defaultIcons[variant || "info"];

  return (
    <div
      role="alert"
      className={cn(bannerVariants({ variant }), className)}
      {...props}
    >
      {IconComponent && <IconComponent className="h-5 w-5 shrink-0 mt-0.5" />}
      <div className="flex-1 space-y-1">
        {title && <h5 className="font-semibold leading-tight">{title}</h5>}
        {description && <div className="text-xs leading-relaxed opacity-90">{description}</div>}
        {children}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-inherit opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </button>
      )}
    </div>
  );
}
