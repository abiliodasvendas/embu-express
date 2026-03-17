import { useMemo } from "react";

export function useOccurrenceBusiness() {
  const processOccurrences = (occurrences: any[]) => {
    return occurrences || [];
  };

  return {
    processOccurrences
  };
}
