import { useState, useMemo } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { useContasBancarias } from "@/hooks/api/useContasBancarias";
import { useClients } from "@/hooks/api/useClients";
import { useFaturas } from "@/hooks/api/useFaturamento";
import { Client, FaturaCliente, StatusFatura } from "@/types/database";
import {
  STATUS_FATURA,
  TIPO_PERIODO_FATURA,
  FILTRO_PERIODO_FATURA,
} from "@/constants/financeiro.constants";
import { toLocalDateString } from "@/utils/formatters/date";
import { ItemRecebimentoPayload, LoteRecebimentoPayload } from "@/services/api/faturamento.api";

interface UseLiquidacaoLoteViewModelProps {
  initialMes: number;
  initialAno: number;
}

export function useLiquidacaoLoteViewModel({
  initialMes,
  initialAno,
}: UseLiquidacaoLoteViewModelProps) {
  const [mes, setMes] = useState<number>(initialMes);
  const [ano, setAno] = useState<number>(initialAno);
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [periodoFiltro, setPeriodoFiltro] = useState<string>("todas");
  const [searchCliente, setSearchCliente] = useState<string>("");

  const [contaBancariaId, setContaBancariaId] = useState<string>("");
  const [dataDeposito, setDataDeposito] = useState<string>(toLocalDateString(new Date()));
  const [observacao, setObservacao] = useState<string>("");

  const [selectedFaturaIds, setSelectedFaturaIds] = useState<string[]>([]);
  const [alocacoes, setAlocacoes] = useState<Record<string, number>>({});

  const { contas = [], isLoading: isLoadingContas } = useContasBancarias();
  const { data: clientsResponse, isLoading: isLoadingClientes } = useClients({ ativo: "true" });
  
  const clientesList: Client[] = useMemo(() => {
    if (Array.isArray(clientsResponse)) return clientsResponse;
    if (clientsResponse && typeof clientsResponse === "object" && "data" in clientsResponse) {
      const data = (clientsResponse as { data?: Client[] }).data;
      return Array.isArray(data) ? data : [];
    }
    return [];
  }, [clientsResponse]);

  const filtrosFatura = useMemo(() => {
    const filtros: {
      mes: number;
      ano: number;
      cliente_id?: number;
      status: StatusFatura;
      tipo_periodo?: string;
      numero_periodo?: number;
      quinzena?: number;
    } = {
      mes,
      ano,
      cliente_id: clienteId || undefined,
      status: STATUS_FATURA.PENDENTE as StatusFatura,
    };

    if (periodoFiltro === FILTRO_PERIODO_FATURA.QUINZENA_1) {
      filtros.tipo_periodo = TIPO_PERIODO_FATURA.QUINZENAL;
      filtros.numero_periodo = 1;
      filtros.quinzena = 1;
    } else if (periodoFiltro === FILTRO_PERIODO_FATURA.QUINZENA_2) {
      filtros.tipo_periodo = TIPO_PERIODO_FATURA.QUINZENAL;
      filtros.numero_periodo = 2;
      filtros.quinzena = 2;
    } else if (periodoFiltro === FILTRO_PERIODO_FATURA.MENSAL) {
      filtros.tipo_periodo = TIPO_PERIODO_FATURA.MENSAL;
    } else if (periodoFiltro.startsWith("SEM_")) {
      filtros.tipo_periodo = TIPO_PERIODO_FATURA.SEMANAL;
      filtros.numero_periodo = Number(periodoFiltro.replace("SEM_", ""));
    }

    return filtros;
  }, [mes, ano, clienteId, periodoFiltro]);

  const {
    faturas = [],
    isLoading: isLoadingFaturas,
    isFetching: isFetchingFaturas,
    loteRecebimentoMutation,
    refetch: refetchFaturas,
  } = useFaturas(filtrosFatura);

  const faturasEmAberto = useMemo(() => {
    return (faturas || [])
      .filter((f) => {
        if (f.status === STATUS_FATURA.LIQUIDADA || f.status === STATUS_FATURA.CANCELADA) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const dataA = new Date(a.data_vencimento).getTime();
        const dataB = new Date(b.data_vencimento).getTime();
        return dataA - dataB;
      });
  }, [faturas]);

  const faturasFiltradas = useMemo(() => {
    if (!searchCliente.trim()) return faturasEmAberto;
    const termo = searchCliente.trim().toLowerCase();
    return faturasEmAberto.filter((f) => {
      const nomeCliente = f.cliente?.nome_fantasia || "";
      return nomeCliente.toLowerCase().includes(termo);
    });
  }, [faturasEmAberto, searchCliente]);

  const totalAlocado = useMemo(() => {
    return selectedFaturaIds.reduce((acc, id) => {
      const valor = alocacoes[id] || 0;
      return acc + valor;
    }, 0);
  }, [selectedFaturaIds, alocacoes]);

  const totalFaturasSelecionadas = selectedFaturaIds.length;

  const acertosIntercompany = useMemo(() => {
    if (!contaBancariaId) return [];
    const contaSelecionada = contas.find((c) => c.id === contaBancariaId);
    if (!contaSelecionada) return [];

    const acertos: { origem: string; destino: string; valor: number }[] = [];

    for (const faturaId of selectedFaturaIds) {
      const valorAlocado = alocacoes[faturaId] || 0;
      if (valorAlocado > 0) {
        const fatura = faturasEmAberto.find((f) => f.id === faturaId);
        if (fatura && fatura.empresa_id !== contaSelecionada.empresa_id) {
          acertos.push({
            origem: contaSelecionada.empresa?.nome_fantasia || "Empresa Recebedora",
            destino: fatura.empresa?.nome_fantasia || "Empresa Dono da Fatura",
            valor: valorAlocado,
          });
        }
      }
    }
    return acertos;
  }, [contaBancariaId, selectedFaturaIds, alocacoes, contas, faturasEmAberto]);

  const handleToggleSelect = (fatura: FaturaCliente) => {
    const isSelected = selectedFaturaIds.includes(fatura.id);
    if (isSelected) {
      setSelectedFaturaIds((prev) => prev.filter((id) => id !== fatura.id));
      setAlocacoes((prev) => {
        const copy = { ...prev };
        delete copy[fatura.id];
        return copy;
      });
    } else {
      setSelectedFaturaIds((prev) => [...prev, fatura.id]);
      const saldoPendente = Math.round((Number(fatura.valor_faturado || 0) - Number(fatura.valor_pago || 0)) * 100) / 100;
      setAlocacoes((prev) => ({
        ...prev,
        [fatura.id]: prev[fatura.id] || (saldoPendente > 0 ? saldoPendente : 0),
      }));
    }
  };

  const isAllSelected = useMemo(() => {
    if (faturasFiltradas.length === 0) return false;
    return faturasFiltradas.every((f) => selectedFaturaIds.includes(f.id));
  }, [faturasFiltradas, selectedFaturaIds]);

  const handleSelectAll = () => {
    const novosIds: string[] = [];
    const novasAlocacoes: Record<string, number> = { ...alocacoes };

    for (const fatura of faturasFiltradas) {
      novosIds.push(fatura.id);
      const saldoPendente = Math.round((Number(fatura.valor_faturado || 0) - Number(fatura.valor_pago || 0)) * 100) / 100;
      if (!novasAlocacoes[fatura.id] || novasAlocacoes[fatura.id] === 0) {
        novasAlocacoes[fatura.id] = saldoPendente > 0 ? saldoPendente : 0;
      }
    }

    setSelectedFaturaIds(novosIds);
    setAlocacoes(novasAlocacoes);
  };

  const handleDeselectAll = () => {
    setSelectedFaturaIds([]);
    setAlocacoes({});
  };

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      handleDeselectAll();
    } else {
      handleSelectAll();
    }
  };

  const handleAlocacaoChange = (faturaId: string, valor: number) => {
    const valorArredondado = Math.max(0, Math.round(valor * 100) / 100);
    setAlocacoes((prev) => ({
      ...prev,
      [faturaId]: valorArredondado,
    }));

    if (valorArredondado > 0 && !selectedFaturaIds.includes(faturaId)) {
      setSelectedFaturaIds((prev) => [...prev, faturaId]);
    }
  };

  const isSubmitting = Boolean(loteRecebimentoMutation?.isPending);

  const handleSubmit = async () => {
    if (!contaBancariaId) {
      toast.error("Selecione a conta bancária de destino.");
      return;
    }
    if (!dataDeposito) {
      toast.error("Informe a data do depósito/recebimento.");
      return;
    }

    const itens: ItemRecebimentoPayload[] = selectedFaturaIds
      .map((id) => ({
        fatura_id: id,
        valor_alocado: alocacoes[id] || 0,
      }))
      .filter((item) => item.valor_alocado > 0);

    if (itens.length === 0) {
      toast.error("Selecione ao menos uma fatura e informe o valor recebido.");
      return;
    }

    const valorTotalLote = itens.reduce((acc, curr) => acc + curr.valor_alocado, 0);
    const valorTotalFormatado = Math.round(valorTotalLote * 100) / 100;

    const payload: LoteRecebimentoPayload = {
      conta_bancaria_destino_id: contaBancariaId,
      data_deposito: dataDeposito,
      valor_total_depositado: valorTotalFormatado,
      observacao: observacao.trim() || null,
      itens,
    };

    try {
      await loteRecebimentoMutation.mutateAsync(payload);
      toast.success(`Lote de recebimento processado! ${itens.length} fatura(s) liquidada(s).`);
      setSelectedFaturaIds([]);
      setAlocacoes({});
      setObservacao("");
      await refetchFaturas();
    } catch (err: unknown) {
      const msg =
        isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : err instanceof Error
          ? err.message
          : "Erro ao processar lote de recebimento.";
      toast.error(msg);
    }
  };

  return {
    mes,
    ano,
    clienteId,
    periodoFiltro,
    searchCliente,
    contaBancariaId,
    dataDeposito,
    observacao,
    selectedFaturaIds,
    alocacoes,
    contas,
    clientesList,
    faturasEmAberto: faturasFiltradas,
    totalFaturasEncontradas: faturasEmAberto.length,
    totalFaturasSelecionadas,
    totalAlocado,
    acertosIntercompany,
    isLoadingContas,
    isLoadingClientes,
    isLoadingFaturas,
    isFetchingFaturas,
    isSubmitting,
    setMes,
    setAno,
    setClienteId,
    setPeriodoFiltro,
    setSearchCliente,
    setContaBancariaId,
    setDataDeposito,
    setObservacao,
    handleToggleSelect,
    handleSelectAll,
    handleDeselectAll,
    handleToggleSelectAll,
    isAllSelected,
    handleAlocacaoChange,
    handleSubmit,
  };
}
