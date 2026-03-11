import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { messages } from "@/constants/messages";
import { useDeleteFeriado, useFeriados, useLayout } from "@/hooks";
import { ActionItem } from "@/types/actions";
import { Feriado } from "@/types/database";
import { anos } from "@/utils/formatters/constants";
import { Calendar, Edit2, Plus, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

// --- Local Components for Pattern Consistency ---

const FeriadoMobileItem = ({
    feriado,
    index,
    onEdit,
    onDelete,
}: {
    feriado: Feriado;
    index: number;
    onEdit: (f: Feriado) => void;
    onDelete: (id: number, desc: string) => void;
}) => {
    const actions: ActionItem[] = [
        {
            label: "Editar",
            icon: <Edit2 className="w-4 h-4" />,
            onClick: () => onEdit(feriado),
        },
        {
            label: "Excluir",
            icon: <Trash2 className="w-4 h-4" />,
            onClick: () => onDelete(feriado.id, feriado.descricao),
            isDestructive: true,
            variant: "destructive",
        },
    ];

    return (
        <MobileActionItem actions={actions} showHint={index === 0}>
            <div
                onClick={() => onEdit(feriado)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 active:scale-[0.99] transition-transform"
            >
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 text-sm line-clamp-1 leading-tight">
                            {feriado.descricao}
                        </h3>
                        <p className="text-xs text-blue-600 font-medium mt-1">
                            {new Date(feriado.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </p>
                    </div>
                </div>
            </div>
        </MobileActionItem>
    );
};

const FeriadoTableRow = ({
    feriado,
    onEdit,
    onDelete,
}: {
    feriado: Feriado;
    onEdit: (f: Feriado) => void;
    onDelete: (id: number, desc: string) => void;
}) => {
    const actions: ActionItem[] = [
        {
            label: "Editar",
            icon: <Edit2 className="w-4 h-4" />,
            onClick: () => onEdit(feriado),
        },
        {
            label: "Excluir",
            icon: <Trash2 className="w-4 h-4" />,
            onClick: () => onDelete(feriado.id, feriado.descricao),
            isDestructive: true,
            variant: "destructive",
        },
    ];

    return (
        <tr
            onClick={() => onEdit(feriado)}
            className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
        >
            <td className="py-4 pl-6 align-middle">
                <p className="font-medium text-blue-600 text-sm">
                    {new Date(feriado.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </p>
            </td>
            <td className="px-6 py-4 align-middle text-sm text-gray-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]">
                {feriado.descricao}
            </td>
            <td className="px-6 py-4 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                <ActionsDropdown actions={actions} />
            </td>
        </tr>
    );
};

export default function Feriados() {
    const { setPageTitle, openConfirmationDialog, closeConfirmationDialog, openFeriadoFormDialog } = useLayout();
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [searchTerm, setSearchTerm] = useState("");

    const { data: feriados = [], isLoading, refetch } = useFeriados(parseInt(selectedYear));
    const deleteFeriado = useDeleteFeriado();

    useEffect(() => {
        setPageTitle("Gestão de Feriados");
    }, [setPageTitle]);

    const pullToRefreshReload = useCallback(async () => {
        await refetch();
    }, [refetch]);

    const handleEdit = (feriado: Feriado) => {
        openFeriadoFormDialog({ feriadoToEdit: feriado });
    };

    const handleAdd = () => {
        openFeriadoFormDialog({});
    };

    const handleDelete = (id: number, desc: string) => {
        openConfirmationDialog({
            title: messages.dialogo.remover.titulo,
            description: `Deseja remover o feriado "${desc}"? Esta ação não pode ser desfeita.`,
            confirmText: "Sim, remover",
            variant: "destructive",
            onConfirm: async () => {
                await deleteFeriado.mutateAsync(id);
                closeConfirmationDialog();
            },
        });
    };

    const filteredFeriados = useMemo(() => {
        if (!searchTerm) return feriados;
        const term = searchTerm.toLowerCase();
        return feriados.filter(f => 
            f.descricao.toLowerCase().includes(term) ||
            new Date(f.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' }).includes(term)
        );
    }, [feriados, searchTerm]);


    const isActionLoading = deleteFeriado.isPending;

    return (
        <>
            <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
                <div className="space-y-6">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardContent className="px-0">
                            {/* Toolbar - Standard Design */}
                            <div className="flex flex-col md:flex-row items-center gap-3 mb-6">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Buscar por data ou descrição..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 bg-white border-gray-100 focus-visible:ring-blue-500/20 h-11 rounded-xl shadow-none font-medium"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                                        <SelectTrigger className="h-11 w-full md:w-[130px] rounded-xl bg-white border-gray-100 font-medium">
                                            <SelectValue placeholder="Ano" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-gray-100">
                                            {anos.map(a => (
                                                <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        onClick={handleAdd}
                                        className="bg-blue-600 hover:bg-blue-700 h-11 rounded-xl gap-2 shadow-sm font-bold text-white transition-all active:scale-95 whitespace-nowrap flex-1 md:flex-initial"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span>Novo Feriado</span>
                                    </Button>
                                </div>
                            </div>

                            {isLoading ? (
                                <ListSkeleton />
                            ) : filteredFeriados.length > 0 ? (
                                <ResponsiveDataList
                                    data={filteredFeriados}
                                    mobileContainerClassName="space-y-3"
                                    mobileItemRenderer={(feriado, index) => (
                                        <FeriadoMobileItem
                                            key={feriado.id}
                                            feriado={feriado}
                                            index={index}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                        />
                                    )}
                                >
                                    <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                                        <table className="w-full">
                                            <thead className="bg-gray-50/50">
                                                <tr className="border-b border-gray-100 text-left">
                                                    <th className="py-4 pl-6 text-xs font-bold text-gray-400 uppercase tracking-wider w-[150px]">
                                                        Data
                                                    </th>
                                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                        Descrição
                                                    </th>
                                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider w-[100px]">
                                                        Ações
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {filteredFeriados.map((feriado) => (
                                                    <FeriadoTableRow
                                                        key={feriado.id}
                                                        feriado={feriado}
                                                        onEdit={handleEdit}
                                                        onDelete={handleDelete}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </ResponsiveDataList>
                            ) : (
                                <UnifiedEmptyState
                                    icon={Calendar}
                                    title="Nenhum feriado encontrado"
                                    description={
                                        searchTerm
                                            ? "Não encontramos nenhum feriado com os filtros atuais."
                                            : `Não há feriados cadastrados para o ano de ${selectedYear}.`
                                    }
                                    action={!searchTerm ? { label: "Cadastrar Feriado", onClick: handleAdd } : undefined}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </PullToRefreshWrapper>

            <LoadingOverlay active={isActionLoading} text="Processando..." />
        </>
    );
}
