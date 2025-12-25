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
      swipeColor: "bg-blue-500",
    },
    {
      label: client.ativo ? "Inativar" : "Reativar",
      icon: client.ativo ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />,
      onClick: () => onToggleStatus(client),
      swipeColor: client.ativo ? "bg-amber-500" : "bg-emerald-500",
    },
    {
      label: "Remover",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => onDelete(client),
      isDestructive: true,
      swipeColor: "bg-red-500",
    },
  ];
}
