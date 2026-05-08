import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useClientActions } from "@/hooks/business/useClientActions";
import { Client } from "@/types/client";
import { useNavigate } from "react-router-dom";

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onToggleStatus: (client: Client) => void;
}

const ClientMobileItem = ({
  client,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onToggleStatus: (client: Client) => void;
}) => {
  const actions = useClientActions({ client, onEdit, onDelete, onToggleStatus });

  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/clientes/${client.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 active:scale-[0.99] transition-transform relative cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1 text-left">
          <p className="font-bold text-gray-900 text-sm line-clamp-2 break-words leading-tight">
            {client.nome_fantasia}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <StatusBadge status={client.ativo} />
          <ActionsDropdown actions={actions} />
        </div>
      </div>
    </div>
  );
};


const ClientTableRow = ({
  client,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onToggleStatus: (client: Client) => void;
}) => {
  const actions = useClientActions({ client, onEdit, onDelete, onToggleStatus });
  const navigate = useNavigate();

  return (
    <tr
      onClick={() => navigate(`/clientes/${client.id}`)}
      className="hover:bg-gray-50/80 transition-colors cursor-pointer"
    >
      <td className="py-4 pl-6 align-middle">
        <p className="font-bold text-gray-900 text-sm">{client.nome_fantasia}</p>
      </td>
      <td className="px-6 py-4 align-middle">
        <StatusBadge status={client.ativo} />
      </td>
      <td className="px-6 py-4 text-right align-middle" onClick={(e) => e.stopPropagation()}>
        <ActionsDropdown actions={actions} />
      </td>
    </tr>
  );
};

export function ClientList({ clients, onEdit, onDelete, onToggleStatus }: ClientListProps) {
  return (
    <ResponsiveDataList
      data={clients}
      mobileContainerClassName="space-y-3"
      mobileItemRenderer={(client) => (
        <ClientMobileItem
          key={client.id}
          client={client}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      )}
    >
      <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr className="border-b border-gray-100 text-left">
              <th className="py-4 pl-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Nome Fantasia
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
            {clients.map((client) => (
              <ClientTableRow
                key={client.id}
                client={client}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </tbody>
        </table>
      </div>
    </ResponsiveDataList>
  );
}
