import { Badge } from "@/components/ui/badge";
import { messages } from "@/constants/messages";
import { cn } from "@/lib/utils";
import { getStatusColor, getStatusText } from "@/utils/formatters";

interface StatusBadgeProps {
  /**
   * Status pode ser booleano (Ativo/Inativo) ou string (Pago/Pendente/Atrasado)
   */
  status: boolean | string;
  


  /**
   * Define explicitamente labels customizadas para true/false
   */
  trueLabel?: string;
  falseLabel?: string;

  className?: string;
}

export function StatusBadge({
  status,
  trueLabel = messages.labels.ativo,
  falseLabel = messages.labels.inativo,
  className,
}: StatusBadgeProps) {

  // Caso 1: Status Booleano (Ativo / Inativo)
  if (typeof status === "boolean") {
    return status ? (
      <Badge
        variant="outline"
        className={cn(
          "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 font-medium",
          className
        )}
      >
        {trueLabel}
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className={cn(
          "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 font-medium",
          className
        )}
      >
        {falseLabel}
      </Badge>
    );
  }

  // Caso 2: Status String
  const colorClass = getStatusColor(status);
  const text = getStatusText(status);

  return (
    <Badge
      variant="secondary"
      className={cn("font-medium", colorClass, className)}
    >
      {text}
    </Badge>
  );
}
