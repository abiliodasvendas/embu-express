import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { cn } from "@/lib/utils";
import { Ocorrencia } from "@/types/database";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle, ArrowDownCircle, ArrowUpCircle, Briefcase, Calendar, Clock, User, Trash2, Edit2 } from "lucide-react";
import { LANCAMENTO_TIPO } from "@/constants/financeiro.constants";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";

interface OccurrenceDetailsDialogProps {
  occurrence: Ocorrencia | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (id: number) => void | Promise<void>;
  onEdit?: (occurrence: Ocorrencia) => void;
}

export function OccurrenceDetailsDialog({
  occurrence,
  open,
  onOpenChange,
  onDelete,
  onEdit,
}: OccurrenceDetailsDialogProps) {
  if (!occurrence) return null;

  const isNegative = occurrence.tipo_lancamento === LANCAMENTO_TIPO.SAIDA;

  const formatTime = (time?: string) => {
    if (!time) return "";
    return time.slice(0, 5);
  };

  const handleClose = () => {
    safeCloseDialog(() => onOpenChange(false));
  };

  const handleDelete = () => {
    if (occurrence && onDelete) {
      safeCloseDialog(() => onDelete(occurrence.id));
    }
  };

  const handleEdit = () => {
    if (occurrence && onEdit) {
      safeCloseDialog(() => onEdit(occurrence));
    }
  };

  return (
    <BaseDialog open={open} onOpenChange={(val) => !val && handleClose()} maxWidth="md">
      <BaseDialog.Header
        title="Detalhes da Ocorrência"
        subtitle="Visualização dos dados e impacto desta ocorrência"
        icon={<AlertCircle className="w-5 h-5 text-foreground" />}
      />

      <BaseDialog.Body className="space-y-4">
        <div className="bg-muted/30 rounded-[20px] p-4 border border-border flex flex-col items-center text-center space-y-2">
          <Badge variant="outline" className="bg-muted text-foreground border-border px-3 py-1 rounded-[10px] text-xs font-semibold">
            {occurrence.tipo?.descricao || "Ocorrência"}
          </Badge>
          <h3 className="text-sm font-medium text-foreground italic leading-relaxed max-w-sm">
            "{occurrence.observacao}"
          </h3>
        </div>

        <div className="space-y-2.5">
          <div className="bg-card rounded-[18px] p-3.5 shadow-xs border border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Colaborador</p>
              <p className="text-xs sm:text-sm font-semibold text-foreground truncate mt-0.5">
                {occurrence.colaborador?.nome_completo || "Colaborador não identificado"}
              </p>
            </div>
          </div>

          <div className="bg-card rounded-[18px] p-3.5 shadow-xs border border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Data do Registro</p>
              <p className="text-xs sm:text-sm font-semibold text-foreground mt-0.5">
                {format(new Date(occurrence.data_ocorrencia), "PPPP", { locale: ptBR })}
              </p>
            </div>
          </div>

          <div className="bg-card rounded-[18px] p-3.5 shadow-xs border border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Turno</p>
              {occurrence.colaborador_cliente_id ? (
                <p className="text-xs sm:text-sm font-semibold text-foreground mt-0.5">
                  {occurrence.vinculo?.cliente?.nome_fantasia || "Turno Vinculado"}{" "}
                  {occurrence.vinculo?.hora_inicio && occurrence.vinculo?.hora_fim && (
                    <span className="text-xs font-normal text-muted-foreground font-mono">
                      ({formatTime(occurrence.vinculo.hora_inicio)} - {formatTime(occurrence.vinculo.hora_fim)})
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-xs sm:text-sm font-semibold text-foreground italic mt-0.5">
                  Geral (Avulsa)
                </p>
              )}
            </div>
          </div>

          {occurrence.impacto_financeiro && (
            <div className="rounded-[18px] p-4 shadow-xs border border-border bg-card flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[10px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
                    {isNegative ? <ArrowDownCircle className="w-4 h-4 text-destructive" /> : <ArrowUpCircle className="w-4 h-4 text-foreground" />}
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Lançamento</p>
                    <p className="text-xs font-semibold text-foreground">
                      {isNegative ? "Saída (Débito)" : "Entrada (Crédito)"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Impacto Financeiro</p>
                  <p className={cn("text-base font-bold font-mono", isNegative ? "text-destructive" : "text-foreground")}>
                    {isNegative ? "-" : "+"} {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(occurrence.valor || 0)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-card rounded-[18px] p-3 shadow-xs border border-border divide-y divide-border/60">
            <div className="py-1.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Registrado por</span>
              <span className="font-semibold text-foreground">{occurrence.criado_por_usuario?.nome_completo || "Sistema"}</span>
            </div>
            <div className="py-1.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Criado em</span>
              <span className="font-semibold text-foreground font-mono">
                {occurrence.created_at ? format(new Date(occurrence.created_at), "Pp", { locale: ptBR }) : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        {onDelete && (
          <Button
            variant="outline"
            onClick={handleDelete}
            className="sm:mr-auto border-destructive/20 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
        )}
        <Button
          variant="outline"
          onClick={handleClose}
        >
          Fechar
        </Button>
        {onEdit && (
          <Button
            onClick={handleEdit}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Editar
          </Button>
        )}
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
