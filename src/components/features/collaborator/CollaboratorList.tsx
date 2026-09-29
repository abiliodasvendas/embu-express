import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { StatusBadge } from "@/components/common/StatusBadge";
import { StatusUsuario } from "@/types/enums";
import { useCollaboratorActions } from "@/hooks/business/useCollaboratorActions";
import { Usuario } from "@/types/database";
import { useNavigate } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
}

const getAvatarStyles = (status: string) => {
  switch (status) {
    case StatusUsuario.ATIVO: return "bg-green-100 text-green-700";
    case StatusUsuario.PENDENTE: return "bg-yellow-100 text-yellow-700";
    default: return "bg-gray-100 text-gray-500";
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
  const actions = useCollaboratorActions({ collaborator, onEdit, onStatusChange, onDelete });
  const navigate = useNavigate();
  const activeLinks = collaborator.status === StatusUsuario.ATIVO
    ? (collaborator.links || []).filter((link) => !link.data_fim)
    : [];

  return (
    <div
      onClick={() => navigate(`/colaboradores/${collaborator.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 active:scale-[0.99] transition-transform"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarStyles(collaborator.status)}`}>
              {collaborator.nome_completo.charAt(0)}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 text-sm break-words leading-tight">
              {collaborator.nome_completo}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <StatusBadge status={collaborator.status} />
          <ActionsDropdown actions={actions} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mt-3 pt-3 border-t border-gray-50">
        <div className="space-y-3">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
              Cargo
            </p>
            <p className="font-medium text-gray-700 text-xs text-left">
              {collaborator.perfil?.nome.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {activeLinks.length > 0 && (
            <div className="flex flex-col items-end">
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider text-right w-full">
                {activeLinks.length > 1 ? "Clientes" : "Cliente"}
              </p>
              <div className="flex flex-col gap-0.5 w-full">
                {activeLinks.slice(0, 2).map((link) => (
                  <p key={link.id} className="font-medium text-gray-700 text-[11px] text-right leading-tight truncate">
                    {link.cliente?.nome_fantasia}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
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
  const actions = useCollaboratorActions({ collaborator, onEdit, onStatusChange, onDelete });
  const navigate = useNavigate();
  const activeLinks = collaborator.status === StatusUsuario.ATIVO
    ? (collaborator.links || []).filter((link) => !link.data_fim)
    : [];

  return (
    <tr
      onClick={() => navigate(`/colaboradores/${collaborator.id}`)}
      className="hover:bg-gray-50/80 transition-colors cursor-pointer"
    >
      <td className="py-4 pl-6 align-middle">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${getAvatarStyles(collaborator.status)}`}>
              {collaborator.nome_completo.charAt(0)}
            </div>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">
              {collaborator.nome_completo}
            </p>
            {activeLinks.length > 0 && (
              <div className="flex items-center gap-1.5 mt-0.5 leading-none">
                {activeLinks.slice(0, 2).map((link, i) => (
                  <div key={link.id} className="flex items-center gap-1.5">
                    {i > 0 && <span className="text-gray-300 scale-75">•</span>}
                    <span className="text-[10px] text-gray-400 font-medium">
                      {link.cliente?.nome_fantasia}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 align-middle text-sm text-gray-600">
        {collaborator.perfil?.nome.toUpperCase()}
      </td>
      <td className="px-6 py-4 align-middle">
        <StatusBadge status={collaborator.status} />
      </td>
      <td className="px-6 py-4 text-right align-middle" onClick={(e) => e.stopPropagation()}>
        <ActionsDropdown actions={actions} />
      </td>
    </tr>
  );
};

const getPageNumbers = (current: number, totalPages: number): (number | string)[] => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (current <= 2) {
    return [1, 2, 3, '...', totalPages];
  }
  if (current >= totalPages - 1) {
    return [1, '...', totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, '...', current, '...', totalPages];
};

export function CollaboratorList({
  collaborators,
  onEdit,
  onStatusChange,
  onDelete,
  page = 1,
  pageSize = 10,
  total = 0,
  totalPages = 1,
  onPageChange,
  onPageSizeChange,
}: CollaboratorListProps) {
  const fromItem = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const toItem = Math.min(page * pageSize, total);
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="space-y-4">
      <ResponsiveDataList
        data={collaborators}
        mobileContainerClassName="space-y-3"
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
        <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr className="border-b border-gray-100 text-left">
                <th className="py-4 pl-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Colaborador
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {collaborators.map((collaborator) => (
                <CollaboratorTableRow
                  key={collaborator.id}
                  collaborator={collaborator}
                  onEdit={onEdit}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      </ResponsiveDataList>

      {total > 0 && onPageChange && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm w-full overflow-hidden">
          <div className="flex items-center justify-between w-full md:w-auto gap-2 text-xs text-gray-500 font-medium px-1">
            <span className="text-[11px] sm:text-xs">
              Mostrando <span className="font-bold text-gray-900">{fromItem}</span> a{" "}
              <span className="font-bold text-gray-900">{toItem}</span> de{" "}
              <span className="font-bold text-gray-900">{total}</span>
            </span>

            {onPageSizeChange && (
              <div className="flex items-center gap-1.5 border-l border-gray-100 pl-2.5">
                <span className="text-[11px] sm:text-xs">Exibir:</span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2 py-1 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            )}
          </div>

          <Pagination className="mx-0 w-full md:w-auto flex justify-center">
            <PaginationContent className="flex-wrap justify-center gap-1">
              <PaginationItem>
                <PaginationPrevious
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) onPageChange(page - 1);
                  }}
                  className={page <= 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
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
                      className="cursor-pointer font-bold text-xs h-8 w-8 sm:h-9 sm:w-9"
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
                  className={page >= totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
