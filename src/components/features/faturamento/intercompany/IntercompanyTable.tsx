import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/skeletons";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { cn } from "@/lib/utils";
import { TransferenciaIntercompany } from "@/types/database";
import { STATUS_INTERCOMPANY } from "@/constants/financeiro.constants";
import { formatDateToBR } from "@/utils/formatters/date";
import { formatCurrency } from "@/utils/formatters/currency";
import { ArrowRightLeft } from "lucide-react";
import { IntercompanyToolbar } from "./IntercompanyToolbar";

interface IntercompanyTableProps {
  transferencias: TransferenciaIntercompany[];
  isLoading: boolean;
  isFetching: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  sortKey: string;
  sortDirection: "asc" | "desc";
  onSort: (key: string) => void;
  onRegistrarAcerto: (transferencia: TransferenciaIntercompany) => void;
  canEdit?: boolean;
}

export function IntercompanyTable({
  transferencias,
  isLoading,
  isFetching,
  search,
  onSearchChange,
  onClearSearch,
  sortKey,
  sortDirection,
  onSort,
  onRegistrarAcerto,
  canEdit = true,
}: IntercompanyTableProps) {
  if (isLoading) {
    return <TableSkeleton cols={7} rows={4} />;
  }

  if (transferencias.length === 0) {
    return (
      <div className="rounded-[24px] border border-border bg-card shadow-xs p-8">
        <UnifiedEmptyState
          icon={ArrowRightLeft}
          title="Nenhum acerto entre empresas encontrado"
          description={
            search
              ? `Nenhuma transferência encontrada para "${search}".`
              : "Nenhum acerto entre empresas registrado."
          }
          action={
            search
              ? { label: "Limpar busca", onClick: onClearSearch }
              : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <IntercompanyToolbar
        searchIntercompany={search}
        onSearchChange={onSearchChange}
      />

      <div className="hidden md:block relative rounded-[24px] border border-border overflow-hidden bg-card shadow-xs">
        {isFetching && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-surface-alt overflow-hidden z-20">
            <div className="h-full bg-primary w-full animate-pulse" />
          </div>
        )}
        <div
          className={cn(
            "overflow-x-auto transition-opacity duration-200",
            isFetching && "opacity-50 pointer-events-none"
          )}
        >
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-alt/60">
              <tr className="border-b border-border text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                <SortableHeader
                  label="Data Origem"
                  sortKey="data_fato_gerador"
                  currentKey={sortKey}
                  direction={sortDirection}
                  onSort={onSort}
                />
                <SortableHeader
                  label="Empresa Devedora"
                  sortKey="empresa_devedora"
                  currentKey={sortKey}
                  direction={sortDirection}
                  onSort={onSort}
                />
                <SortableHeader
                  label="Empresa Credora"
                  sortKey="empresa_credora"
                  currentKey={sortKey}
                  direction={sortDirection}
                  onSort={onSort}
                />
                <th className="py-3 px-4 font-semibold">Motivo / Descrição</th>
                <SortableHeader
                  label="Valor Mútuo"
                  sortKey="valor"
                  currentKey={sortKey}
                  direction={sortDirection}
                  onSort={onSort}
                  align="right"
                />
                <SortableHeader
                  label="Status"
                  sortKey="status"
                  currentKey={sortKey}
                  direction={sortDirection}
                  onSort={onSort}
                  align="center"
                />
                <th className="py-3 px-4 text-center font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {transferencias.map((t) => (
                <tr key={t.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap font-medium">
                    {formatDateToBR(t.data_fato_gerador)}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-foreground/80 whitespace-nowrap">
                    {t.empresa_devedora?.nome_fantasia || "Empresa"}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-foreground/80 whitespace-nowrap">
                    {t.empresa_credora?.nome_fantasia || "Empresa"}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-sm text-foreground block max-w-xs truncate">
                      {t.observacao || "Repasse de recebimento de cliente"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-foreground text-xs sm:text-sm tabular-nums whitespace-nowrap">
                    {formatCurrency(t.valor)}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {t.status === STATUS_INTERCOMPANY.COMPENSADO ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-medium px-2.5 py-0.5 rounded-[18px]"
                      >
                        Acertado {t.data_acerto ? `(${formatDateToBR(t.data_acerto)})` : ""}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-[11px] font-medium px-2.5 py-0.5 rounded-[18px]"
                      >
                        Pendente Acerto
                      </Badge>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {canEdit && t.status === STATUS_INTERCOMPANY.PENDENTE_ACERTO ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 rounded-[18px] px-3 text-xs font-medium border-border hover:bg-muted text-foreground"
                        onClick={() => onRegistrarAcerto(t)}
                      >
                        Registrar Acerto
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {transferencias.map((t) => (
          <div
            key={t.id}
            className="bg-card rounded-[24px] border border-border p-4 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <h4 className="font-bold text-sm text-foreground truncate">
                  {t.observacao || "Repasse entre empresas"}
                </h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                  <span className="font-medium text-foreground/80">
                    De: {t.empresa_devedora?.nome_fantasia || "Empresa"}
                  </span>
                  <span>➔</span>
                  <span className="font-medium text-foreground/80">
                    Para: {t.empresa_credora?.nome_fantasia || "Empresa"}
                  </span>
                </div>
              </div>
              <div className="shrink-0">
                {t.status === STATUS_INTERCOMPANY.COMPENSADO ? (
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-medium px-2.5 py-0.5 rounded-[18px]"
                  >
                    Acertado
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-[11px] font-medium px-2.5 py-0.5 rounded-[18px]"
                  >
                    Pendente
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
              <div>
                <span className="text-[11px] text-muted-foreground block">Data Origem</span>
                <span className="font-medium text-foreground">
                  {formatDateToBR(t.data_fato_gerador)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-muted-foreground block">Valor Mútuo</span>
                <span className="font-semibold text-foreground text-xs tabular-nums">
                  {formatCurrency(t.valor)}
                </span>
              </div>
            </div>

            {canEdit && t.status === STATUS_INTERCOMPANY.PENDENTE_ACERTO && (
              <div className="pt-2 border-t border-border flex items-center justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-[18px] px-3 text-xs font-medium border-border hover:bg-muted text-foreground"
                  onClick={() => onRegistrarAcerto(t)}
                >
                  Registrar Acerto
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
