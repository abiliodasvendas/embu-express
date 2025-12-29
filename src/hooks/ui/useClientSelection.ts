import { useClients } from "@/hooks/api/useClients";

export function useClientSelection(currentClientId?: number | null, options?: { enabled?: boolean }) {
  return useClients(
    { 
      ativo: "true", 
      includeId: currentClientId ? currentClientId.toString() : undefined 
    }, 
    {
      enabled: options?.enabled,
      refetchOnMount: options?.enabled === true ? true : undefined
    }
  );
}
