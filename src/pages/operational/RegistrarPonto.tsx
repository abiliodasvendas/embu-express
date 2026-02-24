import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useLayout } from "@/contexts/LayoutContext";
import { useFinalizarPausa, useIniciarPausa, useTogglePonto } from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useGeolocation } from "@/hooks/ui/useGeolocation";
import { apiClient } from "@/services/api/client";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Pause, Play, RefreshCw, ShieldAlert, Square, Settings, Briefcase } from "lucide-react";
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';
import { useEffect, useState } from "react";

type PontoAction = 'idle' | 'working' | 'paused';

export default function RegistrarPonto() {
    const { setPageTitle } = useLayout();
    const { user } = useSession();
    const { profile: userProfile } = useProfile(user?.id);
    const { location, requestLocation, loading: loadingGeo, error: geoError, permissionDenied, isWeb } = useGeolocation();

    const { mutateAsync: togglePonto } = useTogglePonto();
    const { mutateAsync: iniciarPausa } = useIniciarPausa();
    const { mutateAsync: finalizarPausa } = useFinalizarPausa();

    const [status, setStatus] = useState<PontoAction>("idle");
    const [selectedLinkId, setSelectedLinkId] = useState<string>("");
    const [activeShift, setActiveShift] = useState<{
        nome: string;
        horario?: string;
        empresa?: string;
    } | null>(null);
    const [timer, setTimer] = useState<string>("00:00:00");

    const hasShifts = !!userProfile?.links?.length;

    useEffect(() => {
        setPageTitle("Registrar Ponto");
        // Auto-request location on mount for better UX
        requestLocation().catch(() => { });
    }, [setPageTitle, requestLocation]);

    // Fetch Status from Backend
    const { data: pontoHoje, refetch } = useQuery({
        queryKey: ['ponto-hoje-smart', user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const res = await apiClient.get('/pontos/hoje', {
                params: { usuarioId: user.id }
            });
            return res.data;
        },
        enabled: !!user?.id,
        refetchInterval: 60 * 1000
    });

    useEffect(() => {
        const calculateActiveShift = (pontoId?: number, clienteIdFromPonto?: number) => {
            // Se já tem ponto batido hoje, fixa o turno do ponto
            if (clienteIdFromPonto) {
                const matchedLink = userProfile?.links?.find((l: any) => l.cliente_id === clienteIdFromPonto);
                if (matchedLink) {
                    return {
                        id: matchedLink.id.toString(),
                        nome: matchedLink.cliente?.nome_fantasia || "Turno Atual",
                        horario: matchedLink.hora_inicio && matchedLink.hora_fim ?
                            `${matchedLink.hora_inicio.slice(0, 5)} - ${matchedLink.hora_fim.slice(0, 5)}` : undefined,
                        empresa: matchedLink.empresa?.nome_fantasia
                    };
                }
            }

            // Se for IDLE e já tiver link selecionado pelo usuario, não sobrescreve
            if (!pontoId && selectedLinkId) {
                const currentSelection = userProfile?.links?.find((l: any) => l.id.toString() === selectedLinkId);
                if (currentSelection) {
                    return {
                        id: currentSelection.id.toString(),
                        nome: currentSelection.cliente?.nome_fantasia || "Turno Selecionado",
                        horario: currentSelection.hora_inicio && currentSelection.hora_fim ?
                            `${currentSelection.hora_inicio.slice(0, 5)} - ${currentSelection.hora_fim.slice(0, 5)}` : undefined,
                        empresa: currentSelection.empresa?.nome_fantasia
                    };
                }
            }

            // Priority 2: Use first available link if idle and nothing selected
            const firstLink = userProfile?.links?.[0];
            if (firstLink) {
                return {
                    id: firstLink.id.toString(),
                    nome: firstLink.cliente?.nome_fantasia || "Próximo Turno",
                    horario: firstLink.hora_inicio && firstLink.hora_fim ?
                        `${firstLink.hora_inicio.slice(0, 5)} - ${firstLink.hora_fim.slice(0, 5)}` : undefined,
                    empresa: firstLink.empresa?.nome_fantasia
                };
            }

            return null;
        };

        if (!pontoHoje || !pontoHoje.id) {
            setStatus("idle");
            setTimer("00:00:00");
            const shift = calculateActiveShift();
            setActiveShift(shift);
            if (shift?.id && !selectedLinkId) setSelectedLinkId(shift.id);
            return;
        }

        if (pontoHoje.saida_hora) {
            setStatus("idle");
            const shift = calculateActiveShift();
            setActiveShift(shift);
            if (shift?.id && !selectedLinkId) setSelectedLinkId(shift.id);
        } else {
            const openPause = pontoHoje.pausas?.find((p: any) => !p.fim_hora);

            if (openPause) {
                setStatus("paused");
                setTimer("EM PAUSA");
            } else {
                setStatus("working");

                const entradaIso = pontoHoje.entrada_hora;
                const start = entradaIso ? new Date(entradaIso).getTime() : 0;

                if (!start || isNaN(start)) {
                    setTimer("00:00:00");
                } else {
                    const interval = setInterval(() => {
                        const now = new Date().getTime();
                        const diff = now - start;
                        if (diff < 0) {
                            setTimer("00:00:00");
                            return;
                        }
                        const h = Math.floor(diff / (1000 * 60 * 60));
                        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                        const s = Math.floor((diff % (1000 * 60)) / 1000);
                        setTimer(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
                    }, 1000);
                    return () => clearInterval(interval);
                }
            }

            const shift = calculateActiveShift(pontoHoje.id, pontoHoje.cliente_id);
            setActiveShift(shift);
            if (shift?.id) setSelectedLinkId(shift.id);
        }
    }, [pontoHoje, userProfile, selectedLinkId]);

    const handleToggle = async () => {
        const loc = await requestLocation();
        if (!loc) return;

        let cliente_id = undefined;
        let empresa_id = undefined;

        if (selectedLinkId && userProfile?.links) {
            const link = userProfile.links.find((l: any) => l.id.toString() === selectedLinkId);
            if (link) {
                cliente_id = link.cliente_id;
                empresa_id = link.empresa_id;
            }
        }

        try {
            await togglePonto({
                usuario_id: user?.id,
                location: loc,
                cliente_id,
                empresa_id
            });
            refetch();
        } catch (error) {
            console.error(error);
        }
    };

    const handlePauseStart = async () => {
        if (!pontoHoje) return;
        const loc = await requestLocation();
        if (!loc) return;
        try {
            await iniciarPausa({
                pontoId: pontoHoje.id,
                data: { inicio_loc: loc }
            });
            refetch();
        } catch (error) {
            console.error(error);
        }
    };

    const handlePauseEnd = async () => {
        if (!pontoHoje) return;
        const openPause = pontoHoje.pausas?.find((p: any) => !p.fim_hora);
        if (!openPause) return;
        const loc = await requestLocation();
        if (!loc) return;
        try {
            await finalizarPausa({
                pausaId: openPause.id,
                data: { fim_loc: loc }
            });
            refetch();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="w-full max-w-lg lg:max-w-4xl mx-auto pb-20 mt-4 md:mt-8">
            {/* Geolocation Alert - Always Visible if Error */}
            {(geoError || (!location && !loadingGeo)) && (
                <div className="mb-6">
                    <Alert variant="destructive" className="rounded-2xl border border-red-200 shadow-sm bg-red-50 text-red-900 animate-in fade-in slide-in-from-top-4 duration-500 mb-2">
                        <ShieldAlert className="h-5 w-5 text-red-600" />
                        <AlertTitle className="font-bold">Localização Requerida</AlertTitle>
                        <AlertDescription className="text-red-700 font-medium">
                            {geoError ? (permissionDenied ? "A permissão de localização foi negada no seu aparelho." : "O sinal de GPS está indisponível.") : "Aguardando sinal de GPS para liberar o registro."}

                            {permissionDenied ? (
                                isWeb ? (
                                    <p className="mt-4 text-sm font-semibold text-red-800 text-balance leading-relaxed">
                                        Pelo navegador, não é possível reabrir a solicitação de GPS automaticamente. Clique no ícone de <strong className="mx-1 text-red-900 border border-red-200 bg-red-100 rounded px-1 py-0.5">Cadeado</strong> ou <strong className="mx-1 text-red-900 border border-red-200 bg-red-100 rounded px-1 py-0.5">Ajustes</strong> ao lado da barra de endereço e reative a localização.
                                    </p>
                                ) : (
                                    <button
                                        onClick={() => NativeSettings.open({
                                            optionAndroid: AndroidSettings.ApplicationDetails,
                                            optionIOS: IOSSettings.App
                                        })}
                                        className="mt-3 bg-red-100 px-4 py-2 rounded-xl text-red-900 font-bold hover:bg-red-200 transition-colors flex items-center w-full justify-center"
                                    >
                                        <Settings className="w-4 h-4 mr-2" /> Abrir Config. do Aparelho
                                    </button>
                                )
                            ) : (
                                <button
                                    onClick={() => requestLocation()}
                                    className="block mt-2 text-red-900 font-bold underline hover:text-red-700 transition-colors flex items-center"
                                >
                                    <RefreshCw className="w-3 h-3 mr-1" /> Tentar Novamente
                                </button>
                            )}
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            {!hasShifts ? (
                /* MISSING SHIFT PROMINENT ALERT - Centered on standalone */
                <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-amber-200 p-6 sm:p-12 text-center flex flex-col items-center animate-in zoom-in-95 duration-500 min-h-[400px] justify-center">
                    <div className="bg-amber-50 p-6 rounded-3xl mb-6 sm:mb-8 border border-amber-100">
                        <ShieldAlert className="w-16 h-16 sm:w-20 sm:h-20 text-amber-500" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-4 sm:mb-6 tracking-tight">Turnos não configurados</h2>
                    <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
                        Identificamos que seu cadastro ainda não possui vínculos de turno registrados no sistema.
                    </p>
                    <div className="w-full p-5 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 text-sm sm:text-base font-medium">
                        Por favor, solicite ao administrador que vincule sua conta a um cliente para liberar o registro de ponto.
                    </div>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Esquerda: Status */}
                    <div className="flex-1 flex flex-col">
                        {/* Header / Status Card - Clean Corporate Style */}
                        <Card className={`border shadow-sm rounded-3xl overflow-hidden relative transition-all duration-500 h-full min-h-[300px] flex flex-col justify-center ${status === 'working' ? 'bg-white border-blue-100' :
                                status === 'paused' ? 'bg-amber-50 border-amber-200' :
                                    'bg-slate-50 border-slate-200'
                            }`}>
                            <CardContent className="p-8 sm:p-10 relative z-10 flex flex-col items-center justify-center text-center">
                                <span className={`text-sm font-bold uppercase tracking-[0.2em] mb-4 ${status === 'working' ? 'text-blue-500' :
                                        status === 'paused' ? 'text-amber-600' :
                                            'text-slate-400'
                                    }`}>
                                    Status Atual
                                </span>
                                <h2 className={`text-2xl font-black mb-2 tracking-tight ${status === 'working' ? 'text-slate-800' :
                                        status === 'paused' ? 'text-amber-900' :
                                            'text-slate-700'
                                    }`}>
                                    {status === 'idle' && "AGUARDANDO INÍCIO"}
                                    {status === 'working' && "EM SERVIÇO"}
                                    {status === 'paused' && "EM PAUSA"}
                                </h2>
                                <div className={`text-5xl md:text-6xl font-mono font-bold mt-4 tabular-nums tracking-tighter ${status === 'working' ? 'text-blue-600' :
                                        status === 'paused' ? 'text-amber-700' :
                                            'text-slate-800'
                                    }`}>
                                    {timer}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Direita: Ações e Informações */}
                    <div className="w-full lg:w-[400px] flex flex-col gap-6 shrink-0">
                        {/* Area de Selecao de Turno - Somente Visivel no IDLE */}
                        {status === 'idle' && hasShifts && (
                            <Card className="rounded-3xl shadow-sm border-slate-200 overflow-visible bg-white">
                                <CardContent className="p-6">
                                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest block mb-3">Selecione o Turno</label>
                                    <Select
                                        value={selectedLinkId}
                                        onValueChange={setSelectedLinkId}
                                        disabled={loadingGeo || !location}
                                    >
                                        <SelectTrigger className="w-full h-14 rounded-xl bg-slate-50 border-slate-200 text-slate-800 font-semibold focus:ring-blue-500/20 text-base">
                                            <SelectValue placeholder="Escolha a empresa e horário..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                            {userProfile?.links?.map((link: any) => (
                                                <SelectItem
                                                    key={link.id}
                                                    value={link.id.toString()}
                                                    className="rounded-lg cursor-pointer focus:bg-slate-100 py-3"
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-800">{link.cliente?.nome_fantasia || "Cliente Não Informado"}</span>
                                                        <span className="text-sm text-slate-500 mt-0.5">
                                                            <Briefcase className="w-3 h-3 inline mr-1 opacity-70" />
                                                            {link.hora_inicio?.slice(0, 5)} - {link.hora_fim?.slice(0, 5)}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>
                        )}

                        {/* Info Cards - Visible on Working/Paused */}
                        {status !== 'idle' && hasShifts && (
                            <Card className="rounded-3xl shadow-sm border-slate-200 overflow-hidden bg-white">
                                <CardContent className="p-6">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Turno em Andamento</span>
                                    {activeShift?.horario ? (
                                        <p className="text-2xl font-black text-blue-600 leading-tight">{activeShift.horario}</p>
                                    ) : (
                                        <p className="text-2xl font-black text-slate-800 leading-tight">--</p>
                                    )}
                                    <p className="text-base font-bold text-slate-500 mt-1 truncate">
                                        {activeShift?.nome}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Action Buttons */}
                        {hasShifts && (
                            <div className="grid grid-cols-1 gap-4">
                                {status === 'idle' && (
                                    <Button
                                        onClick={handleToggle}
                                        disabled={loadingGeo || !location || !selectedLinkId}
                                        className="h-20 text-xl font-bold rounded-2xl shadow-md bg-blue-600 text-white hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:scale-100"
                                    >
                                        {loadingGeo ? <MapPin className="animate-pulse w-6 h-6 mr-3" /> : <Play className="w-6 h-6 mr-3" />}
                                        {loadingGeo ? "LOCALIZANDO..." : "INICIAR EXPEDIENTE"}
                                    </Button>
                                )}

                                {status === 'working' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            variant="outline"
                                            onClick={handlePauseStart}
                                            disabled={loadingGeo || !location}
                                            className="h-20 text-lg font-bold rounded-2xl border-2 border-amber-500 text-amber-600 hover:bg-amber-50 shadow-sm disabled:opacity-50 transition-all active:scale-[0.98]"
                                        >
                                            <Pause className="w-5 h-5 mr-2" />
                                            PAUSA
                                        </Button>
                                        <Button
                                            onClick={handleToggle}
                                            disabled={loadingGeo || !location}
                                            className="h-20 text-lg font-bold rounded-2xl shadow-md bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-50 transition-all active:scale-[0.98]"
                                        >
                                            {loadingGeo ? <MapPin className="animate-pulse w-5 h-5 mr-2" /> : <Square className="w-5 h-5 mr-2 text-red-500" />}
                                            ENCERRAR
                                        </Button>
                                    </div>
                                )}

                                {status === 'paused' && (
                                    <Button
                                        onClick={handlePauseEnd}
                                        disabled={loadingGeo || !location}
                                        className="h-20 text-xl font-bold rounded-2xl shadow-md bg-amber-500 text-white hover:bg-amber-600 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {loadingGeo ? <MapPin className="animate-pulse w-6 h-6 mr-3" /> : <Play className="w-6 h-6 mr-3" />}
                                        {loadingGeo ? "LOCALIZANDO..." : "RETOMAR TRABALHO"}
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Always visible info - Small block */}
                        <div className="flex items-center justify-center text-slate-500 text-sm font-medium mt-2 bg-slate-100/50 py-3 rounded-2xl border border-slate-200">
                            <MapPin className={`w-4 h-4 mr-2 flex-shrink-0 ${location ? 'text-emerald-500' : 'text-slate-300'}`} />
                            <span className="truncate">Localização: {loadingGeo ? "Obtendo..." : location ? "Ativa e Monitorada" : "Indisponível"}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
