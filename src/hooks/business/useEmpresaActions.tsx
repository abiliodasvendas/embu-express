import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { Empresa } from "@/types/database";
import { Edit, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

interface UseEmpresaActionsProps {
  empresa: Empresa;
  onEdit: (empresa: Empresa) => void;
  onToggleStatus: (empresa: Empresa) => void;
  onDelete: (empresa: Empresa) => void;
}

export function useEmpresaActions({
  empresa,
  onEdit,
  onToggleStatus,
  onDelete,
}: UseEmpresaActionsProps) {
  const { can } = usePermissions();
  const actions = [];

  if (can(PERMISSIONS.EMPRESAS.EDITAR)) {
    actions.push({
      label: "Editar",
      icon: <Edit className="w-4 h-4" />,
      onClick: () => onEdit(empresa),
      swipeColor: "bg-blue-600",
      drawerClass: "text-blue-600",
    });
  }

  if (can(PERMISSIONS.EMPRESAS.STATUS)) {
    actions.push({
      label: empresa.ativo ? "Desativar" : "Ativar",
      icon: empresa.ativo ? (
        <ToggleRight className="w-4 h-4" />
      ) : (
        <ToggleLeft className="w-4 h-4" />
      ),
      onClick: () => onToggleStatus(empresa),
      swipeColor: empresa.ativo ? "bg-amber-600" : "bg-emerald-600",
      drawerClass: empresa.ativo ? "text-amber-600" : "text-emerald-600",
    });
  }

  if (can(PERMISSIONS.EMPRESAS.DELETAR)) {
    actions.push({
      label: "Remover",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => onDelete(empresa),
      isDestructive: true,
      swipeColor: "bg-red-600",
      drawerClass: "text-red-600",
    });
  }

  return actions;
}
