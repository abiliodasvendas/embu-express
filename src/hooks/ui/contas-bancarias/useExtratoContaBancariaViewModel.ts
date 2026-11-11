import { useState, useMemo, useEffect } from "react";
import { useExtratoContaBancaria } from "@/hooks/api/useContasBancarias";

export type TipoFiltroExtrato = "TODOS" | "ENTRADA" | "SAIDA";

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
  const hoje = new Date();
  const [mes, setMes] = useState<number>(mesInicial || hoje.getMonth() + 1);
  const [ano, setAno] = useState<number>(anoInicial || hoje.getFullYear());
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltroExtrato>("TODOS");
  const [busca, setBusca] = useState<string>("");

  useEffect(() => {
    if (open) {
      if (mesInicial) setMes(mesInicial);
      if (anoInicial) setAno(anoInicial);
      setTipoFiltro("TODOS");
      setBusca("");
    }
  }, [open, mesInicial, anoInicial]);

  const { data: extrato, isLoading, isFetching } = useExtratoContaBancaria(
    contaId,
    mes,
    ano,
    open
  );

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
      if (tipoFiltro !== "TODOS" && item.tipo !== tipoFiltro) return false;
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
    isLoading: isLoading || isFetching,
  };
}
