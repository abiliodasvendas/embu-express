import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api/client";
import { BloqueioConvenio, BloqueiosColaboradorResultado, ElegibilidadeConvenioResultado } from "@/types/database";

export interface SalvarBloqueiosPayload {
  bloqueio_geral: boolean;
  convenios_bloqueados_ids: string[];
  motivo?: string | null;
}

export function useBloqueiosColaborador(colaboradorId?: string) {
  return useQuery<BloqueiosColaboradorResultado>({
    queryKey: ["bloqueios_colaborador", colaboradorId],
    queryFn: async () => {
      const { data } = await api.get<BloqueiosColaboradorResultado>(
        `/convenios/colaboradores/${colaboradorId}/bloqueios`
      );
      return data;
    },
    enabled: !!colaboradorId,
  });
}

export function useSalvarBloqueiosColaborador() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      colaboradorId,
      payload,
    }: {
      colaboradorId: string;
      payload: SalvarBloqueiosPayload;
    }) => {
      const { data } = await api.put<BloqueiosColaboradorResultado>(
        `/convenios/colaboradores/${colaboradorId}/bloqueios`,
        payload
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["bloqueios_colaborador", variables.colaboradorId],
      });
      queryClient.invalidateQueries({ queryKey: ["todos_bloqueios_convenios"] });
      queryClient.invalidateQueries({ queryKey: ["public_collaborators"] });
      queryClient.invalidateQueries({ queryKey: ["elegibilidade_convenio"] });
    },
  });
}

export function useTodosBloqueiosConvenios() {
  return useQuery<BloqueioConvenio[]>({
    queryKey: ["todos_bloqueios_convenios"],
    queryFn: async () => {
      const { data } = await api.get<BloqueioConvenio[]>("/convenios/bloqueios");
      return data;
    },
  });
}

export function useElegibilidadeConvenio(
  colaboradorId?: string,
  convenioId?: string,
  mes?: number,
  ano?: number,
  valor?: number
) {
  return useQuery<ElegibilidadeConvenioResultado>({
    queryKey: ["elegibilidade_convenio", colaboradorId, convenioId, mes, ano, valor],
    queryFn: async () => {
      const { data } = await api.get<ElegibilidadeConvenioResultado>(
        `/convenios/colaboradores/${colaboradorId}/elegibilidade/${convenioId}`,
        {
          params: { mes, ano, valor },
        }
      );
      return data;
    },
    enabled: !!colaboradorId && !!convenioId,
    staleTime: 10 * 1000,
  });
}
