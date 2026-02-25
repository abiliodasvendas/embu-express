import { useQuery, useMutation } from "@tanstack/react-query";
import { Settings, Save, Clock, AlertTriangle, CheckCircle2, Shield } from "lucide-react";
import { apiClient } from "@/services/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ConfigItem {
    chave: string;
    valor: string;
    descricao: string;
}

const CONFIG_METADATA: Record<string, { label: string; icon: any; unit?: string }> = {
    tolerancia_verde_min: { label: "Tolerância Verde", icon: CheckCircle2, unit: "min" },
    tolerancia_amarelo_min: { label: "Tolerância Amarela", icon: Clock, unit: "min" },
    tolerancia_saida_min: { label: "Tolerância de Saída", icon: Clock, unit: "min" },
    limite_he_excessiva_min: { label: "Limite HE Excessiva", icon: AlertTriangle, unit: "min" },
};

export default function Configuracoes() {
    const { data: configs, isLoading, refetch } = useQuery<ConfigItem[]>({
        queryKey: ["configuracoes"],
        queryFn: async () => {
            const { data } = await apiClient.get("/configuracoes");
            return data;
        },
    });

    const mutation = useMutation({
        mutationFn: async ({ chave, valor }: { chave: string; valor: string }) => {
            const { data } = await apiClient.put(`/configuracoes/${chave}`, { valor });
            return data;
        },
        onSuccess: () => {
            toast.success("Configuração atualizada com sucesso!");
            refetch();
        },
        onError: (error: any) => {
            const message = error.response?.data?.error || "Erro ao atualizar configuração";
            toast.error(message);
        },
    });

    if (isLoading) {
        return (
            <div className="p-4 sm:p-8 space-y-6">
                <div className="flex items-center gap-3 mb-8">
                    <Settings className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-slate-800">Configurações do Sistema</h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-48 w-full rounded-3xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <Settings className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Configurações do Sistema</h1>
                        <p className="text-slate-500 mt-1">Gerencie os parâmetros globais de tolerância e regras de negócio</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
                    <Shield className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Acesso Restrito</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {configs?.map((config) => (
                    <ConfigCard
                        key={config.chave}
                        config={config}
                        onSave={(valor) => mutation.mutate({ chave: config.chave, valor })}
                        isSaving={mutation.isPending && mutation.variables?.chave === config.chave}
                    />
                ))}
            </div>
        </div>
    );
}

function ConfigCard({ config, onSave, isSaving }: {
    config: ConfigItem;
    onSave: (valor: string) => void;
    isSaving: boolean;
}) {
    const [value, setValue] = useState(config.valor);
    const metadata = CONFIG_METADATA[config.chave] || { label: config.chave, icon: Settings };
    const Icon = metadata.icon;

    useEffect(() => {
        setValue(config.valor);
    }, [config.valor]);

    const hasChanged = value !== config.valor;

    return (
        <Card className="rounded-3xl border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                        <Icon className="h-5 w-5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-800">{metadata.label}</CardTitle>
                </div>
                <CardDescription className="text-slate-500 line-clamp-2 min-h-[40px]">
                    {config.descricao}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-gray-700 font-bold ml-1 text-sm opacity-70">Valor Atual</Label>
                    <div className="relative">
                        <Input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-xl pr-12 h-12 text-lg font-medium"
                        />
                        {metadata.unit && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm uppercase tracking-wider select-none">
                                {metadata.unit}
                            </div>
                        )}
                    </div>
                </div>

                <Button
                    className={`w-full h-12 rounded-xl font-bold transition-all ${hasChanged
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed hover:bg-slate-100'
                        }`}
                    onClick={() => hasChanged && onSave(value)}
                    disabled={!hasChanged || isSaving}
                >
                    {isSaving ? (
                        <div className="flex items-center gap-2">
                            <Clock className="animate-spin h-4 w-4" />
                            <span>Salvando...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            <span>{hasChanged ? 'Salvar Alteração' : 'Sem Alterações'}</span>
                        </div>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
