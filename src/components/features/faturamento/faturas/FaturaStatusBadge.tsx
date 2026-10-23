import { Badge } from "@/components/ui/badge";
import { STATUS_FATURA } from "@/constants/financeiro.constants";
import type { StatusFatura } from "@/types/database";

interface FaturaStatusBadgeProps {
  status: StatusFatura;
  isPrevisao?: boolean;
}

export function FaturaStatusBadge({ status, isPrevisao }: FaturaStatusBadgeProps) {
  if (isPrevisao) {
    return (
      <Badge
        variant="secondary"
        className="text-[11px] bg-primary/10 text-primary border-primary/20 px-2.5 py-0.5 font-medium rounded-[18px]"
      >
        Previsão
      </Badge>
    );
  }

  switch (status) {
    case STATUS_FATURA.PENDENTE:
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-[11px] font-medium px-2.5 py-0.5 rounded-[18px]"
        >
          Pendente
        </Badge>
      );
    case STATUS_FATURA.PAGO_PARCIAL:
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 text-[11px] font-medium px-2.5 py-0.5 rounded-[18px]"
        >
          Pago Parcial
        </Badge>
      );
    case STATUS_FATURA.LIQUIDADA:
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-medium px-2.5 py-0.5 rounded-[18px]"
        >
          Quitado / Recebido
        </Badge>
      );
    case STATUS_FATURA.CANCELADA:
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
