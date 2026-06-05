import { useEffect, useState, useMemo, useCallback } from "react";
import { useLayout } from "@/hooks";
import { useTickets } from "@/hooks/api/useTickets";
import { useUpdateTicket } from "@/hooks/api/useTicketMutations";
import { usePermissions } from "@/hooks/business/usePermissions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Search, Plus, X, Bug, Lightbulb, HelpCircle, AlertTriangle, ArrowUpDown } from "lucide-react";
import { Ticket } from "@/types/database";
import { TicketType, TicketStatus, TicketPriority, TICKET_TYPE_LABELS, TICKET_PRIORITY_LABELS } from "@/types/enums";

type ColumnType = TicketStatus.OPEN | TicketStatus.IN_PROGRESS | TicketStatus.DONE;

export default function TicketsKanban() {
  const { setPageTitle, openCreateTicketDialog, openTicketDetailsDialog } = useLayout();
  const { data: tickets = [], isLoading, refetch } = useTickets();
  const updateMutation = useUpdateTicket();
  const { isAdmin, isSuperAdmin } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");

  const isUserAdmin = isAdmin || isSuperAdmin;

  useEffect(() => {
    setPageTitle("Suporte e Chamados");
  }, [setPageTitle]);

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleAdd = () => {
    openCreateTicketDialog({ ticketToEdit: null, onSuccess: refetch });
  };

  const handleCardClick = (ticketId: string) => {
    openTicketDetailsDialog({ ticketId, onSuccess: refetch });
  };

  const handleDragStart = (e: React.DragEvent, ticketId: string) => {
    if (!isUserAdmin) return;
    e.dataTransfer.setData("ticketId", ticketId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isUserAdmin) return;
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: ColumnType) => {
    if (!isUserAdmin) return;
    const ticketId = e.dataTransfer.getData("ticketId");
    if (!ticketId) return;

    const ticket = tickets.find((t) => t.id === ticketId);
    if (ticket && ticket.status !== newStatus) {
      await updateMutation.mutateAsync({
        id: ticketId,
        data: { status: newStatus },
      });
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchTitle = t.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDesc = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchTitle || matchDesc;
    });
  }, [tickets, searchTerm]);

  const columns: { id: ColumnType; title: string; color: string; bg: string; border: string }[] = [
    {
      id: TicketStatus.OPEN,
      title: "Abertos",
      color: "text-blue-600",
      bg: "bg-blue-50/50",
      border: "border-blue-100",
    },
    {
      id: TicketStatus.IN_PROGRESS,
      title: "Em Andamento",
      color: "text-yellow-600",
      bg: "bg-yellow-50/50",
      border: "border-yellow-100",
    },
    {
      id: TicketStatus.DONE,
      title: "Concluídos",
      color: "text-green-600",
      bg: "bg-green-50/50",
      border: "border-green-100",
    },
  ];

  const ticketsByColumn = useMemo(() => {
    const map: Record<ColumnType, Ticket[]> = {
      [TicketStatus.OPEN]: [],
      [TicketStatus.IN_PROGRESS]: [],
      [TicketStatus.DONE]: [],
    };

    filteredTickets.forEach((t) => {
      if (t.status === TicketStatus.CANCELED) return;
      if (map[t.status as ColumnType]) {
        map[t.status as ColumnType].push(t);
      } else {
        map[TicketStatus.OPEN].push(t);
      }
    });

    return map;
  }, [filteredTickets]);

  const getTypeIcon = (type: TicketType) => {
    switch (type) {
      case TicketType.BUG:
        return <Bug className="w-3.5 h-3.5 text-red-500" />;
      case TicketType.FEATURE:
        return <Lightbulb className="w-3.5 h-3.5 text-green-500" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  const getPriorityBadgeClass = (priority: TicketPriority) => {
    switch (priority) {
      case TicketPriority.HIGH:
        return "bg-red-50 text-red-600 border-red-100";
      case TicketPriority.LOW:
        return "bg-slate-100 text-slate-500 border-slate-200";
      default:
        return "bg-blue-50 text-blue-600 border-blue-100";
    }
  };

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <div className="space-y-6">
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="px-0 space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por título ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-white border-gray-100 focus-visible:ring-blue-500/20 h-11 rounded-xl shadow-none font-medium"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <Button
                onClick={handleAdd}
                className="bg-blue-600 hover:bg-blue-700 h-11 rounded-xl gap-2 shadow-sm font-bold text-white transition-all active:scale-95 whitespace-nowrap w-full md:w-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Novo Chamado</span>
              </Button>
            </div>

            {isLoading ? (
              <ListSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map((col) => {
                  const colTickets = ticketsByColumn[col.id] || [];

                  return (
                    <div
                      key={col.id}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, col.id)}
                      className={`rounded-2xl border ${col.border} ${col.bg} p-4 flex flex-col min-h-[300px] md:min-h-[500px]`}
                    >
                      <div className="flex items-center justify-between mb-4 px-1 shrink-0">
                        <span className={`font-bold text-sm ${col.color}`}>{col.title}</span>
                        <Badge variant="outline" className={`border-none ${col.color} bg-white text-xs font-bold px-2 py-0.5 rounded-full shadow-none`}>
                          {colTickets.length}
                        </Badge>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-none">
                        {colTickets.length > 0 ? (
                          colTickets.map((t) => (
                            <div
                              key={t.id}
                              onClick={() => handleCardClick(t.id)}
                              draggable={isUserAdmin}
                              onDragStart={(e) => handleDragStart(e, t.id)}
                              className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer ${isUserAdmin ? "active:cursor-grabbing" : ""
                                }`}
                            >
                              <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-bold text-gray-900 text-xs line-clamp-2 leading-tight flex-1">
                                    {t.title}
                                  </h4>
                                  <div className="shrink-0 flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg text-[9px] font-bold text-gray-500">
                                    {getTypeIcon(t.type)}
                                    <span>{TICKET_TYPE_LABELS[t.type]}</span>
                                  </div>
                                </div>

                                <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                                  {t.description}
                                </p>

                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-50 text-[10px] text-gray-400">
                                  <span className="font-medium truncate max-w-[100px]">
                                    {t.author?.nome_completo ? `Por ${t.author.nome_completo.trim().split(" ")[0]}` : "Usuário"}
                                  </span>
                                  <Badge variant="outline" className={`text-[9px] font-bold uppercase ${getPriorityBadgeClass(t.priority)}`}>
                                    {TICKET_PRIORITY_LABELS[t.priority]}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center flex-1 py-8 text-center text-gray-400 text-xs font-medium border border-dashed border-gray-200/50 rounded-xl bg-white/20">
                            Nenhum chamado
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PullToRefreshWrapper>
  );
}
