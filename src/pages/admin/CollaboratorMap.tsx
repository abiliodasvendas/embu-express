import { useEffect, useState, useMemo, useRef } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { PeriodSelectorToolbar } from "@/components/common/PeriodSelectorToolbar";
import { useActiveCollaborators, useCollaboratorMap } from "@/hooks";
import { useHierarchyFilters, useDateFilters } from "@/hooks/ui/useFilters";
import { FilterOptions } from "@/types/enums";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Calendar, HelpCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatTime } from "@/utils/ponto";
import { cn } from "@/lib/utils";

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

interface PontoMapaItem {
  id: number;
  data_referencia: string;
  entrada_hora: string;
  lat: number;
  lng: number;
  metadata?: {
    address?: string;
    accuracy?: number;
  } | null;
  detalhes_calculo?: {
    entrada?: {
      turno_base?: string | null;
    } | null;
  } | null;
}

interface TurnoMapaItem {
  colaborador_cliente_id: number;
  nome_fantasia_cliente: string;
  nome_unidade: string;
  unidade_latitude?: number | null;
  unidade_longitude?: number | null;
  pontos: PontoMapaItem[];
}

function RecenterMap({
  coords,
  points,
  selectedPoint,
}: {
  coords: [number, number] | null;
  points: [number, number][];
  selectedPoint: { lat: number; lng: number; id: number } | null;
}) {
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
  const markerRefs = useRef<{ [key: number]: L.Marker | null }>({});

  const { selectedUsuario, setSelectedUsuario } = useHierarchyFilters({
    usuarioParam: "usuario",
    syncWithUrl: true,
  });

  const { selectedMes, setSelectedMes, selectedAno, setSelectedAno } = useDateFilters({
    mesParam: "mes",
    anoParam: "ano",
    syncWithUrl: true,
  });

  const { data: collaborators = [] } = useActiveCollaborators();
  const usuarioId = selectedUsuario === FilterOptions.TODOS ? undefined : selectedUsuario;

  const { data: rawTurnos = [], isLoading } = useCollaboratorMap(
    usuarioId,
    selectedMes,
    selectedAno
  );

  const turnos = rawTurnos as TurnoMapaItem[];
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
    return turnos.find((t) => String(t.colaborador_cliente_id) === activeTab) || null;
  }, [turnos, activeTab]);

  const pontosOrdenados = useMemo(() => {
    if (!activeTurno) return [];
    return [...activeTurno.pontos].sort(
      (a, b) => new Date(b.data_referencia).getTime() - new Date(a.data_referencia).getTime()
    );
  }, [activeTurno]);

  const mapCenterAndPoints = useMemo(() => {
    if (!activeTurno) return { center: null, points: [] };

    const center: [number, number] | null =
      activeTurno.unidade_latitude && activeTurno.unidade_longitude
        ? [activeTurno.unidade_latitude, activeTurno.unidade_longitude]
        : null;

    const points: [number, number][] = activeTurno.pontos
      .filter((p) => p.lat && p.lng)
      .map((p) => [p.lat, p.lng] as [number, number]);

    return { center, points };
  }, [activeTurno]);

  const escalaEntrada = useMemo(() => {
    if (!activeTurno || !activeTurno.pontos.length) return null;
    const pontoComTurno = activeTurno.pontos.find((p) => p.detalhes_calculo?.entrada?.turno_base);
    const base = pontoComTurno?.detalhes_calculo?.entrada?.turno_base;
    return base && typeof base === "string" ? base.substring(0, 5) : base || null;
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
        <div className="rounded-[24px] border border-border bg-card p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-[16px] bg-muted/70 border border-border text-foreground flex items-center justify-center">
            <MapPin className="h-6 w-6" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-base font-semibold text-foreground">Selecione um Colaborador</h3>
            <p className="text-xs text-muted-foreground">
              Escolha um colaborador e o período nos filtros acima para visualizar o mapa com os pontos registrados no mês.
            </p>
          </div>
        </div>
      ) : isLoading ? (
        <div className="rounded-[24px] border border-border bg-card p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
          <Loader2 className="h-8 w-8 text-foreground animate-spin" />
          <p className="text-xs font-medium text-muted-foreground">Carregando dados de geolocalização...</p>
        </div>
      ) : turnos.length === 0 ? (
        <div className="rounded-[24px] border border-border bg-card p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-[16px] bg-muted/70 border border-border text-muted-foreground flex items-center justify-center">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-base font-semibold text-foreground">Nenhuma Geolocalização Registrada</h3>
            <p className="text-xs text-muted-foreground">
              Nenhum ponto registrado por GPS foi encontrado para este colaborador no período selecionado.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex bg-muted/50 p-1 rounded-[16px] border border-border overflow-x-auto gap-1">
            {turnos.map((t) => (
              <button
                key={t.colaborador_cliente_id}
                onClick={() => setActiveTab(String(t.colaborador_cliente_id))}
                className={cn(
                  "px-4 py-2 font-semibold text-xs transition-all rounded-[12px] whitespace-nowrap cursor-pointer",
                  activeTab === String(t.colaborador_cliente_id)
                    ? "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.nome_fantasia_cliente} - {t.nome_unidade}
              </button>
            ))}
          </div>

          {activeTurno && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="rounded-[20px] sm:rounded-[24px] border border-border bg-card shadow-xs lg:col-span-1 flex flex-col h-[520px] overflow-hidden">
                <div className="border-b border-border/60 p-4">
                  <h4 className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Registros do Mês ({activeTurno.pontos.length})
                  </h4>
                </div>
                <div className="p-2 overflow-y-auto flex-1 space-y-1 divide-y divide-border/40">
                  {pontosOrdenados.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedPoint({ lat: p.lat, lng: p.lng, id: p.id });
                        const marker = markerRefs.current[p.id];
                        if (marker) {
                          marker.openPopup();
                        }
                      }}
                      className={cn(
                        "p-2.5 rounded-[14px] transition-colors flex justify-between items-center text-xs cursor-pointer border border-transparent",
                        selectedPoint?.id === p.id
                          ? "bg-muted/80 border-border font-semibold text-foreground"
                          : "hover:bg-muted/40 text-foreground"
                      )}
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold text-foreground block truncate">
                          {format(new Date(p.data_referencia + "T12:00:00"), "dd/MM (EEEE)", { locale: ptBR })}
                        </span>
                        {p.metadata?.address && (
                          <p className="text-[10px] text-muted-foreground truncate max-w-[150px]" title={p.metadata.address}>
                            {p.metadata.address}
                          </p>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded-[8px] bg-muted/70 text-foreground border border-border text-xs font-mono font-semibold shrink-0">
                        {formatTime(p.entrada_hora)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[20px] sm:rounded-[24px] border border-border bg-card shadow-xs lg:col-span-3 overflow-hidden h-[520px] flex flex-col">
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
                        <Popup className="rounded-[16px] overflow-hidden font-sans">
                          <div className="p-1 space-y-1">
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Unidade Oficial</span>
                            <h4 className="font-bold text-foreground text-sm mt-0.5">{activeTurno.nome_unidade}</h4>
                            <p className="text-xs text-muted-foreground font-medium">{activeTurno.nome_fantasia_cliente}</p>
                            {escalaEntrada && (
                              <p className="text-xs text-foreground mt-2 pt-1.5 border-t border-border font-medium flex justify-between gap-4 font-mono">
                                <span className="text-muted-foreground">Horário de Entrada:</span>
                                <span className="font-semibold">{escalaEntrada}</span>
                              </p>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    )}

                    {activeTurno.pontos.map((p) => (
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
                        <Popup className="rounded-[16px] overflow-hidden font-sans">
                          <div className="p-1 space-y-1">
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Registro de Ponto</span>
                            <h4 className="font-bold text-foreground text-sm">
                              {format(new Date(p.data_referencia + "T12:00:00"), "dd 'de' MMMM", { locale: ptBR })}
                            </h4>
                            <div className="text-xs space-y-1 py-1 border-t border-b border-border my-1 font-mono">
                              <p className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Escala:</span>
                                <strong className="text-foreground">
                                  {p.detalhes_calculo?.entrada?.turno_base && typeof p.detalhes_calculo.entrada.turno_base === "string"
                                    ? p.detalhes_calculo.entrada.turno_base.substring(0, 5)
                                    : p.detalhes_calculo?.entrada?.turno_base || "Não planejado"}
                                </strong>
                              </p>
                              <p className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Real:</span>
                                <strong className="text-foreground font-bold">{formatTime(p.entrada_hora)}</strong>
                              </p>
                            </div>
                            {p.metadata?.accuracy && (
                              <p className="text-[10px] text-muted-foreground">
                                Precisão GPS: {p.metadata.accuracy.toFixed(1)}m
                              </p>
                            )}
                            {p.metadata?.address && (
                              <p className="text-[10px] text-muted-foreground leading-snug truncate max-w-[200px]" title={p.metadata.address}>
                                {p.metadata.address}
                              </p>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CollaboratorMap;
