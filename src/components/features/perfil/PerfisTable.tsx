import { Perfil } from "@/types/database";
import { format } from "date-fns";
import { Shield, ShieldAlert } from "lucide-react";
import { PROTECTED_ROLES_NAMES } from "@/constants/permissions.enum";
import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { usePerfilActions } from "@/hooks/business/usePerfilActions";

interface PerfisTableProps {
    perfis: Perfil[];
    onEdit: (perfil: Perfil) => void;
    onDelete: (perfil: Perfil) => void;
}

const PerfilMobileItem = ({
    perfil,
    index,
    onEdit,
    onDelete,
}: {
    perfil: Perfil;
    index: number;
    onEdit: (perfil: Perfil) => void;
    onDelete: (perfil: Perfil) => void;
}) => {
    const actions = usePerfilActions({ perfil, onEdit, onDelete });
    const isProtected = PROTECTED_ROLES_NAMES.includes(perfil.nome as any);
    const dataCriacao = perfil.created_at ? format(new Date(perfil.created_at), "dd/MM/yyyy") : "-";

    return (
        <MobileActionItem actions={actions} showHint={index === 0}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 relative">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 pr-10">
                        <div className="flex items-center gap-2">
                            <Shield className={`h-4 w-4 shrink-0 ${isProtected ? 'text-blue-500' : 'text-slate-400'}`} />
                            <p className="font-bold text-gray-900 text-sm truncate uppercase">
                                {perfil.nome}
                            </p>
                            {isProtected && (
                                <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold shrink-0">
                                    SISTEMA
                                </span>
                            )}
                        </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">ID: #{perfil.id}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3 truncate">{perfil.descricao || "Sem descrição"}</p>
                <p className="text-xs text-muted-foreground">Criado em: {dataCriacao}</p>
            </div>
        </MobileActionItem>
    );
};

const PerfilTableRow = ({
    perfil,
    onEdit,
    onDelete,
}: {
    perfil: Perfil;
    onEdit: (perfil: Perfil) => void;
    onDelete: (perfil: Perfil) => void;
}) => {
    const actions = usePerfilActions({ perfil, onEdit, onDelete });
    const isProtected = PROTECTED_ROLES_NAMES.includes(perfil.nome as any);
    const dataCriacao = perfil.created_at ? format(new Date(perfil.created_at), "dd/MM/yyyy") : "-";

    return (
        <tr className="hover:bg-gray-50/80 transition-colors">
            <td className="py-4 pl-6 align-middle font-medium text-slate-500">#{perfil.id}</td>
            <td className="px-6 py-4 align-middle">
                <div className="flex items-center gap-2">
                    <Shield className={`h-4 w-4 ${isProtected ? 'text-blue-500' : 'text-slate-400'}`} />
                    <span className="font-semibold text-slate-700 uppercase">{perfil.nome}</span>
                    {isProtected && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold ml-2">
                            SISTEMA
                        </span>
                    )}
                </div>
            </td>
            <td className="px-6 py-4 align-middle text-sm text-gray-600 hidden md:table-cell">
                {perfil.descricao || "-"}
            </td>
            <td className="px-6 py-4 align-middle text-sm text-gray-600 hidden sm:table-cell">
                {dataCriacao}
            </td>
            <td className="px-6 py-4 text-right align-middle">
                <ActionsDropdown actions={actions} />
            </td>
        </tr>
    );
};

export function PerfisTable({ perfis, onEdit, onDelete }: PerfisTableProps) {
    if (perfis.length === 0) {
        return (
            <div className="h-32 flex flex-col items-center justify-center gap-2 text-slate-500 rounded-md border bg-slate-50/50">
                <ShieldAlert className="h-8 w-8 text-slate-300" />
                <p className="text-sm font-medium">Nenhum perfil encontrado.</p>
            </div>
        );
    }

    return (
        <ResponsiveDataList
            data={perfis}
            mobileContainerClassName="space-y-3"
            mobileItemRenderer={(perfil, index) => (
                <PerfilMobileItem
                    key={perfil.id}
                    perfil={perfil}
                    index={index}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            )}
        >
            <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                <table className="w-full">
                    <thead className="bg-gray-50/50">
                        <tr className="border-b border-gray-100 text-left">
                            <th className="py-4 pl-6 text-xs font-bold text-gray-400 uppercase tracking-wider w-[80px]">
                                ID
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Perfil
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                                Descrição
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                                Criado em
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {perfis.map((perfil) => (
                            <PerfilTableRow
                                key={perfil.id}
                                perfil={perfil}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </ResponsiveDataList>
    );
}
