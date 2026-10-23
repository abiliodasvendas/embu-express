import { fluxoCaixaApi, FluxoCaixaResponse } from "@/services/api/fluxo-caixa.api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useFluxoCaixa(mes: number, ano: number, empresaId?: number) {
  const queryClient = useQueryClient();

  const query = useQuery<FluxoCaixaResponse>({
    queryKey: ["fluxo-caixa", mes, ano, empresaId],
    queryFn: () => fluxoCaixaApi.getFluxoCaixa(mes, ano, empresaId),
    enabled: !!mes && !!ano,
    staleTime: 30000,
  });

  const setSaldoInicialMutation = useMutation({
    mutationFn: ({ saldoInicial }: { saldoInicial: number }) =>
      fluxoCaixaApi.setSaldoInicial(mes, ano, saldoInicial),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fluxo-caixa", mes, ano] });
    },
  });

  return {
    ...query,
    fluxo: query.data,
    setSaldoInicialMutation,
  };
}
