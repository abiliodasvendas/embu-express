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
import { StatusUsuario } from "@/types/enums";
import { useCollaboratorActions } from "@/hooks/business/useCollaboratorActions";
import { Usuario } from "@/types/database";
import { getPerfilLabel } from "@/utils/formatters";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CollaboratorListProps {
  collaborators: Usuario[];
  onEdit: (collaborator: Usuario) => void;
  onStatusChange: (collaborator: Usuario, newStatus: string) => void;
  onDelete: (collaborator: Usuario) => void;
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isFetching?: boolean;
}

const getAvatarStyles = (status: string) => {
  switch (status) {
    case StatusUsuario.ATIVO:
      return "bg-emerald-50 text-emerald-700 border border-emerald-200/60";
    case StatusUsuario.PENDENTE:
      return "bg-amber-50 text-amber-700 border border-amber-200/60";
    default:
      return "bg-neutral-100 text-neutral-600 border border-neutral-200/60";
  }
};

const CollaboratorMobileItem = ({
  collaborator,
  onEdit,
  onStatusChange,
  onDelete,
}: {
  collaborator: Usuario;
  onEdit: (collaborator: Usuario) => void;
  onStatusChange: (collaborator: Usuario, newStatus: string) => void;
  onDelete: (collaborator: Usuario) => void;
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const actions = useCollaboratorActions({
    collaborator,
    onEdit,
    onStatusChange,
    onDelete,
  });

  const activeLinks =
    collaborator.status === StatusUsuario.ATIVO
      ? (collaborator.links || []).filter((link) => !link.data_fim)
      : [];

  return (
    <>
      <div
        onClick={() => setIsSheetOpen(true)}
        className="bg-card rounded-2xl shadow-xs border border-border p-4 active:scale-[0.99] transition-all cursor-pointer space-y-3"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarStyles(
                collaborator.status
              )}`}
            >
              {collaborator.nome_completo.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-foreground text-sm leading-tight truncate">
                {collaborator.nome_completo}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {getPerfilLabel(collaborator.perfil?.nome)}
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <StatusBadge status={collaborator.status} />
          </div>
        </div>

        {activeLinks.length > 0 && (
          <div className="pt-2 border-t border-border flex items-center gap-1.5 flex-wrap">
            {activeLinks.slice(0, 3).map((link) => (
              <span
                key={link.id}
                className="text-[11px] font-medium text-foreground bg-surface-alt px-2.5 py-0.5 rounded-[8px] border border-border"
              >
                {link.cliente?.nome_fantasia}
              </span>
            ))}
            {activeLinks.length > 3 && (
              <span className="text-[10px] text-muted-foreground font-medium">
                +{activeLinks.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      <ActionSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title={collaborator.nome_completo}
        description={getPerfilLabel(collaborator.perfil?.nome)}
        actions={actions.map((action) => ({
          label: action.label,
          title: action.title,
          description: action.description,
          icon: action.icon,
          onClick: action.onClick,
          disabled: action.disabled,
          isLoading: action.isLoading,
          isLink: action.isLink,
          href: action.href,
          isDestructive: action.isDestructive || action.variant === "destructive",
          hasSeparatorAfter: action.hasSeparatorAfter,
        }))}
      />
    </>
  );
};

const CollaboratorTableRow = ({
  collaborator,
  onEdit,
  onStatusChange,
  onDelete,
}: {
  collaborator: Usuario;
  onEdit: (collaborator: Usuario) => void;
  onStatusChange: (collaborator: Usuario, newStatus: string) => void;
  onDelete: (collaborator: Usuario) => void;
}) => {
  const actions = useCollaboratorActions({
    collaborator,
    onEdit,
    onStatusChange,
    onDelete,
  });
  const navigate = useNavigate();
  const activeLinks =
    collaborator.status === StatusUsuario.ATIVO
      ? (collaborator.links || []).filter((link) => !link.data_fim)
      : [];

  return (
    <TableRow
      onClick={() => navigate(`/colaboradores/${collaborator.id}`)}
      className="cursor-pointer hover:bg-primary/[0.04] active:bg-primary/[0.08] transition-colors duration-150"
    >
      <TableCell className="py-3.5 pl-6 align-middle">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarStyles(
              collaborator.status
            )}`}
          >
            {collaborator.nome_completo.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-foreground text-sm leading-tight hover:underline">
              {collaborator.nome_completo}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-6 py-3.5 align-middle">
        {activeLinks.length > 0 ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            {activeLinks.map((link) => (
              <span
                key={link.id}
                className="text-[11px] font-medium text-foreground bg-surface-alt px-2.5 py-0.5 rounded-[8px] border border-border"
              >
                {link.cliente?.nome_fantasia}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/60">-</span>
        )}
      </TableCell>
      <TableCell className="px-6 py-3.5 align-middle text-xs font-semibold text-muted-foreground uppercase">
        {getPerfilLabel(collaborator.perfil?.nome)}
      </TableCell>
      <TableCell className="px-6 py-3.5 align-middle">
        <StatusBadge status={collaborator.status} />
      </TableCell>
      <TableCell
        className="px-6 py-3.5 text-right align-middle"
        onClick={(e) => e.stopPropagation()}
      >
        <ActionsDropdown
          actions={actions}
          title={collaborator.nome_completo}
          description={getPerfilLabel(collaborator.perfil?.nome)}
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

export function CollaboratorList({
  collaborators,
  onEdit,
  onStatusChange,
  onDelete,
  page = 1,
  pageSize = 50,
  total = 0,
  totalPages = 1,
  onPageChange,
  onPageSizeChange,
  isFetching,
}: CollaboratorListProps) {
  const fromItem = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const toItem = Math.min(page * pageSize, total);
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="space-y-4">
      <ResponsiveDataList
        data={collaborators}
        mobileContainerClassName={cn(
          "space-y-3 transition-opacity duration-200",
          isFetching && "opacity-50 pointer-events-none"
        )}
        mobileItemRenderer={(collaborator) => (
          <CollaboratorMobileItem
            key={collaborator.id}
            collaborator={collaborator}
            onEdit={onEdit}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        )}
      >
        <div className="relative rounded-3xl border border-border bg-card shadow-xs overflow-hidden">
          {isFetching && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-surface-alt overflow-hidden z-20">
              <div className="h-full bg-primary w-full animate-pulse" />
            </div>
          )}
          <div className={cn("transition-opacity duration-200", isFetching && "opacity-50 pointer-events-none")}>
            <Table>
              <TableHeader className="bg-surface-alt/60">
                <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="py-3.5 pl-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Colaborador
                </TableHead>
                <TableHead className="px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Turno / Cliente
                </TableHead>
                <TableHead className="px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Cargo
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
              {collaborators.map((collaborator) => (
                <CollaboratorTableRow
                  key={collaborator.id}
                  collaborator={collaborator}
                  onEdit={onEdit}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                />
              ))}
            </TableBody>
          </Table>
          </div>
        </div>
      </ResponsiveDataList>

      {(totalPages > 1 || total > 50) && onPageChange && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3.5 bg-card rounded-2xl border border-border shadow-xs w-full overflow-hidden">
          <div className="flex items-center justify-between w-full md:w-auto gap-3 text-xs text-muted-foreground font-medium px-1">
            <span className="text-xs">
              Mostrando <span className="font-bold text-foreground">{fromItem}</span> a{" "}
              <span className="font-bold text-foreground">{toItem}</span> de{" "}
              <span className="font-bold text-foreground">{total}</span>
            </span>

            {onPageSizeChange && (
              <div className="flex items-center gap-1.5 border-l border-border pl-3">
                <span className="text-xs">Exibir:</span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="bg-surface-alt border border-border text-foreground text-xs rounded-lg px-2 py-1 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={500}>500</option>
                </select>
              </div>
            )}
          </div>

          {totalPages > 1 && (
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

                {pageNumbers.map((item, index) => (
                  <PaginationItem key={index}>
                    {item === "..." ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        isActive={item === page}
                        onClick={(e) => {
                          e.preventDefault();
                          onPageChange(Number(item));
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
          )}
        </div>
      )}
    </div>
  );
}
