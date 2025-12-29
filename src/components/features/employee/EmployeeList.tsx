import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useEmployeeActions } from "@/hooks/business/useEmployeeActions";
import { Usuario } from "@/types/database";
import { getPerfilLabel } from "@/utils/formatters";

interface EmployeeListProps {
  employees: Usuario[];
  onEdit: (employee: Usuario) => void;
  onToggleStatus: (employee: Usuario) => void;
  onDelete: (employee: Usuario) => void;
}

const getAvatarStyles = (isActive: boolean) => {
  if (isActive) {
    return "bg-green-100 text-green-700";
  }
  return "bg-gray-100 text-gray-500";
};

const EmployeeMobileItem = ({
  employee,
  index,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  employee: Usuario;
  index: number;
  onEdit: (employee: Usuario) => void;
  onToggleStatus: (employee: Usuario) => void;
  onDelete: (employee: Usuario) => void;
}) => {
  const actions = useEmployeeActions({ employee, onEdit, onToggleStatus, onDelete });

  return (
    <MobileActionItem actions={actions} showHint={index === 0}>
      <div
        onClick={() => onEdit(employee)}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 active:scale-[0.99] transition-transform"
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-3 pr-20">
            {/* Added pr-20 to avoid overlap with absolute badge */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarStyles(employee.ativo)}`}>
              {employee.nome_completo.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-sm truncate">
                {employee.nome_completo}
              </h3>
               {employee.cliente?.nome_fantasia && (
                <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{employee.cliente.nome_fantasia}</p>
               )}
            </div>
          </div>
          <StatusBadge status={employee.ativo} className="absolute top-4 right-4" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm mt-3 pt-3 border-t border-gray-50">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
              Cargo
            </p>
            <p className="font-medium text-gray-700 text-xs text-left">
              {getPerfilLabel(employee.perfil?.nome)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
              Turnos
            </p>
             <div className="flex flex-wrap gap-1 mt-0.5">
                {employee.turnos?.map((t, i) => (
                    <span key={i} className="text-[10px] font-medium text-gray-500 bg-gray-100/50 px-1.5 py-0.5 rounded border border-gray-200/50">
                        {t.hora_inicio.substring(0, 5)} - {t.hora_fim.substring(0, 5)}
                    </span>
                ))}
                {!employee.turnos?.length && <span className="text-[10px] text-gray-400">Sem turno</span>}
              </div>
          </div>
        </div>
      </div>
    </MobileActionItem>
  );
};

const EmployeeTableRow = ({
  employee,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  employee: Usuario;
  onEdit: (employee: Usuario) => void;
  onToggleStatus: (employee: Usuario) => void;
  onDelete: (employee: Usuario) => void;
}) => {
  const actions = useEmployeeActions({ employee, onEdit, onToggleStatus, onDelete });

  const renderTurnos = (turnos: any[]) => {
    if (!turnos || turnos.length === 0) return <span className="text-gray-400">-</span>;
    return (
        <div className="flex flex-col gap-1">
            {turnos.map((t, i) => (
                <div key={i} className="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 w-fit whitespace-nowrap">
                    {t.hora_inicio.substring(0, 5)} - {t.hora_fim.substring(0, 5)}
                </div>
            ))}
        </div>
    );
  };

  return (
    <tr
      onClick={() => onEdit(employee)}
      className="hover:bg-gray-50/80 transition-colors cursor-pointer"
    >
      <td className="py-4 pl-6 align-middle">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${getAvatarStyles(employee.ativo)}`}>
            {employee.nome_completo.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm line-clamp-1">
              {employee.nome_completo}
            </p>
             {employee.cliente?.nome_fantasia && (
                <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{employee.cliente.nome_fantasia}</p>
             )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 align-middle text-sm text-gray-600">
        {getPerfilLabel(employee.perfil?.nome)}
      </td>
      {/* Client Column Removed */}
      <td className="px-6 py-4 align-middle">
        {renderTurnos(employee.turnos)}
      </td>
      <td className="px-6 py-4 align-middle">
        <StatusBadge status={employee.ativo} />
      </td>
      <td className="px-6 py-4 text-right align-middle" onClick={(e) => e.stopPropagation()}>
        <ActionsDropdown actions={actions} />
      </td>
    </tr>
  );
};

export function EmployeeList({
  employees,
  onEdit,
  onToggleStatus,
  onDelete,
}: EmployeeListProps) {
  return (
    <ResponsiveDataList
      data={employees}
      mobileContainerClassName="space-y-3"
      mobileItemRenderer={(employee, index) => (
        <EmployeeMobileItem
          key={employee.id}
          employee={employee}
          index={index}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      )}
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
              {/* Client Column Removed */}
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Turnos
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
            {employees.map((employee) => (
              <EmployeeTableRow
                key={employee.id}
                employee={employee}
                onEdit={onEdit}
                onToggleStatus={onToggleStatus}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </ResponsiveDataList>
  );
}
