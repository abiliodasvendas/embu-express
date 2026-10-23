import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ListSkeleton } from "@/components/skeletons";
import { Calendar, Edit2, Trash2, FileText, Wrench, Users, ChevronDown } from "lucide-react";
import { LancamentoConvenio } from "@/types/database";
import { cn } from "@/lib/utils";
import type { GroupedLancamento } from "@/hooks/ui/convenios";

interface PortalColaboradoresTabProps {
  isLoading: boolean;
  groups: GroupedLancamento[];
  expandedGroups: Record<string, boolean>;
  onToggleGroup: (name: string) => void;
  isConvenioAtivo: boolean;
  onEdit: (lancamento: LancamentoConvenio) => void;
  onDelete: (lancamento: LancamentoConvenio) => void;
  formatCurrency: (val: number) => string;
  formatLocalDate: (dateStr: string) => string;
}

export function PortalColaboradoresTab({
  isLoading,
  groups,
  expandedGroups,
  onToggleGroup,
  isConvenioAtivo,
  onEdit,
  onDelete,
  formatCurrency,
  formatLocalDate,
}: PortalColaboradoresTabProps) {
  if (isLoading) {
    return <ListSkeleton count={4} />;
  }

  if (groups.length === 0) {
    return (
      <Card className="rounded-[24px] border border-border bg-card shadow-xs text-center py-10 px-6">
        <div className="w-12 h-12 rounded-[16px] bg-muted/70 text-foreground border border-border mx-auto flex items-center justify-center mb-3">
          <FileText className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="font-bold text-sm sm:text-base text-foreground">Nenhum lançamento</h3>
        <p className="text-muted-foreground text-xs mt-1 leading-relaxed max-w-sm mx-auto">
          Você não realizou nenhum lançamento de manutenção neste mês de referência.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const isExpanded = !!expandedGroups[group.name];
        return (
          <Card
            key={group.name}
            className="rounded-[24px] border border-border bg-card shadow-xs overflow-hidden"
          >
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors select-none"
              onClick={() => onToggleGroup(group.name)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
                  {group.isFrota ? (
                    <Wrench className="h-5 w-5 text-foreground" />
                  ) : (
                    <Users className="h-5 w-5 text-foreground" />
                  )}
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-foreground break-words">
                    {group.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    {group.items.length} {group.items.length === 1 ? "lançamento" : "lançamentos"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-sm sm:text-base font-bold text-foreground">
                  {formatCurrency(group.total)}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )}
                />
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-border/50 bg-muted/10 divide-y divide-border/40 px-4 py-2">
                {group.items.map((l) => (
                  <div key={l.id} className="py-3.5 last:pb-2 first:pt-2 space-y-2 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatLocalDate(l.data_lancamento)}
                      </span>
                      <span className="font-bold text-sm text-foreground">
                        {formatCurrency(Number(l.valor))}
                      </span>
                    </div>

                    {group.isFrota && l.colaborador?.nome_completo && (
                      <div className="text-xs font-semibold text-foreground">
                        {l.colaborador.nome_completo}
                      </div>
                    )}

                    {l.descricao && (
                      <p className="text-xs text-muted-foreground leading-relaxed bg-muted/40 px-3 py-2 rounded-[14px] border border-border/40 text-left">
                        {l.descricao}
                      </p>
                    )}

                    {isConvenioAtivo && (
                      <div className="flex justify-end items-center gap-1 pt-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(l)}
                          className="h-8 w-8 rounded-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/70"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(l)}
                          className="h-8 w-8 rounded-[10px] text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
