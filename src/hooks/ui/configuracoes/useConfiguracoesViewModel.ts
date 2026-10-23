import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/services/api/client";
import { useLayout } from "@/contexts/LayoutContext";

export interface ConfigItem {
  chave: string;
  valor: string;
  descricao: string;
}

export function useConfiguracoesViewModel() {
  const { setPageTitle } = useLayout();
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});

  useEffect(() => {
    setPageTitle("Configurações");
  }, [setPageTitle]);

  const { data: configs, isLoading, refetch } = useQuery<ConfigItem[]>({
    queryKey: ["configuracoes"],
    queryFn: async () => {
      const { data } = await apiClient.get("/configuracoes");
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ chave, valor }: { chave: string; valor: string }) => {
      const { data } = await apiClient.put(`/configuracoes/${chave}`, { valor });
      return data;
    },
    onSuccess: () => {
      toast.success("Configuração atualizada com sucesso!");
      refetch();
    },
    onError: (error: unknown) => {
      const axiosError = error as { response?: { data?: { error?: string } } };
      const message = axiosError.response?.data?.error || "Erro ao atualizar configuração";
      toast.error(message);
    },
  });

  const handleSave = (chave: string, valor: string) => {
    mutation.mutate({ chave, valor });
  };

  const isSaving = (chave: string) => {
    return mutation.isPending && mutation.variables?.chave === chave;
  };

  const setDraftValue = (chave: string, valor: string) => {
    setDraftValues((prev) => ({ ...prev, [chave]: valor }));
  };

  const configAmarelo = configs?.find((c) => c.chave === "tolerancia_amarelo_min");
  const configHeExcessiva = configs?.find((c) => c.chave === "limite_he_excessiva_min");
  const configFeriado = configs?.find((c) => c.chave === "valor_adicional_feriado");
  const configGeofencing = configs?.find((c) => c.chave === "raio_geofencing_metros");
  const configConvenioLimite = configs?.find((c) => c.chave === "percentual_limite_convenio");
  const configSalarios = configs?.find((c) => c.chave === "dia_desembolso_salarios");
  const configConvenios = configs?.find((c) => c.chave === "dia_desembolso_convenios");
  const configVales = configs?.find((c) => c.chave === "dia_desembolso_vales");

  return {
    configs,
    isLoading,
    draftValues,
    setDraftValue,
    handleSave,
    isSaving,
    configAmarelo,
    configHeExcessiva,
    configFeriado,
    configGeofencing,
    configConvenioLimite,
    configSalarios,
    configConvenios,
    configVales,
  };
}
