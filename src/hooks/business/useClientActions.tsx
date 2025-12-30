import { ActionItem } from "@/types/actions";
import { Client } from "@/types/client";
import { Edit2, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

interface UseClientActionsProps {
  client: Client;
  onEdit: (client: Client) => void;
  onToggleStatus: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export function useClientActions({
  client,
  onEdit,
  onToggleStatus,
  onDelete,
}: UseClientActionsProps): ActionItem[] {
  return [
    {
      label: "Editar",
      icon: <Edit2 className="h-4 w-4" />,
      onClick: () => onEdit(client),
      swipeColor: "bg-blue-600",
      drawerClass: "text-blue-600",
    },
    {
      label: client.ativo ? "Desativar" : "Reativar",
      icon: client.ativo ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />,
      onClick: () => onToggleStatus(client),
      swipeColor: client.ativo ? "bg-amber-600" : "bg-emerald-600",
      drawerClass: client.ativo ? "text-amber-600" : "text-emerald-600",
    },
    {
      label: "Remover",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => onDelete(client),
      isDestructive: true,
      swipeColor: "bg-red-600",
      drawerClass: "text-red-600",
    },
  ];
}
