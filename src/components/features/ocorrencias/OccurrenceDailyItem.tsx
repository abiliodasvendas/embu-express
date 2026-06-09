import React from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LANCAMENTO_TIPO } from "@/constants/financeiro.constants";

interface OccurrenceDailyItemProps {
  occurrence: any;
  onClick: (occurrence: any) => void;
  showCollaborator?: boolean;
}

import { usePermissions } from "@/hooks/business/usePermissions";

export function OccurrenceDailyItem({
  occurrence: oc,
  onClick,
  showCollaborator = true,
}: OccurrenceDailyItemProps) {
  const { isSuperAdmin } = usePermissions();
  return (
    <div
      onClick={() => onClick(oc)}
      className="relative pl-9 py-4 group cursor-pointer transition-all hover:bg-gray-50/50 rounded-2xl"
    >
      {/* Indicador Lateral Premium (Status) */}
      <div className={cn(
        "absolute left-0 top-[22px] w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-all group-hover:scale-110",
        !oc.impacto_financeiro
          ? "bg-slate-300"
          : oc.tipo_lancamento === LANCAMENTO_TIPO.SAIDA
            ? "bg-red-500"
            : "bg-green-500"
      )}>
        <div className="w-1.5 h-1.5 rounded-full bg-white" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
        <div className="flex-1 min-w-0">
          {showCollaborator && (
            <div className="text-[11px] font-black text-gray-900 uppercase tracking-tight mb-0.5">
              {oc.colaborador?.nome_completo}
            </div>
          )}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
              {format(parseISO(oc.data_ocorrencia), "dd 'de' MMM", { locale: ptBR })}
            </span>
            <Badge variant="outline" className="text-[9px] h-3.5 px-1.5 border-gray-100 text-gray-400 font-bold bg-white/50">
              {oc.tipo?.descricao || 'Ocorrência'}
            </Badge>
            {isSuperAdmin && oc.criado_por_usuario?.nome_completo && (
              <span className="text-[10px] text-gray-400 font-medium italic">
                (Registrado por {oc.criado_por_usuario.nome_completo.split(' ')[0]})
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-700 truncate pr-4 italic">
            {oc.observacao || 'Sem observação'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {oc.impacto_financeiro && (
            <div className={cn(
              "text-xs font-black px-2 py-1 rounded-lg",
              oc.tipo_lancamento === LANCAMENTO_TIPO.SAIDA ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"
            )}>
              {oc.tipo_lancamento === LANCAMENTO_TIPO.SAIDA ? "-" : "+"} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(oc.valor || 0)}
            </div>
          )}
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
        </div>
      </div>
    </div>
  );
}
