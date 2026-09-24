import { TransferenciaIntercompany } from "@/types/database";
import { apiClient } from "./client";

export interface MatrizSaldoItem {
  empresa_devedora: { id: number; nome_fantasia: string; codigo?: string | null };
  empresa_credora: { id: number; nome_fantasia: string; codigo?: string | null };
  saldo_devedor_liquido: number;
}

export const intercompanyApi = {
  listTransferencias: (filtros?: {
    status?: "PENDENTE_ACERTO" | "COMPENSADO";
    empresaCredoraId?: number;
    empresaDevedoraId?: number;
  }): Promise<TransferenciaIntercompany[]> =>
    apiClient.get("/intercompany", { params: filtros }).then(res => res.data),

  getMatrizSaldos: (): Promise<MatrizSaldoItem[]> =>
    apiClient.get("/intercompany/matriz").then(res => res.data),

  registrarAcerto: (payload: {
    transferencia_id: string;
    data_acerto: string;
    comprovante_acerto_url?: string | null;
    observacao?: string | null;
  }): Promise<TransferenciaIntercompany> =>
    apiClient.post("/intercompany/acerto", payload).then(res => res.data),
};
