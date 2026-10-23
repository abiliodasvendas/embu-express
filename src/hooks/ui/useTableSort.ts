import { useState, useMemo, useCallback } from "react";

export type SortDirection = "asc" | "desc";

export type ValueExtractor<T> = (item: T) => unknown;

export interface UseTableSortOptions<T> {
  defaultKey: string;
  defaultDirection?: SortDirection;
  customExtractors?: Record<string, ValueExtractor<T>>;
}

export function useTableSort<T>(items: T[], options: UseTableSortOptions<T>) {
  const [sortKey, setSortKey] = useState<string>(options.defaultKey);
  const [sortDirection, setSortDirection] = useState<SortDirection>(options.defaultDirection || "asc");

  const handleSort = useCallback((key: string) => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDirection((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return prevKey;
      }
      setSortDirection("asc");
      return key;
    });
  }, []);

  const sortedData = useMemo(() => {
    if (!items || items.length === 0) return [];
    const list = [...items];

    return list.sort((a, b) => {
      let valA: unknown;
      let valB: unknown;

      const extractor = options.customExtractors?.[sortKey];
      if (extractor) {
        valA = extractor(a);
        valB = extractor(b);
      } else {
        valA = (a as Record<string, unknown>)[sortKey];
        valB = (b as Record<string, unknown>)[sortKey];
      }

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }

      const strA = String(valA).trim();
      const strB = String(valB).trim();

      const comparison = strA.localeCompare(strB, "pt-BR", { numeric: true, sensitivity: "base" });
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [items, sortKey, sortDirection, options.customExtractors]);

  return {
    sortedData,
    sortKey,
    sortDirection,
    handleSort,
    setSortKey,
    setSortDirection,
  };
}
