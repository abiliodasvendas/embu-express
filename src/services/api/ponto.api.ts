import { RegistroPonto } from "@/types/database";
import { apiClient } from "./client";

export const pontoApi = {
  listRegistros: (filtros?: Record<string, any>): Promise<RegistroPonto[]> =>
    apiClient.get(`/registros-ponto`, { params: filtros }).then(res => res.data),
};
