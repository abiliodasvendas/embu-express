import { BaseDialog } from "@/components/ui/BaseDialog";
import { useExtratoContaBancariaViewModel } from "@/hooks/ui/contas-bancarias/useExtratoContaBancariaViewModel";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { ReceiptText } from "lucide-react";
import { ExtratoToolbar } from "./extrato-conta-bancaria/ExtratoToolbar";
import { ExtratoResumoKpis } from "./extrato-conta-bancaria/ExtratoResumoKpis";
import { ExtratoLancamentosTable } from "./extrato-conta-bancaria/ExtratoLancamentosTable";

export interface ExtratoContaBancariaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contaId: string;
  bancoNome?: string;
  agencia?: string | null;
  contaNumero?: string | null;
  empresaNome?: string;
  mesInicial?: number;
  anoInicial?: number;
}

export function ExtratoContaBancariaDialog({
  open,
  onOpenChange,
  contaId,
  bancoNome,
  agencia,
  contaNumero,
  empresaNome,
  mesInicial,
  anoInicial,
}: ExtratoContaBancariaDialogProps) {
  const {
    mes,
    setMes,
    ano,
    setAno,
    tipoFiltro,
    setTipoFiltro,
    busca,
    setBusca,
    nomeBanco,
    agInfo,
    ccInfo,
    empInfo,
    resumo,
    itensFiltrados,
    anosDisponiveis,
    isLoading,
    isFetching,
    handleNovoLancamento,
    handleNovaTransferencia,
    handleDeleteMovimentacaoAvulsa,
  } = useExtratoContaBancariaViewModel({
    open,
    contaId,
    bancoNome,
    agencia,
    contaNumero,
    empresaNome,
    mesInicial,
    anoInicial,
  });

  const handleClose = () => {
    safeCloseDialog(() => onOpenChange(false));
  };

  return (
    <BaseDialog open={open} onOpenChange={handleClose} maxWidth="5xl">
      <BaseDialog.Header
        icon={<ReceiptText className="w-5 h-5 text-foreground" />}
        title={`Extrato Bancário — ${nomeBanco}`}
        subtitle={`Ag: ${agInfo} • Conta: ${ccInfo} • ${empInfo}`}
        onClose={handleClose}
      />

      <BaseDialog.Body className="space-y-5">
        <ExtratoToolbar
          busca={busca}
          onBuscaChange={setBusca}
          tipoFiltro={tipoFiltro}
          onTipoFiltroChange={setTipoFiltro}
          mes={mes}
          onMesChange={setMes}
          ano={ano}
          onAnoChange={setAno}
          anosDisponiveis={anosDisponiveis}
          onNovaTransferencia={handleNovaTransferencia}
          onNovoLancamento={handleNovoLancamento}
        />

        <ExtratoResumoKpis
          resumo={resumo}
          isLoading={isLoading}
          isFetching={isFetching}
        />

        <ExtratoLancamentosTable
          mes={mes}
          ano={ano}
          saldoAnterior={resumo.saldo_anterior}
          itensFiltrados={itensFiltrados}
          isLoading={isLoading}
          isFetching={isFetching}
          onDeleteMovimentacaoAvulsa={handleDeleteMovimentacaoAvulsa}
        />
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Fechar Extrato"
          variant="secondary"
          onClick={handleClose}
          type="button"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

export default ExtratoContaBancariaDialog;
