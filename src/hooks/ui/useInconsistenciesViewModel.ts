import { useMemo } from "react";
import { useSearchFilters, useFiltersManager } from "./useFilters";
import { useUrlState } from "./useUrlState";
import { useTimeRecords } from "@/hooks/api/useTimeRecords";
import { FilterOptions } from "@/types/enums";
import { format } from "date-fns";
import { onlyNumbers } from "@/utils/string";

export function useInconsistenciesViewModel() {
    const [date, setDate] = useUrlState<string>({ 
        key: "date", 
        defaultValue: format(new Date(), "yyyy-MM-dd") 
    });
    
    const { searchTerm, setSearchTerm } = useSearchFilters();
    const { hasActiveFilters, clearFilters } = useFiltersManager(["search", "date"]);

    const dateObj = useMemo(() => new Date(date + "T12:00:00"), [date]);

    const { data: records = [], isLoading, refetch } = useTimeRecords({
        date,
        statusSaida: FilterOptions.FALTA_SAIDA,
        incluirTodos: true
    });

    const filteredRecords = useMemo(() => {
        if (!records) return [];
        const term = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        return records.filter(r => {
            const name = (r.usuario?.nome_completo || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const cpf = onlyNumbers(r.usuario?.cpf || "");
            const searchCpf = onlyNumbers(term);
            
            return name.includes(term) || (searchCpf && cpf.includes(searchCpf));
        });
    }, [records, searchTerm]);

    return {
        date: dateObj,
        setDate: (d: Date) => setDate(format(d, "yyyy-MM-dd")),
        searchTerm,
        setSearchTerm,
        records,
        filteredRecords,
        isLoading,
        refetch,
        hasActiveFilters,
        clearFilters
    };
}
