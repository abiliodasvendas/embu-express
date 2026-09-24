import { faturamentoApi, LoteRecebimentoPayload } from "@/services/api/faturamento.api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaturaCliente, StatusFatura } from "@/types/database";

export function useFaturas(filtros?: {
  mes?: number;
  ano?: number;
  quinzena?: number;
  empresa_id?: number;
  cliente_id?: number;
  status?: StatusFatura;
}) {
  const queryClient = useQueryClient();

  const query = useQuery<FaturaCliente[]>({
    queryKey: ["faturas-clientes", filtros],
    queryFn: () => faturamentoApi.listFaturas(filtros),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<FaturaCliente>) => faturamentoApi.createFatura(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faturas-clientes"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FaturaCliente> }) =>
      faturamentoApi.updateFatura(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faturas-clientes"] });
      queryClient.invalidateQueries({ queryKey: ["intercompany"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => faturamentoApi.deleteFatura(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faturas-clientes"] }),
  });

  const loteRecebimentoMutation = useMutation({
    mutationFn: (payload: LoteRecebimentoPayload) => faturamentoApi.processarLoteRecebimento(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faturas-clientes"] });
      queryClient.invalidateQueries({ queryKey: ["intercompany"] });
      queryClient.invalidateQueries({ queryKey: ["fluxo-caixa"] });
    },
  });

  return {
    ...query,
    faturas: query.data || [],
    createMutation,
    updateMutation,
    deleteMutation,
    loteRecebimentoMutation,
  };
}

export function useSugestaoMedicao(clienteId: number, mes: number, ano: number, quinzena: number, enabled = true) {
  return useQuery({
    queryKey: ["sugestao-medicao", clienteId, mes, ano, quinzena],
    queryFn: () => faturamentoApi.getSugestao(clienteId, mes, ano, quinzena),
    enabled: enabled && clienteId > 0 && !!mes && !!ano && !!quinzena,
  });
}
