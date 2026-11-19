import {
  aniversarianteApi,
  AniversariantesResponse,
} from "@/services/api/aniversariante.api";
import { useQuery } from "@tanstack/react-query";

export const ANIVERSARIANTES_QUERY_KEY = ["aniversariantes"] as const;

export function useAniversariantes(mes?: number, enabled = true) {
  return useQuery<AniversariantesResponse>({
    queryKey: [...ANIVERSARIANTES_QUERY_KEY, mes ?? "atual"],
    queryFn: () => aniversarianteApi.listar(mes),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}
