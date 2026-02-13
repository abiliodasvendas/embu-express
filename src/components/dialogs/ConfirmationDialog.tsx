import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning" | "success";
  isLoading?: boolean;
}

export default function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  isLoading = false,
}: ConfirmationDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  
  const showLoading = isLoading || internalLoading;

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = "";
        document.body.style.removeProperty("overflow");
        document.body.removeAttribute("data-scroll-locked");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const getIcon = () => {
    switch (variant) {
      case "destructive": return <AlertCircle className="w-6 h-6 text-red-600" />;
      case "warning": return <AlertTriangle className="w-6 h-6 text-amber-600" />;
      case "success": return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
      default: return <AlertCircle className="w-6 h-6 text-blue-600" />;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "destructive": return "bg-red-600 hover:bg-red-700 shadow-red-500/20";
      case "warning": return "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20";
      case "success": return "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20";
      default: return "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20";
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[90vw] max-w-sm rounded-[2rem] border-0 shadow-2xl p-0 overflow-hidden bg-white gap-0 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-8 pb-6 flex flex-col items-center text-center space-y-4">
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-sm border",
                variant === "destructive" ? "bg-red-50 border-red-100" :
                variant === "warning" ? "bg-amber-50 border-amber-100" :
                variant === "success" ? "bg-emerald-50 border-emerald-100" :
                "bg-blue-50 border-blue-100"
            )}>
                {getIcon()}
            </div>

            <div className="space-y-2">
                <AlertDialogTitle className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tight">
                    {title}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-500 text-sm leading-relaxed px-2 font-medium">
                    {description}
                </AlertDialogDescription>
            </div>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3 bg-gray-50/50 border-t border-gray-50 mt-2">
          <AlertDialogCancel
            disabled={showLoading}
            className="h-11 rounded-xl border-gray-200 bg-white hover:bg-gray-100 text-gray-600 font-bold transition-all shadow-sm"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={async (e) => {
              e.preventDefault();
              if (onConfirm) {
                  const result = onConfirm();
                  if (result instanceof Promise) {
                      setInternalLoading(true);
                      try {
                          await result;
                      } finally {
                          setInternalLoading(false);
                      }
                  }
              }
            }}
            disabled={showLoading}
            className={cn(
              "h-11 rounded-xl font-bold shadow-lg transition-all text-white min-w-0 px-4",
              getVariantStyles()
            )}
          >
            {showLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
               confirmText
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}