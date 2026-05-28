import { useQuery, useMutation } from "@tanstack/react-query";
import { Settings, Save, Clock, AlertTriangle, CircleDollarSign, MapPin } from "lucide-react";
import { apiClient } from "@/services/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ToleranceTimeline } from "@/components/admin/ToleranceTimeline";
import { MoneyInput } from "@/components/ui/MoneyInput";

interface ConfigItem {
    chave: string;
    valor: string;
    descricao: string;
}

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
            <div className="space-y-6">
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

    const configAmarelo = configs?.find(c => c.chave === "tolerancia_amarelo_min");
    const configHeExcessiva = configs?.find(c => c.chave === "limite_he_excessiva_min");
    const configFeriado = configs?.find(c => c.chave === "valor_adicional_feriado");
    const configGeofencing = configs?.find(c => c.chave === "raio_geofencing_metros");

    return (
        <div className="space-y-6 pb-24 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
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
                {configAmarelo && (
                    <MinutesConfigCard
                        config={configAmarelo}
                        onSave={(valor) => mutation.mutate({ chave: configAmarelo.chave, valor })}
                        onChangeDraft={(valor) => setDraftValues(prev => ({ ...prev, [configAmarelo.chave]: valor }))}
                        isSaving={mutation.isPending && mutation.variables?.chave === configAmarelo.chave}
                        title="Alerta de Atraso (Amarelo)"
                        description="Limite superior para o status de 'Atenção'. Após este tempo, o atraso é considerado crítico (Vermelho)."
                        icon={Clock}
                        example="Ex: Se definido como 15 min, entradas de 6 a 15 min de atraso ficam amarelas. Acima disso, vermelhas."
                    />
                )}

                {configHeExcessiva && (
                    <MinutesConfigCard
                        config={configHeExcessiva}
                        onSave={(valor) => mutation.mutate({ chave: configHeExcessiva.chave, valor })}
                        isSaving={mutation.isPending && mutation.variables?.chave === configHeExcessiva.chave}
                        title="Limite de Hora Extra Alerta"
                        description="Define o tempo de jornada excedente que dispara um alerta de segurança/fadiga para a gerência."
                        icon={AlertTriangle}
                        example="Ex: Se definido como 120 min, o sistema avisa quando o colaborador trabalhar 2h além do seu horário."
                    />
                )}

                {configFeriado && (
                    <MoneyConfigCard
                        config={configFeriado}
                        onSave={(valor) => mutation.mutate({ chave: configFeriado.chave, valor })}
                        isSaving={mutation.isPending && mutation.variables?.chave === configFeriado.chave}
                    />
                )}

                {configGeofencing && (
                    <GeofencingConfigCard
                        config={configGeofencing}
                        onSave={(valor) => mutation.mutate({ chave: configGeofencing.chave, valor })}
                        isSaving={mutation.isPending && mutation.variables?.chave === configGeofencing.chave}
                    />
                )}

                <div className="col-span-1 md:col-span-2 mt-2">
                    <ToleranceTimeline draftValues={draftValues} />
                </div>
            </div>
        </div>
    );
}

interface BaseConfigCardProps {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    example?: string;
    hasChanged: boolean;
    isSaving: boolean;
    onSave: () => void;
    disabled?: boolean;
    unit?: string;
    children: React.ReactNode;
}

function BaseConfigCard({
    title,
    description,
    icon: Icon,
    example,
    hasChanged,
    isSaving,
    onSave,
    disabled = false,
    unit,
    children
}: BaseConfigCardProps) {
    const unitLabel = unit === "R$" ? "Reais" : unit === "m" ? "Metros" : "Minutos";

    return (
        <Card className="rounded-3xl border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                        <Icon className="h-5 w-5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-800">{title}</CardTitle>
                </div>
                <CardDescription className="text-slate-500 min-h-[40px]">
                    {description}
                </CardDescription>
                {example && (
                    <div className="mt-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                        <p className="text-[11px] text-blue-600 font-bold leading-normal italic">
                            {example}
                        </p>
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                        Valor em {unitLabel}
                    </Label>
                    <div className="relative">
                        {children}
                        {unit && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm uppercase tracking-wider select-none">
                                {unit}
                            </div>
                        )}
                    </div>
                </div>

                <Button
                    className={`w-full h-12 rounded-xl font-bold transition-all ${hasChanged && !disabled
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed hover:bg-slate-100'
                        }`}
                    onClick={() => hasChanged && !disabled && onSave()}
                    disabled={!hasChanged || isSaving || disabled}
                >
                    {isSaving ? (
                        <div className="flex items-center gap-2">
                            <Clock className="animate-spin h-4 w-4" />
                            <span>Salvando...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            <span>{hasChanged ? "Salvar Alteração" : "Sem Alterações"}</span>
                        </div>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}

interface MinutesConfigCardProps {
    config: ConfigItem;
    onSave: (value: string) => void;
    onChangeDraft?: (value: string) => void;
    isSaving: boolean;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    example?: string;
}

function MinutesConfigCard({
    config,
    onSave,
    onChangeDraft,
    isSaving,
    title,
    description,
    icon,
    example
}: MinutesConfigCardProps) {
    const [value, setValue] = useState(config.valor);

    useEffect(() => {
        setValue(config.valor);
        if (onChangeDraft) onChangeDraft(config.valor);
    }, [config.valor]);

    const hasChanged = value !== config.valor;

    const handleValueChange = (val: string) => {
        setValue(val);
        if (onChangeDraft) onChangeDraft(val);
    };

    return (
        <BaseConfigCard
            title={title}
            description={description}
            icon={icon}
            example={example}
            hasChanged={hasChanged}
            isSaving={isSaving}
            onSave={() => onSave(value)}
            unit="min"
        >
            <Input
                type="number"
                value={value}
                onChange={(e) => handleValueChange(e.target.value)}
                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-xl pr-12 h-12 text-lg font-medium"
            />
        </BaseConfigCard>
    );
}

interface MoneyConfigCardProps {
    config: ConfigItem;
    onSave: (value: string) => void;
    isSaving: boolean;
}

function MoneyConfigCard({ config, onSave, isSaving }: MoneyConfigCardProps) {
    const [value, setValue] = useState(config.valor);

    useEffect(() => {
        setValue(config.valor);
    }, [config.valor]);

    const hasChanged = value !== config.valor;

    return (
        <BaseConfigCard
            title="Valor Fixo para Feriado"
            description="Valor adicional pago automaticamente como ocorrência extra quando uma atividade é aberta em dia de feriado."
            icon={CircleDollarSign}
            example="Ex: Se definido como 50, o colaborador ganhará R$ 50,00 adicionais no extrato se abrir turno num feriado."
            hasChanged={hasChanged}
            isSaving={isSaving}
            onSave={() => onSave(value)}
            unit="R$"
        >
            <MoneyInput
                value={Number(value || 0)}
                onChange={(val) => setValue(val.toString())}
                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-xl pr-12 h-12 text-lg font-medium"
            />
        </BaseConfigCard>
    );
}

interface GeofencingConfigCardProps {
    config: ConfigItem;
    onSave: (value: string) => void;
    isSaving: boolean;
}

function GeofencingConfigCard({ config, onSave, isSaving }: GeofencingConfigCardProps) {
    const [value, setValue] = useState(config.valor);
    const MIN_RECOMMENDED_METERS = 100;

    useEffect(() => {
        setValue(config.valor);
    }, [config.valor]);

    const hasChanged = value !== config.valor;
    const isBelowMinimum = Number(value || 0) < MIN_RECOMMENDED_METERS;

    return (
        <BaseConfigCard
            title="Distância máxima para registrar atividade"
            description="Distância máxima permitida entre o colaborador e a unidade para o registro de atividade ser autorizado."
            icon={MapPin}
            example="Ex: Se definido como 500, o colaborador deve estar num raio de 500 metros da unidade para conseguir iniciar o turno."
            hasChanged={hasChanged}
            isSaving={isSaving}
            onSave={() => onSave(value)}
            disabled={isBelowMinimum}
            unit="m"
        >
            <Input
                type="number"
                min={MIN_RECOMMENDED_METERS}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-xl pr-12 h-12 text-lg font-medium"
            />
            {isBelowMinimum && (
                <p className="text-[10px] text-red-500 font-bold ml-1 mt-1 italic">
                    Mínimo recomendado: {MIN_RECOMMENDED_METERS}m (para evitar erros de GPS)
                </p>
            )}
        </BaseConfigCard>
    );
}
