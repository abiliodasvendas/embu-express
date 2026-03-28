import { useEffect } from "react";
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
import { messages } from "@/constants/messages";
import { useRegistrarPontoViewModel } from "@/hooks/ui/useRegistrarPontoViewModel";
import { ColaboradorCliente } from "@/types/database";
import { StatusPonto } from "@/types/enums";
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings';
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, MapPin, Pause, Play, RefreshCw, Settings, ShieldAlert, Square } from "lucide-react";
import { useLayout } from "@/contexts/LayoutContext";

export default function RegistrarPonto() {
    const vm = useRegistrarPontoViewModel();
    const { geo, business } = vm;
    const { setPageTitle } = useLayout();

    useEffect(() => {
        setPageTitle("Registrar Atividade");
    }, [setPageTitle]);

    const getStatusColors = () => {
        switch (vm.status) {
            case StatusPonto.TRABALHANDO:
                return {
                    bg: "bg-blue-50 border-blue-100",
                    text: "text-blue-600",
                    accent: "text-blue-500",
                    timer: "text-blue-700 drop-shadow-[0_0_15px_rgba(37,99,235,0.3)]",
                    badge: "bg-blue-600 text-white"
                };
            case StatusPonto.PAUSADO:
                return {
                    bg: "bg-amber-50 border-amber-100",
                    text: "text-amber-700",
                    accent: "text-amber-600",
                    timer: "text-amber-700 drop-shadow-[0_0_15px_rgba(245,158,11,0.2)]",
                    badge: "bg-amber-100 text-amber-700 border border-amber-200"
                };
            default:
                return {
                    bg: "bg-slate-50 border-slate-200",
                    text: "text-slate-700",
                    accent: "text-slate-400",
                    timer: "text-slate-800",
                    badge: "bg-slate-500 text-white"
                };
        }
    };

    const colors = getStatusColors();

    if (!geo.location && !geo.loading) {
        return (
            <div className="w-full max-w-lg mx-auto pb-24 md:mt-8 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8"
                >
                    <Alert variant="destructive" className="rounded-[2.5rem] border-none shadow-2xl shadow-red-500/20 bg-white/90 backdrop-blur-xl text-red-900 mb-2 p-8 overflow-hidden relative group ring-1 ring-red-100">
                        <div className="absolute top-0 left-0 w-2 h-full bg-red-500" />
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-red-50 p-4 rounded-3xl mb-4">
                                <ShieldAlert className="h-10 w-10 text-red-600" />
                            </div>
                            <AlertTitle className="font-black text-2xl text-red-800 mb-2 tracking-tight uppercase">{messages.ponto.labels.localizacaoRequerida}</AlertTitle>
                            <AlertDescription className="text-red-700 font-medium leading-relaxed max-w-sm">
                                {geo.permissionStatus === 'denied' ? (
                                    messages.ponto.labels.localizacaoNegada
                                ) : geo.error ? (
                                    messages.ponto.labels.localizacaoSinalFraco
                                ) : (
                                    messages.ponto.labels.localizacaoAguardando
                                )}

                                <div className="mt-8 space-y-3 w-full">
                                    {geo.permissionStatus === 'denied' && (
                                        !geo.isWeb ? (
                                            <Button
                                                onClick={() => NativeSettings.open({
                                                    optionAndroid: AndroidSettings.ApplicationDetails,
                                                    optionIOS: IOSSettings.App
                                                })}
                                                className="w-full h-14 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 shadow-lg shadow-red-600/30 flex items-center justify-center transition-all active:scale-95"
                                            >
                                                <Settings className="w-5 h-5 mr-3" /> {messages.ponto.labels.abrirConfiguracoes}
                                            </Button>
                                        ) : (
                                            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-sm italic font-semibold">
                                                {messages.ponto.labels.localizacaoPendente}
                                            </div>
                                        )
                                    )}

                                    {geo.permissionStatus !== 'denied' && (
                                        <Button
                                            onClick={() => geo.requestLocation()}
                                            variant="outline"
                                            className="w-full h-14 border-2 border-red-200 text-red-800 font-bold rounded-2xl hover:bg-red-50 transition-all flex items-center justify-center active:scale-95 bg-white"
                                        >
                                            <RefreshCw className="w-5 h-5 mr-3" /> {messages.ponto.labels.tentarNovamente}
                                        </Button>
                                    )}
                                </div>
                            </AlertDescription>
                        </div>
                    </Alert>
                </motion.div>
                <div className="mt-auto pt-8 flex justify-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 font-bold tracking-widest text-[10px] uppercase hover:bg-slate-50 rounded-xl px-4 h-10"
                        onClick={vm.onRefresh}
                    >
                        <RefreshCw className="w-3 h-3 mr-2" /> {messages.ponto.labels.atualizarDados}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <PullToRefreshWrapper onRefresh={vm.onRefresh}>
            <div className="w-full max-w-lg lg:max-w-6xl mx-auto pb-24 md:mt-8 relative animate-in fade-in duration-700 px-4">
                <LoadingOverlay active={geo.loading || business.isLoadingPonto} text={business.isLoadingPonto ? messages.ponto.labels.carregandoDados : messages.ponto.labels.buscandoLocalizacao} />

                <AnimatePresence mode="wait">
                    {/* State: AGUARDANDO (Selection Only) */}
                    {vm.status === StatusPonto.AGUARDANDO ? (
                        <motion.div
                            key="selection"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="flex flex-col items-center justify-start max-w-md mx-auto py-2"
                        >
                            {business.activeLinks.length > 0 ? (
                                <div className="w-full space-y-4 text-center">
                                    <div className="space-y-0.5 pt-2">
                                        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Pronto para iniciar?</h1>
                                        <p className="text-slate-500 font-medium text-xs">Confirme seu turno para liberar o registro.</p>
                                    </div>

                                    <Card className="rounded-[2.5rem] shadow-lg border-none bg-white shadow-blue-900/5 overflow-hidden p-0 relative">
                                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-30" />
                                        <CardContent className="p-5 space-y-4 relative z-10">
                                            <div className="space-y-1 text-left">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">{messages.ponto.labels.selecioneTurno}</label>
                                                <Select
                                                    value={vm.selectedLinkId}
                                                    onValueChange={vm.setSelectedLinkId}
                                                    disabled={vm.isProcessing}
                                                >
                                                    <SelectTrigger className="w-full h-14 rounded-xl bg-slate-50 border-none shadow-none text-slate-800 font-bold focus:ring-blue-500/20 text-sm ring-offset-0 px-5 transition-all hover:bg-slate-100">
                                                        <SelectValue placeholder="Toque para escolher..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2 max-h-[250px]">
                                                        {business.activeLinks.map((link: ColaboradorCliente) => {
                                                            const today = new Date().getDay();
                                                            const schedule = link.horarios?.find((h: any) => h.dia_semana === today);
                                                            return (
                                                                <SelectItem key={link.id} value={link.id.toString()} className="rounded-xl cursor-pointer py-3 pl-4 pr-4 focus:bg-blue-600 focus:text-white mb-1 group transition-colors text-sm [&>span:first-child]:hidden">
                                                                    <div className="flex flex-col text-left">
                                                                        <span className="font-black">{link.cliente?.nome_fantasia || "Cliente"}</span>
                                                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 group-focus:text-blue-100 mt-0.5 uppercase tracking-wide">
                                                                            <RefreshCw className="w-2 h-2" />
                                                                            {schedule ? `${schedule.hora_inicio?.slice(0, 5)} - ${schedule.hora_fim?.slice(0, 5)}` : messages.ponto.labels.semEscala}
                                                                        </div>
                                                                    </div>
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <Button
                                                onClick={vm.handleToggle}
                                                disabled={vm.isProcessing || !vm.selectedLinkId}
                                                className="w-full h-16 text-lg font-black rounded-2xl shadow-xl shadow-blue-600/20 bg-blue-600 text-white hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50"
                                            >
                                                {vm.isProcessing ? <RefreshCw className="animate-spin w-5 h-5 mr-3" /> : <Play className="w-5 h-5 mr-3 fill-current" />}
                                                {messages.ponto.labels.iniciarTurno}
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    <div className="flex items-center justify-center gap-8 py-4">
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <div className={`w-2 h-2 rounded-full ${geo.location ? 'bg-emerald-500' : 'bg-slate-300'} animate-pulse`} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">
                                                {geo.location ? messages.ponto.labels.localizacaoAtiva : messages.ponto.labels.localizacaoPendente}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-slate-400 font-bold tracking-widest text-[10px] uppercase hover:bg-slate-50 rounded-xl px-4"
                                            onClick={vm.onRefresh}
                                        >
                                            {messages.ponto.labels.atualizarDados}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full space-y-6 text-center py-8">
                                    <div className="relative inline-block">
                                        <div className="bg-slate-100 p-8 rounded-[2.5rem] mb-2 relative z-10">
                                            <Briefcase className="h-16 w-16 text-slate-400 opacity-50" />
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-amber-500 p-2 rounded-2xl z-20 shadow-lg border-4 border-white">
                                            <ShieldAlert className="h-6 w-6 text-white" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                                            {messages.ponto.labels.vinculosNaoEncontrados}
                                        </h2>
                                        <p className="text-slate-500 font-medium text-sm max-w-[280px] mx-auto">
                                            {messages.ponto.labels.semTurnosAtivos}
                                        </p>
                                    </div>

                                    <Button
                                        onClick={vm.onRefresh}
                                        variant="outline"
                                        className="h-14 px-8 border-2 border-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-white hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm active:scale-95 bg-slate-50/50"
                                    >
                                        <RefreshCw className="w-5 h-5 mr-3" /> {messages.ponto.labels.atualizarDados}
                                    </Button>

                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest pt-4">
                                        Tente atualizar se o vínculo foi criado agora.
                                    </p>
                                </div>
                            )}
                        </motion.div>

                    ) : (
                        /* State: WORKING / PAUSED (Full Dashboard) */
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col gap-6 py-4"
                        >
                            {/* Bloco Superior: Status, Timer e Cliente */}
                            <Card className={`rounded-[3rem] border-none shadow-2xl overflow-hidden relative transition-all duration-700 ${colors.bg} ring-1 ring-black/5 ${vm.status === StatusPonto.PAUSADO ? 'shadow-amber-900/5' : ''}`}>
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    {vm.status === StatusPonto.PAUSADO ? (
                                        <Pause className="w-24 h-24 text-amber-900" />
                                    ) : (
                                        <RefreshCw className={`w-24 h-24 ${vm.status === StatusPonto.TRABALHANDO ? 'animate-[spin_10s_linear_infinite]' : ''}`} />
                                    )}
                                </div>

                                <CardContent className="p-8 flex flex-col items-center justify-center text-center relative z-10">
                                    <div className={`${colors.badge} px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-sm`}>
                                        {vm.status === StatusPonto.TRABALHANDO ? messages.ponto.labels.emServico : messages.ponto.labels.emPausa}
                                    </div>

                                    <div className="mb-2">
                                        <h3 className={`text-xl font-black ${colors.text} leading-tight`}>{vm.activeShift?.nome}</h3>
                                        <p className={`text-[10px] font-black ${vm.status === StatusPonto.PAUSADO ? 'text-amber-400' : 'text-slate-400'} uppercase tracking-[0.15em]`}>{vm.activeShift?.horario || 'Horário Flexível'}</p>
                                    </div>

                                    <div className={`text-5xl sm:text-7xl font-black font-mono tracking-tighter tabular-nums ${colors.timer} ${vm.status === StatusPonto.PAUSADO ? 'mb-2' : 'my-4'}`}>
                                        {vm.status === StatusPonto.PAUSADO ? vm.activePauseTimer : vm.timer}
                                    </div>

                                    {vm.status === StatusPonto.PAUSADO && (
                                        <div className="flex flex-col items-center gap-2 mt-2 animate-in fade-in slide-in-from-top-2 duration-500">
                                            <div className="flex items-center gap-2 text-amber-600 font-bold text-[10px] uppercase tracking-[0.15em] bg-amber-100/50 px-3 py-1 rounded-full border border-amber-200/50">
                                                <Pause className="w-3 h-3 fill-current" />
                                                <span>{messages.ponto.labels.inicioPausa}: {vm.activePauseStartTime}</span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Botões de Ação Principais (50/50) */}
                            <div className="flex gap-4">
                                {vm.status === StatusPonto.TRABALHANDO ? (
                                    <>
                                        <Button
                                            onClick={vm.handlePauseStart}
                                            disabled={vm.isProcessing}
                                            className="flex-1 h-20 rounded-3xl border-2 border-amber-100 bg-white text-amber-600 hover:bg-amber-50 transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-1 shadow-sm shadow-amber-500/5"
                                        >
                                            {vm.isProcessing ? <RefreshCw className="animate-spin w-5 h-5" /> : <Pause className="w-5 h-5 fill-current" />}
                                            <span className="text-[10px] font-black uppercase tracking-widest">{messages.ponto.labels.pausa}</span>
                                        </Button>
                                        <Button
                                            onClick={vm.handleToggle}
                                            disabled={vm.isProcessing}
                                            className="flex-1 h-20 rounded-3xl shadow-xl shadow-red-500/30 bg-red-600 text-white hover:bg-red-700 transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-1"
                                        >
                                            {vm.isProcessing ? <RefreshCw className="animate-spin w-5 h-5" /> : <Square className="w-5 h-5 fill-current text-white/40" />}
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">{messages.ponto.labels.encerrar}</span>
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={vm.handlePauseEnd}
                                        disabled={vm.isProcessing}
                                        className="w-full h-20 text-xl font-black rounded-3xl shadow-2xl shadow-amber-600/30 bg-amber-500 text-white hover:bg-amber-600 transition-all active:scale-[0.98] flex items-center justify-center gap-4"
                                    >
                                        {vm.isProcessing ? <RefreshCw className="animate-spin w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
                                        {messages.ponto.labels.retomarTrabalho}
                                    </Button>
                                )}
                            </div>

                            {/* Métricas Essenciais */}
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <Card className="rounded-3xl border-none bg-slate-50/50 p-5 text-center ring-1 ring-slate-100 shadow-sm">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{messages.ponto.labels.entrada}</span>
                                    <span className="text-xl font-black text-slate-700">
                                        {business.pontoHoje?.entrada_hora
                                            ? new Date(business.pontoHoje.entrada_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                                            : '--:--'}
                                    </span>
                                </Card>
                                <Card className="rounded-3xl border-none bg-slate-50/50 p-5 text-center ring-1 ring-slate-100 shadow-sm">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{messages.ponto.labels.totalPausa}</span>
                                    <span className="text-xl font-black text-slate-700">
                                        {vm.totalPauseTimer}
                                    </span>
                                </Card>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PullToRefreshWrapper>
    );
}
