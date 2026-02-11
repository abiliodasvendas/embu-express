import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useCollaboratorActions } from "@/hooks/business/useCollaboratorActions";
import { Usuario } from "@/types/database";
import { getPerfilLabel } from "@/utils/formatters";
import { useNavigate } from "react-router-dom";

interface CollaboratorListProps {
  collaborators: Usuario[];
  onEdit: (collaborator: Usuario) => void;
  onStatusChange: (collaborator: Usuario, newStatus: string) => void;
  onDelete: (collaborator: Usuario) => void;
}

const getAvatarStyles = (status: string) => {
  switch (status) {
    case 'ATIVO': return "bg-green-100 text-green-700";
    case 'PENDENTE': return "bg-yellow-100 text-yellow-700";
    default: return "bg-gray-100 text-gray-500";
  }
};

const CollaboratorMobileItem = ({
  collaborator,
  index,
  onEdit,
  onStatusChange,
  onDelete,
}: {
  collaborator: Usuario;
  index: number;
  onEdit: (collaborator: Usuario) => void;
  onStatusChange: (collaborator: Usuario, newStatus: string) => void;
  onDelete: (collaborator: Usuario) => void;
}) => {
  const actions = useCollaboratorActions({ collaborator, onEdit, onStatusChange, onDelete });
  const navigate = useNavigate();

  return (
    <MobileActionItem actions={actions} showHint={index === 0}>
      <div
        onClick={() => navigate(`/colaboradores/${collaborator.id}`)}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 active:scale-[0.99] transition-transform"
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-3 pr-20">
            {/* Added pr-20 to avoid overlap with absolute badge */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarStyles(collaborator.status)}`}>
              {collaborator.nome_completo.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-sm truncate">
                {collaborator.nome_completo}
              </h3>
               {collaborator.cliente?.nome_fantasia && (
                <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{collaborator.cliente.nome_fantasia}</p>
               )}
            </div>
          </div>
          <StatusBadge status={collaborator.status} className="absolute top-4 right-4" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm mt-3 pt-3 border-t border-gray-50">
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                Cargo
              </p>
              <p className="font-medium text-gray-700 text-xs text-left">
                {getPerfilLabel(collaborator.perfil?.nome)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </MobileActionItem>
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

  return (
    <tr
      onClick={() => navigate(`/colaboradores/${collaborator.id}`)}
      className="hover:bg-gray-50/80 transition-colors cursor-pointer"
    >
      <td className="py-4 pl-6 align-middle">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${getAvatarStyles(collaborator.status)}`}>
            {collaborator.nome_completo.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">
              {collaborator.nome_completo}
            </p>
             {collaborator.cliente?.nome_fantasia && (
                <p className="text-[10px] text-gray-400 mt-0.5">{collaborator.cliente.nome_fantasia}</p>
             )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 align-middle text-sm text-gray-600">
        {getPerfilLabel(collaborator.perfil?.nome)}
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

export function CollaboratorList({
  collaborators,
  onEdit,
  onStatusChange,
  onDelete,
}: CollaboratorListProps) {
  return (
    <ResponsiveDataList
      data={collaborators}
      mobileContainerClassName="space-y-3"
      mobileItemRenderer={(collaborator, index) => (
        <CollaboratorMobileItem
          key={collaborator.id}
          collaborator={collaborator}
          index={index}
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
  );
}
