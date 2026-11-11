import { contaBancariaApi } from "@/services/api/conta-bancaria.api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ContaBancaria, ContaBancariaComSaldo, ExtratoBancarioResponse } from "@/types/database";

export function useContasBancariasSaldos(params?: { empresa_id?: number; mes?: number; ano?: number }) {
  const query = useQuery<ContaBancariaComSaldo[]>({
    queryKey: ["contas-bancarias-saldos", params],
    queryFn: () => contaBancariaApi.listComSaldos(params),
  });

  return {
    ...query,
    contasComSaldo: query.data || [],
  };
}

export function useExtratoContaBancaria(contaId: string | undefined, mes: number, ano: number, enabled = true) {
  return useQuery<ExtratoBancarioResponse>({
    queryKey: ["conta-bancaria-extrato", contaId, mes, ano],
    queryFn: () => contaBancariaApi.getExtrato(contaId!, { mes, ano }),
    enabled: Boolean(contaId && mes && ano && enabled),
  });
}

export function useContasBancarias(empresaId?: number) {
  const queryClient = useQueryClient();

  const query = useQuery<ContaBancaria[]>({
    queryKey: ["contas-bancarias", empresaId],
    queryFn: () => contaBancariaApi.list(empresaId),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<ContaBancaria>) => contaBancariaApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias-saldos"] });
      queryClient.invalidateQueries({ queryKey: ["fluxo-caixa"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContaBancaria> }) =>
      contaBancariaApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias-saldos"] });
      queryClient.invalidateQueries({ queryKey: ["fluxo-caixa"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contaBancariaApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias-saldos"] });
      queryClient.invalidateQueries({ queryKey: ["fluxo-caixa"] });
    },
  });

  return {
    ...query,
    contas: query.data || [],
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
