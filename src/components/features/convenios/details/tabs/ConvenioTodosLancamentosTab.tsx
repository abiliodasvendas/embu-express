import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LancamentoConvenio } from "@/types/database";
import { formatCurrency } from "@/utils/formatters/currency";
import { Edit2, FileText, Trash2 } from "lucide-react";

interface ConvenioTodosLancamentosTabProps {
  lancamentos: LancamentoConvenio[];
  canEdit: boolean;
  onEdit: (lancamento: LancamentoConvenio) => void;
  onDelete: (lancamento: LancamentoConvenio) => void;
}

export function ConvenioTodosLancamentosTab({
  lancamentos,
  canEdit,
  onEdit,
  onDelete,
}: ConvenioTodosLancamentosTabProps) {
  const formatLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.substring(0, 10).split("-");
    return `${day}/${month}/${year}`;
  };

  if (lancamentos.length === 0) {
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
    <div className="border border-border shadow-xs bg-card rounded-[24px] overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-b border-border hover:bg-transparent text-left">
              <TableHead className="py-3 pl-4 w-[100px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Data
              </TableHead>
              <TableHead className="py-3 w-[220px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Colaborador
              </TableHead>
              <TableHead className="py-3 w-[120px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Valor
              </TableHead>
              <TableHead className="py-3 pr-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Descrição
              </TableHead>
              {canEdit && (
                <TableHead className="py-3 text-right pr-4 w-[90px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Ações
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/60 text-xs">
            {lancamentos.map((l) => (
              <TableRow
                key={l.id}
                className="hover:bg-primary/[0.04] active:bg-primary/[0.08] transition-colors duration-150"
              >
                <TableCell className="py-3 pl-4 font-medium text-muted-foreground whitespace-nowrap">
                  {formatLocalDate(l.data_lancamento)}
                </TableCell>
                <TableCell className="py-3 pr-2 font-bold text-foreground whitespace-nowrap text-left">
                  <div
                    className="flex flex-col gap-0.5 truncate max-w-[200px]"
                    title={l.colaborador?.nome_completo}
                  >
                    <span className="truncate">
                      {l.colaborador?.nome_completo || "Desconhecido"}
                    </span>
                    {l.moto_embu && (
                      <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider truncate">
                        Veículo Embu Express
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-3 font-bold text-foreground whitespace-nowrap">
                  {formatCurrency(Number(l.valor))}
                </TableCell>
                <TableCell className="py-3 pr-2 text-muted-foreground font-medium break-words whitespace-normal text-left">
                  {l.descricao || <span className="text-muted-foreground/50">—</span>}
                </TableCell>
                {canEdit && (
                  <TableCell className="py-3 pr-4 text-right whitespace-nowrap">
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
  );
}
