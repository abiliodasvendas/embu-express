import { pontoApi } from "@/services/api/ponto.api";
import { RegistroPonto } from "@/types/database";
import { useQuery } from "@tanstack/react-query";

export function useTimeRecord(id: number | null) {
    return useQuery<RegistroPonto>({
        queryKey: ["time-record", id],
        queryFn: () => pontoApi.getById(id!),
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
