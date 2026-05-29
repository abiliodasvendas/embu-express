import { useEffect, useState, useMemo, useRef } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { PeriodSelectorToolbar } from "@/components/common/PeriodSelectorToolbar";
import { useActiveCollaborators, useCollaboratorMap } from "@/hooks";
import { useHierarchyFilters, useDateFilters } from "@/hooks/ui/useFilters";
import { FilterOptions } from "@/types/enums";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Calendar, HelpCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatTime } from "@/utils/ponto";


const unitIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const collaboratorIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});



function RecenterMap({ coords, points, selectedPoint }: { coords: [number, number] | null; points: [number, number][]; selectedPoint: { lat: number; lng: number; id: number } | null }) {
    const map = useMap();
    
    useEffect(() => {
        if (selectedPoint) {
            map.setView([selectedPoint.lat, selectedPoint.lng], 16);
        } else if (points.length > 0) {
            const bounds = L.latLngBounds(points);
            if (coords) bounds.extend(coords);
            map.fitBounds(bounds, { padding: [50, 50] });
        } else if (coords) {
            map.setView(coords, 15);
        }
    }, [coords, points, selectedPoint, map]);
    
    return null;
}

export function CollaboratorMap() {
    const { setPageTitle } = useLayout();
    const [selectedPoint, setSelectedPoint] = useState<{ lat: number; lng: number; id: number } | null>(null);
    const markerRefs = useRef<{[key: number]: L.Marker | null}>({});
    
    const { selectedUsuario, setSelectedUsuario } = useHierarchyFilters({
        usuarioParam: "usuario",
        syncWithUrl: true
    });
    
    const { selectedMes, setSelectedMes, selectedAno, setSelectedAno } = useDateFilters({
        mesParam: "mes",
        anoParam: "ano",
        syncWithUrl: true
    });

    const { data: collaborators = [] } = useActiveCollaborators();
    const usuarioId = selectedUsuario === FilterOptions.TODOS ? undefined : selectedUsuario;
    
    const { data: turnos = [], isLoading } = useCollaboratorMap(
        usuarioId,
        selectedMes,
        selectedAno
    );

    const [activeTab, setActiveTab] = useState<string>("");

    useEffect(() => {
        setPageTitle("Mapa de Jornada");
    }, [setPageTitle]);

    useEffect(() => {
        if (turnos.length > 0) {
            setActiveTab(String(turnos[0].colaborador_cliente_id));
        } else {
            setActiveTab("");
        }
    }, [turnos]);

    useEffect(() => {
        setSelectedPoint(null);
        markerRefs.current = {};
    }, [activeTab]);

    const activeTurno = useMemo(() => {
        return turnos.find(t => String(t.colaborador_cliente_id) === activeTab) || null;
    }, [turnos, activeTab]);

    const pontosOrdenados = useMemo(() => {
        if (!activeTurno) return [];
        return [...activeTurno.pontos].sort((a, b) => 
            new Date(b.data_referencia).getTime() - new Date(a.data_referencia).getTime()
        );
    }, [activeTurno]);

    const mapCenterAndPoints = useMemo(() => {
        if (!activeTurno) return { center: null, points: [] };
        
        const center: [number, number] | null = activeTurno.unidade_latitude && activeTurno.unidade_longitude
            ? [activeTurno.unidade_latitude, activeTurno.unidade_longitude]
            : null;
            
        const points: [number, number][] = activeTurno.pontos
            .filter((p: any) => p.lat && p.lng)
            .map((p: any) => [p.lat, p.lng] as [number, number]);
            
        return { center, points };
    }, [activeTurno]);

    const escalaEntrada = useMemo(() => {
        if (!activeTurno || !activeTurno.pontos.length) return null;
        const pontoComTurno = activeTurno.pontos.find((p: any) => p.detalhes_calculo?.entrada?.turno_base);
        const base = pontoComTurno?.detalhes_calculo?.entrada?.turno_base;
        return base && typeof base === 'string' ? base.substring(0, 5) : base || null;
    }, [activeTurno]);

    return (
        <div className="space-y-6 pb-24">
            <PeriodSelectorToolbar
                usuarioId={selectedUsuario}
                collaborators={collaborators}
                selectedMonth={selectedMes}
                selectedYear={selectedAno}
                onUsuarioChange={setSelectedUsuario}
                onMonthChange={setSelectedMes}
                onYearChange={setSelectedAno}
                hideShiftSelect={true}
                title="Filtrar Mapa"
            />

            {!usuarioId ? (
                <Card className="border-none shadow-sm rounded-3xl bg-white p-8 text-center flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-full text-emerald-500">
                        <MapPin className="h-10 w-10" />
                    </div>
                    <div className="max-w-md space-y-2">
                        <h3 className="text-xl font-bold text-slate-800">Selecione um Colaborador</h3>
                        <p className="text-sm text-slate-500">
                            Escolha um colaborador e o período nos filtros acima para visualizar o mapa interativo com os pontos batidos no mês.
                        </p>
                    </div>
                </Card>
            ) : isLoading ? (
                <Card className="border-none shadow-sm rounded-3xl bg-white p-12 text-center flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
                    <p className="text-sm font-medium text-slate-500">Buscando geolocalizações no banco de dados...</p>
                </Card>
            ) : turnos.length === 0 ? (
                <Card className="border-none shadow-sm rounded-3xl bg-white p-8 text-center flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 bg-amber-50 rounded-full text-amber-500">
                        <HelpCircle className="h-10 w-10" />
                    </div>
                    <div className="max-w-md space-y-2">
                        <h3 className="text-xl font-bold text-slate-800">Nenhuma Geolocalização Registrada</h3>
                        <p className="text-sm text-slate-500">
                            Nenhum ponto batido pelo GPS foi encontrado para este colaborador no período selecionado. Batidas manuais retroativas não possuem geolocalização.
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-6">
                    <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-none gap-2">
                        {turnos.map((t) => (
                            <button
                                key={t.colaborador_cliente_id}
                                onClick={() => setActiveTab(String(t.colaborador_cliente_id))}
                                className={`px-5 py-3 font-semibold text-sm transition-all rounded-t-2xl whitespace-nowrap ${
                                    activeTab === String(t.colaborador_cliente_id)
                                        ? "bg-white text-emerald-600 border-t-2 border-emerald-500 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700 bg-slate-50/50 hover:bg-slate-50 border-t-2 border-transparent"
                                }`}
                            >
                                {t.nome_fantasia_cliente} - {t.nome_unidade}
                            </button>
                        ))}
                    </div>

                    {activeTurno && (
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <Card className="border-none shadow-sm rounded-3xl bg-white lg:col-span-1 flex flex-col h-[500px]">
                                <CardHeader className="border-b border-gray-50 py-4">
                                    <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-emerald-500" />
                                        Registros do Mês ({activeTurno.pontos.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 overflow-y-auto flex-1 divide-y divide-gray-50 scrollbar-thin">
                                    {pontosOrdenados.map((p: any) => (
                                        <div 
                                            key={p.id} 
                                            onClick={() => {
                                                setSelectedPoint({ lat: p.lat, lng: p.lng, id: p.id });
                                                const marker = markerRefs.current[p.id];
                                                if (marker) {
                                                    marker.openPopup();
                                                }
                                            }}
                                            className={`p-3 hover:bg-slate-50 transition-colors flex justify-between items-center text-xs cursor-pointer ${
                                                selectedPoint?.id === p.id ? "bg-emerald-50/50 hover:bg-emerald-50/50 border-r-2 border-emerald-500 font-medium" : ""
                                            }`}
                                        >
                                            <div>
                                                <span className="font-semibold text-slate-700">
                                                    {format(new Date(p.data_referencia + "T12:00:00"), "dd/MM (EEEE)", { locale: ptBR })}
                                                </span>
                                                {p.metadata?.address && (
                                                    <p className="text-[10px] text-slate-400 truncate max-w-[160px]" title={p.metadata.address}>
                                                        {p.metadata.address}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg font-bold">
                                                {formatTime(p.entrada_hora)}
                                            </span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm rounded-3xl bg-white lg:col-span-3 overflow-hidden h-[500px] flex flex-col">
                                <div className="flex-1 w-full relative z-10">
                                    <MapContainer
                                        center={mapCenterAndPoints.center || [-23.652, -46.822]}
                                        zoom={14}
                                        style={{ height: "100%", width: "100%" }}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />

                                        <RecenterMap
                                            coords={mapCenterAndPoints.center}
                                            points={mapCenterAndPoints.points}
                                            selectedPoint={selectedPoint}
                                        />

                                        {mapCenterAndPoints.center && (
                                            <Marker position={mapCenterAndPoints.center} icon={unitIcon}>
                                                <Popup className="rounded-xl overflow-hidden font-sans">
                                                    <div className="p-1 space-y-1">
                                                        <span className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">Unidade Oficial</span>
                                                        <h4 className="font-bold text-slate-800 text-sm mt-0.5">{activeTurno.nome_unidade}</h4>
                                                        <p className="text-xs text-slate-500 font-medium">{activeTurno.nome_fantasia_cliente}</p>
                                                        {escalaEntrada && (
                                                            <p className="text-xs text-slate-600 mt-2 pt-1.5 border-t border-gray-100 font-semibold flex justify-between gap-4">
                                                                <span>⏰ Horário de Entrada:</span>
                                                                <span className="text-blue-600 font-bold">{escalaEntrada}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        )}

                                        {activeTurno.pontos.map((p: any) => (
                                            <Marker 
                                                key={p.id} 
                                                position={[p.lat, p.lng]} 
                                                icon={collaboratorIcon}
                                                ref={(el) => {
                                                    if (el) {
                                                        markerRefs.current[p.id] = el;
                                                    }
                                                }}
                                            >
                                                <Popup className="rounded-xl overflow-hidden font-sans">
                                                    <div className="p-1 space-y-1">
                                                        <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Batida de Ponto</span>
                                                        <h4 className="font-bold text-slate-800 text-sm">
                                                            {format(new Date(p.data_referencia + "T12:00:00"), "dd 'de' MMMM", { locale: ptBR })}
                                                        </h4>
                                                        <div className="text-xs space-y-1 py-1 border-t border-b border-gray-100 my-1">
                                                            <p className="text-slate-500 flex justify-between gap-4">
                                                                <span>⏰ Escala:</span>
                                                                <strong className="text-slate-700">
                                                                    {p.detalhes_calculo?.entrada?.turno_base && typeof p.detalhes_calculo.entrada.turno_base === 'string'
                                                                        ? p.detalhes_calculo.entrada.turno_base.substring(0, 5)
                                                                        : p.detalhes_calculo?.entrada?.turno_base || "Não planejado"}
                                                                </strong>
                                                            </p>
                                                            <p className="text-slate-500 flex justify-between gap-4">
                                                                <span>🟢 Registro Real:</span>
                                                                <strong className="text-emerald-600 font-bold">{formatTime(p.entrada_hora)}</strong>
                                                            </p>
                                                        </div>
                                                        {p.metadata?.accuracy && (
                                                            <p className="text-[10px] text-slate-400">
                                                                🎯 Precisão do GPS: {p.metadata.accuracy.toFixed(1)}m
                                                            </p>
                                                        )}
                                                        {p.metadata?.address && (
                                                            <p className="text-[10px] text-slate-400 leading-snug truncate max-w-[200px]" title={p.metadata.address}>
                                                                📍 {p.metadata.address}
                                                            </p>
                                                        )}
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        ))}
                                    </MapContainer>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default CollaboratorMap;
