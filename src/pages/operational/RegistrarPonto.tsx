import { useEffect } from "react";
import { useRegistrarPontoViewModel } from "@/hooks";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
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
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings';
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, MapPin, Pause, Play, RefreshCw, Settings, ShieldAlert, Square } from "lucide-react";

export default function RegistrarPonto() {
    const vm = useRegistrarPontoViewModel();
    const { geo, business } = vm;

    return (
        <PullToRefreshWrapper onRefresh={vm.onRefresh}>
            <div className="w-full max-w-lg lg:max-w-5xl mx-auto pb-20 md:mt-8 relative animate-in fade-in duration-500">
                <LoadingOverlay active={geo.loading && !business.isLoadingPonto} text="Buscando localização..." />

                {/* Geolocation Alerts */}
                <AnimatePresence>
                    {(geo.error || (!geo.location && !geo.loading)) && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6"
                        >
                            <Alert variant="destructive" className="rounded-3xl border-2 border-red-100 shadow-xl shadow-red-500/10 bg-white/80 backdrop-blur-md text-red-900 mb-2 p-6 overflow-hidden relative group">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
                                <ShieldAlert className="h-6 w-6 text-red-600 mb-2" />
                                <AlertTitle className="font-black text-lg text-red-800">Localização Requerida</AlertTitle>
                                <AlertDescription className="text-red-700 font-medium leading-relaxed">
                                    {geo.permissionStatus === 'denied' ? (
                                        "A permissão de localização foi negada no seu aparelho."
                                    ) : geo.error ? (
                                        "O sinal de GPS está indisponível, fraco demais ou o GPS está desligado."
                                    ) : (
                                        "Aguardando sinal de GPS para liberar o registro seguramente."
                                    )}

                                    {geo.permissionStatus === 'denied' && (
                                        !geo.isWeb ? (
                                            <button
                                                onClick={() => NativeSettings.open({
                                                    optionAndroid: AndroidSettings.ApplicationDetails,
                                                    optionIOS: IOSSettings.App
                                                })}
                                                className="mt-6 bg-red-600 px-6 py-4 rounded-2xl text-white font-black hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center w-full justify-center hover:-translate-y-0.5"
                                            >
                                                <Settings className="w-5 h-5 mr-3" /> Abrir Configurações
                                            </button>
                                        ) : (
                                            <p className="mt-4 text-sm font-semibold text-red-800 bg-red-50 p-4 rounded-2xl border border-red-100 italic">
                                                Ative a localização nas configurações do seu navegador para continuar.
                                            </p>
                                        )
                                    )}
                                    
                                    {geo.permissionStatus !== 'denied' && (
                                        <button
                                            onClick={() => geo.requestLocation()}
                                            className="mt-4 bg-white border border-red-200 px-6 py-3 rounded-2xl text-red-900 font-black hover:bg-red-50 transition-all flex items-center w-full justify-center shadow-sm active:scale-95"
                                        >
                                            <RefreshCw className="w-4 h-4 mr-2" /> Tentar Novamente
                                        </button>
                                    )}
                                </AlertDescription>
                            </Alert>
                        </motion.div>
                    )}
                </AnimatePresence>

                {geo.location && (
                    <>
                        {!business.hasShifts ? (
                            <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-amber-200 p-6 sm:p-12 text-center flex flex-col items-center animate-in zoom-in-95 duration-500 min-h-[400px] justify-center">
                                <div className="bg-amber-50 p-6 rounded-3xl mb-6 sm:mb-8 border border-amber-100">
                                    <ShieldAlert className="w-16 h-16 sm:w-20 sm:h-20 text-amber-500" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-4 tracking-tight">Turnos não configurados</h2>
                                <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-8 text-balance">
                                    Ainda não é possível registrar seu ponto pois não identificamos vínculos ativos no seu perfil.
                                </p>
                                <div className="w-full p-5 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 text-sm font-medium">
                                    Solicite ao seu <strong className="text-slate-900">gestor</strong> a vinculação do seu cadastro.
                                </div>
                            </div>
                        ) : (
                            <div className={`flex gap-6 ${vm.status === 'idle' ? 'flex-col-reverse sm:flex-row' : 'flex-col sm:flex-row'}`}>
                                {/* Dashboard Card */}
                                <div className="flex-1 flex flex-col min-w-0">
                                    <Card className={`border shadow-sm rounded-3xl overflow-hidden relative transition-all duration-500 h-full flex flex-col justify-center ${
                                        vm.status === 'idle' ? 'min-h-[180px] sm:min-h-[300px]' : 'min-h-[110px] sm:min-h-[300px]'
                                        } ${vm.status === 'working' ? 'bg-white border-blue-100' :
                                            vm.status === 'paused' ? 'bg-amber-50 border-amber-200' :
                                            'bg-slate-50 border-slate-200'
                                        }`}>
                                        <CardContent className={`p-4 sm:p-5 md:p-6 lg:p-10 relative z-10 flex flex-col items-center justify-center text-center ${vm.status !== 'idle' ? 'py-4' : 'py-8'}`}>
                                            <span className={`text-[10px] sm:text-sm font-bold uppercase tracking-[0.2em] mb-0 sm:mb-4 ${
                                                    vm.status === 'working' ? 'text-blue-500' :
                                                    vm.status === 'paused' ? 'text-amber-600' :
                                                    'text-slate-400'
                                                }`}>
                                                Status Atual
                                            </span>
                                            <h2 className={`text-lg sm:text-2xl font-black mb-0 sm:mb-2 tracking-tight ${
                                                    vm.status === 'working' ? 'text-slate-800' :
                                                    vm.status === 'paused' ? 'text-amber-900' :
                                                    'text-slate-700'
                                                }`}>
                                                {vm.status === 'idle' && "AGUARDANDO INÍCIO"}
                                                {vm.status === 'working' && "EM SERVIÇO"}
                                                {vm.status === 'paused' && "EM PAUSA"}
                                            </h2>
                                            <div className={`text-2xl sm:text-2xl md:text-3xl lg:text-5xl xl:text-6xl font-mono font-bold mt-1 sm:mt-4 tabular-nums tracking-tighter ${
                                                    vm.status === 'working' ? 'text-blue-600' :
                                                    vm.status === 'paused' ? 'text-amber-700' :
                                                    'text-slate-800'
                                                }`}>
                                                {vm.timer}
                                            </div>

                                            {vm.status !== 'idle' && (
                                                <div className="mt-6 w-full border-t border-slate-200/50 pt-6 space-y-6">
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div className="text-center">
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Entrada</span>
                                                            <span className="text-sm font-bold text-slate-600">
                                                                {business.pontoHoje?.entrada_hora ? new Date(business.pontoHoje.entrada_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                            </span>
                                                        </div>
                                                        <div className="text-center">
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Pausas</span>
                                                            <span className="text-sm font-bold text-slate-600">{business.journeyMetrics.count}</span>
                                                        </div>
                                                        <div className="text-center">
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Pausa</span>
                                                            <span className="text-sm font-bold text-slate-600">
                                                                {Math.floor(business.journeyMetrics.totalMs / 3600000).toString().padStart(2, '0')}:
                                                                {Math.floor((business.journeyMetrics.totalMs % 3600000) / 60000).toString().padStart(2, '0')}h
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {vm.isMotoboyOrFiscal && (
                                                        <div className="grid grid-cols-2 gap-4 pb-2 text-left">
                                                            <div className="bg-blue-50/50 rounded-2xl p-3 border border-blue-100/50">
                                                                <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest block mb-1">KM em Serviço</span>
                                                                <span className="text-lg font-black text-blue-700">
                                                                    {vm.formatKm(business.journeyMetrics.kmTrabalho)} <small className="text-[10px] opacity-70">KM</small>
                                                                </span>
                                                            </div>
                                                            <div className="bg-amber-50/50 rounded-2xl p-3 border border-amber-100/50">
                                                                <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest block mb-1">KM em Pausa</span>
                                                                <span className="text-lg font-black text-amber-700">
                                                                    {vm.formatKm(business.journeyMetrics.kmPausa)} <small className="text-[10px] opacity-70">KM</small>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Actions & Selection */}
                                <div className="w-full sm:w-60 md:w-72 lg:w-80 xl:w-[400px] flex flex-col gap-6 shrink-0 min-w-0">
                                    {vm.status === 'idle' && business.hasShifts && (
                                        <Card className="rounded-3xl shadow-sm border-slate-200 bg-white">
                                            <CardContent className="p-6">
                                                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest block mb-3">Selecione o Turno</label>
                                                <Select
                                                    value={vm.selectedLinkId}
                                                    onValueChange={vm.setSelectedLinkId}
                                                    disabled={vm.isProcessing}
                                                >
                                                    <SelectTrigger className="w-full h-14 rounded-xl bg-slate-50 border-slate-200 text-slate-800 font-semibold focus:ring-blue-500/20 text-base">
                                                        <SelectValue placeholder="Escolha a empresa e horário..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                                        {business.activeLinks.map((link: any) => (
                                                            <SelectItem key={link.id} value={link.id.toString()} className="rounded-lg cursor-pointer py-3">
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-slate-800">{link.cliente?.nome_fantasia || "Cliente"}</span>
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

                                    {vm.status !== 'idle' && (
                                        <Card className="rounded-2xl shadow-sm border-slate-200 overflow-hidden bg-white">
                                            <CardContent className="p-4 sm:p-6 flex justify-between items-center bg-slate-50/50">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 flex items-center gap-1">
                                                        <Briefcase className="w-3 h-3" /> Turno em Andamento
                                                    </span>
                                                    <p className="text-sm font-bold text-slate-600 truncate max-w-[150px] sm:max-w-[200px]">
                                                        {vm.activeShift?.nome}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl sm:text-2xl font-black text-blue-600 leading-none">{vm.activeShift?.horario || '--:--'}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-1 gap-4">
                                        {vm.status === 'idle' && (
                                            <Button
                                                onClick={vm.handleToggle}
                                                disabled={vm.isProcessing || !vm.selectedLinkId}
                                                className="h-20 text-xl font-bold rounded-2xl shadow-md bg-blue-600 text-white hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50"
                                            >
                                                {vm.isProcessing ? <RefreshCw className="animate-spin w-6 h-6 mr-3" /> : (geo.loading ? <MapPin className="animate-pulse w-6 h-6 mr-3" /> : <Play className="w-6 h-6 mr-3" />)}
                                                {vm.isProcessing ? "PROCESSANDO..." : "INICIAR TURNO"}
                                            </Button>
                                        )}

                                        {vm.status === 'working' && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <Button
                                                    variant="outline"
                                                    onClick={vm.handlePauseStart}
                                                    disabled={vm.isProcessing}
                                                    className="h-20 text-lg font-bold rounded-2xl border-2 border-amber-500 text-amber-600 hover:bg-amber-50 shadow-sm active:scale-[0.98]"
                                                >
                                                    {vm.isProcessing ? <RefreshCw className="animate-spin w-5 h-5 mr-2" /> : <Pause className="w-5 h-5 mr-2" />}
                                                    PAUSA
                                                </Button>
                                                <Button
                                                    onClick={vm.handleToggle}
                                                    disabled={vm.isProcessing}
                                                    className="h-20 text-lg font-bold rounded-2xl shadow-md bg-slate-800 text-white hover:bg-slate-900 active:scale-[0.98]"
                                                >
                                                    {vm.isProcessing ? <RefreshCw className="animate-spin w-5 h-5 mr-2" /> : <Square className="w-5 h-5 mr-2 text-red-500" />}
                                                    ENCERRAR
                                                </Button>
                                            </div>
                                        )}

                                        {vm.status === 'paused' && (
                                            <Button
                                                onClick={vm.handlePauseEnd}
                                                disabled={vm.isProcessing}
                                                className="h-20 text-xl font-bold rounded-2xl shadow-md bg-amber-500 text-white hover:bg-amber-600 transition-all active:scale-[0.98]"
                                            >
                                                {vm.isProcessing ? <RefreshCw className="animate-spin w-6 h-6 mr-3" /> : <Play className="w-6 h-6 mr-3" />}
                                                RETOMAR TRABALHO
                                            </Button>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-center text-slate-500 text-sm font-medium mt-2 bg-slate-100/50 py-3 rounded-2xl border border-slate-200">
                                        <MapPin className={`w-4 h-4 mr-2 ${geo.location ? 'text-emerald-500' : 'text-slate-300'}`} />
                                        <span>Localização: {geo.loading ? "Obtendo..." : geo.location ? "Ativa" : "Indisponível"}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </PullToRefreshWrapper>
    );
}
