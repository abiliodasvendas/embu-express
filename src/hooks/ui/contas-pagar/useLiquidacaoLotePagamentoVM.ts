import { useState, useMemo } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { useContasPagar } from "@/hooks/api/useContasPagar";
import { useContasBancarias } from "@/hooks/api/useContasBancarias";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { ContaPagarItem } from "@/types/database";
import { STATUS_DESPESA } from "@/constants/financeiro.constants";
import { toLocalDateString } from "@/utils/formatters/date";

export function useLiquidacaoLotePagamentoVM() {
  const currentDate = new Date();
  const [mes, setMes] = useState<number>(currentDate.getMonth() + 1);
  const [ano, setAno] = useState<number>(currentDate.getFullYear());
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [busca, setBusca] = useState<string>("");
  const [tipoFiltro, setTipoFiltro] = useState<"TODOS" | "DESPESA" | "CONVENIO">("TODOS");

  const [contaBancariaId, setContaBancariaId] = useState<string>("");
  const [dataPagamento, setDataPagamento] = useState<string>(toLocalDateString(new Date()));
  const [observacao, setObservacao] = useState<string>("");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [alocacoes, setAlocacoes] = useState<Record<string, number>>({});

  const { data: contas = [], isLoading: isLoadingContas } = useContasBancarias();
  const { data: empresas = [], isLoading: isLoadingEmpresas } = useEmpresas();

  const {
    itens = [],
    isLoading: isLoadingItens,
    isFetching,
    refetch,
    loteMutation,
  } = useContasPagar({
    mes,
    ano,
    empresa_id: empresaId || undefined,
    status: "PENDENTE",
    busca: busca.trim() || undefined,
  });

  const contasFiltradas = useMemo(() => {
    if (!empresaId) return contas;
    return contas.filter((c) => c.empresa_id === empresaId);
  }, [contas, empresaId]);

  const itensEmAberto = useMemo(() => {
    return itens
      .filter((i) => {
        if (i.status === STATUS_DESPESA.PAGO || i.status === STATUS_DESPESA.CANCELADO) return false;
        if (tipoFiltro !== "TODOS" && i.tipo !== tipoFiltro) return false;
        return true;
      })
      .sort((a, b) => a.data_vencimento.localeCompare(b.data_vencimento));
  }, [itens, tipoFiltro]);

  const totalSelecionado = useMemo(() => {
    return itensEmAberto
      .filter((i) => selectedIds.includes(i.id))
      .reduce((acc, curr) => acc + curr.saldo_pendente, 0);
  }, [itensEmAberto, selectedIds]);

  const totalAlocado = useMemo(() => {
    return selectedIds.reduce((acc, id) => {
      const valor = alocacoes[id];
      if (valor !== undefined) return acc + valor;
      const item = itensEmAberto.find((i) => i.id === id);
      return acc + (item ? item.saldo_pendente : 0);
    }, 0);
  }, [selectedIds, alocacoes, itensEmAberto]);

  const toggleSelect = (item: ContaPagarItem) => {
    setSelectedIds((prev) => {
      const exists = prev.includes(item.id);
      if (exists) {
        const next = prev.filter((id) => id !== item.id);
        const nextAloc = { ...alocacoes };
        delete nextAloc[item.id];
        setAlocacoes(nextAloc);
        return next;
      } else {
        setAlocacoes((prevAloc) => ({
          ...prevAloc,
          [item.id]: item.saldo_pendente,
        }));
        return [...prev, item.id];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === itensEmAberto.length) {
      setSelectedIds([]);
      setAlocacoes({});
    } else {
      const allIds = itensEmAberto.map((i) => i.id);
      const newAlocs: Record<string, number> = {};
      itensEmAberto.forEach((i) => {
        newAlocs[i.id] = i.saldo_pendente;
      });
      setSelectedIds(allIds);
      setAlocacoes(newAlocs);
    }
  };

  const handleAlocacaoChange = (id: string, valor: number) => {
    setAlocacoes((prev) => ({
      ...prev,
      [id]: Math.max(0, valor),
    }));
  };

  const handleConfirmarLote = async () => {
    if (!contaBancariaId) {
      toast.error("Selecione a conta bancária pagadora de origem.");
      return;
    }

    if (selectedIds.length === 0) {
      toast.error("Selecione ao menos um compromisso para pagamento.");
      return;
    }

    if (!dataPagamento) {
      toast.error("Informe a data do pagamento.");
      return;
    }

    const payloadItens = selectedIds.map((id) => {
      const item = itensEmAberto.find((i) => i.id === id)!;
      const valor = alocacoes[id] !== undefined ? alocacoes[id] : item.saldo_pendente;
      return {
        id: item.id,
        tipo: item.tipo,
        valor_alocado: parseFloat(Number(valor).toFixed(2)),
      };
    });

    const valorTotal = parseFloat(
      payloadItens.reduce((acc, curr) => acc + curr.valor_alocado, 0).toFixed(2)
    );

    if (valorTotal <= 0) {
      toast.error("O valor total do lote de pagamento deve ser maior que zero.");
      return;
    }

    try {
      await loteMutation.mutateAsync({
        conta_bancaria_origem_id: contaBancariaId,
        data_pagamento: dataPagamento,
        valor_total_pago: valorTotal,
        observacao: observacao.trim() || null,
        itens: payloadItens,
      });

      toast.success("Lote de pagamento processado com sucesso!");
      setSelectedIds([]);
      setAlocacoes({});
      setObservacao("");
      refetch();
    } catch (err: unknown) {
      const msg =
        isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : "Erro ao processar lote de pagamentos.";
      toast.error(msg);
    }
  };

  return {
    mes,
    setMes,
    ano,
    setAno,
    empresaId,
    setEmpresaId,
    busca,
    setBusca,
    tipoFiltro,
    setTipoFiltro,
    contaBancariaId,
    setContaBancariaId,
    dataPagamento,
    setDataPagamento,
    observacao,
    setObservacao,
    selectedIds,
    alocacoes,
    contas: contasFiltradas,
    empresas,
    itens: itensEmAberto,
    totalSelecionado,
    totalAlocado,
    isLoading: isLoadingItens || isLoadingContas || isLoadingEmpresas,
    isFetching,
    isSubmitting: loteMutation.isPending,
    toggleSelect,
    toggleSelectAll,
    handleAlocacaoChange,
    handleConfirmarLote,
  };
}
