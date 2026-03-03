import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useFeriados(ano?: number) {
    return useQuery({
        queryKey: ["feriados", ano],
        queryFn: async () => {
            let query = supabase
                .from("feriados")
                .select("*")
                .order("data", { ascending: true });

            if (ano) {
                query = query
                    .gte("data", `${ano}-01-01`)
                    .lte("data", `${ano}-12-31`);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateFeriado() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ data, descricao }: { data: string; descricao: string }) => {
            const { data: created, error } = await supabase
                .from("feriados")
                .insert([{ data, descricao }])
                .select()
                .single();

            if (error) throw error;
            return created;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feriados"] });
            toast.success("Feriado cadastrado com sucesso!");
        },
        onError: (error: any) => {
            toast.error(error.message || "Erro ao cadastrar feriado");
        },
    });
}

export function useDeleteFeriado() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase
                .from("feriados")
                .delete()
                .eq("id", id);

            if (error) throw error;
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feriados"] });
            toast.success("Feriado removido!");
        },
        onError: (error: any) => {
            toast.error(error.message || "Erro ao remover feriado");
        },
    });
}
