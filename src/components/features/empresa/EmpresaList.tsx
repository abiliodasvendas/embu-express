import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useEmpresaActions } from "@/hooks/business/useEmpresaActions";
import { ActionItem } from "@/types/actions";
import { Empresa } from "@/types/database";
import { cnpjMask } from "@/utils/masks";

interface EmpresaListProps {
  empresas: Empresa[];
  onEdit: (empresa: Empresa) => void;
  onToggleStatus: (empresa: Empresa) => void;
  onDelete: (empresa: Empresa) => void;
}

const EmpresaMobileItem = ({
  empresa,
  index,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  empresa: Empresa;
  index: number;
  onEdit: (empresa: Empresa) => void;
  onToggleStatus: (empresa: Empresa) => void;
  onDelete: (empresa: Empresa) => void;
}) => {
  const actions = useEmpresaActions({ empresa, onEdit, onToggleStatus, onDelete });

  return (
    <MobileActionItem actions={actions as ActionItem[]} showHint={index === 0}>
      <div
        onClick={() => onEdit(empresa)}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 active:scale-[0.99] transition-transform"
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-3 pr-20">

            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-sm truncate">
                {empresa.nome_fantasia}
              </h3>
              {empresa.razao_social && (
                <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{empresa.razao_social}</p>
              )}
            </div>
          </div>
          <StatusBadge status={empresa.ativo} className="absolute top-4 right-4" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm mt-3 pt-3 border-t border-gray-50">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
              CNPJ
            </p>
            <p className="font-medium text-gray-700 text-xs text-left">
              {empresa.cnpj ? cnpjMask(empresa.cnpj) : "-"}
            </p>
          </div>
        </div>
      </div>
    </MobileActionItem>
  );
};

const EmpresaTableRow = ({
  empresa,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  empresa: Empresa;
  onEdit: (empresa: Empresa) => void;
  onToggleStatus: (empresa: Empresa) => void;
  onDelete: (empresa: Empresa) => void;
}) => {
  const actions = useEmpresaActions({ empresa, onEdit, onToggleStatus, onDelete });

  return (
    <tr
      onClick={() => onEdit(empresa)}
      className="hover:bg-gray-50/80 transition-colors cursor-pointer"
    >
      <td className="py-4 pl-6 align-middle">
        <div className="flex items-center gap-3">

          <div>
            <p className="font-bold text-gray-900 text-sm line-clamp-1">
              {empresa.nome_fantasia}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 align-middle text-sm text-gray-600">
        {empresa.cnpj ? cnpjMask(empresa.cnpj) : "-"}
      </td>
      <td className="px-6 py-4 align-middle text-sm text-gray-600">
        {empresa.razao_social || "-"}
      </td>
      <td className="px-6 py-4 align-middle">
        <StatusBadge status={empresa.ativo} />
      </td>
      <td className="px-6 py-4 text-right align-middle" onClick={(e) => e.stopPropagation()}>
        <ActionsDropdown actions={actions} />
      </td>
    </tr>
  );
};

export function EmpresaList({
  empresas,
  onEdit,
  onToggleStatus,
  onDelete,
}: EmpresaListProps) {
  return (
    <ResponsiveDataList
      data={empresas}
      mobileContainerClassName="space-y-3"
      mobileItemRenderer={(empresa, index) => (
        <EmpresaMobileItem
          key={empresa.id}
          empresa={empresa}
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
            {empresas.map((empresa) => (
              <EmpresaTableRow
                key={empresa.id}
                empresa={empresa}
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
