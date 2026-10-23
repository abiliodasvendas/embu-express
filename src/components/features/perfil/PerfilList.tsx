import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { ActionSheet } from "@/components/common/ActionSheet";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { Badge } from "@/components/ui/badge";
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
import { PROTECTED_ROLES_NAMES } from "@/constants/permissions.enum";
import { usePerfilActions } from "@/hooks/business/usePerfilActions";
import { Perfil } from "@/types/database";
import { Shield } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NativeSelect } from "@/components/ui/native-select";

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

interface PerfilListProps {
  perfis: Perfil[];
  onEdit: (perfil: Perfil) => void;
  onDelete: (perfil: Perfil) => void;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isFetching?: boolean;
}

export function PerfilList({
  perfis,
  onEdit,
  onDelete,
  page = 1,
  pageSize = 50,
  onPageChange,
  onPageSizeChange,
  isFetching = false,
}: PerfilListProps) {
  const [selectedPerfilForAction, setSelectedPerfilForAction] = useState<Perfil | null>(null);
  const [internalPage, setInternalPage] = useState(page);
  const [internalPageSize, setInternalPageSize] = useState(pageSize);

  const currentPage = onPageChange ? page : internalPage;
  const currentPageSize = onPageSizeChange ? pageSize : internalPageSize;

  const total = perfis.length;
  const totalPages = Math.max(1, Math.ceil(total / currentPageSize));
  const startIndex = (currentPage - 1) * currentPageSize;
  const paginatedPerfis = perfis.slice(startIndex, startIndex + currentPageSize);
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

  const { getPerfilActions } = usePerfilActions({
    onEdit,
    onDelete,
  });

  return (
    <div className="space-y-4">
      {isFetching && (
        <div className="h-0.5 w-full bg-primary/20 overflow-hidden rounded-full -mb-3.5">
          <div className="h-full bg-primary animate-pulse w-full" />
        </div>
      )}

      <ResponsiveDataList
        data={paginatedPerfis}
        mobileContainerClassName="space-y-3"
        mobileItemRenderer={(perfil: Perfil) => {
          const isProtected = (PROTECTED_ROLES_NAMES as readonly string[]).includes(perfil.nome);
          return (
            <div
              key={perfil.id}
              onClick={() => setSelectedPerfilForAction(perfil)}
              className="p-4 rounded-2xl bg-card border border-border shadow-xs active:scale-[0.99] transition-transform cursor-pointer"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="h-10 w-10 rounded-xl bg-muted/70 text-foreground flex items-center justify-center shrink-0 border border-border">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-foreground text-sm leading-tight capitalize truncate">
                        {perfil.nome.replace(/_/g, " ")}
                      </h4>
                      {isProtected && (
                        <Badge variant="secondary" className="text-[9px] bg-muted text-foreground border border-border font-semibold shrink-0">
                          SISTEMA
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-muted/60 text-muted-foreground border border-border">
                    {perfil.total_colaboradores || 0}{" "}
                    {(perfil.total_colaboradores || 0) === 1 ? "ativo" : "ativos"}
                  </span>
                </div>
              </div>
            </div>
          );
        }}
      >
        <div
          className={cn(
            "rounded-3xl border border-border bg-card shadow-xs overflow-hidden transition-opacity duration-200",
            isFetching && "opacity-60 pointer-events-none"
          )}
        >
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-b border-border/80 hover:bg-transparent">
                <TableHead className="w-[100px] pl-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  ID
                </TableHead>
                <TableHead className="w-[260px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Perfil
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Descrição
                </TableHead>
                <TableHead className="w-[180px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Colaboradores
                </TableHead>
                <TableHead className="w-[80px] pr-6 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPerfis.map((perfil) => {
                const actions = getPerfilActions(perfil);
                const isProtected = (PROTECTED_ROLES_NAMES as readonly string[]).includes(perfil.nome);
                return (
                  <TableRow
                    key={perfil.id}
                    onClick={() => onEdit(perfil)}
                    className="hover:bg-muted/40 transition-colors cursor-pointer group border-b border-border/60 last:border-0"
                  >
                    <TableCell className="pl-6 py-4 align-middle">
                      <span className="text-xs font-medium text-muted-foreground">
                        #{perfil.id}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-muted/70 text-foreground flex items-center justify-center shrink-0 border border-border">
                          <Shield className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-sm uppercase">
                            {perfil.nome.replace(/_/g, " ")}
                          </span>
                          {isProtected && (
                            <Badge variant="secondary" className="text-[9px] bg-muted text-foreground border border-border font-semibold">
                              SISTEMA
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 align-middle">
                      <span className="text-xs font-medium text-muted-foreground line-clamp-1">
                        {perfil.descricao || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 align-middle">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-muted/60 text-muted-foreground border border-border">
                        {perfil.total_colaboradores || 0} ativos
                      </span>
                    </TableCell>
                    <TableCell
                      className="pr-6 py-4 text-right align-middle"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ActionsDropdown
                        actions={actions}
                        title={perfil.nome.replace(/_/g, " ").toUpperCase()}
                        description={perfil.descricao || `${perfil.total_colaboradores || 0} colaboradores ativos`}
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
                value={currentPageSize.toString()}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                variant="white"
                className="h-8 text-xs rounded-[10px] w-20"
              >
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="500">500</option>
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

      {selectedPerfilForAction && (
        <ActionSheet
          open={!!selectedPerfilForAction}
          onOpenChange={(open) => !open && setSelectedPerfilForAction(null)}
          title={selectedPerfilForAction.nome.replace(/_/g, " ").toUpperCase()}
          description={selectedPerfilForAction.descricao || "Perfil de acesso"}
          actions={getPerfilActions(selectedPerfilForAction)}
        />
      )}
    </div>
  );
}
