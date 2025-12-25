import { clienteApi } from "@/services/api/cliente.api";
import { useQuery } from "@tanstack/react-query";

export function useClients(filters?: { searchTerm?: string; ativo?: string }) {
  return useQuery({
    queryKey: ["clients", filters],
    queryFn: () => clienteApi.listClientes(filters),
  });
}
