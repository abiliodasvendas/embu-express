import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useSession } from "@/hooks/business/useSession";
import { Usuario } from "@/types/database";
import { getPerfilLabel } from "@/utils/formatters";
import { Edit2, ToggleLeft, ToggleRight, Trash2, User } from "lucide-react";

interface EmployeeListProps {
  employees: Usuario[];
  onEdit: (employee: Usuario) => void;
  onToggleStatus: (employee: Usuario) => void;
  onDelete: (employee: Usuario) => void;
}

export function EmployeeList({
  employees,
  onEdit,
  onToggleStatus,
  onDelete,
}: EmployeeListProps) {
  const { user } = useSession();

  const getActions = (employee: Usuario) => {
    const isCurrentUser = user?.id === employee.id;
    const actions = [
      {
        label: "Editar",
        icon: <Edit2 className="h-4 w-4" />,
        onClick: () => onEdit(employee),
        swipeColor: "bg-blue-500",
      },
      {
        label: employee.ativo ? "Inativar" : "Reativar",
        icon: employee.ativo ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />,
        onClick: () => onToggleStatus(employee),
        disabled: isCurrentUser,
        swipeColor: employee.ativo ? "bg-amber-500" : "bg-emerald-500",
      },
      {
        label: "Remover",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: () => onDelete(employee),
        variant: "destructive" as const,
        disabled: isCurrentUser,
        swipeColor: "bg-red-500",
      },
    ];

    if (isCurrentUser) {
      // Allow editing self, but hide other dangerous actions
      return actions
        .filter(a => a.label === "Editar")
        .map(a => ({ ...a, label: "Editar (Você)" }));
    }

    return actions;
  };

  return (
    <ResponsiveDataList
      data={employees}
      mobileContainerClassName="space-y-3"
      mobileItemRenderer={(employee, index) => {
        const actions = getActions(employee);

        return (
          <MobileActionItem key={employee.id} actions={actions} showHint={index === 0}>
            <div
              onClick={() => onEdit(employee)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 active:scale-[0.99] transition-transform"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3 pr-20"> {/* Added pr-20 to avoid overlap with absolute badge */}
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm truncate">{employee.nome_completo}</h3>
                    <p className="text-xs text-muted-foreground truncate">{employee.email}</p>
                  </div>
                </div>
                <StatusBadge status={employee.ativo} className="absolute top-4 right-4" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mt-3 pt-3 border-t border-gray-50">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Cargo</p>
                  <p className="font-medium text-gray-700 text-xs">{getPerfilLabel(employee.perfil?.nome)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Cliente Atual</p>
                  <p className="font-medium text-gray-700 text-xs truncate">{employee.cliente?.nome_fantasia || "-"}</p>
                </div>
              </div>
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
                Funcionário
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Cargo
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Cliente Atual
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
            {employees.map((employee) => {
              const actions = getActions(employee);

              return (
                <tr
                  key={employee.id}
                  onClick={() => onEdit(employee)}
                  className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-4 pl-6 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {employee.nome_completo.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm line-clamp-1">{employee.nome_completo}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{employee.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle text-sm text-gray-600">
                    {getPerfilLabel(employee.perfil?.nome)}
                  </td>
                  <td className="px-6 py-4 align-middle text-sm text-gray-600">
                    {employee.cliente?.nome_fantasia || "-"}
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <StatusBadge status={employee.ativo} />
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
