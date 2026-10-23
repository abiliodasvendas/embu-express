import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { ActionSheet } from "@/components/common/ActionSheet";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { StatusBadge } from "@/components/common/StatusBadge";
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
import { NativeSelect } from "@/components/ui/native-select";
import { useEmpresaActions } from "@/hooks/business/useEmpresaActions";
import { Empresa } from "@/types/database";
import { cnpjMask } from "@/utils/masks";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface EmpresaListProps {
  empresas: Empresa[];
  onEdit: (empresa: Empresa) => void;
  onToggleStatus: (empresa: Empresa) => void;
  onDelete: (empresa: Empresa) => void;
  onGerenciarContas?: (empresa: Empresa) => void;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isFetching?: boolean;
}

const EmpresaMobileItem = ({
  empresa,
  onEdit,
  onToggleStatus,
  onDelete,
  onGerenciarContas,
}: {
  empresa: Empresa;
  onEdit: (empresa: Empresa) => void;
  onToggleStatus: (empresa: Empresa) => void;
  onDelete: (empresa: Empresa) => void;
  onGerenciarContas?: (empresa: Empresa) => void;
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const actions = useEmpresaActions({
    empresa,
    onEdit,
    onToggleStatus,
    onDelete,
    onGerenciarContas,
  });

  return (
    <>
      <div
        onClick={() => setIsSheetOpen(true)}
        className="bg-card rounded-[18px] shadow-xs border border-border p-4 active:scale-[0.99] transition-all cursor-pointer space-y-3"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold text-xs shrink-0">
              {empresa.nome_fantasia.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-foreground text-sm leading-tight truncate">
                {empresa.nome_fantasia}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                {empresa.cnpj ? cnpjMask(empresa.cnpj) : (empresa.razao_social || "-")}
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <StatusBadge status={empresa.ativo} />
          </div>
        </div>
      </div>

      <ActionSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title={empresa.nome_fantasia}
        description={empresa.cnpj ? cnpjMask(empresa.cnpj) : undefined}
        actions={actions.map((action) => ({
          label: action.label,
          icon: action.icon,
          variant: action.variant,
          onClick: () => {
            action.onClick();
            setIsSheetOpen(false);
          },
          hasSeparatorAfter: action.hasSeparatorAfter,
        }))}
      />
    </>
  );
};

const EmpresaTableRow = ({
  empresa,
  onEdit,
  onToggleStatus,
  onDelete,
  onGerenciarContas,
}: {
  empresa: Empresa;
  onEdit: (empresa: Empresa) => void;
  onToggleStatus: (empresa: Empresa) => void;
  onDelete: (empresa: Empresa) => void;
  onGerenciarContas?: (empresa: Empresa) => void;
}) => {
  const actions = useEmpresaActions({
    empresa,
    onEdit,
    onToggleStatus,
    onDelete,
    onGerenciarContas,
  });

  return (
    <TableRow
      onClick={() => onEdit(empresa)}
      className="cursor-pointer hover:bg-muted/40 transition-colors"
    >
      <TableCell className="py-3.5 pl-6 align-middle">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold text-xs shrink-0">
            {empresa.nome_fantasia.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-foreground text-sm leading-tight hover:underline">
              {empresa.nome_fantasia}
            </p>
            {empresa.razao_social && (
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-xs">
                {empresa.razao_social}
              </p>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="px-6 py-3.5 align-middle text-xs font-medium text-foreground">
        {empresa.cnpj ? cnpjMask(empresa.cnpj) : "-"}
      </TableCell>
      <TableCell className="px-6 py-3.5 align-middle">
        {empresa.codigo ? (
          <span className="text-[11px] font-medium text-foreground bg-muted/60 px-2.5 py-0.5 rounded-[8px] border border-border">
            {empresa.codigo}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/60">-</span>
        )}
      </TableCell>
      <TableCell className="px-6 py-3.5 align-middle">
        <StatusBadge status={empresa.ativo} />
      </TableCell>
      <TableCell
        className="px-6 py-3.5 text-right align-middle"
        onClick={(e) => e.stopPropagation()}
      >
        <ActionsDropdown
          actions={actions}
          title={empresa.nome_fantasia}
        />
      </TableCell>
    </TableRow>
  );
};

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

export function EmpresaList({
  empresas,
  onEdit,
  onToggleStatus,
  onDelete,
  onGerenciarContas,
  page: externalPage,
  pageSize: externalPageSize,
  onPageChange: externalOnPageChange,
  onPageSizeChange: externalOnPageSizeChange,
  isFetching,
}: EmpresaListProps) {
  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(50);

  const currentPage = externalPage ?? internalPage;
  const currentPageSize = externalPageSize ?? internalPageSize;

  const total = empresas.length;
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

  const paginatedEmpresas = externalPage !== undefined
    ? empresas
    : empresas.slice((currentPage - 1) * currentPageSize, currentPage * currentPageSize);

  const fromItem = total > 0 ? (currentPage - 1) * currentPageSize + 1 : 0;
  const toItem = Math.min(currentPage * currentPageSize, total);
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="space-y-4">
      <ResponsiveDataList
        data={paginatedEmpresas}
        mobileContainerClassName={cn(
          "space-y-3 transition-opacity duration-200",
          isFetching && "opacity-50 pointer-events-none"
        )}
        mobileItemRenderer={(empresa) => (
          <EmpresaMobileItem
            key={empresa.id}
            empresa={empresa}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            onGerenciarContas={onGerenciarContas}
          />
        )}
      >
        <div className="relative rounded-[18px] border border-border bg-card shadow-xs overflow-hidden">
          {isFetching && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-muted overflow-hidden z-20">
              <div className="h-full bg-primary w-full animate-pulse" />
            </div>
          )}
          <div className={cn("transition-opacity duration-200", isFetching && "opacity-50 pointer-events-none")}>
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="py-3.5 pl-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Empresa
                  </TableHead>
                  <TableHead className="px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    CNPJ
                  </TableHead>
                  <TableHead className="px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Código
                  </TableHead>
                  <TableHead className="px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-3.5 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/60">
                {paginatedEmpresas.map((empresa) => (
                  <EmpresaTableRow
                    key={empresa.id}
                    empresa={empresa}
                    onEdit={onEdit}
                    onToggleStatus={onToggleStatus}
                    onDelete={onDelete}
                    onGerenciarContas={onGerenciarContas}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </ResponsiveDataList>

      {(totalPages > 1 || total > 50) && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3.5 bg-card rounded-[18px] border border-border shadow-xs w-full overflow-hidden">
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
                className="h-8 rounded-[10px] bg-background border-border text-foreground text-xs px-2 py-0 font-semibold"
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
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    className={cn(
                      "rounded-[10px] text-xs h-8 border border-border",
                      currentPage === 1 && "pointer-events-none opacity-40"
                    )}
                  />
                </PaginationItem>

                {pageNumbers.map((p, idx) => (
                  <PaginationItem key={idx}>
                    {p === "..." ? (
                      <PaginationEllipsis className="h-8 w-8 text-xs text-muted-foreground" />
                    ) : (
                      <PaginationLink
                        href="#"
                        isActive={p === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(Number(p));
                        }}
                        className={cn(
                          "rounded-[10px] text-xs h-8 w-8 border border-border",
                          p === currentPage && "bg-foreground text-background font-bold border-foreground"
                        )}
                      >
                        {p}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) handlePageChange(currentPage + 1);
                    }}
                    className={cn(
                      "rounded-[10px] text-xs h-8 border border-border",
                      currentPage === totalPages && "pointer-events-none opacity-40"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}
