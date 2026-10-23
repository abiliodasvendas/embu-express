import { faturamentoApi, LoteRecebimentoPayload, LiquidarFaturaPayload } from "@/services/api/faturamento.api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaturaCliente, StatusFatura } from "@/types/database";

export function useFaturas(
  filtros?: {
    mes?: number;
    ano?: number;
    quinzena?: number;
    tipo_periodo?: string;
    numero_periodo?: number;
    empresa_id?: number;
    cliente_id?: number;
    status?: StatusFatura;
  },
  options?: { enabled?: boolean }
) {
  const queryClient = useQueryClient();

  const query = useQuery<FaturaCliente[]>({
    queryKey: ["faturas-clientes", filtros],
    queryFn: () => faturamentoApi.listFaturas(filtros),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });

  const invalidarConsultasFinanceiras = () => {
    queryClient.invalidateQueries({ queryKey: ["faturas-clientes"] });
    queryClient.invalidateQueries({ queryKey: ["aging-recebiveis"] });
    queryClient.invalidateQueries({ queryKey: ["dre"] });
    queryClient.invalidateQueries({ queryKey: ["fluxo-caixa"] });
    queryClient.invalidateQueries({ queryKey: ["intercompany"] });
  };

  const createMutation = useMutation({
    mutationFn: (data: Partial<FaturaCliente>) => faturamentoApi.createFatura(data),
    onSuccess: () => invalidarConsultasFinanceiras(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FaturaCliente> }) =>
      faturamentoApi.updateFatura(id, data),
    onSuccess: () => invalidarConsultasFinanceiras(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => faturamentoApi.deleteFatura(id),
    onSuccess: () => invalidarConsultasFinanceiras(),
  });

  const loteRecebimentoMutation = useMutation({
    mutationFn: (payload: LoteRecebimentoPayload) => faturamentoApi.processarLoteRecebimento(payload),
    onSuccess: () => invalidarConsultasFinanceiras(),
  });

  const liquidarMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: LiquidarFaturaPayload }) =>
      faturamentoApi.liquidarFatura(id, payload),
    onSuccess: () => invalidarConsultasFinanceiras(),
  });

  return {
    ...query,
    faturas: query.data || [],
    createMutation,
    updateMutation,
    deleteMutation,
    loteRecebimentoMutation,
    liquidarMutation,
  };
}
