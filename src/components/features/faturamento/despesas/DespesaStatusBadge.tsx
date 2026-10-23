import { Badge } from "@/components/ui/badge";
import { STATUS_DESPESA } from "@/constants/financeiro.constants";
import type { StatusDespesa } from "@/types/database";

interface DespesaStatusBadgeProps {
  status: StatusDespesa;
}

export function DespesaStatusBadge({ status }: DespesaStatusBadgeProps) {
  switch (status) {
    case STATUS_DESPESA.PENDENTE:
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-[11px] font-medium px-2.5 py-0.5 rounded-[18px]"
        >
          A Pagar
        </Badge>
      );
    case STATUS_DESPESA.PAGO:
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-medium px-2.5 py-0.5 rounded-[18px]"
        >
          Pago
        </Badge>
      );
    case STATUS_DESPESA.ADIADA:
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 text-[11px] font-medium px-2.5 py-0.5 rounded-[18px]"
        >
          Adiada
        </Badge>
      );
    case STATUS_DESPESA.CANCELADO:
      return (
        <Badge
          variant="outline"
          className="bg-muted/50 text-muted-foreground border-border text-[11px] font-medium px-2.5 py-0.5 rounded-[18px]"
        >
          Cancelada
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="bg-muted/70 text-foreground border-border text-[11px] font-medium px-2.5 py-0.5 rounded-[18px]"
        >
          {status}
        </Badge>
      );
  }
}
