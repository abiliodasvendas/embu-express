import { Can } from "@/components/auth/Can";
import { ScaleIndicators } from "@/components/common/ScaleIndicators";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { cn } from "@/lib/utils";
import { ColaboradorCliente } from "@/types/database";
import { formatCurrency } from "@/utils/formatters/currency";
import { Bike, CalendarOff, Edit2, RotateCcw, Trash2 } from "lucide-react";

interface CollaboratorTurnCardProps {
  link: ColaboradorCliente;
  isClosed?: boolean;
  onEdit?: (link: ColaboradorCliente) => void;
  onEnd?: (link: ColaboradorCliente) => void;
  onReactivate?: (link: ColaboradorCliente) => void;
  onDelete?: (turnId: number) => void;
}

export function CollaboratorTurnCard({
  link,
  isClosed = false,
  onEdit,
  onEnd,
  onReactivate,
  onDelete,
}: CollaboratorTurnCardProps) {
  const hasValues = Boolean(
    link.valor_contrato ||
    link.valor_bonus ||
    link.valor_aluguel ||
    link.ajuda_custo ||
    link.valor_adiantamento ||
    link.taxa_entrega
  );

  const totalGanhos =
    (link.valor_contrato || 0) +
    (link.valor_aluguel || 0) +
    (link.valor_bonus || 0) +
    (link.ajuda_custo || 0);

  return (
    <div
      className={cn(
        "group border border-border p-5 rounded-[18px] transition-all relative bg-card shadow-xs",
        !isClosed && "hover:border-primary/40"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-muted shadow-xs border border-border rounded-[14px]">
          <Bike className={cn("h-5 w-5", isClosed ? "text-gray-400" : "text-primary")} />
        </div>

        <Can I={PERMISSIONS.USUARIOS.EDITAR}>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button
                onClick={() => onEdit(link)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-[8px]"
                title="Ver / Editar Turno"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            )}

            {!isClosed && onEnd && (
              <Button
                onClick={() => onEnd(link)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-[8px]"
                title="Encerrar Vínculo"
              >
                <CalendarOff className="h-3.5 w-3.5" />
              </Button>
            )}

            {isClosed && onReactivate && (
              <Button
                onClick={() => onReactivate(link)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-emerald-600 rounded-[8px]"
                title="Reativar Vínculo"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}

            {onDelete && (
              <Button
                onClick={() => onDelete(link.id)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-[8px]"
                title="Remover Turno"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </Can>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <h4 className={cn("font-bold leading-tight", isClosed ? "text-gray-700" : "text-gray-800")}>
              {link.cliente?.nome_fantasia}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className={cn("text-[11px] font-medium capitalize", isClosed ? "text-gray-400" : "text-gray-500")}>
                {link.unidade?.nome_unidade?.toLowerCase()}
              </p>
              {link.horarios?.[0] && (
                <>
                  <span className="text-gray-300 text-[10px]">•</span>
                  <span className={cn("text-[11px] font-medium", isClosed ? "text-gray-500" : "font-bold text-primary")}>
                    {link.horarios[0].hora_inicio.substring(0, 5)} - {link.horarios[0].hora_fim.substring(0, 5)}
                  </span>
                </>
              )}
            </div>
          </div>

          {isClosed && link.data_fim && (
            <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 font-bold text-[10px] shrink-0">
              Encerrado em: {new Date(link.data_fim + "T12:00:00").toLocaleDateString("pt-BR")}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1.5">
              Escala Semanal
            </p>
            <div className={cn("flex flex-wrap gap-1", isClosed && "opacity-70")}>
              {link.horarios && link.horarios.length > 0 ? (
                <ScaleIndicators
                  activeDays={link.horarios.map((h) => h.dia_semana)}
                  availableDays={link.unidade?.escala_semanal}
                  size="sm"
                  variant="condensed"
                />
              ) : (
                <Badge variant="outline" className="bg-red-50 border-red-200 text-red-600 font-bold text-[9px]">
                  Sem horário
                </Badge>
              )}
            </div>
          </div>

          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Empresa</p>
            <p className={cn("text-sm font-medium mt-0.5", isClosed ? "text-gray-500" : "text-gray-600")}>
              {link.empresa?.nome_fantasia || link.empresa?.razao_social || "EE"}
            </p>
          </div>

          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Taxa Entrega</p>
            <p className={cn("text-sm font-bold mt-0.5", isClosed ? "text-gray-600" : "text-gray-700")}>
              {link.taxa_entrega ? formatCurrency(link.taxa_entrega) : "-"}
            </p>
          </div>
        </div>

        {hasValues && (
          <div className={cn("pt-3 mt-3 border-t border-dashed border-border space-y-2", isClosed && "opacity-90")}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Boolean(link.valor_contrato) && (
                <div className="bg-muted/40 p-2.5 rounded-[12px] border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Contrato Base
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {formatCurrency(link.valor_contrato)}
                  </span>
                </div>
              )}

              {Boolean(link.valor_bonus) && (
                <div className="bg-muted/40 p-2.5 rounded-[12px] border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Zero Falta / Bônus
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {formatCurrency(link.valor_bonus)}
                  </span>
                </div>
              )}

              {Boolean(link.valor_aluguel) && (
                <div className="bg-muted/40 p-2.5 rounded-[12px] border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Aluguel Moto
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {formatCurrency(link.valor_aluguel)}
                  </span>
                </div>
              )}

              {Boolean(link.ajuda_custo) && (
                <div className="bg-muted/40 p-2.5 rounded-[12px] border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Ajuda de Custo
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {formatCurrency(link.ajuda_custo)}
                  </span>
                </div>
              )}

              {Boolean(link.valor_adiantamento) && (
                <div className="bg-muted/40 p-2.5 rounded-[12px] border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Adiantamento (Vale)
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    -{formatCurrency(link.valor_adiantamento)}
                  </span>
                </div>
              )}

              {Boolean(link.taxa_entrega) && (
                <div className="bg-muted/40 p-2.5 rounded-[12px] border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Taxa Entrega
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {formatCurrency(link.taxa_entrega)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-1.5 px-0.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                Remuneração Total
              </span>
              <span className={cn("text-sm font-extrabold", isClosed ? "text-gray-700" : "text-primary")}>
                {formatCurrency(totalGanhos)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
