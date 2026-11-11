import { useState, useMemo } from "react";
import { useFinanceiroGeral } from "@/hooks/api/useFinanceiro";
import { useCollaborators } from "@/hooks/api/useCollaborators";
import { StatusGeralFechamento } from "@/services/api/financeiro.api";
import { STATUS } from "@/constants/roles";

interface UseFechamentoGeralViewModelProps {
  selectedMes: number;
  selectedAno: number;
}

export type StatusAdiantamentoFilter = "todos" | "pendente" | "confirmado";
export type StatusFechamentoFilter = "todos" | "pendente" | "confirmado";
export type StatusCadastroFilter = "todos" | "ativo" | "inativo";

export function useFechamentoGeralViewModel({
  selectedMes,
  selectedAno,
}: UseFechamentoGeralViewModelProps) {
  const [adiantamentoFilter, setAdiantamentoFilter] =
    useState<StatusAdiantamentoFilter>("todos");
  const [fechamentoFilter, setFechamentoFilter] =
    useState<StatusFechamentoFilter>("pendente");
  const [statusCadastroFilter, setStatusCadastroFilter] =
    useState<StatusCadastroFilter>("todos");

  const { data: collaboratorsResponse } = useCollaborators({ all: true });
  const collaborators = useMemo(() => {
    if (!collaboratorsResponse) return [];
    if (Array.isArray(collaboratorsResponse)) return collaboratorsResponse;
    return (collaboratorsResponse as { data?: unknown[] }).data || [];
  }, [collaboratorsResponse]);

  const {
    data: statusGeral = [],
    isLoading: isGlobalLoading,
    isFetching: isGlobalFetching,
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

      const statusColab = (colab.status_cadastro || STATUS.ATIVO).toUpperCase();
      const matchStatusCadastro =
        statusCadastroFilter === "todos" ||
        (statusCadastroFilter === "ativo" && statusColab === STATUS.ATIVO) ||
        (statusCadastroFilter === "inativo" && statusColab === STATUS.INATIVO);

      return matchAdiantamento && matchFechamento && matchStatusCadastro;
    });
  }, [statusGeral, adiantamentoFilter, fechamentoFilter, statusCadastroFilter]);

  return {
    collaborators,
    statusGeral,
    isGlobalLoading: isGlobalLoading || isGlobalFetching,
    refetchGeral,
    estatisticas,
    colaboradoresFiltrados,
    adiantamentoFilter,
    setAdiantamentoFilter,
    fechamentoFilter,
    setFechamentoFilter,
    statusCadastroFilter,
    setStatusCadastroFilter,
  };
}
