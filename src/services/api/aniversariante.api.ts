import { Usuario } from "@/types/database";
import { apiClient } from "./client";

export interface AniversarianteItem {
  id: string;
  nome_completo: string;
  data_nascimento: string;
  dia: number;
  mes: number;
  eh_hoje: boolean;
  perfil_nome: string | null;
}

export interface AniversariantesResumo {
  total_hoje: number;
  total_mes: number;
  total_sem_data: number;
}

export interface AniversariantesResponse {
  mes_referencia: number;
  dia_atual: number;
  mes_atual: number;
  hoje: AniversarianteItem[];
  aniversariantes_mes: AniversarianteItem[];
  sem_data_nascimento: Usuario[];
  resumo: AniversariantesResumo;
}

export const aniversarianteApi = {
  listar: (mes?: number): Promise<AniversariantesResponse> =>
    apiClient
      .get<AniversariantesResponse>("/usuarios/aniversariantes", {
        params: mes ? { mes } : undefined,
      })
      .then((res) => res.data),
};
