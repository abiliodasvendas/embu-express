import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useSession } from "@/hooks/business/useSession";
import { pontoApi } from "@/services/api/ponto.api";

export function useManualAbsences(date: Date) {
  const queryClient = useQueryClient();
  const { session } = useSession();
  const dateStr = format(date, "yyyy-MM-dd");

  const { data: manualAbsenceIds = [], isLoading } = useQuery({
    queryKey: ["manualAbsences", dateStr],
    queryFn: () => pontoApi.listManualAbsences(dateStr),
    enabled: !!session?.access_token,
  });

  const addManualAbsence = useMutation({
    mutationFn: (userId: string) => pontoApi.addManualAbsence(dateStr, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manualAbsences", dateStr] });
    },
  });

  const removeManualAbsence = useMutation({
    mutationFn: (userId: string) => pontoApi.removeManualAbsence(dateStr, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manualAbsences", dateStr] });
    },
  });

  return {
    manualAbsenceIds,
    isLoading,
    addManualAbsence,
    removeManualAbsence,
  };
}
