import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { ActionSheet } from "@/components/common/ActionSheet";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { Badge } from "@/components/ui/badge";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useItemEquipamentoActions } from "@/hooks/business/useItemEquipamentoActions";
import { ItemEquipamento } from "@/types/database";
import { Package } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const getPageNumbers = (
  current: number,
  totalPages: number
): (number | string)[] => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (current <= 2) {
    return [1, 2, 3, "...", totalPages];
  }
  if (current >= totalPages - 1) {
    return [1, "...", totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", current, "...", totalPages];
};

interface ItemEquipamentoListProps {
  itens: ItemEquipamento[];
  onEdit: (item: ItemEquipamento) => void;
  onDelete: (item: ItemEquipamento) => void;
  onViewAlocados: (item: ItemEquipamento) => void;
  canEdit?: boolean;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isFetching?: boolean;
}

export function ItemEquipamentoList({
  itens,
  onEdit,
  onDelete,
  onViewAlocados,
  canEdit = true,
  page = 1,
  pageSize = 50,
  onPageChange,
  onPageSizeChange,
  isFetching = false,
}: ItemEquipamentoListProps) {
  const [selectedItemForAction, setSelectedItemForAction] = useState<ItemEquipamento | null>(null);
  const [internalPage, setInternalPage] = useState(page);
  const [internalPageSize, setInternalPageSize] = useState(pageSize);

  const currentPage = onPageChange ? page : internalPage;
  const currentPageSize = onPageSizeChange ? pageSize : internalPageSize;

  const total = itens.length;
  const totalPages = Math.max(1, Math.ceil(total / currentPageSize));
  const startIndex = (currentPage - 1) * currentPageSize;
  const paginatedItens = itens.slice(startIndex, startIndex + currentPageSize);
  const fromItem = total > 0 ? startIndex + 1 : 0;
  const toItem = Math.min(startIndex + currentPageSize, total);
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    } else {
      setInternalPageSize(newSize);
      setInternalPage(1);
    }
  };

  const { getItemActions } = useItemEquipamentoActions({
    onEdit,
    onDelete,
    onViewAlocados,
    canEdit,
  });

  return (
    <div className="space-y-4">
      {isFetching && (
        <div className="h-0.5 w-full bg-primary/20 overflow-hidden rounded-full -mb-3.5">
          <div className="h-full bg-primary animate-pulse w-full" />
        </div>
      )}

      <ResponsiveDataList
        data={paginatedItens}
        mobileContainerClassName="space-y-3"
        mobileItemRenderer={(item: ItemEquipamento) => (
          <div
            key={item.id}
            onClick={() => setSelectedItemForAction(item)}
            className="p-4 rounded-[18px] bg-card border border-border shadow-xs active:scale-[0.99] transition-transform cursor-pointer"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-10 w-10 rounded-[14px] bg-muted/70 text-foreground flex items-center justify-center shrink-0 border border-border">
                  <Package className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-foreground text-sm leading-tight truncate">
                      {item.nome}
                    </h4>
                    {!item.ativo && (
                      <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground font-semibold shrink-0">
                        Inativo
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    {item.categoria?.nome || "Sem categoria"}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border",
                    (item.total_alocado || 0) > 0
                      ? "bg-muted/80 text-foreground border-border"
                      : "bg-muted/40 text-muted-foreground border-border"
                  )}
                >
                  {item.total_alocado || 0}{" "}
                  {(item.total_alocado || 0) === 1 ? "alocado" : "alocados"}
                </span>
              </div>
            </div>
          </div>
        )}
      >
        <div
          className={cn(
            "rounded-[24px] border border-border bg-card shadow-xs overflow-hidden transition-opacity duration-200",
            isFetching && "opacity-60 pointer-events-none"
          )}
        >
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-b border-border/80 hover:bg-transparent">
                <TableHead className="pl-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Item
                </TableHead>
                <TableHead className="w-[200px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Categoria
                </TableHead>
                <TableHead className="w-[150px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Qtd. Alocada
                </TableHead>
                <TableHead className="w-[80px] pr-6 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItens.map((item) => {
                const actions = getItemActions(item);
                return (
                  <TableRow
                    key={item.id}
                    onClick={() => onEdit(item)}
                    className="hover:bg-muted/40 transition-colors cursor-pointer group border-b border-border/60 last:border-0"
                  >
                    <TableCell className="pl-6 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-[12px] bg-muted/70 text-foreground flex items-center justify-center shrink-0 border border-border">
                          <Package className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-sm">
                            {item.nome}
                          </span>
                          {!item.ativo && (
                            <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground font-semibold">
                              Inativo
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 align-middle">
                      <Badge variant="outline" className="text-xs border-border text-muted-foreground font-medium uppercase shadow-none">
                        {item.categoria?.nome || "Sem Categoria"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 align-middle">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-muted/80 text-foreground border border-border">
                        {item.total_alocado || 0} alocados
                      </span>
                    </TableCell>
                    <TableCell
                      className="pr-6 py-4 text-right align-middle"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ActionsDropdown
                        actions={actions}
                        title={item.nome}
                        description={item.categoria?.nome ? `${item.categoria.nome} • ${item.total_alocado || 0} alocados` : `${item.total_alocado || 0} alocados`}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </ResponsiveDataList>

      {(totalPages > 1 || total > 50) && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3.5 bg-card rounded-2xl border border-border shadow-xs w-full overflow-hidden">
          <div className="flex items-center justify-between w-full md:w-auto gap-3 text-xs text-muted-foreground font-medium px-1">
            <span className="text-xs">
              Mostrando <span className="font-bold text-foreground">{fromItem}</span> a{" "}
              <span className="font-bold text-foreground">{toItem}</span> de{" "}
              <span className="font-bold text-foreground">{total}</span>
            </span>

            <div className="flex items-center gap-1.5 border-l border-border pl-3">
              <span className="text-xs">Exibir:</span>
              <NativeSelect
                value={String(currentPageSize)}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="bg-card border border-border text-foreground text-xs rounded-[10px] h-8 py-0 px-2 font-semibold shadow-xs"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
              </NativeSelect>
            </div>
          </div>

          {totalPages > 1 && (
            <Pagination className="mx-0 w-full md:w-auto flex justify-center">
              <PaginationContent className="flex-wrap justify-center gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    className={
                      currentPage <= 1
                        ? "pointer-events-none opacity-40"
                        : "cursor-pointer rounded-xl h-9"
                    }
                  />
                </PaginationItem>

                {pageNumbers.map((item, index) => (
                  <PaginationItem key={index}>
                    {item === "..." ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        isActive={item === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(Number(item));
                        }}
                        className="cursor-pointer font-bold text-xs h-9 w-9 rounded-xl"
                      >
                        {item}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) handlePageChange(currentPage + 1);
                    }}
                    className={
                      currentPage >= totalPages
                        ? "pointer-events-none opacity-40"
                        : "cursor-pointer rounded-xl h-9"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}

      {selectedItemForAction && (
        <ActionSheet
          open={!!selectedItemForAction}
          onOpenChange={(open) => !open && setSelectedItemForAction(null)}
          title={selectedItemForAction.nome}
          description={selectedItemForAction.categoria?.nome ? `${selectedItemForAction.categoria.nome} • ${selectedItemForAction.total_alocado || 0} alocados` : `${selectedItemForAction.total_alocado || 0} alocados`}
          actions={getItemActions(selectedItemForAction)}
        />
      )}
    </div>
  );
}
