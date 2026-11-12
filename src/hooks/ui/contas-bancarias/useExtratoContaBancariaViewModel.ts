import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useExtratoContaBancaria } from "@/hooks/api/useContasBancarias";
import { useMovimentacoesAvulsas } from "@/hooks/api/useMovimentacoesAvulsas";
import { useLayout } from "@/contexts/LayoutContext";
import { ExtratoBancarioItem } from "@/types/database";
import {
  FILTRO_EXTRATO_TIPO,
  FiltroExtratoTipoType,
  MODO_LANCAMENTO_AVULSO,
  ORIGEM_EXTRATO_BANCARIO,
} from "@/constants/financeiro.constants";
import { formatCurrency } from "@/utils/formatters/currency";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";

export type TipoFiltroExtrato = FiltroExtratoTipoType;

export interface UseExtratoContaBancariaViewModelProps {
  open: boolean;
  contaId: string;
  bancoNome?: string;
  agencia?: string | null;
  contaNumero?: string | null;
  empresaNome?: string;
  mesInicial?: number;
  anoInicial?: number;
}

export function useExtratoContaBancariaViewModel({
  open,
  contaId,
  bancoNome,
  agencia,
  contaNumero,
  empresaNome,
  mesInicial,
  anoInicial,
}: UseExtratoContaBancariaViewModelProps) {
  const {
    openMovimentacaoAvulsaDialog,
    openConfirmationDialog,
    closeConfirmationDialog,
  } = useLayout();
  const { deleteMutation } = useMovimentacoesAvulsas(undefined, { enabled: false });

  const hoje = new Date();
  const [mes, setMes] = useState<number>(mesInicial || hoje.getMonth() + 1);
  const [ano, setAno] = useState<number>(anoInicial || hoje.getFullYear());
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltroExtrato>(
    FILTRO_EXTRATO_TIPO.TODOS
  );
  const [busca, setBusca] = useState<string>("");

  useEffect(() => {
    if (open) {
      if (mesInicial) setMes(mesInicial);
      if (anoInicial) setAno(anoInicial);
      setTipoFiltro(FILTRO_EXTRATO_TIPO.TODOS);
      setBusca("");
    }
  }, [open, mesInicial, anoInicial]);

  const {
    data: extrato,
    isLoading,
    isFetching,
    refetch,
  } = useExtratoContaBancaria(contaId, mes, ano, open);

  const contaInfo = extrato?.conta;
  const nomeBanco = contaInfo?.banco_nome || bancoNome || "Conta Bancária";
  const agInfo = contaInfo?.agencia ?? agencia ?? "S/A";
  const ccInfo = contaInfo?.conta ?? contaNumero ?? "S/C";
  const empInfo =
    contaInfo?.empresa?.nome_fantasia ||
    contaInfo?.empresa?.razao_social ||
    empresaNome ||
    "Empresa";

  const resumo = extrato?.resumo || {
    saldo_anterior: 0,
    total_entradas: 0,
    total_saidas: 0,
    resultado_periodo: 0,
    saldo_final: 0,
  };

  const itensFiltrados = useMemo(() => {
    const lista = extrato?.itens || [];
    return lista.filter((item) => {
      if (
        tipoFiltro !== FILTRO_EXTRATO_TIPO.TODOS &&
        item.tipo !== tipoFiltro
      ) {
        return false;
      }
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        return (
          item.descricao.toLowerCase().includes(termo) ||
          item.origem_label.toLowerCase().includes(termo)
        );
      }
      return true;
    });
  }, [extrato?.itens, tipoFiltro, busca]);

  const handleNovoLancamento = () => {
    openMovimentacaoAvulsaDialog({
      contaBancariaInicialId: contaId,
      empresaIdInicial: contaInfo?.empresa_id ?? null,
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleNovaTransferencia = () => {
    openMovimentacaoAvulsaDialog({
      initialMode: MODO_LANCAMENTO_AVULSO.TRANSFERENCIA,
      contaBancariaInicialId: contaId,
      empresaIdInicial: contaInfo?.empresa_id ?? null,
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleDeleteMovimentacaoAvulsa = (item: ExtratoBancarioItem) => {
    if (!item.movimentacao_avulsa_id) return;
    const isTransferencia =
      item.origem === ORIGEM_EXTRATO_BANCARIO.TRANSFERENCIA_ENTRE_CONTAS;

    openConfirmationDialog({
      title: isTransferencia
        ? "Excluir Transferência entre Contas"
        : "Excluir Lançamento Avulso",
      description: isTransferencia
        ? `Deseja excluir a transferência "${item.descricao}" no valor de ${formatCurrency(item.valor)}? O lançamento espelhado na outra conta bancária também será removido automaticamente.`
        : `Deseja excluir o lançamento "${item.descricao}" no valor de ${formatCurrency(item.valor)}?`,
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(item.movimentacao_avulsa_id!);
          await refetch();
          toast.success(
            isTransferencia
              ? "Transferência excluída com sucesso!"
              : "Lançamento excluído com sucesso!"
          );
          safeCloseDialog(closeConfirmationDialog);
        } catch {
          toast.error("Erro ao excluir lançamento.");
        }
      },
    });
  };

  const anoAtual = hoje.getFullYear();
  const anosDisponiveis = [anoAtual - 1, anoAtual, anoAtual + 1];

  return {
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
  };
}
