import { useCallback, useMemo } from "react";
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

  const value = useMemo(() => {
    if (!syncWithUrl) return defaultValue;
    const val = searchParams.get(key);
    
    if (val === null) return defaultValue;

    if (typeof defaultValue === "number") {
      return (parseInt(val) as T) || defaultValue;
    }
    if (typeof defaultValue === "boolean") {
      return (val === "true" as unknown as T) || defaultValue;
    }
    return (val as T) || defaultValue;
  }, [key, defaultValue, syncWithUrl, searchParams]);

  const setValue = useCallback((newValue: T | null | undefined) => {
    if (!syncWithUrl) return;

    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      const isDefault = newValue === defaultValue || newValue === FilterOptions.TODOS || newValue === null || newValue === undefined || newValue === "";

      if (isDefault) {
        newParams.delete(key);
      } else {
        newParams.set(key, String(newValue));
      }
      return newParams;
    }, { replace: true });
  }, [key, defaultValue, syncWithUrl, setSearchParams]);

  return [value, setValue] as [T, (newValue: T | null | undefined) => void];
}
