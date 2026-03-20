import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FilterOptions } from "@/types/enums";

export interface UseUrlStateOptions<T> {
  key: string;
  defaultValue: T;
  syncWithUrl?: boolean;
}

/**
 * Hook base para gerenciar um estado sincronizado com a URL (Query Params).
 */
export function useUrlState<T extends string | number | boolean>(options: UseUrlStateOptions<T>) {
  const { key, defaultValue, syncWithUrl = true } = options;
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estado local para quando não estiver sincronizando com a URL
  const [localValue, setLocalValue] = useState<T>(defaultValue);

  const value = useMemo(() => {
    if (!syncWithUrl) return localValue;
    
    const val = searchParams.get(key);
    if (val === null) return defaultValue;

    if (typeof defaultValue === "number") {
      const parsed = parseInt(val);
      return (isNaN(parsed) ? defaultValue : parsed) as T;
    }
    if (typeof defaultValue === "boolean") {
      return (val === "true") as unknown as T;
    }
    return (val as T) || defaultValue;
  }, [key, defaultValue, syncWithUrl, searchParams, localValue]);

  const setValue = useCallback((newValue: T | null | undefined) => {
    const finalValue = (newValue === null || newValue === undefined) ? defaultValue : newValue;

    if (!syncWithUrl) {
      setLocalValue(finalValue);
      return;
    }

    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      const isDefault = finalValue === defaultValue || 
                        finalValue === FilterOptions.TODOS || 
                        finalValue === "";

      if (isDefault) {
        newParams.delete(key);
      } else {
        newParams.set(key, String(finalValue));
      }
      return newParams;
    }, { replace: true });
  }, [key, defaultValue, syncWithUrl, setSearchParams]);

  return [value, setValue] as [T, (newValue: T | null | undefined) => void];
}

