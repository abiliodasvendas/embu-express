import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useLayout } from "@/contexts/LayoutContext";
import { useFinalizarPausa, useIniciarPausa, useTogglePonto } from "@/hooks";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useGeolocation } from "@/hooks/ui/useGeolocation";
import { apiClient } from "@/services/api/client";
import { useQuery } from "@tanstack/react-query";
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings';
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, MapPin, Pause, Play, RefreshCw, Settings, ShieldAlert, Square } from "lucide-react";
import { useEffect, useState } from "react";

type PontoAction = 'idle' | 'working' | 'paused';

export default function RegistrarPonto() {
    const { setPageTitle, openMileageDialog } = useLayout();
    const { user } = useSession();
    const { profile: userProfile } = useProfile(user?.id);
    const { isMotoboy } = usePermissions();
    const { location, requestLocation, loading: loadingGeo, error: geoError, permissionDenied, isWeb } = useGeolocation();

    const { mutateAsync: togglePonto } = useTogglePonto();
    const { mutateAsync: iniciarPausa } = useIniciarPausa();
    const { mutateAsync: finalizarPausa } = useFinalizarPausa();

    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<PontoAction>("idle");
    const [selectedLinkId, setSelectedLinkId] = useState<string>("");
    const [activeShift, setActiveShift] = useState<{
        nome: string;
        horario?: string;
        empresa?: string;
    } | null>(null);
    const [timer, setTimer] = useState<string>("00:00:00");
    const [pausasMetric, setPausasMetric] = useState<{ count: number; totalMs: number }>({ count: 0, totalMs: 0 });
    const [isRefreshing, setIsRefreshing] = useState(false);

    const hasShifts = !!userProfile?.links?.length;

    useEffect(() => {
        setPageTitle("Registrar Ponto");
        // Auto-request location on mount for better UX
        requestLocation().catch(() => { });
    }, [setPageTitle, requestLocation]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([
                refetch(),
                requestLocation()
            ]);
        } finally {
            setIsRefreshing(false);
        }
    };

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
            // Se já tem ponto batido hoje, fixa o turno do ponto (Type-safe match)
            if (clienteIdFromPonto) {
                const matchedLink = userProfile?.links?.find((l: any) => String(l.cliente_id) === String(clienteIdFromPonto));
                if (matchedLink) {
                    return {
                        id: matchedLink.id.toString(),
                        nome: matchedLink.cliente?.nome_fantasia || "Turno Atual",
                        horario: matchedLink.hora_inicio && matchedLink.hora_fim ?
                            `${matchedLink.hora_inicio.slice(0, 5)} - ${matchedLink.hora_fim.slice(0, 5)}` : undefined,
                        empresa: matchedLink.empresa?.nome_fantasia
                    };
                }

                // Fallback robusto caso linkSumuma mas clienteId exista no ponto
                if (pontoHoje?.cliente) {
                    return {
                        id: pontoId?.toString() || "0",
                        nome: pontoHoje.cliente.nome_fantasia || "Turno Atual",
                        horario: "Horário Indefinido",
                        empresa: "Desconhecida"
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
            return;
        }

        const openPause = pontoHoje.pausas?.find((p: any) => !p.fim_hora);

        const shift = calculateActiveShift(pontoHoje.id, pontoHoje.cliente_id);
        setActiveShift(shift);
        if (shift?.id) setSelectedLinkId(shift.id);

        // Calculate Pause Metrics
        const finishedPausas = pontoHoje.pausas?.filter((p: any) => p.fim_hora) || [];
        const totalPausasMs = finishedPausas.reduce((acc: number, p: any) => {
            const s = new Date(p.inicio_hora).getTime();
            const e = new Date(p.fim_hora).getTime();
            return acc + (e - s);
        }, 0);
        setPausasMetric({
            count: pontoHoje.pausas?.length || 0,
            totalMs: totalPausasMs
        });

        if (openPause) {
            setStatus("paused");

            // Smart Timer for Paused State: Net time accumulated until pause start
            const entradaIso = pontoHoje.entrada_hora;
            const start = entradaIso ? new Date(entradaIso).getTime() : 0;
            const pauseStart = new Date(openPause.inicio_hora).getTime();

            const diff = (pauseStart - start) - totalPausasMs;
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            setTimer(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        } else {
            setStatus("working");

            const entradaIso = pontoHoje.entrada_hora;
            const start = entradaIso ? new Date(entradaIso).getTime() : 0;

            if (!start || isNaN(start)) {
                setTimer("00:00:00");
            } else {
                const interval = setInterval(() => {
                    const now = new Date().getTime();
                    // Smart Timer: (Now - Start) - Finished Pauses
                    const diff = (now - start) - totalPausasMs;

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
    }, [pontoHoje, userProfile, selectedLinkId]);

    const executeToggle = async (loc: any, km?: number) => {
        setIsProcessing(true);
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
                km,
                cliente_id,
                empresa_id
            });
            await refetch();
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleToggle = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        const loc = await requestLocation();
        if (!loc) { setIsProcessing(false); return; }

        if (isMotoboy) {
            const { data } = await apiClient.get(`/pontos/ultimo-km/${user?.id}`);
            const lastKm = data?.km || 0;

            openMileageDialog({
                title: status === 'idle' ? "Início de Turno" : "Fim de Turno",
                description: status === 'idle' ? "Informe o KM inicial da moto para começar." : "Informe o KM final da moto para encerrar.",
                lastKm,
                onConfirm: (km) => executeToggle(loc, km)
            });
            setIsProcessing(false);
            return;
        }

        await executeToggle(loc);
    };

    const executePauseStart = async (loc: any, km?: number) => {
        if (!pontoHoje) return;
        setIsProcessing(true);
        try {
            await iniciarPausa({
                pontoId: pontoHoje.id,
                data: { inicio_loc: loc, inicio_km: km }
            });
            await refetch();
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePauseStart = async () => {
        if (!pontoHoje || isProcessing) return;
        setIsProcessing(true);
        const loc = await requestLocation();
        if (!loc) { setIsProcessing(false); return; }

        if (isMotoboy) {
            const { data } = await apiClient.get(`/pontos/ultimo-km/${user?.id}`);
            const lastKm = data?.km || 0;

            openMileageDialog({
                title: "Início de Pausa",
                description: "Informe o KM da moto ao iniciar a pausa.",
                lastKm,
                onConfirm: (km) => executePauseStart(loc, km)
            });
            setIsProcessing(false);
            return;
        }

        await executePauseStart(loc);
    };

    const executePauseEnd = async (loc: any, km?: number) => {
        const openPause = pontoHoje?.pausas?.find((p: any) => !p.fim_hora);
        if (!openPause) return;
        setIsProcessing(true);
        try {
            await finalizarPausa({
                pausaId: openPause.id,
                data: { fim_loc: loc, fim_km: km }
            });
            await refetch();
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePauseEnd = async () => {
        if (!pontoHoje || isProcessing) return;
        const openPause = pontoHoje.pausas?.find((p: any) => !p.fim_hora);
        if (!openPause) { setIsProcessing(false); return; }
        setIsProcessing(true);
        const loc = await requestLocation();
        if (!loc) { setIsProcessing(false); return; }

        if (isMotoboy) {
            const { data } = await apiClient.get(`/pontos/ultimo-km/${user?.id}`);
            const lastKm = data?.km || 0;

            openMileageDialog({
                title: "Retorno de Pausa",
                description: "Informe o KM da moto ao retomar o trabalho.",
                lastKm,
                onConfirm: (km) => executePauseEnd(loc, km)
            });
            setIsProcessing(false);
            return;
        }

        await executePauseEnd(loc);
    };


    return (
        <div className="w-full max-w-lg lg:max-w-5xl mx-auto pb-20 md:mt-8 relative">
            <LoadingOverlay active={loadingGeo && !isRefreshing} text="Buscando localização..." />

            {/* Pull to Refresh Indicator */}
            <motion.div
                style={{ 
                    position: 'absolute', 
                    top: -40, 
                    left: 0, 
                    right: 0, 
                    display: 'flex', 
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    zIndex: 50
                }}
                animate={{ y: isRefreshing ? 60 : 0 }}
            >
                <div className="bg-white p-2 rounded-full shadow-lg border border-slate-100">
                    <RefreshCw className={`w-5 h-5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                </div>
            </motion.div>

            <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                onDragEnd={(_, info) => {
                    if (info.offset.y > 100) {
                        handleRefresh();
                    }
                }}
                className="w-full"
            >
            {/* Geolocation Alert - Always Visible if Error */}
            <AnimatePresence>
                {(geoError || (!location && !loadingGeo)) && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-6"
                    >
                        <Alert variant="destructive" className="rounded-3xl border-2 border-red-100 shadow-xl shadow-red-500/10 bg-white/80 backdrop-blur-md text-red-900 mb-2 p-6 overflow-hidden relative group">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
                            <ShieldAlert className="h-6 w-6 text-red-600 mb-2" />
                            <AlertTitle className="font-black text-lg">Localização Requerida</AlertTitle>
                            <AlertDescription className="text-red-700 font-medium leading-relaxed">
                                {geoError ? (permissionDenied ? "A permissão de localização foi negada no seu aparelho." : "O sinal de GPS está indisponível ou fraco demais.") : "Aguardando sinal de GPS para liberar o registro seguramente."}

                                {permissionDenied ? (
                                    isWeb ? (
                                        <p className="mt-4 text-sm font-semibold text-red-800 text-balance bg-red-50 p-4 rounded-2xl border border-red-100">
                                            Pelo navegador, não é possível reabrir a solicitação de GPS automaticamente. Clique no ícone de <strong className="mx-1 text-red-900 font-black">Cadeado</strong> ou <strong className="mx-1 text-red-900 font-black">Ajustes</strong> ao lado da barra de endereço e reative a localização.
                                        </p>
                                    ) : (
                                        <button
                                            onClick={() => NativeSettings.open({
                                                optionAndroid: AndroidSettings.ApplicationDetails,
                                                optionIOS: IOSSettings.App
                                            })}
                                            className="mt-6 bg-red-600 px-6 py-4 rounded-2xl text-white font-black hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center w-full justify-center hover:-translate-y-0.5 active:translate-y-0"
                                        >
                                            <Settings className="w-5 h-5 mr-3" /> Abrir Configurações
                                        </button>
                                    )
                                ) : (
                                    <button
                                        onClick={() => requestLocation()}
                                        className="mt-4 bg-white border border-red-200 px-6 py-3 rounded-2xl text-red-900 font-black hover:bg-red-50 transition-all flex items-center w-full justify-center shadow-sm"
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" /> Tentar Novamente
                                    </button>
                                )}
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            {location && (
                <>
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
                                Por favor, solicite ao administrador que inclua o(s) turno(s) de trabalho para liberar o registro de ponto.
                            </div>
                        </div>
                    ) : (
                        <div className={`flex gap-6 ${status === 'idle' ? 'flex-col-reverse sm:flex-row' : 'flex-col sm:flex-row'}`}>
                            {/* Esquerda: Status */}
                            <div className="flex-1 flex flex-col min-w-0">
                                {/* Header / Status Card - Clean Corporate Style */}
                                <Card className={`border shadow-sm rounded-3xl overflow-hidden relative transition-all duration-500 h-full flex flex-col justify-center ${status === 'idle' ? 'min-h-[180px] sm:min-h-[300px]' : 'min-h-[110px] sm:min-h-[300px]'
                                    } ${status === 'working' ? 'bg-white border-blue-100' :
                                        status === 'paused' ? 'bg-amber-50 border-amber-200' :
                                            'bg-slate-50 border-slate-200'
                                    }`}>
                                    <CardContent className={`p-4 sm:p-5 md:p-6 lg:p-10 relative z-10 flex flex-col items-center justify-center text-center ${status !== 'idle' ? 'py-4' : 'py-8'}`}>
                                        <span className={`text-[10px] sm:text-sm font-bold uppercase tracking-[0.2em] mb-0 sm:mb-4 ${status === 'working' ? 'text-blue-500' :
                                            status === 'paused' ? 'text-amber-600' :
                                                'text-slate-400'
                                            }`}>
                                            Status Atual
                                        </span>
                                        <h2 className={`text-lg sm:text-2xl font-black mb-0 sm:mb-2 tracking-tight ${status === 'working' ? 'text-slate-800' :
                                            status === 'paused' ? 'text-amber-900' :
                                                'text-slate-700'
                                            }`}>
                                            {status === 'idle' && "AGUARDANDO INÍCIO"}
                                            {status === 'working' && "EM SERVIÇO"}
                                            {status === 'paused' && "EM PAUSA"}
                                        </h2>
                                        <div className={`text-2xl sm:text-2xl md:text-3xl lg:text-5xl xl:text-6xl font-mono font-bold mt-1 sm:mt-4 tabular-nums tracking-tighter ${status === 'working' ? 'text-blue-600' :
                                            status === 'paused' ? 'text-amber-700' :
                                                'text-slate-800'
                                            }`}>
                                            {timer}
                                        </div>

                                        {status !== 'idle' && (
                                            <div className="mt-6 grid grid-cols-3 gap-8 w-full border-t border-slate-200/50 pt-6">
                                                <div className="text-center">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Entrada</span>
                                                    <span className="text-sm font-bold text-slate-600">
                                                        {pontoHoje?.entrada_hora ? new Date(pontoHoje.entrada_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                    </span>
                                                </div>
                                                <div className="text-center">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Pausas</span>
                                                    <span className="text-sm font-bold text-slate-600">{pausasMetric.count}</span>
                                                </div>
                                                <div className="text-center">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Pausa</span>
                                                    <span className="text-sm font-bold text-slate-600">
                                                        {Math.floor(pausasMetric.totalMs / 3600000).toString().padStart(2, '0')}:
                                                        {Math.floor((pausasMetric.totalMs % 3600000) / 60000).toString().padStart(2, '0')}h
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Direita: Ações e Informações */}
                            <div className="w-full sm:w-60 md:w-72 lg:w-80 xl:w-[400px] flex flex-col gap-6 shrink-0 min-w-0">
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
                                    <Card className="rounded-2xl shadow-sm border-slate-200 overflow-hidden bg-white">
                                        <CardContent className="p-4 sm:p-6 flex justify-between items-center bg-slate-50/50">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1 flex items-center gap-1">
                                                    <Briefcase className="w-3 h-3" /> Turno em Andamento
                                                </span>
                                                <p className="text-sm sm:text-base font-bold text-slate-600 truncate max-w-[150px] sm:max-w-[200px]">
                                                    {activeShift?.nome}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                {activeShift?.horario ? (
                                                    <p className="text-xl sm:text-2xl font-black text-blue-600 leading-none">{activeShift.horario}</p>
                                                ) : (
                                                    <p className="text-xl sm:text-2xl font-black text-slate-800 leading-none">--</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Action Buttons */}
                                {hasShifts && (
                                    <div className="grid grid-cols-1 gap-4">
                                        {status === 'idle' && (
                                            <Button
                                                onClick={handleToggle}
                                                disabled={loadingGeo || !location || !selectedLinkId || isProcessing}
                                                className="h-20 text-xl font-bold rounded-2xl shadow-md bg-blue-600 text-white hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:scale-100"
                                            >
                                                {isProcessing ? <RefreshCw className="animate-spin w-6 h-6 mr-3" /> : (loadingGeo ? <MapPin className="animate-pulse w-6 h-6 mr-3" /> : <Play className="w-6 h-6 mr-3" />)}
                                                {isProcessing ? "PROCESSANDO..." : (loadingGeo ? "LOCALIZANDO..." : "INICIAR TURNO")}
                                            </Button>
                                        )}

                                        {status === 'working' && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <Button
                                                    variant="outline"
                                                    onClick={handlePauseStart}
                                                    disabled={loadingGeo || !location || isProcessing}
                                                    className="h-20 text-lg font-bold rounded-2xl border-2 border-amber-500 text-amber-600 hover:bg-amber-50 shadow-sm disabled:opacity-50 transition-all active:scale-[0.98]"
                                                >
                                                    {isProcessing ? <RefreshCw className="animate-spin w-5 h-5 mr-2" /> : <Pause className="w-5 h-5 mr-2" />}
                                                    PAUSA
                                                </Button>
                                                <Button
                                                    onClick={handleToggle}
                                                    disabled={loadingGeo || !location || isProcessing}
                                                    className="h-20 text-lg font-bold rounded-2xl shadow-md bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-50 transition-all active:scale-[0.98]"
                                                >
                                                    {isProcessing ? <RefreshCw className="animate-spin w-5 h-5 mr-2 text-white" /> : (loadingGeo ? <MapPin className="animate-pulse w-5 h-5 mr-2" /> : <Square className="w-5 h-5 mr-2 text-red-500" />)}
                                                    {isProcessing ? "AGUARDE..." : "ENCERRAR"}
                                                </Button>
                                            </div>
                                        )}

                                        {status === 'paused' && (
                                            <Button
                                                onClick={handlePauseEnd}
                                                disabled={loadingGeo || !location || isProcessing}
                                                className="h-20 text-xl font-bold rounded-2xl shadow-md bg-amber-500 text-white hover:bg-amber-600 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                            >
                                                {isProcessing ? <RefreshCw className="animate-spin w-6 h-6 mr-3" /> : (loadingGeo ? <MapPin className="animate-pulse w-6 h-6 mr-3" /> : <Play className="w-6 h-6 mr-3" />)}
                                                {isProcessing ? "PROCESSANDO..." : (loadingGeo ? "LOCALIZANDO..." : "RETOMAR TRABALHO")}
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
                </>
            )}

            </motion.div>
        </div>
    );
}
