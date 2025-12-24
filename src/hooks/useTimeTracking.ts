import { messages } from "@/constants/messages";
import { pontoApi } from "@/services/api/ponto.api";
import { toast } from "@/utils/notifications/toast";
import { useQuery } from "@tanstack/react-query";

export function useTimeTracking(filters?: {
  searchTerm?: string;
  mes?: number;
  ano?: number;
  periodo?: string;
  usuarioId?: string;
}) {
  return useQuery({
    queryKey: ["time-tracking", filters],
    queryFn: async () => {
      try {
        return await pontoApi.listRegistros(filters);
      } catch (error: any) {
        toast.error(messages.ponto.erro.carregar, {
          description: error.message,
        });
        throw error;
      }
    },
  });
}
