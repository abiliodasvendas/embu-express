import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Client } from "@/types/client";
import { Edit2, Eye, Trash2 } from "lucide-react";

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onToggleStatus: (client: Client) => void;
}

export function ClientList({ clients, onEdit, onDelete, onToggleStatus }: ClientListProps) {
  const getActions = (client: Client) => [
    {
      label: "Editar",
      icon: <Edit2 className="h-4 w-4" />,
      onClick: () => onEdit(client),
      swipeColor: "bg-blue-500",
    },
    {
      label: client.status === "ativo" ? "Inativar" : "Reativar",
      icon: <Eye className="h-4 w-4" />,
      onClick: () => onToggleStatus(client),
      swipeColor: client.status === "ativo" ? "bg-amber-500" : "bg-emerald-500",
    },
    {
      label: "Remover",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => onDelete(client),
      variant: "destructive" as const,
      swipeColor: "bg-red-500",
    },
  ];

  return (
    <ResponsiveDataList
      data={clients}
      mobileContainerClassName="space-y-3"
      mobileItemRenderer={(client, index) => {
        const actions = getActions(client);

        return (
          <MobileActionItem key={client.id} actions={actions} showHint={index === 0}>
            <div
              onClick={() => onEdit(client)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 active:scale-[0.99] transition-transform relative"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0 pr-20">
                  <p className="font-bold text-gray-900 text-sm truncate">
                    {client.nome_fantasia}
                  </p>
                  {client.cnpj && (
                    <p className="text-xs text-muted-foreground">{client.cnpj}</p>
                  )}
                </div>
                <StatusBadge status={client.status === "ativo"} className="absolute top-4 right-4" />
              </div>
              {client.razao_social && (
                <p className="text-xs text-gray-500 truncate">{client.razao_social}</p>
              )}
            </div>
          </MobileActionItem>
        );
      }}
    >
      <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr className="border-b border-gray-100 text-left">
              <th className="py-4 pl-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Nome Fantasia
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                CNPJ
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Razão Social
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
            {clients.map((client) => {
              const actions = getActions(client);

              return (
                <tr
                  key={client.id}
                  onClick={() => onEdit(client)}
                  className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-4 pl-6 align-middle">
                    <p className="font-bold text-gray-900 text-sm">{client.nome_fantasia}</p>
                  </td>
                  <td className="px-6 py-4 align-middle text-sm text-gray-600">
                    {client.cnpj || "-"}
                  </td>
                  <td className="px-6 py-4 align-middle text-sm text-gray-600">
                    {client.razao_social || "-"}
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <StatusBadge status={client.status === "ativo"} />
                  </td>
                  <td className="px-6 py-4 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                    <ActionsDropdown actions={actions} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ResponsiveDataList>
  );
}
