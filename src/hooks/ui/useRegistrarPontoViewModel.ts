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
    const { isMotoboyOrFiscal } = usePermissions();
    const geo = useGeolocation();
    const { openMileageDialog } = useLayout();

    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedLinkId, setSelectedLinkId] = useState<string>("");
    const [timer, setTimer] = useState<string>("00:00:00");
    const [activeShift, setActiveShift] = useState<{
        id?: string;
        nome: string;
        horario?: string;
        empresa?: string;
        escala_semanal?: number[];
    } | null>(null);

    // Initial selectedLinkId based on proximity or existing point
    useEffect(() => {
        if (!business.pontoHoje) {
            if (selectedLinkId) return; // Keep current user selection
            
            // Proximity based selection
            if (business.activeLinks.length > 0) {
                const now = new Date();
                const formatter = new Intl.DateTimeFormat('pt-BR', {
                    timeZone: 'America/Sao_Paulo',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: false
                });
                const parts = formatter.format(now).split(':');
                const nowMinutes = Number(parts[0]) * 60 + Number(parts[1]);

                let bestShift = business.activeLinks[0];
                let minDiff = Infinity;

                business.activeLinks.forEach((link: ColaboradorCliente) => {
                    if (link.hora_inicio) {
                        const [h, m] = link.hora_inicio.split(':').map(Number);
                        const shiftStartMinutes = h * 60 + m;
                        const diff = Math.abs(nowMinutes - shiftStartMinutes);
                        if (diff < minDiff) {
                            minDiff = diff;
                            bestShift = link;
                        }
                    }
                });

                if (bestShift) {
                    setSelectedLinkId(bestShift.id.toString());
                }
            }
        } else {
            // Priority: if point is active, always use point's client
            if (business.pontoHoje.cliente_id) {
                const matchedLink = business.activeLinks.find((l: ColaboradorCliente) => String(l.cliente_id) === String(business.pontoHoje!.cliente_id));
                if (matchedLink) {
                    setSelectedLinkId(matchedLink.id.toString());
                }
            }
        }
    }, [business.pontoHoje, business.activeLinks, selectedLinkId]);

    // Active Shift Object for Display
    useEffect(() => {
        const link = business.activeLinks.find((l: ColaboradorCliente) => l.id.toString() === selectedLinkId);
        if (link) {
            setActiveShift({
                id: link.id.toString(),
                nome: link.cliente?.nome_fantasia || "Turno Selecionado",
                horario: link.hora_inicio && link.hora_fim ?
                    `${link.hora_inicio.slice(0, 5)} - ${link.hora_fim.slice(0, 5)}` : undefined,
                empresa: link.empresa?.nome_fantasia,
                escala_semanal: link.cliente?.escala_semanal
            });
        }
    }, [selectedLinkId, business.activeLinks]);

    const status = useMemo((): StatusPonto => {
        if (!business.pontoHoje || business.pontoHoje.saida_hora) return StatusPonto.AGUARDANDO;
        const openPause = business.pontoHoje.pausas?.find((p: Pausa) => !p.fim_hora);
        return openPause ? StatusPonto.PAUSADO : StatusPonto.TRABALHANDO;
    }, [business.pontoHoje]);

    // Timer Logic
    useEffect(() => {
        if (status === StatusPonto.TRABALHANDO) {
            const start = business.pontoHoje?.entrada_hora ? new Date(business.pontoHoje.entrada_hora).getTime() : 0;
            const pauseMs = business.journeyMetrics.totalMs;

            if (!start || isNaN(start)) {
                setTimer("00:00:00");
                return;
            }

            const interval = setInterval(() => {
                const now = Date.now();
                const diff = (now - start) - pauseMs;
                if (diff < 0) {
                    setTimer("00:00:00");
                    return;
                }
                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                setTimer(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
            }, 1000);
            return () => clearInterval(interval);
        } else if (status === StatusPonto.PAUSADO) {
            const openPause = business.pontoHoje?.pausas?.find((p: Pausa) => !p.fim_hora);
            if (openPause) {
                const entradaIso = business.pontoHoje?.entrada_hora;
                const start = entradaIso ? new Date(entradaIso).getTime() : 0;
                const pauseStart = new Date(openPause.inicio_hora).getTime();
                const diff = (pauseStart - start) - business.journeyMetrics.totalMs;
                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                setTimer(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
            }
        } else {
            setTimer("00:00:00");
        }
    }, [status, business.pontoHoje, business.journeyMetrics.totalMs]);

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
                    pontoId: business.pontoHoje!.id,
                    data: { inicio_loc: loc, inicio_km: km }
                });
            } else if (actionType === 'pause-end') {
                const openPause = business.pontoHoje!.pausas?.find((p: Pausa) => !p.fim_hora);
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
                isMotoboyOrFiscal ? apiClient.get(`/pontos/ultimo-km/${business.user?.id}`) : Promise.resolve({ data: { km: 0 } })
            ]);

            if (!loc) {
                setIsProcessing(false);
                return;
            }

            if (isMotoboyOrFiscal) {
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
    }, [isProcessing, geo, isMotoboyOrFiscal, business.user?.id, status, openMileageDialog, executeAction]);

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
        activeShift,
        isProcessing: isProcessing || business.isLoadingPonto,
        geo,
        business,
        isMotoboyOrFiscal,
        
        // Actions
        handleToggle: () => handleAction('toggle'),
        handlePauseStart: () => handleAction('pause-start'),
        handlePauseEnd: () => handleAction('pause-end'),
        onRefresh,
        formatKm: (val: number) => formatKm(val)
    };
}
