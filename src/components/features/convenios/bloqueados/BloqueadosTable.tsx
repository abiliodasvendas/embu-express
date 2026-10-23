import { Calendar, ExternalLink, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ColabBloqueioItem } from "@/hooks/ui/convenios/useConveniosBloqueadosViewModel";

interface BloqueadosTableProps {
  paginados: ColabBloqueioItem[];
  onNavigateToColaborador: (id: string) => void;
  onAjustar: (id: string, nome: string) => void;
}

export function BloqueadosTable({
  paginados,
  onNavigateToColaborador,
  onAjustar,
}: BloqueadosTableProps) {
  return (
    <div className="rounded-[24px] border border-border overflow-hidden bg-card shadow-xs">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="border-b border-border hover:bg-transparent text-left">
            <TableHead className="py-3.5 pl-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Colaborador
            </TableHead>
            <TableHead className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Abrangência
            </TableHead>
            <TableHead className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Restrições Ativas
            </TableHead>
            <TableHead className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Motivo Registrado
            </TableHead>
            <TableHead className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Data
            </TableHead>
            <TableHead className="px-6 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border/60 text-sm">
          {paginados.map((item) => (
            <TableRow
              key={item.colaborador_id}
              className="hover:bg-primary/[0.04] active:bg-primary/[0.08] transition-colors duration-150"
            >
              <TableCell className="py-4 pl-6 align-middle">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-foreground">{item.nome_completo}</p>
                  <button
                    onClick={() => onNavigateToColaborador(item.colaborador_id)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-0.5 inline-flex items-center"
                    title="Ver perfil do colaborador"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </TableCell>
              <TableCell className="px-5 py-4 align-middle">
                {item.bloqueio_geral ? (
                  <Badge
                    variant="secondary"
                    className="bg-destructive/10 text-destructive border-destructive/20 font-bold text-xs rounded-[18px]"
                  >
                    Geral (Todas)
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-muted text-foreground border-border font-bold text-xs rounded-[18px]"
                  >
                    Parcial ({item.convenios_especificos.length})
                  </Badge>
                )}
              </TableCell>
              <TableCell className="px-5 py-4 align-middle max-w-xs">
                {item.bloqueio_geral ? (
                  <span className="text-xs text-muted-foreground">Todos os convênios</span>
                ) : item.convenios_especificos.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {item.convenios_especificos.map((c) => (
                      <Badge
                        key={c.id}
                        variant="outline"
                        className="text-[11px] font-medium border-border text-foreground rounded-[18px]"
                      >
                        {c.nome}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="px-5 py-4 align-middle max-w-xs text-xs text-muted-foreground truncate">
                {item.motivo ? (
                  <span title={item.motivo} className="italic">
                    &ldquo;{item.motivo}&rdquo;
                  </span>
                ) : (
                  <span className="text-muted-foreground/60">Não informado</span>
                )}
              </TableCell>
              <TableCell className="px-5 py-4 align-middle text-xs text-muted-foreground whitespace-nowrap">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{new Date(item.criado_em).toLocaleDateString("pt-BR")}</span>
                  </div>
                  {item.criado_por_nome && (
                    <span className="text-[11px] text-muted-foreground/80 pl-5">
                      por {item.criado_por_nome}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="px-6 py-4 text-right align-middle whitespace-nowrap">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    className="h-8 px-3 rounded-[12px] text-xs bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shadow-xs"
                    onClick={() => onAjustar(item.colaborador_id, item.nome_completo)}
                  >
                    <Settings2 className="h-3.5 w-3.5 mr-1" />
                    Ajustar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
