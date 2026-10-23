import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { LancamentoConvenio } from "@/types/database";
import { formatCurrency } from "@/utils/formatters/currency";
import { ChevronDown, Edit2, FileText, Trash2, Users, Wrench } from "lucide-react";
import { GroupedLancamento } from "@/hooks/ui/convenios/useConvenioDetailsViewModel";

interface ConvenioPorColaboradorTabProps {
  groupedLancamentos: GroupedLancamento[];
  expandedGroups: Record<string, boolean>;
  onToggleGroup: (groupName: string) => void;
  canEdit: boolean;
  onEdit: (lancamento: LancamentoConvenio) => void;
  onDelete: (lancamento: LancamentoConvenio) => void;
}

export function ConvenioPorColaboradorTab({
  groupedLancamentos,
  expandedGroups,
  onToggleGroup,
  canEdit,
  onEdit,
  onDelete,
}: ConvenioPorColaboradorTabProps) {
  const formatLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.substring(0, 10).split("-");
    return `${day}/${month}/${year}`;
  };

  if (groupedLancamentos.length === 0) {
    return (
      <div className="text-center py-16 bg-card rounded-[24px] border border-dashed border-border">
        <div className="bg-muted/70 h-16 w-16 rounded-[16px] flex items-center justify-center mx-auto mb-4 border border-border">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-base font-bold text-foreground">
          Nenhum lançamento no período
        </h3>
        <p className="text-muted-foreground mt-1 max-w-xs mx-auto text-xs">
          Não há registros para este convênio no mês selecionado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groupedLancamentos.map((group) => {
        const isExpanded = Boolean(expandedGroups[group.name]);
        return (
          <div
            key={group.name}
            className="border border-border shadow-xs bg-card rounded-[24px] overflow-hidden"
          >
            <div
              className="p-5 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors select-none"
              onClick={() => onToggleGroup(group.name)}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-muted/70 rounded-[14px] text-foreground border border-border flex items-center justify-center shrink-0">
                  {group.isFrota ? (
                    <Wrench className="h-5 w-5" />
                  ) : (
                    <Users className="h-5 w-5" />
                  )}
                </div>
                <div className="text-left">
                  <h4 className="text-base font-bold text-foreground">
                    {group.name}
                  </h4>
                  <p className="text-xs text-muted-foreground font-medium">
                    {group.items.length}{" "}
                    {group.items.length === 1 ? "lançamento" : "lançamentos"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-base font-bold text-foreground">
                  {formatCurrency(group.total)}
                </span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )}
                />
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-border bg-muted/10 px-5 py-4">
                <div className="overflow-x-auto pb-2">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow className="border-b border-border hover:bg-transparent text-left">
                        <TableHead className="py-3 pl-2 w-[100px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Data
                        </TableHead>
                        {group.isFrota && (
                          <TableHead className="py-3 pl-2 w-[220px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Colaborador
                          </TableHead>
                        )}
                        <TableHead className="py-3 w-[110px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Valor
                        </TableHead>
                        <TableHead className="py-3 pr-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Descrição
                        </TableHead>
                        {canEdit && (
                          <TableHead className="py-3 text-right pr-2 w-[90px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Ações
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border/60 text-xs">
                      {group.items.map((l) => (
                        <TableRow
                          key={l.id}
                          className="hover:bg-primary/[0.04] active:bg-primary/[0.08] transition-colors duration-150"
                        >
                          <TableCell className="py-3 pl-2 font-medium text-muted-foreground whitespace-nowrap">
                            {formatLocalDate(l.data_lancamento)}
                          </TableCell>
                          {group.isFrota && (
                            <TableCell className="py-3 pl-2 pr-2 font-bold text-foreground whitespace-nowrap text-left">
                              <div
                                className="truncate max-w-[200px]"
                                title={l.colaborador?.nome_completo}
                              >
                                {l.colaborador?.nome_completo || "Desconhecido"}
                              </div>
                            </TableCell>
                          )}
                          <TableCell className="py-3 font-bold text-foreground whitespace-nowrap">
                            {formatCurrency(Number(l.valor))}
                          </TableCell>
                          <TableCell className="py-3 pr-2 text-muted-foreground font-medium break-words whitespace-normal text-left">
                            {l.descricao || <span className="text-muted-foreground/50">—</span>}
                          </TableCell>
                          {canEdit && (
                            <TableCell className="py-3 pr-2 text-right whitespace-nowrap">
                              <div className="flex justify-end gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-[10px] text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                                  onClick={() => onEdit(l)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-[10px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                  onClick={() => onDelete(l)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
