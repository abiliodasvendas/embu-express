import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api/client";

export interface DashboardFinanceiroResponse {
    totalFolha: number;
    valorPago: number;
    restaPagar: number;
    pendentesCount: number;
}

export function useFinanceiroDashboard(mes: number, ano: number) {
    return useQuery({
        queryKey: ['financeiro-dashboard', mes, ano],
        queryFn: async () => {
            const { data } = await apiClient.get<DashboardFinanceiroResponse>('/financeiro/dashboard-lote', {
                params: { mes, ano }
            });
            return data;
        },
        enabled: !!mes && !!ano
    });
}
