import { Ocorrencia } from "@/types/database";

export function useOccurrenceBusiness() {
  const processOccurrences = (occurrences: Ocorrencia[]): Ocorrencia[] => {
    return occurrences || [];
  };

  return {
    processOccurrences
  };
}
