import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton } from "@/components/skeletons";
import { Calendar, Edit2, Trash2, FileText } from "lucide-react";
import { LancamentoConvenio } from "@/types/database";

interface PortalRecentesTabProps {
  isLoading: boolean;
  lancamentos: LancamentoConvenio[];
  isConvenioAtivo: boolean;
  onEdit: (lancamento: LancamentoConvenio) => void;
  onDelete: (lancamento: LancamentoConvenio) => void;
  formatCurrency: (val: number) => string;
  formatLocalDate: (dateStr: string) => string;
}

export function PortalRecentesTab({
  isLoading,
  lancamentos,
  isConvenioAtivo,
  onEdit,
  onDelete,
  formatCurrency,
  formatLocalDate,
}: PortalRecentesTabProps) {
  if (isLoading) {
    return <ListSkeleton count={4} />;
  }

  if (lancamentos.length === 0) {
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
      {lancamentos.map((lancamento) => (
        <Card
          key={lancamento.id}
          className="rounded-[24px] border border-border bg-card shadow-xs hover:border-border/80 transition-colors"
        >
          <CardContent className="p-4 flex flex-col gap-2.5">
            <div className="flex justify-between items-start gap-2">
              <div className="space-y-1 text-left min-w-0">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatLocalDate(lancamento.data_lancamento)}
                </span>
                <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug truncate">
                  {lancamento.colaborador?.nome_completo || "Colaborador não cadastrado"}
                </h3>
                {lancamento.moto_embu && (
                  <div className="flex pt-0.5">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-semibold rounded-[10px] border-border bg-muted/50 text-foreground"
                    >
                      Veículo Embu Express
                    </Badge>
                  </div>
                )}
              </div>
              <span className="font-bold text-base sm:text-lg text-foreground shrink-0">
                {formatCurrency(Number(lancamento.valor))}
              </span>
            </div>

            {lancamento.descricao && (
              <p className="text-xs text-muted-foreground leading-relaxed bg-muted/40 px-3 py-2 rounded-[14px] border border-border/40 text-left">
                {lancamento.descricao}
              </p>
            )}

            {isConvenioAtivo && (
              <div className="flex justify-end items-center gap-1 pt-1 border-t border-border/40">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(lancamento)}
                  className="h-8 w-8 rounded-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/70"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(lancamento)}
                  className="h-8 w-8 rounded-[10px] text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
