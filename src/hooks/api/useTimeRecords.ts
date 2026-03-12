import { FILTER_OPTIONS } from "@/constants/ponto";
import { apiClient } from "@/services/api/client";
import { RegistroPonto } from "@/types/database";
import { useQuery } from "@tanstack/react-query";

interface UseTimeRecordsParams {
  date: string; // YYYY-MM-DD
  searchTerm?: string;
  usuarioId?: string;
  statusEntrada?: string;
  statusSaida?: string;
  clienteId?: string;
  incluirTodos?: boolean;
}

export function useTimeRecords({ date, searchTerm, usuarioId, statusEntrada, statusSaida, clienteId, incluirTodos }: UseTimeRecordsParams) {
  return useQuery({
    queryKey: ["time-records", date, searchTerm, usuarioId, statusEntrada, statusSaida, clienteId, incluirTodos],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (date) params.append("data_referencia", date);
      if (searchTerm) params.append("searchTerm", searchTerm);
      if (usuarioId && usuarioId !== FILTER_OPTIONS.TODOS) params.append("usuario_id", usuarioId);
      if (statusEntrada && statusEntrada !== FILTER_OPTIONS.TODOS) params.append("status_entrada", statusEntrada);
      if (statusSaida && statusSaida !== FILTER_OPTIONS.TODOS) params.append("status_saida", statusSaida);
      if (clienteId && clienteId !== FILTER_OPTIONS.TODOS) params.append("cliente_id", clienteId);
      if (incluirTodos) params.append("incluir_todos", "true");

      const response = await apiClient.get<RegistroPonto[]>(`/pontos?${params.toString()}`);
      return response.data;
    },
    // Refresh every 30 seconds to keep statuses updated securely
    refetchInterval: 30000,
    // FORCE FRESH DATA (User Request)
    // "Quase como se não houvesse react query"
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true, 
  });
}
