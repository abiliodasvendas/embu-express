import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronRight, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LANCAMENTO_TIPO } from "@/constants/financeiro.constants";
import { Ocorrencia } from "@/types/database";
import { usePermissions } from "@/hooks/business/usePermissions";

interface OccurrenceDailyItemProps {
  occurrence: Ocorrencia;
  onClick: (occurrence: Ocorrencia) => void;
  showCollaborator?: boolean;
}

export function OccurrenceDailyItem({
  occurrence: oc,
  onClick,
  showCollaborator = true,
}: OccurrenceDailyItemProps) {
  const { isSuperAdmin } = usePermissions();
  const isNegative = oc.tipo_lancamento === LANCAMENTO_TIPO.SAIDA;

  return (
    <div
      onClick={() => onClick(oc)}
      className="p-3.5 sm:p-4 rounded-[18px] sm:rounded-[20px] border border-border bg-card shadow-xs transition-all hover:border-foreground/20 cursor-pointer group flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-[12px] bg-muted/70 border border-border flex items-center justify-center shrink-0 text-foreground">
          <AlertCircle className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0 space-y-0.5">
          {showCollaborator && (
            <div className="text-xs sm:text-sm font-semibold text-foreground truncate leading-tight">
              {oc.colaborador?.nome_completo}
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {format(parseISO(oc.data_ocorrencia), "dd 'de' MMM", { locale: ptBR })}
            </span>
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 rounded-[6px] border-border text-foreground font-semibold bg-muted/60 uppercase">
              {oc.tipo?.descricao || "Ocorrência"}
            </Badge>
            {isSuperAdmin && oc.criado_por_usuario?.nome_completo && (
              <span className="text-[10px] text-muted-foreground/70 font-medium italic">
                (Por {oc.criado_por_usuario.nome_completo.split(" ")[0]})
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate italic">
            {oc.observacao || "Sem observação"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {oc.impacto_financeiro && (
          <span
            className={cn(
              "text-xs sm:text-sm font-bold font-mono px-2 py-0.5 rounded-[8px] bg-muted/60 border border-border",
              isNegative ? "text-destructive" : "text-foreground"
            )}
          >
            {isNegative ? "-" : "+"} {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(oc.valor || 0)}
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    </div>
  );
}
