import { useQuery, useMutation } from "@tanstack/react-query";
import { Settings, Save, Clock, AlertTriangle, CheckCircle2, Shield, CircleDollarSign } from "lucide-react";
import { apiClient } from "@/services/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ToleranceTimeline } from "@/components/admin/ToleranceTimeline";

interface ConfigItem {
    chave: string;
    valor: string;
    descricao: string;
}

const CONFIG_METADATA: Record<string, { label: string; icon: any; unit?: string; description: string; example: string }> = {
    tolerancia_verde_min: {
        label: "Tolerância Ideal (Verde)",
        icon: CheckCircle2,
        unit: "min",
        description: "Tempo máximo de atraso permitido para que a entrada ainda seja considerada pontual no painel.",
        example: "Ex: Se definido como 5 min, entrar às 08:05 em um turno das 08:00 ainda manterá o status Verde."
    },
    tolerancia_amarelo_min: {
        label: "Alerta de Atraso (Amarelo)",
        icon: Clock,
        unit: "min",
        description: "Limite superior para o status de 'Atenção'. Após este tempo, o atraso é considerado crítico (Vermelho).",
        example: "Ex: Se definido como 15 min, entradas de 6 a 15 min de atraso ficam amarelas. Acima disso, vermelhas."
    },
    tolerancia_saida_min: {
        label: "Flexibilidade de Saída",
        icon: Clock,
        unit: "min",
        description: "Janela aceitável para bater o ponto de saída sem gerar alertas de saída antecipada ou atrasada.",
        example: "Ex: Se definido como 10 min, sair 10 min antes ou depois do horário oficial não gera inconsistência."
    },
    limite_he_excessiva_min: {
        label: "Limite de Hora Extra Alerta",
        icon: AlertTriangle,
        unit: "min",
        description: "Define o tempo de jornada excedente que dispara um alerta de segurança/fadiga para a gerência.",
        example: "Ex: Se definido como 120 min, o sistema avisa quando o colaborador trabalhar 2h além do seu horário."
    },
    valor_adicional_feriado: {
        label: "Valor Fixo para Feriado",
        icon: CircleDollarSign,
        unit: "R$",
        description: "Valor adicional pago automaticamente como ocorrência extra quando um ponto é aberto em dia de feriado.",
        example: "Ex: Se definido como 50, o colaborador ganhará R$ 50,00 adicionais no extrato se abrir turno num feriado."
    },
};

export default function Configuracoes() {
    const [draftValues, setDraftValues] = useState<Record<string, string>>({});

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
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

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ToleranceTimeline draftValues={draftValues} />
                
                {configs?.map((config) => (
                    <ConfigCard
                        key={config.chave}
                        config={config}
                        onSave={(valor) => mutation.mutate({ chave: config.chave, valor })}
                        onChangeDraft={(valor) => setDraftValues(prev => ({ ...prev, [config.chave]: valor }))}
                        isSaving={mutation.isPending && mutation.variables?.chave === config.chave}
                    />
                ))}
            </div>
        </div>
    );
}

function ConfigCard({ config, onSave, onChangeDraft, isSaving }: {
    config: ConfigItem;
    onSave: (valor: string) => void;
    onChangeDraft: (valor: string) => void;
    isSaving: boolean;
}) {
    const [value, setValue] = useState(config.valor);
    const metadata = CONFIG_METADATA[config.chave] || { label: config.chave, icon: Settings, description: config.descricao, example: "" };
    const Icon = metadata.icon;

    useEffect(() => {
        setValue(config.valor);
        onChangeDraft(config.valor);
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
                <CardDescription className="text-slate-500 min-h-[40px]">
                    {metadata.description}
                </CardDescription>
                {metadata.example && (
                    <div className="mt-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                        <p className="text-[11px] text-blue-600 font-bold leading-normal italic">
                            {metadata.example}
                        </p>
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-gray-700 font-bold ml-1 text-sm opacity-70">Valor em {metadata.unit === 'R$' ? 'Reais' : 'Minutos'}</Label>
                    <div className="relative">
                        <Input
                            type="number"
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                onChangeDraft(e.target.value);
                            }}
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
