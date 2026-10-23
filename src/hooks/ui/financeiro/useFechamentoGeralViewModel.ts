import { useState, useMemo } from "react";
import { useFinanceiroGeral } from "@/hooks/api/useFinanceiro";
import { useCollaborators } from "@/hooks/api/useCollaborators";
import { StatusGeralFechamento } from "@/services/api/financeiro.api";

interface UseFechamentoGeralViewModelProps {
  selectedMes: number;
  selectedAno: number;
}

export type StatusAdiantamentoFilter = "todos" | "pendente" | "confirmado";
export type StatusFechamentoFilter = "todos" | "pendente" | "confirmado";

export function useFechamentoGeralViewModel({
  selectedMes,
  selectedAno,
}: UseFechamentoGeralViewModelProps) {
  const [adiantamentoFilter, setAdiantamentoFilter] =
    useState<StatusAdiantamentoFilter>("pendente");
  const [fechamentoFilter, setFechamentoFilter] =
    useState<StatusFechamentoFilter>("pendente");

  const { data: collaboratorsResponse } = useCollaborators({});
  const collaborators = useMemo(() => {
    if (!collaboratorsResponse) return [];
    if (Array.isArray(collaboratorsResponse)) return collaboratorsResponse;
    return (collaboratorsResponse as { data?: unknown[] }).data || [];
  }, [collaboratorsResponse]);

  const {
    data: statusGeral = [],
    isLoading: isGlobalLoading,
    refetch: refetchGeral,
  } = useFinanceiroGeral(selectedMes, selectedAno);

  const estatisticas = useMemo(() => {
    const total = statusGeral.length;
    const adiantamentosConfirmados = statusGeral.filter(
      (s) => s.adiantamento_confirmado,
    ).length;
    const pagamentosConcluidos = statusGeral.filter((s) => s.pago).length;

    return { total, adiantamentosConfirmados, pagamentosConcluidos };
  }, [statusGeral]);

  const colaboradoresFiltrados = useMemo(() => {
    return statusGeral.filter((colab: StatusGeralFechamento) => {
      const matchAdiantamento =
        adiantamentoFilter === "todos" ||
        (adiantamentoFilter === "confirmado" && colab.adiantamento_confirmado) ||
        (adiantamentoFilter === "pendente" && !colab.adiantamento_confirmado);

      const matchFechamento =
        fechamentoFilter === "todos" ||
        (fechamentoFilter === "confirmado" && colab.pago) ||
        (fechamentoFilter === "pendente" && !colab.pago);

      return matchAdiantamento && matchFechamento;
    });
  }, [statusGeral, adiantamentoFilter, fechamentoFilter]);

  return {
    collaborators,
    statusGeral,
    isGlobalLoading,
    refetchGeral,
    estatisticas,
    colaboradoresFiltrados,
    adiantamentoFilter,
    setAdiantamentoFilter,
    fechamentoFilter,
    setFechamentoFilter,
  };
}
