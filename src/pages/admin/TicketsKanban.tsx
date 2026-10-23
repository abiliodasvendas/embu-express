import { useEffect, useState, useMemo, useCallback } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { useTickets } from "@/hooks/api/useTickets";
import { useUpdateTicket } from "@/hooks/api/useTicketMutations";
import { usePermissions } from "@/hooks/business/usePermissions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { NativeSelect } from "@/components/ui/native-select";
import { Tabs, TabsBadge, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Plus, X, Bug, Lightbulb, HelpCircle, Loader2, LifeBuoy } from "lucide-react";
import { Ticket } from "@/types/database";
import { TicketType, TicketStatus, TicketPriority, TICKET_TYPE_LABELS, TICKET_PRIORITY_LABELS } from "@/types/enums";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

type ColumnType = TicketStatus.OPEN | TicketStatus.IN_PROGRESS | TicketStatus.DONE;

export default function TicketsKanban() {
  const { setPageTitle, openCreateTicketDialog, openTicketDetailsDialog } = useLayout();
  const { data: tickets = [], isLoading, isFetching, refetch } = useTickets();
  const isInitialLoading = isLoading && !tickets.length;
  const updateMutation = useUpdateTicket();
  const { isAdmin, isSuperAdmin } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<TicketType | "ALL">("ALL");
  const [activeMobileColumn, setActiveMobileColumn] = useState<ColumnType>(TicketStatus.OPEN);

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
      const matchSearch =
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
      const matchType = typeFilter === "ALL" || t.type === typeFilter;

      return matchSearch && matchPriority && matchType;
    });
  }, [tickets, searchTerm, priorityFilter, typeFilter]);

  const columns: { id: ColumnType; title: string }[] = [
    {
      id: TicketStatus.OPEN,
      title: "Abertos",
    },
    {
      id: TicketStatus.IN_PROGRESS,
      title: "Em Andamento",
    },
    {
      id: TicketStatus.DONE,
      title: "Concluídos",
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
        return <Bug className="w-3.5 h-3.5 text-foreground" />;
      case TicketType.FEATURE:
        return <Lightbulb className="w-3.5 h-3.5 text-foreground" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-foreground" />;
    }
  };

  const renderTicketCard = (t: Ticket) => (
    <div
      key={t.id}
      onClick={() => handleCardClick(t.id)}
      draggable={isUserAdmin}
      onDragStart={(e) => handleDragStart(e, t.id)}
      className={cn(
        "bg-card rounded-[18px] shadow-xs border border-border p-4 hover:border-border/80 hover:shadow-sm transition-all cursor-pointer space-y-3 text-left",
        isUserAdmin && "active:cursor-grabbing"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-bold text-foreground text-xs sm:text-sm line-clamp-2 leading-snug flex-1">
          {t.title}
        </h4>
        <div className="shrink-0 flex items-center gap-1.5 bg-muted/60 px-2 py-1 rounded-[10px] text-[10px] font-semibold text-foreground border border-border/40">
          {getTypeIcon(t.type)}
          <span>{TICKET_TYPE_LABELS[t.type]}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
        {t.description}
      </p>

      <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-border/40 text-[10px] text-muted-foreground">
        <span className="font-medium truncate max-w-[150px]">
          {`${t.author.nome_completo.trim().split(" ")[0]} • `}
          {t.created_at ? format(new Date(t.created_at), "dd/MM HH:mm", { locale: ptBR }) : ""}
        </span>
        <Badge
          variant="secondary"
          className={cn(
            "text-[9px] font-bold uppercase tracking-wider rounded-[8px] px-2 py-0.5",
            t.priority === TicketPriority.HIGH
              ? "bg-destructive/10 text-destructive border-destructive/20"
              : "bg-muted text-muted-foreground border-border"
          )}
        >
          {TICKET_PRIORITY_LABELS[t.priority]}
        </Badge>
      </div>
    </div>
  );

  const renderColumnContent = (colId: ColumnType, title: string) => {
    const colTickets = ticketsByColumn[colId] || [];

    return (
      <div
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, colId)}
        className={cn(
          "rounded-[24px] border border-border bg-card shadow-xs p-4 flex flex-col min-h-[350px] md:min-h-[520px] transition-all duration-200",
          updateMutation.isPending && "opacity-60 pointer-events-none"
        )}
      >
        <div className="flex items-center justify-between mb-4 px-1 shrink-0">
          <span className="font-bold text-sm text-foreground">{title}</span>
          <div className="flex items-center gap-1.5">
            {updateMutation.isPending && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            )}
            <Badge
              variant="secondary"
              className="bg-muted text-foreground border border-border text-xs font-bold px-2 py-0.5 rounded-full shadow-none"
            >
              {colTickets.length}
            </Badge>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {colTickets.length > 0 ? (
            colTickets.map(renderTicketCard)
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 py-12 text-center text-muted-foreground text-xs font-medium border border-dashed border-border/80 rounded-[18px] bg-muted/20">
              Nenhum chamado
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Suporte e Chamados
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Acompanhe e gerencie solicitações, dúvidas e melhorias do sistema
              </p>
            </div>
          </div>

          <Button
            onClick={handleAdd}
            className="h-11 rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-4 gap-2 shadow-xs transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Chamado</span>
          </Button>
        </div>

        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="px-0 space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Buscar por título ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 rounded-[18px] bg-card border-border shadow-xs text-xs sm:text-sm font-normal focus:bg-white focus:border-primary placeholder:text-muted-foreground"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="w-full sm:w-44 shrink-0">
                <NativeSelect
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as TicketType | "ALL")}
                  className="h-11 rounded-[18px] bg-card border-border shadow-xs text-xs sm:text-sm font-semibold"
                >
                  <option value="ALL">Todos os Tipos</option>
                  <option value={TicketType.BUG}>{TICKET_TYPE_LABELS[TicketType.BUG]}</option>
                  <option value={TicketType.FEATURE}>{TICKET_TYPE_LABELS[TicketType.FEATURE]}</option>
                  <option value={TicketType.IMPROVEMENT}>{TICKET_TYPE_LABELS[TicketType.IMPROVEMENT]}</option>
                </NativeSelect>
              </div>

              <div className="w-full sm:w-44 shrink-0">
                <NativeSelect
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | "ALL")}
                  className="h-11 rounded-[18px] bg-card border-border shadow-xs text-xs sm:text-sm font-semibold"
                >
                  <option value="ALL">Todas Prioridades</option>
                  <option value={TicketPriority.LOW}>{TICKET_PRIORITY_LABELS[TicketPriority.LOW]}</option>
                  <option value={TicketPriority.MEDIUM}>{TICKET_PRIORITY_LABELS[TicketPriority.MEDIUM]}</option>
                  <option value={TicketPriority.HIGH}>{TICKET_PRIORITY_LABELS[TicketPriority.HIGH]}</option>
                </NativeSelect>
              </div>
            </div>

            {isInitialLoading ? (
              <>
                <div className="hidden md:grid md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((colIndex) => (
                    <div
                      key={colIndex}
                      className="rounded-[24px] border border-border bg-card shadow-xs p-4 flex flex-col min-h-[520px] space-y-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Skeleton className="h-4 w-28 rounded-[6px] bg-muted/70" />
                        <Skeleton className="h-5 w-8 rounded-full bg-muted/50" />
                      </div>
                      {[1, 2, 3].map((cardIndex) => (
                        <div key={cardIndex} className="rounded-[18px] border border-border p-4 space-y-3">
                          <Skeleton className="h-4 w-3/4 rounded-[6px] bg-muted/70" />
                          <Skeleton className="h-3 w-full rounded-[6px] bg-muted/50" />
                          <Skeleton className="h-3 w-1/2 rounded-[6px] bg-muted/40" />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="block md:hidden space-y-4">
                  <Skeleton className="h-11 rounded-[18px] bg-muted/60 w-full" />
                  <ListSkeleton count={4} />
                </div>
              </>
            ) : (
              <>
                <div className="block md:hidden">
                  <Tabs
                    value={activeMobileColumn}
                    onValueChange={(val) => setActiveMobileColumn(val as ColumnType)}
                    className="w-full space-y-4"
                  >
                    <TabsList className="bg-muted/50 p-1 rounded-[18px] border border-border/40 w-full gap-1 flex">
                      {columns.map((col) => {
                        const count = ticketsByColumn[col.id]?.length || 0;
                        return (
                          <TabsTrigger
                            key={col.id}
                            value={col.id}
                            className="rounded-[14px] font-semibold text-xs py-1.5 px-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs text-muted-foreground hover:text-foreground flex-1 flex items-center justify-center gap-1.5 transition-all"
                          >
                            <span>{col.title}</span>
                            <TabsBadge>
                              {count}
                            </TabsBadge>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>

                    {columns.map((col) => (
                      <TabsContent key={col.id} value={col.id} className="mt-0">
                        {renderColumnContent(col.id, col.title)}
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>

                <div className="hidden md:grid md:grid-cols-3 gap-6">
                  {columns.map((col) => (
                    <div key={col.id}>{renderColumnContent(col.id, col.title)}</div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PullToRefreshWrapper>
  );
}
