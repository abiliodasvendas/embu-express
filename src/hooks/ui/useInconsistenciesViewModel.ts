import { useState, useMemo, useEffect } from "react";
import { useTimeRecords } from "@/hooks/api/useTimeRecords";
import { FILTER_OPTIONS } from "@/constants/ponto";
import { format } from "date-fns";
import { useFilters } from "./useFilters";

export function useInconsistenciesViewModel() {
    const [date, setDate] = useState<Date>(new Date());
    const [searchTerm, setSearchTerm] = useState("");

    const { data: records = [], isLoading, refetch } = useTimeRecords({
        date: format(date, "yyyy-MM-dd"),
        statusSaida: FILTER_OPTIONS.FALTA_SAIDA,
        incluirTodos: true
    });

    const filteredRecords = useMemo(() => {
        if (!records) return [];
        const term = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        return records.filter(r => {
            const name = (r.usuario?.nome_completo || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const cpf = (r.usuario?.cpf || "").replace(/\D/g, "");
            const searchCpf = term.replace(/\D/g, "");
            
            return name.includes(term) || (searchCpf && cpf.includes(searchCpf));
        });
    }, [records, searchTerm]);

    return {
        date,
        setDate,
        searchTerm,
        setSearchTerm,
        records,
        filteredRecords,
        isLoading,
        refetch
    };
}
