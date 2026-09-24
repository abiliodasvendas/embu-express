import { intercompanyApi } from "@/services/api/intercompany.api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useIntercompany(filtros?: {
  status?: "PENDENTE_ACERTO" | "COMPENSADO";
  empresaCredoraId?: number;
  empresaDevedoraId?: number;
}) {
  const queryClient = useQueryClient();

  const transferenciasQuery = useQuery({
    queryKey: ["intercompany", "transferencias", filtros],
    queryFn: () => intercompanyApi.listTransferencias(filtros),
  });

  const matrizSaldosQuery = useQuery({
    queryKey: ["intercompany", "matriz"],
    queryFn: () => intercompanyApi.getMatrizSaldos(),
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
    },
  });

  return {
    transferencias: transferenciasQuery.data || [],
    isLoadingTransferencias: transferenciasQuery.isLoading,
    matrizSaldos: matrizSaldosQuery.data || [],
    isLoadingMatriz: matrizSaldosQuery.isLoading,
    refetch: () => {
      transferenciasQuery.refetch();
      matrizSaldosQuery.refetch();
    },
    registrarAcertoMutation,
  };
}
