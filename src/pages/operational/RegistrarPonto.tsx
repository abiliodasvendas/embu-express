import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { messages } from "@/constants/messages";
import { useLayout } from "@/contexts/LayoutContext";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { useGeolocation } from "@/hooks/ui/useGeolocation";
import { apiClient } from "@/services/api/client";
import { toast } from "@/utils/notifications/toast";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Pause, Play, ShieldAlert, Square } from "lucide-react";
import { useEffect, useState } from "react";

type PontoAction = 'idle' | 'working' | 'paused';

export default function RegistrarPonto() {
    const { setPageTitle } = useLayout();
    const { user } = useSession();
    const { profile: userProfile } = useProfile(user?.id);
    const { location, requestLocation, loading: loadingGeo } = useGeolocation();
    
    const [status, setStatus] = useState<PontoAction>("idle");
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
        requestLocation().catch(() => {});
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
        const getShiftInfo = (pontoId?: number, clienteIdFromPonto?: number) => {
            // Priority 1: Match with active point's client
            if (clienteIdFromPonto) {
                const matchedLink = userProfile?.links?.find((l: any) => l.cliente_id === clienteIdFromPonto);
                if (matchedLink) {
                    return {
                        nome: matchedLink.cliente?.nome_fantasia || "Turno Atual",
                        horario: matchedLink.hora_inicio && matchedLink.hora_fim ? 
                            `${matchedLink.hora_inicio.slice(0, 5)} - ${matchedLink.hora_fim.slice(0, 5)}` : undefined,
                        empresa: matchedLink.empresa?.nome_fantasia
                    };
                }
            }

            // Priority 2: Use first available link if idle
            const firstLink = userProfile?.links?.[0];
            if (firstLink) {
                return {
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
            setActiveShift(getShiftInfo());
            return;
        }

        if (pontoHoje.saida_hora) {
             setStatus("idle");
             setActiveShift(getShiftInfo());
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

             setActiveShift(getShiftInfo(pontoHoje.id, pontoHoje.cliente_id));
        }
    }, [pontoHoje, userProfile]);

    const handleToggle = async () => {
        const loc = await requestLocation();
        if (!loc) return;
        try {
            await apiClient.post('/pontos/toggle', {
                usuario_id: user?.id,
                location: loc
            });
            toast.success(messages.ponto.sucesso.registrado);
            refetch();
        } catch (error) {
            console.error(error);
            toast.error(messages.ponto.erro.registrar);
        }
    };

    const handlePauseStart = async () => {
        if (!pontoHoje) return;
        const loc = await requestLocation();
        if (!loc) return;
        try {
            await apiClient.post('/pontos/pausa/inicio', {
                ponto_id: pontoHoje.id,
                inicio_loc: loc
            });
            toast.success("Pausa iniciada!");
            refetch();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao iniciar pausa.");
        }
    };

    const handlePauseEnd = async () => {
        if (!pontoHoje) return;
        const openPause = pontoHoje.pausas?.find((p: any) => !p.fim_hora);
        if (!openPause) return;
        const loc = await requestLocation();
        if (!loc) return;
        try {
            await apiClient.post('/pontos/pausa/fim', {
                id: openPause.id,
                fim_loc: loc
            });
            toast.success("Pausa finalizada!");
            refetch();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao finalizar pausa.");
        }
    };

    return (
        <div className="space-y-6 max-w-lg mx-auto pb-20">
            {!hasShifts ? (
                /* MISSING SHIFT PROMINENT ALERT */
                <div className="bg-white rounded-[2rem] shadow-xl border-t-8 border-amber-500 p-8 sm:p-12 text-center flex flex-col items-center animate-in zoom-in-95 duration-500">
                    <div className="bg-amber-100 p-6 rounded-3xl mb-8">
                        <ShieldAlert className="w-20 h-20 text-amber-600" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">Turnos não configurados</h2>
                    <p className="text-gray-600 text-lg leading-relaxed mb-8">
                        Identificamos que seu cadastro ainda não possui vínculos de turno registrados no sistema.
                    </p>
                    <div className="w-full p-6 bg-amber-50/50 rounded-2xl border border-amber-100 text-amber-900 font-medium">
                        Por favor, solicite ao administrador que vincule sua conta a um cliente para liberar o registro de ponto.
                    </div>
                </div>
            ) : (
                /* Header / Status Card */
                <Card className={`border-none shadow-2xl rounded-[2rem] text-white overflow-hidden relative transition-colors duration-500 ${
                    status === 'working' ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 
                    status === 'paused' ? 'bg-gradient-to-br from-yellow-500 to-amber-700' :
                    'bg-gradient-to-br from-slate-700 to-slate-900'
                }`}>
                     <CardContent className="p-10 relative z-10 flex flex-col items-center justify-center min-h-[220px]">
                          <span className="text-white/70 text-sm font-bold uppercase tracking-[0.2em] mb-4">Status Atual</span>
                          <h2 className="text-2xl font-black mb-2 tracking-tight">
                              {status === 'idle' && "AGUARDANDO INÍCIO"}
                              {status === 'working' && "EM SERVIÇO"}
                              {status === 'paused' && "EM PAUSA"}
                          </h2>
                          <div className="text-5xl font-mono font-bold mt-4 tabular-nums drop-shadow-2xl">
                              {timer}
                          </div>
                     </CardContent>
                </Card>
            )}

            {/* Smart Action Button - Hidden if no shifts */}
            {hasShifts && (
                <div className="grid grid-cols-1 gap-4">
                    {status === 'idle' && (
                        <Button 
                            onClick={handleToggle}
                            disabled={loadingGeo}
                            className="h-28 text-2xl font-black rounded-[2rem] shadow-xl bg-green-600 hover:bg-green-700 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:scale-100"
                        >
                            {loadingGeo ? <MapPin className="animate-pulse w-8 h-8 mr-3"/> : <Play className="w-8 h-8 mr-3" />}
                            {loadingGeo ? "LOCALIZANDO..." : "INICIAR DIA"}
                        </Button>
                    )}

                    {status === 'working' && (
                        <div className="grid grid-cols-2 gap-4">
                            <Button 
                                variant="outline" 
                                onClick={handlePauseStart}
                                className="h-24 text-xl font-bold rounded-[2rem] border-4 border-yellow-500 text-yellow-600 hover:bg-yellow-50 shadow-lg"
                            >
                                <Pause className="w-7 h-7 mr-2" />
                                PAUSA
                            </Button>
                            <Button 
                                onClick={handleToggle}
                                disabled={loadingGeo}
                                className="h-24 text-xl font-bold rounded-[2rem] shadow-xl bg-red-600 hover:bg-red-700"
                            >
                                {loadingGeo ? <MapPin className="animate-pulse w-7 h-7 mr-2"/> : <Square className="w-7 h-7 mr-2" />}
                                ENCERRAR
                            </Button>
                        </div>
                    )}

                    {status === 'paused' && (
                        <Button 
                            onClick={handlePauseEnd}
                            className="h-28 text-2xl font-black rounded-[2rem] shadow-xl bg-yellow-600 hover:bg-yellow-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Play className="w-8 h-8 mr-3" />
                            RETOMAR TRABALHO
                        </Button>
                    )}
                </div>
            )}
            
            {/* Info Cards - Hidden if no shifts */}
            {hasShifts && (
                <div className="grid grid-cols-1 gap-4">
                    <Card className="rounded-3xl shadow-md border-gray-100 overflow-hidden">
                        <CardContent className="p-6">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Turno</span>
                            {activeShift?.horario ? (
                                <p className="text-3xl font-black text-blue-600 leading-tight">{activeShift.horario}</p>
                            ) : (
                                <p className="text-3xl font-black text-gray-900 leading-tight">--</p>
                            )}
                            <p className="text-base font-bold text-gray-400 mt-1 truncate">
                                {activeShift?.nome || "Cliente não identificado"}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl shadow-md border-gray-100 overflow-hidden">
                        <CardContent className="p-6">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Localização</span>
                            <div className="flex items-center text-gray-900 font-black text-xl truncate">
                                <MapPin className={`w-6 h-6 mr-3 flex-shrink-0 ${location ? 'text-green-500' : 'text-gray-300'}`} />
                                <span className="truncate">{loadingGeo ? "Obtendo..." : location ? "Ativa" : "--"}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
