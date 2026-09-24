import { retaguardaApi, MonitorReservasResponse, AlertaRiscoValeItem, CriarAlocacaoPayload } from "@/services/api/retaguarda.api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useRetaguarda(mes: number, ano: number) {
  const queryClient = useQueryClient();

  const monitorQuery = useQuery<MonitorReservasResponse>({
    queryKey: ["retaguarda", "monitor", mes, ano],
    queryFn: () => retaguardaApi.getMonitor(mes, ano),
    enabled: !!mes && !!ano,
  });

  const alertaValesQuery = useQuery<AlertaRiscoValeItem[]>({
    queryKey: ["retaguarda", "alerta-vales", mes, ano],
    queryFn: () => retaguardaApi.getAlertaVales(mes, ano),
    enabled: !!mes && !!ano,
  });

  const criarAlocacaoMutation = useMutation({
    mutationFn: (payload: CriarAlocacaoPayload) => retaguardaApi.criarAlocacao(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retaguarda"] });
      queryClient.invalidateQueries({ queryKey: ["sugestao-medicao"] });
    },
  });

  return {
    monitor: monitorQuery.data,
    isLoadingMonitor: monitorQuery.isLoading,
    alertas: alertaValesQuery.data || [],
    isLoadingAlertas: alertaValesQuery.isLoading,
    criarAlocacaoMutation,
    refetch: () => {
      monitorQuery.refetch();
      alertaValesQuery.refetch();
    },
  };
}
