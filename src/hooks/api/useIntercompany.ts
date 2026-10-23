import { intercompanyApi } from "@/services/api/intercompany.api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useIntercompany(
  filtros?: {
    status?: "PENDENTE_ACERTO" | "COMPENSADO";
    empresaCredoraId?: number;
    empresaDevedoraId?: number;
  },
  options?: { enabled?: boolean }
) {
  const queryClient = useQueryClient();

  const transferenciasQuery = useQuery({
    queryKey: ["intercompany", "transferencias", filtros],
    queryFn: () => intercompanyApi.listTransferencias(filtros),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });

  const matrizSaldosQuery = useQuery({
    queryKey: ["intercompany", "matriz"],
    queryFn: () => intercompanyApi.getMatrizSaldos(),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });

  const registrarAcertoMutation = useMutation({
    mutationFn: (payload: {
      transferencia_id: string;
      data_acerto: string;
      comprovante_acerto_url?: string | null;
      observacao?: string | null;
    }) => intercompanyApi.registrarAcerto(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intercompany"] });
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
      queryClient.invalidateQueries({ queryKey: ["fluxo-caixa"] });
    },
  });

  return {
    transferencias: transferenciasQuery.data || [],
    isLoadingTransferencias: transferenciasQuery.isLoading,
    isFetchingTransferencias: transferenciasQuery.isFetching,
    matrizSaldos: matrizSaldosQuery.data || [],
    isLoadingMatriz: matrizSaldosQuery.isLoading,
    isFetchingMatriz: matrizSaldosQuery.isFetching,
    refetch: () => {
      transferenciasQuery.refetch();
      matrizSaldosQuery.refetch();
    },
    registrarAcertoMutation,
  };
}
