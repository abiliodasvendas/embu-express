import { useState, useMemo } from "react";
import { useDateFilters } from "@/hooks";
import { useContasBancarias, useContasBancariasSaldos } from "@/hooks/api/useContasBancarias";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { useLayout } from "@/contexts/LayoutContext";
import { ContaBancariaComSaldo } from "@/types/database";
import { toast } from "sonner";

export type TipoContaFiltro = "TODOS" | "CORRENTE" | "POUPANCA" | "PAGAMENTO" | "INVESTIMENTO";

export function useContasBancariasViewModel() {
  const { openContasBancariasDialog, openConfirmationDialog } = useLayout();
  const [busca, setBusca] = useState("");
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [tipoConta, setTipoConta] = useState<TipoContaFiltro>("TODOS");

  const {
    selectedMes: mes,
    setSelectedMes: setMes,
    selectedAno: ano,
    setSelectedAno: setAno,
  } = useDateFilters({
    mesParam: "mes",
    anoParam: "ano",
    syncWithUrl: true,
  });

  const { data: empresas = [], isLoading: isLoadingEmpresas } = useEmpresas();

  const {
    contasComSaldo,
    isLoading: isLoadingSaldos,
    isFetching,
    refetch,
  } = useContasBancariasSaldos({
    empresa_id: empresaId || undefined,
    mes,
    ano,
  });

  const { deleteMutation } = useContasBancarias(empresaId || undefined);

  const contasFiltradas = useMemo(() => {
    return contasComSaldo.filter((conta) => {
      if (tipoConta !== "TODOS") {
        if (conta.tipo_conta !== tipoConta) return false;
      }

      if (!busca.trim()) return true;

      const termo = busca.toLowerCase();
      const bancoMatch = conta.banco_nome.toLowerCase().includes(termo);
      const agenciaMatch = conta.agencia?.toLowerCase().includes(termo);
      const contaMatch = conta.conta.toLowerCase().includes(termo);
      const empresaMatch =
        conta.empresa?.nome_fantasia?.toLowerCase().includes(termo) ||
        conta.empresa?.razao_social?.toLowerCase().includes(termo);

      return bancoMatch || agenciaMatch || contaMatch || empresaMatch;
    });
  }, [contasComSaldo, tipoConta, busca]);

  const kpis = useMemo(() => {
    return contasFiltradas.reduce(
      (acc, conta) => {
        acc.saldoAtual += conta.saldo_atual || 0;
        acc.saldoProjetado += conta.saldo_projetado || 0;
        acc.entradasRealizadas += conta.total_entradas_realizadas || 0;
        acc.entradasPrevistas += conta.total_entradas_previstas || 0;
        acc.saidasRealizadas += conta.total_saidas_realizadas || 0;
        acc.saidasPrevistas += conta.total_saidas_previstas || 0;
        acc.totalContas += 1;
        return acc;
      },
      {
        saldoAtual: 0,
        saldoProjetado: 0,
        entradasRealizadas: 0,
        entradasPrevistas: 0,
        saidasRealizadas: 0,
        saidasPrevistas: 0,
        totalContas: 0,
      }
    );
  }, [contasFiltradas]);

  const handleExcluirConta = (conta: ContaBancariaComSaldo) => {
    openConfirmationDialog({
      title: "Excluir Conta Bancária",
      description: `Deseja realmente excluir a conta ${conta.banco_nome} - Ag ${conta.agencia || "S/A"} C/C ${conta.conta}? Todas as movimentações vinculadas serão desassociadas.`,
      confirmText: "Excluir Conta",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(conta.id);
          toast.success("Conta bancária removida com sucesso.");
          refetch();
        } catch {
          toast.error("Erro ao remover conta bancária.");
        }
      },
    });
  };

  const handleNovaConta = () => {
    openContasBancariasDialog({ empresaIdInicial: empresaId || undefined });
  };

  return {
    busca,
    setBusca,
    mes,
    setMes,
    ano,
    setAno,
    empresaId,
    setEmpresaId,
    tipoConta,
    setTipoConta,
    empresas,
    contasFiltradas,
    kpis,
    isLoading: isLoadingSaldos || isLoadingEmpresas,
    isFetching,
    isDeleting: deleteMutation.isPending,
    refetch,
    handleNovaConta,
    handleExcluirConta,
  };
}
