import { BaseDialog } from "@/components/ui/BaseDialog";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import React, { useState } from "react";

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
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
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  isLoading = false,
}: ConfirmationDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const showLoading = isLoading || internalLoading;

  const getIcon = () => {
    switch (variant) {
      case "destructive":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-foreground" />;
    }
  };

  const handleClose = () => {
    if (showLoading) return;
    onCancel?.();
    safeCloseDialog(() => onOpenChange(false));
  };

  const handleConfirm = async () => {
    if (onConfirm) {
      setInternalLoading(true);
      try {
        await onConfirm();
        safeCloseDialog(() => onOpenChange(false));
      } catch {
        // Mantém aberto se a Promise rejeitar
      } finally {
        setInternalLoading(false);
      }
    } else {
      safeCloseDialog(() => onOpenChange(false));
    }
  };

  const actionVariant = variant === "destructive" ? "destructive" : "primary";

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="sm"
      lockClose={showLoading}
    >
      <BaseDialog.Header
        title={title}
        icon={getIcon()}
        onClose={handleClose}
      />
      <BaseDialog.Body>
        <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
          {description}
        </div>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action
          label={cancelText}
          variant="secondary"
          disabled={showLoading}
          onClick={handleClose}
          type="button"
        />
        <BaseDialog.Action
          label={showLoading ? "Processando..." : confirmText}
          variant={actionVariant}
          isLoading={showLoading}
          onClick={handleConfirm}
          disabled={showLoading}
          type="button"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}