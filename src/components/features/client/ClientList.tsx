import { useState, useMemo } from "react";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { Client } from "@/types/database";
import { cn } from "@/lib/utils";
import { ClientMobileItem } from "./ClientMobileItem";
import { ClientTableRow } from "./ClientTableRow";
import { ClientPagination } from "./ClientPagination";

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onToggleStatus: (client: Client) => void;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isFetching?: boolean;
}

export function ClientList({
  clients,
  onEdit,
  onDelete,
  onToggleStatus,
  page: externalPage,
  pageSize: externalPageSize,
  onPageChange: externalOnPageChange,
  onPageSizeChange: externalOnPageSizeChange,
  isFetching,
}: ClientListProps) {
  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(50);

  const { data: empresas = [] } = useEmpresas();
  const { isAnyAdmin, can } = usePermissions();
  const podeVerValores = isAnyAdmin || can(PERMISSIONS.FATURAMENTO.VER);

  const empresasMap = useMemo(
    () => new Map(empresas.map((e) => [e.id, e])),
    [empresas]
  );

  const getEmpresaEmissoraNome = (client: Client): string | null => {
    if (client.empresa_emissora_padrao) {
      if (typeof client.empresa_emissora_padrao === "object") {
        const emp = Array.isArray(client.empresa_emissora_padrao)
          ? client.empresa_emissora_padrao[0]
          : client.empresa_emissora_padrao;
        if (emp?.nome_fantasia || emp?.razao_social) {
          return emp.nome_fantasia || emp.razao_social;
        }
      }
    }
    if (client.empresa_emissora_padrao_id) {
      const emp = empresasMap.get(client.empresa_emissora_padrao_id);
      return emp?.nome_fantasia || emp?.razao_social || null;
    }
    return null;
  };

  const currentPage = externalPage ?? internalPage;
  const currentPageSize = externalPageSize ?? internalPageSize;

  const total = clients.length;
  const totalPages = Math.max(1, Math.ceil(total / currentPageSize));

  const handlePageChange = (newPage: number) => {
    if (externalOnPageChange) {
      externalOnPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (externalOnPageSizeChange) {
      externalOnPageSizeChange(newSize);
    } else {
      setInternalPageSize(newSize);
      setInternalPage(1);
    }
  };

  const paginatedClients =
    externalPage !== undefined
      ? clients
      : clients.slice(
          (currentPage - 1) * currentPageSize,
          currentPage * currentPageSize
        );

  const fromItem = total > 0 ? (currentPage - 1) * currentPageSize + 1 : 0;
  const toItem = Math.min(currentPage * currentPageSize, total);

  return (
    <div className="space-y-4">
      <ResponsiveDataList
        data={paginatedClients}
        mobileContainerClassName={cn(
          "space-y-3 transition-opacity duration-200",
          isFetching && "opacity-50 pointer-events-none"
        )}
        mobileItemRenderer={(client) => (
          <ClientMobileItem
            key={client.id}
            client={client}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            podeVerValores={podeVerValores}
            empresaNome={getEmpresaEmissoraNome(client)}
          />
        )}
      >
        <div className="relative rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
          {isFetching && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-surface-alt overflow-hidden z-20">
              <div className="h-full bg-primary w-full animate-pulse" />
            </div>
          )}
          <div
            className={cn(
              "transition-opacity duration-200",
              isFetching && "opacity-50 pointer-events-none"
            )}
          >
            <Table>
              <TableHeader className="bg-surface-alt/60">
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="py-3.5 pl-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Cliente
                  </TableHead>
                  <TableHead className="px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Empresa Emissora
                  </TableHead>
                  {podeVerValores && (
                    <TableHead className="px-6 py-3.5 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Valor Contratual
                    </TableHead>
                  )}
                  <TableHead className="px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-3.5 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/60">
                {paginatedClients.map((client) => (
                  <ClientTableRow
                    key={client.id}
                    client={client}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                    podeVerValores={podeVerValores}
                    empresaNome={getEmpresaEmissoraNome(client)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </ResponsiveDataList>

      <ClientPagination
        currentPage={currentPage}
        currentPageSize={currentPageSize}
        totalPages={totalPages}
        total={total}
        fromItem={fromItem}
        toItem={toItem}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}

export default ClientList;
