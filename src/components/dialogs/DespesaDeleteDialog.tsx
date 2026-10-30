import { useEffect, useState } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { cn } from "@/lib/utils";
import { DESPESA_ESCOPO_ACAO, DespesaEscopoAcao } from "@/constants/financeiro.constants";
import { formatCurrency } from "@/utils/formatters/currency";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export interface DespesaToDeleteTarget {
  id: string;
  descricao: string;
  valor_previsto: number;
  grupo_parcelamento_id?: string | null;
  numero_parcela?: number | null;
  total_parcelas?: number | null;
  is_recorrente?: boolean;
}

export interface DespesaDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  despesa?: DespesaToDeleteTarget | null;
  onConfirm: (escopo: DespesaEscopoAcao) => Promise<void> | void;
  isLoading?: boolean;
}

export function DespesaDeleteDialog({
  open,
  onOpenChange,
  despesa,
  onConfirm,
  isLoading = false,
}: DespesaDeleteDialogProps) {
  const [escopo, setEscopo] = useState<DespesaEscopoAcao | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setEscopo(null);
    }
  }, [open, despesa]);

  if (!despesa) return null;

  const isParcelado = Boolean(despesa.grupo_parcelamento_id && despesa.total_parcelas && despesa.total_parcelas > 1);
  const isRecorrente = Boolean(!isParcelado && despesa.is_recorrente);
  const isMultiplo = isParcelado || isRecorrente;

  const handleClose = () => {
    safeCloseDialog(() => onOpenChange(false));
  };

  const handleConfirm = async () => {
    if (isMultiplo && !escopo) {
      toast.error("Selecione qual opção de exclusão você deseja aplicar.");
      return;
    }

    const escopoFinal: DespesaEscopoAcao = isMultiplo && escopo ? escopo : DESPESA_ESCOPO_ACAO.UNICA;
    setIsSubmitting(true);
    try {
      await onConfirm(escopoFinal);
      handleClose();
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  const numeroParcela = despesa.numero_parcela || 1;
  const totalParcelas = despesa.total_parcelas || 1;

  return (
    <BaseDialog
      open={open}
      onOpenChange={(val) => !val && handleClose()}
      maxWidth="md"
      lockClose={isLoading || isSubmitting}
    >
      <BaseDialog.Header
        icon={<Trash2 className="w-5 h-5 text-destructive" />}
        title={isParcelado ? "Excluir Parcela da Despesa" : isRecorrente ? "Excluir Despesa Recorrente" : "Excluir Conta a Pagar"}
        subtitle={`Lançamento: ${despesa.descricao} (${formatCurrency(despesa.valor_previsto)})`}
        onClose={handleClose}
      />
      <BaseDialog.Body>
        <div className="space-y-4 pt-1">
          {!isMultiplo ? (
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tem certeza que deseja excluir esta conta a pagar? Esta ação removerá o compromisso financeiro pendente.
            </p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isParcelado
                  ? `Esta despesa faz parte de um parcelamento em ${totalParcelas}x (atualmente na parcela ${numeroParcela}). Escolha o escopo da exclusão:`
                  : "Esta é uma despesa de recorrência mensal contínua. Escolha o escopo da exclusão:"}
              </p>

              <div className="grid grid-cols-1 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setEscopo(DESPESA_ESCOPO_ACAO.UNICA)}
                  className={cn(
                    "flex items-start gap-3 p-3.5 rounded-[16px] border text-left transition-all text-xs cursor-pointer",
                    escopo === DESPESA_ESCOPO_ACAO.UNICA
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-xs"
                      : "border-border bg-card hover:bg-muted/40"
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 transition-colors",
                      escopo === DESPESA_ESCOPO_ACAO.UNICA ? "border-primary bg-primary" : "border-muted-foreground/40 bg-background"
                    )}
                  >
                    {escopo === DESPESA_ESCOPO_ACAO.UNICA && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block">
                      {isParcelado ? `Somente esta parcela (${numeroParcela}/${totalParcelas})` : "Somente este mês"}
                    </span>
                    <span className="text-[11px] text-muted-foreground leading-relaxed block mt-0.5">
                      {isParcelado
                        ? "Remove apenas a parcela atual, mantendo as demais parcelas inalteradas."
                        : "Cancela apenas o compromisso desta competência, mantendo a recorrência ativa nos próximos meses."}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setEscopo(DESPESA_ESCOPO_ACAO.FUTURAS)}
                  className={cn(
                    "flex items-start gap-3 p-3.5 rounded-[16px] border text-left transition-all text-xs cursor-pointer",
                    escopo === DESPESA_ESCOPO_ACAO.FUTURAS
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-xs"
                      : "border-border bg-card hover:bg-muted/40"
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 transition-colors",
                      escopo === DESPESA_ESCOPO_ACAO.FUTURAS ? "border-primary bg-primary" : "border-muted-foreground/40 bg-background"
                    )}
                  >
                    {escopo === DESPESA_ESCOPO_ACAO.FUTURAS && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block">
                      {isParcelado ? `Esta e as futuras parcelas (${numeroParcela} até ${totalParcelas})` : "Este mês e todas as futuras ocorrências"}
                    </span>
                    <span className="text-[11px] text-muted-foreground leading-relaxed block mt-0.5">
                      {isParcelado
                        ? "Remove a parcela atual e todas as seguintes pendentes, preservando parcelas anteriores."
                        : "Cancela este mês e encerra a recorrência para os meses futuros."}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setEscopo(DESPESA_ESCOPO_ACAO.TODAS)}
                  className={cn(
                    "flex items-start gap-3 p-3.5 rounded-[16px] border text-left transition-all text-xs cursor-pointer",
                    escopo === DESPESA_ESCOPO_ACAO.TODAS
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-xs"
                      : "border-border bg-card hover:bg-muted/40"
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 transition-colors",
                      escopo === DESPESA_ESCOPO_ACAO.TODAS ? "border-primary bg-primary" : "border-muted-foreground/40 bg-background"
                    )}
                  >
                    {escopo === DESPESA_ESCOPO_ACAO.TODAS && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block">
                      {isParcelado ? `Todas as parcelas do grupo (1 a ${totalParcelas})` : "Todas as ocorrências (exclusão total)"}
                    </span>
                    <span className="text-[11px] text-muted-foreground leading-relaxed block mt-0.5">
                      {isParcelado
                        ? "Remove todas as parcelas pendentes vinculadas a esta negociação."
                        : "Exclui a despesa mestre e todo o vínculo recorrente."}
                    </span>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          disabled={isLoading || isSubmitting}
          onClick={handleClose}
          type="button"
        />
        <BaseDialog.Action
          label="Excluir Lançamento"
          variant="destructive"
          isLoading={isLoading || isSubmitting}
          onClick={handleConfirm}
          type="button"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
