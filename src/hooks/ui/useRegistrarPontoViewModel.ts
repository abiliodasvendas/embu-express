import { useEffect, useState, useMemo, useCallback } from "react";
import { StatusPonto } from "@/types/enums";
import { useRegistrarPontoBusiness } from "../business/useRegistrarPontoBusiness";
import { usePermissions } from "../business/usePermissions";
import { useGeolocation } from "../ui/useGeolocation";
import { useLayout } from "@/contexts/LayoutContext";
import { formatKm } from "@/utils/masks";
import { apiClient } from "@/services/api/client";
import { ColaboradorCliente, PontoLocation, Pausa } from "@/types/database";

export function useRegistrarPontoViewModel() {
    const business = useRegistrarPontoBusiness();
    const { isMotoboy } = usePermissions();
    const geo = useGeolocation();
    const { openMileageDialog, openLocationTutorialDialog } = useLayout();

    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedLinkId, setSelectedLinkId] = useState<string>("");
    const [timer, setTimer] = useState<string>("00:00:00");
    const [totalPauseTimer, setTotalPauseTimer] = useState<string>("00:00:00");
    const [activePauseTimer, setActivePauseTimer] = useState<string>("00:00:00");
    const [activePauseStartTime, setActivePauseStartTime] = useState<string | null>(null);

    const [activeShift, setActiveShift] = useState<{
        id?: string;
        nome: string;
        horario?: string;
        empresa?: string;
        escala_semanal?: number[];
    } | null>(null);

    // Auto-fetch location on mount
    useEffect(() => {
        geo.requestLocation();
    }, []);

    const [isInitialized, setIsInitialized] = useState(false);

    // Initial selectedLinkId: Auto-select only if there's exactly one link and data is NOT loading
    useEffect(() => {
        if (business.isLoadingProfile || business.isLoadingPonto) return;

        const pontoRef = Array.isArray(business.pontoHoje) ? business.pontoHoje[0] : business.pontoHoje;
        const hasActivePoint = pontoRef && !pontoRef.saida_hora;
        const linksCount = business.activeLinks?.length || 0;

        if (!hasActivePoint && linksCount > 0) {
            // Se já inicializamos e o usuário já tem uma seleção válida, não interferimos mais
            if (isInitialized && selectedLinkId) {
                const isValid = business.activeLinks.some(l => l?.id?.toString() === selectedLinkId);
                if (isValid) return;
            }

            if (linksCount === 1) {
                const firstId = business.activeLinks[0]?.id?.toString();
                if (firstId && firstId !== selectedLinkId) {
                    setSelectedLinkId(firstId);
                }
            } else if (!isInitialized || !selectedLinkId) {
                // Se tem múltiplos e ainda não inicializamos ou não tem seleção, garante vazio (placeholder)
                setSelectedLinkId("");
            }
            setIsInitialized(true);
        } else if (hasActivePoint) {
            if (pontoRef?.cliente_id) {
                const matchedLinkId = business.activeLinks?.find((l: ColaboradorCliente) => String(l.cliente_id) === String(pontoRef.cliente_id))?.id?.toString();
                if (matchedLinkId && matchedLinkId !== selectedLinkId) {
                    setSelectedLinkId(matchedLinkId);
                }
            }
            setIsInitialized(true);
        }
    }, [business.pontoHoje, business.activeLinks, business.isLoadingProfile, business.isLoadingPonto, selectedLinkId, isInitialized]);

    // Active Shift Object for Display
    useEffect(() => {
        const link = business.activeLinks.find((l: ColaboradorCliente) => l.id.toString() === selectedLinkId);
        if (link) {
            const dayOfWeek = new Date().getDay();
            const todaySchedule = link.horarios?.find((h: any) => h.dia_semana === dayOfWeek);

            setActiveShift({
                id: link.id.toString(),
                nome: link.cliente?.nome_fantasia || "Turno Selecionado",
                horario: todaySchedule?.hora_inicio && todaySchedule?.hora_fim ?
                    `${todaySchedule.hora_inicio.slice(0, 5)} - ${todaySchedule.hora_fim.slice(0, 5)}` : (link.cliente?.ativo ? "Sem Escala Hoje" : undefined),
                empresa: link.empresa?.nome_fantasia,
                escala_semanal: link.horarios?.map((h: any) => h.dia_semana)
            });
        }
    }, [selectedLinkId, business.activeLinks]);

    const pontoAtivo = useMemo(() => {
        if (!business.pontoHoje) return null;
        if (!Array.isArray(business.pontoHoje)) return business.pontoHoje;
        return business.pontoHoje.find((p: any) => String(p.colaborador_cliente_id) === selectedLinkId) || null;
    }, [business.pontoHoje, selectedLinkId]);

    const journeyMetrics = useMemo(() => {
        if (!pontoAtivo) return { count: 0, totalMs: 0, kmTrabalho: 0, kmPausa: 0, entradaKm: 0 };

        const allPausas = pontoAtivo.pausas || [];
        const finishedPausas = allPausas.filter((p: Pausa) => p.fim_hora) || [];

        const totalPausasMs = finishedPausas.reduce((acc: number, p: Pausa) => {
            const s = new Date(p.inicio_hora).getTime();
            const e = new Date(p.fim_hora!).getTime();
            return acc + (e - s);
        }, 0);

        const kmTrabalho = allPausas.reduce((acc: number, p: Pausa) => acc + (Number(p.distancia_trabalho) || 0), 0) + (Number(pontoAtivo.saida_distancia_trabalho) || 0);
        const kmPausa = allPausas.reduce((acc: number, p: Pausa) => acc + (Number(p.distancia_pausa) || 0), 0);
        const entradaKm = Number(pontoAtivo.entrada_km || 0);

        return {
            count: allPausas.length,
            totalMs: totalPausasMs,
            kmTrabalho,
            kmPausa,
            entradaKm
        };
    }, [pontoAtivo]);

    const status = useMemo((): StatusPonto => {
        if (!pontoAtivo || pontoAtivo.saida_hora) return StatusPonto.AGUARDANDO;
        const openPause = pontoAtivo.pausas?.find((p: Pausa) => !p.fim_hora);
        return openPause ? StatusPonto.PAUSADO : StatusPonto.TRABALHANDO;
    }, [pontoAtivo]);

    // Robust Date Normalization for Multi-platform support
    const parseDate = useCallback((dateStr?: string) => {
        if (!dateStr) return 0;
        // Fix for non-T ISO formats (SQLite/Postgres sometimes return 'YYYY-MM-DD HH:MM:SS')
        const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
        const date = new Date(normalized);
        return date.getTime();
    }, []);

    // Helper to format duration MS to HH:MM:SS
    const formatDuration = (diff: number) => {
        if (diff < 0) return "00:00:00";
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Timers Logic (Work, Total Pause, Active Pause)
    useEffect(() => {
        const updateTimers = () => {
            if (status === StatusPonto.TRABALHANDO) {
                const start = parseDate(pontoAtivo?.entrada_hora);
                const pauseMs = journeyMetrics.totalMs;

                if (!start || isNaN(start)) {
                    setTimer("--:--:--");
                    setTotalPauseTimer(formatDuration(pauseMs));
                    return;
                }

                const workDiff = (Date.now() - start) - pauseMs;
                setTimer(formatDuration(workDiff));
                setTotalPauseTimer(formatDuration(pauseMs));
                setActivePauseTimer("00:00:00");
                setActivePauseStartTime(null);

            } else if (status === StatusPonto.PAUSADO) {
                const openPause = pontoAtivo?.pausas?.find((p: Pausa) => !p.fim_hora);
                if (openPause) {
                    const start = parseDate(pontoAtivo?.entrada_hora);
                    const pauseStart = parseDate(openPause.inicio_hora);
                    const finishedPauseMs = journeyMetrics.totalMs;
                    
                    // Work Timer Frozen
                    const workDiff = (pauseStart - start) - finishedPauseMs;
                    setTimer(formatDuration(workDiff));

                    // Active Pause Timer
                    const activeDiff = Date.now() - pauseStart;
                    setActivePauseTimer(formatDuration(activeDiff));

                    // Total Pause Timer (Accumulated + Active)
                    setTotalPauseTimer(formatDuration(finishedPauseMs + activeDiff));

                    // Active Pause Start Time (HH:MM)
                    const date = new Date(pauseStart);
                    setActivePauseStartTime(`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`);
                }
            } else {
                setTimer("--:--:--");
                setTotalPauseTimer("00:00:00");
                setActivePauseTimer("00:00:00");
                setActivePauseStartTime(null);
            }
        };

        updateTimers();
        const interval = setInterval(updateTimers, 1000);
        return () => clearInterval(interval);
    }, [status, pontoAtivo, journeyMetrics.totalMs, parseDate]);

    const executeAction = useCallback(async (actionType: 'toggle' | 'pause-start' | 'pause-end', loc: PontoLocation, km?: number) => {
        setIsProcessing(true);
        try {
            if (actionType === 'toggle') {
                const link = business.activeLinks.find((l: ColaboradorCliente) => l.id.toString() === selectedLinkId);
                await business.togglePonto.mutateAsync({
                    usuario_id: business.user?.id,
                    location: loc,
                    km,
                    cliente_id: link?.cliente_id,
                    empresa_id: link?.empresa_id,
                    colaborador_cliente_id: link?.id
                });
            } else if (actionType === 'pause-start') {
                await business.iniciarPausa.mutateAsync({
                    pontoId: pontoAtivo!.id,
                    data: { inicio_loc: loc, inicio_km: km }
                });
            } else if (actionType === 'pause-end') {
                const openPause = pontoAtivo!.pausas?.find((p: Pausa) => !p.fim_hora);
                await business.finalizarPausa.mutateAsync({
                    pausaId: openPause!.id,
                    data: { fim_loc: loc, fim_km: km }
                });
            }
            await business.refetch();
        } finally {
            setIsProcessing(false);
        }
    }, [business, selectedLinkId]);

    const handleAction = useCallback(async (actionType: 'toggle' | 'pause-start' | 'pause-end') => {
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            const [loc, lastKmData] = await Promise.all([
                geo.requestLocation(),
                isMotoboy ? apiClient.get(`/pontos/ultimo-km/${business.user?.id}`) : Promise.resolve({ data: { km: 0 } })
            ]);

            if (!loc) {
                setIsProcessing(false);
                return;
            }

            if (isMotoboy) {
                const lastKm = lastKmData.data?.km || 0;
                let title = "Início de Turno";
                let description = "Informe o KM da moto.";

                if (actionType === 'toggle') {
                    title = status === StatusPonto.AGUARDANDO ? "Início de Turno" : "Fim de Turno";
                } else if (actionType === 'pause-start') {
                    title = "Início de Pausa";
                } else if (actionType === 'pause-end') {
                    title = "Retorno de Pausa";
                }

                const pontoLoc: PontoLocation = {
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    accuracy: loc.accuracy
                };

                openMileageDialog({
                    title,
                    description,
                    lastKm,
                    onConfirm: (km) => executeAction(actionType, pontoLoc, km)
                });
                setIsProcessing(false);
                return;
            }

            const pontoLoc: PontoLocation = {
                latitude: loc.latitude,
                longitude: loc.longitude,
                accuracy: loc.accuracy
            };

            await executeAction(actionType, pontoLoc);
        } catch (error) {
            console.error("Action preparation error:", error);
            setIsProcessing(false);
        }
    }, [isProcessing, geo, isMotoboy, business.user?.id, status, openMileageDialog, executeAction]);

    const onRefresh = async () => {
        await Promise.all([
            business.refetch(),
            geo.requestLocation()
        ]);
    };

    return {
        // State
        status,
        selectedLinkId,
        setSelectedLinkId,
        timer,
        totalPauseTimer,
        activePauseTimer,
        activePauseStartTime,
        activeShift,
        isProcessing: isProcessing || business.isLoadingPonto,
        geo,
        business,
        isMotoboy,

        // Actions
        handleToggle: () => handleAction('toggle'),
        handlePauseStart: () => handleAction('pause-start'),
        handlePauseEnd: () => handleAction('pause-end'),
        openLocationTutorialDialog,
        onRefresh,
        formatKm: (val: number) => formatKm(val)
    };
}
