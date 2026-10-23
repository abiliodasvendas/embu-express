import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ListSkeleton } from "@/components/skeletons";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ActionItem } from "@/types/actions";
import { Convenio, ConvenioResumoItem } from "@/types/database";
import { Handshake } from "lucide-react";
import { ConvenioMobileItem } from "./ConvenioMobileItem";
import { ConvenioTableRow } from "./ConvenioTableRow";

interface ConveniosTableProps {
  paginatedConvenios: Convenio[];
  filteredConvenios: Convenio[];
  resumoMap: Map<string, ConvenioResumoItem>;
  isInitialLoading: boolean;
  isFetching: boolean;
  isResumoFetching: boolean;
  searchTerm: string;
  canEdit: boolean;
  canLiquidar?: boolean;
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRegister: () => void;
  getConvenioActions: (convenio: Convenio) => ActionItem[];
  onLiquidarFatura: (convenio: Convenio, resumoItem?: ConvenioResumoItem) => void;
}

export function ConveniosTable({
  paginatedConvenios,
  filteredConvenios,
  resumoMap,
  isInitialLoading,
  isFetching,
  isResumoFetching,
  searchTerm,
  canEdit,
  canLiquidar = true,
  total,
  totalPages,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onRegister,
  getConvenioActions,
  onLiquidarFatura,
}: ConveniosTableProps) {
  if (isInitialLoading) {
    return <ListSkeleton />;
  }

  if (filteredConvenios.length === 0) {
    return (
      <UnifiedEmptyState
        icon={Handshake}
        title="Nenhum convênio encontrado"
        description={
          searchTerm
            ? "Não encontramos nenhum convênio com os critérios de busca."
            : "Cadastre oficinas ou autopeças parceiras para iniciar os lançamentos."
        }
        action={
          !searchTerm && canEdit
            ? { label: "Cadastrar Convênio", onClick: onRegister }
            : undefined
        }
      />
    );
  }

  const isRefreshing = (isFetching || isResumoFetching) && !isInitialLoading;

  return (
    <div className="space-y-4 relative">
      {isRefreshing && (
        <div className="absolute -top-3 left-0 right-0 h-1 bg-surface-alt overflow-hidden rounded-full z-20">
          <div className="h-full bg-primary w-full animate-pulse" />
        </div>
      )}

      <div
        className={cn(
          "space-y-4 transition-opacity duration-200",
          isRefreshing && "opacity-60 pointer-events-none"
        )}
      >
        <ResponsiveDataList
          data={paginatedConvenios}
          mobileContainerClassName="space-y-3"
          mobileItemRenderer={(convenio) => (
            <ConvenioMobileItem
              key={convenio.id}
              convenio={convenio}
              resumoItem={resumoMap.get(convenio.id)}
              actions={getConvenioActions(convenio)}
              onLiquidar={
                canLiquidar
                  ? () => onLiquidarFatura(convenio, resumoMap.get(convenio.id))
                  : undefined
              }
            />
          )}
        >
          <div className="rounded-[24px] border border-border overflow-hidden bg-card shadow-xs">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="py-4 pl-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Convênio
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Total do Mês
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Motoboys
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Moto Embu
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Fatura
                  </TableHead>
                  <TableHead className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Data Pagto
                  </TableHead>
                  <TableHead className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/60">
                {paginatedConvenios.map((convenio) => (
                  <ConvenioTableRow
                    key={convenio.id}
                    convenio={convenio}
                    resumoItem={resumoMap.get(convenio.id)}
                    actions={getConvenioActions(convenio)}
                    onLiquidar={
                      canLiquidar
                        ? () => onLiquidarFatura(convenio, resumoMap.get(convenio.id))
                        : undefined
                    }
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </ResponsiveDataList>

        {total > 50 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border mt-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span>
                Exibindo {paginatedConvenios.length} de {total} registros
              </span>
              <NativeSelect
                value={String(pageSize)}
                onChange={(e) => {
                  onPageSizeChange(Number(e.target.value));
                  onPageChange(1);
                }}
                className="h-8 w-20 text-xs rounded-[10px] bg-card border-border"
              >
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="500">500</option>
              </NativeSelect>
            </div>

            <Pagination className="mx-0 w-full md:w-auto flex justify-center">
              <PaginationContent className="flex-wrap justify-center gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) onPageChange(page - 1);
                    }}
                    className={
                      page <= 1
                        ? "pointer-events-none opacity-40"
                        : "cursor-pointer rounded-xl h-9"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      isActive={p === page}
                      onClick={(e) => {
                        e.preventDefault();
                        onPageChange(p);
                      }}
                      className="cursor-pointer font-bold text-xs h-9 w-9 rounded-xl"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) onPageChange(page + 1);
                    }}
                    className={
                      page >= totalPages
                        ? "pointer-events-none opacity-40"
                        : "cursor-pointer rounded-xl h-9"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
