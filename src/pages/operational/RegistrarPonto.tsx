import { useEffect } from "react";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { NativeSelect } from "@/components/ui/native-select";
import { messages } from "@/constants/messages";
import { useRegistrarPontoViewModel } from "@/hooks/ui/useRegistrarPontoViewModel";
import { ColaboradorCliente } from "@/types/database";
import { StatusPonto } from "@/types/enums";
import { AndroidSettings, IOSSettings, NativeSettings } from "capacitor-native-settings";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, Info, Pause, Play, RefreshCw, Settings, ShieldAlert, Square } from "lucide-react";
import { useLayout } from "@/contexts/LayoutContext";
import { formatTime } from "@/utils/ponto";

interface EscalaHorarioItem {
    dia_semana: number;
    hora_inicio?: string;
    hora_fim?: string;
}

export default function RegistrarPonto() {
    const vm = useRegistrarPontoViewModel();
    const { geo, business } = vm;
    const { setPageTitle } = useLayout();

    useEffect(() => {
        setPageTitle("Registrar Atividade");
    }, [setPageTitle]);

    if (!geo.location && !geo.loading) {
        return (
            <div className="w-full max-w-lg mx-auto pb-24 md:mt-8 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                >
                    <Banner
                        variant="destructive"
                        title={messages.ponto.labels.localizacaoRequerida}
                        description={geo.error || messages.ponto.labels.localizacaoAguardando}
                    />

                    <Card className="rounded-[24px] border-border bg-card p-6 shadow-xs">
                        <CardContent className="p-0 flex flex-col items-center text-center space-y-4">
                            <div className="bg-muted p-4 rounded-[18px]">
                                <ShieldAlert className="h-8 w-8 text-destructive" />
                            </div>

                            <p className="text-sm text-muted-foreground max-w-sm">
                                {geo.permissionStatus === "denied"
                                    ? "A permissão de localização é obrigatória para registrar a jornada de trabalho."
                                    : "Verifique se o GPS está ativo e com boa recepção de sinal para prosseguir."}
                            </p>

                            <div className="space-y-2 w-full pt-2">
                                {geo.permissionStatus === "denied" && (
                                    !geo.isWeb ? (
                                        <Button
                                            onClick={() => NativeSettings.open({
                                                optionAndroid: AndroidSettings.ApplicationDetails,
                                                optionIOS: IOSSettings.App
                                            })}
                                            className="w-full h-11 rounded-[18px] flex items-center justify-center gap-2"
                                        >
                                            <Settings className="w-4 h-4" />
                                            {messages.ponto.labels.abrirConfiguracoes}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={vm.openLocationTutorialDialog}
                                            variant="outline"
                                            className="w-full h-11 rounded-[18px] flex items-center justify-center gap-2"
                                        >
                                            <Info className="w-4 h-4" />
                                            {messages.ponto.labels.verTutorialLocalizacao}
                                        </Button>
                                    )
                                )}

                                {geo.permissionStatus !== "denied" && (
                                    <Button
                                        onClick={() => geo.requestLocation()}
                                        variant="outline"
                                        className="w-full h-11 rounded-[18px] flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        {messages.ponto.labels.tentarNovamente}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <PullToRefreshWrapper onRefresh={vm.onRefresh}>
            <div className="w-full max-w-lg lg:max-w-2xl mx-auto pb-24 md:mt-8 relative animate-in fade-in duration-500 px-4">
                <LoadingOverlay
                    active={geo.loading || business.isLoadingPonto}
                    text={business.isLoadingPonto ? messages.ponto.labels.carregandoDados : messages.ponto.labels.buscandoLocalizacao}
                />

                <AnimatePresence mode="wait">
                    {vm.status === StatusPonto.AGUARDANDO ? (
                        <motion.div
                            key="selection"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="flex flex-col items-center justify-start max-w-md mx-auto py-2 space-y-4"
                        >
                            {business.activeLinks.length > 0 ? (
                                <div className="w-full space-y-4 text-center">
                                    <div className="space-y-1 pt-2">
                                        <h1 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
                                            Pronto para iniciar?
                                        </h1>
                                        <p className="text-xs text-muted-foreground">
                                            Selecione o turno correspondente e inicie sua atividade
                                        </p>
                                    </div>

                                    <Card className="rounded-[24px] border-border bg-card shadow-xs">
                                        <CardContent className="p-5 space-y-4 text-left">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium text-muted-foreground">
                                                    {messages.ponto.labels.selecioneTurno}
                                                </label>
                                                <NativeSelect
                                                    value={vm.selectedLinkId}
                                                    onChange={(e) => vm.setSelectedLinkId(e.target.value)}
                                                    disabled={vm.isProcessing}
                                                    className="h-11 rounded-[18px]"
                                                >
                                                    <option value="">Selecione um cliente / turno...</option>
                                                    {business.activeLinks.map((link: ColaboradorCliente) => {
                                                        const today = new Date().getDay();
                                                        const schedules = link.horarios as EscalaHorarioItem[] | undefined;
                                                        const schedule = schedules?.find((h) => h.dia_semana === today);
                                                        const horarioText = schedule?.hora_inicio && schedule?.hora_fim
                                                            ? ` (${schedule.hora_inicio.slice(0, 5)} - ${schedule.hora_fim.slice(0, 5)})`
                                                            : ` (${messages.ponto.labels.semEscala})`;
                                                        return (
                                                            <option key={link.id} value={link.id.toString()}>
                                                                {(link.cliente?.nome_fantasia || "Cliente") + horarioText}
                                                            </option>
                                                        );
                                                    })}
                                                </NativeSelect>
                                            </div>

                                            <Button
                                                onClick={vm.handleToggle}
                                                disabled={vm.isProcessing || !vm.selectedLinkId}
                                                className="w-full h-11 rounded-[18px] flex items-center justify-center gap-2 font-medium"
                                            >
                                                {vm.isProcessing ? (
                                                    <RefreshCw className="animate-spin w-4 h-4" />
                                                ) : (
                                                    <Play className="w-4 h-4 fill-current" />
                                                )}
                                                {messages.ponto.labels.iniciarTurno}
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    <div className="flex items-center justify-center gap-2 py-2 text-muted-foreground">
                                        <div
                                            className={`w-2 h-2 rounded-full ${
                                                geo.location ? "bg-emerald-500" : "bg-neutral-300"
                                            }`}
                                        />
                                        <span className="text-xs font-medium tracking-wide">
                                            {geo.location ? messages.ponto.labels.localizacaoAtiva : messages.ponto.labels.localizacaoPendente}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full space-y-6 text-center py-8">
                                    <div className="relative inline-block">
                                        <div className="bg-muted p-8 rounded-[24px] mb-2 relative z-10">
                                            <Briefcase className="h-12 w-12 text-muted-foreground/60" />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <h2 className="text-lg font-semibold text-foreground tracking-tight">
                                            {messages.ponto.labels.vinculosNaoEncontrados}
                                        </h2>
                                        <p className="text-xs text-muted-foreground max-w-[280px] mx-auto">
                                            {messages.ponto.labels.semTurnosAtivos}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col gap-4 py-2"
                        >
                            <Card className="rounded-[24px] border-border bg-card shadow-xs overflow-hidden relative">
                                <CardContent className="p-6 sm:p-8 flex flex-col items-center justify-center text-center relative z-10 space-y-3">
                                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted border border-border text-foreground">
                                        {vm.status === StatusPonto.TRABALHANDO
                                            ? messages.ponto.labels.emServico
                                            : messages.ponto.labels.emPausa}
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground leading-tight">
                                            {vm.activeShift?.nome}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {vm.activeShift?.horario || "Horário Flexível"}
                                        </p>
                                    </div>

                                    <div className="text-4xl sm:text-6xl font-bold font-mono tracking-tight text-foreground tabular-nums my-2">
                                        {vm.status === StatusPonto.PAUSADO ? vm.activePauseTimer : vm.timer}
                                    </div>

                                    {vm.status === StatusPonto.PAUSADO && (
                                        <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-3 py-1 rounded-full border border-border">
                                            <Pause className="w-3 h-3 fill-current" />
                                            <span>
                                                {messages.ponto.labels.inicioPausa}: {vm.activePauseStartTime}
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="flex gap-3">
                                {vm.status === StatusPonto.TRABALHANDO ? (
                                    <>
                                        <Button
                                            onClick={vm.handlePauseStart}
                                            disabled={vm.isProcessing}
                                            variant="outline"
                                            className="flex-1 h-12 rounded-[18px] flex items-center justify-center gap-2"
                                        >
                                            {vm.isProcessing ? (
                                                <RefreshCw className="animate-spin w-4 h-4" />
                                            ) : (
                                                <Pause className="w-4 h-4 fill-current" />
                                            )}
                                            <span className="text-sm font-medium">{messages.ponto.labels.pausa}</span>
                                        </Button>
                                        <Button
                                            onClick={vm.handleToggle}
                                            disabled={vm.isProcessing}
                                            variant="destructive"
                                            className="flex-1 h-12 rounded-[18px] flex items-center justify-center gap-2"
                                        >
                                            {vm.isProcessing ? (
                                                <RefreshCw className="animate-spin w-4 h-4" />
                                            ) : (
                                                <Square className="w-4 h-4 fill-current" />
                                            )}
                                            <span className="text-sm font-medium">{messages.ponto.labels.encerrar}</span>
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={vm.handlePauseEnd}
                                        disabled={vm.isProcessing}
                                        className="w-full h-12 rounded-[18px] flex items-center justify-center gap-2 font-medium"
                                    >
                                        {vm.isProcessing ? (
                                            <RefreshCw className="animate-spin w-4 h-4" />
                                        ) : (
                                            <Play className="w-4 h-4 fill-current" />
                                        )}
                                        <span className="text-sm font-medium">{messages.ponto.labels.retomarTrabalho}</span>
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <Card className="rounded-[18px] border-border bg-card p-4 text-center shadow-xs">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                                        {messages.ponto.labels.entrada}
                                    </span>
                                    <span className="text-lg font-semibold text-foreground">
                                        {formatTime(vm.pontoAtivo?.entrada_hora)}
                                    </span>
                                </Card>
                                <Card className="rounded-[18px] border-border bg-card p-4 text-center shadow-xs">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">
                                        {messages.ponto.labels.totalPausa}
                                    </span>
                                    <span className="text-lg font-semibold text-foreground">
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
