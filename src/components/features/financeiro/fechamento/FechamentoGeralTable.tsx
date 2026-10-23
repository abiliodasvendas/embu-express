import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListSkeleton } from "@/components/skeletons";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { StatusGeralFechamento } from "@/services/api/financeiro.api";
import { cn } from "@/lib/utils";
import { Wallet, Eye } from "lucide-react";

interface FechamentoGeralTableProps {
  colaboradores: StatusGeralFechamento[];
  isLoading: boolean;
  hasData: boolean;
  onSelectColaborador: (colaboradorId: string) => void;
}

export function FechamentoGeralTable({
  colaboradores,
  isLoading,
  hasData,
  onSelectColaborador,
}: FechamentoGeralTableProps) {
  if (isLoading && !hasData) {
    return <ListSkeleton />;
  }

  if (colaboradores.length === 0) {
    return (
      <UnifiedEmptyState
        icon={Wallet}
        title="Nenhum colaborador localizado"
        description="Não encontramos nenhum registro com os filtros selecionados para o período."
      />
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute -top-3 left-0 right-0 h-1 bg-surface-alt overflow-hidden rounded-full z-20">
          <div className="h-full bg-primary w-full animate-pulse" />
        </div>
      )}
      <div
        className={cn(
          "transition-opacity duration-200",
          isLoading && "opacity-60 pointer-events-none",
        )}
      >
        <ResponsiveDataList
          data={colaboradores}
          mobileContainerClassName="space-y-2.5"
          mobileItemRenderer={(colab) => (
            <div
              key={colab.colaborador_id}
              onClick={() => onSelectColaborador(colab.colaborador_id)}
              className="rounded-[20px] border border-border bg-card p-4 space-y-3 shadow-xs active:scale-[0.99] transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold text-xs shrink-0">
                    {colab.nome_completo.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground text-sm truncate">
                      {colab.nome_completo}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5 leading-none">
                      {colab.clientes && colab.clientes.length > 0 ? (
                        colab.clientes.slice(0, 2).map((cliente, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            {i > 0 && (
                              <span className="text-muted-foreground/40 scale-75">•</span>
                            )}
                            <span className="text-[11px] text-muted-foreground font-medium">
                              {cliente}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-medium">
                          Sem turnos ativos
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border text-xs">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider mb-1">
                    Adiantamento
                  </p>
                  <Badge
                    variant="outline"
                    className="bg-muted/70 text-foreground border-border font-medium text-[10px] px-2 py-0.5 rounded-lg"
                  >
                    {colab.adiantamento_confirmado ? "Confirmado" : "Pendente"}
                  </Badge>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider mb-1">
                    Fechamento
                  </p>
                  <Badge
                    variant="outline"
                    className="bg-muted/70 text-foreground border-border font-medium text-[10px] px-2 py-0.5 rounded-lg"
                  >
                    {colab.pago ? "Confirmado" : "Pendente"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        >
          <div className="rounded-[20px] sm:rounded-[24px] border border-border overflow-hidden bg-card shadow-xs">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr className="border-b border-border text-left">
                  <th className="py-3.5 pl-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Colaborador
                  </th>
                  <th className="px-6 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Adiantamento
                  </th>
                  <th className="px-6 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Fechamento
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {colaboradores.map((colab) => (
                  <tr
                    key={colab.colaborador_id}
                    className="hover:bg-muted/40 transition-colors cursor-pointer"
                    onClick={() => onSelectColaborador(colab.colaborador_id)}
                  >
                    <td className="py-3.5 pl-6 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold text-xs shrink-0">
                          {colab.nome_completo.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            {colab.nome_completo}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 leading-none">
                            {colab.clientes && colab.clientes.length > 0 ? (
                              colab.clientes.slice(0, 2).map((cliente, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                  {i > 0 && (
                                    <span className="text-muted-foreground/40 scale-75">
                                      •
                                    </span>
                                  )}
                                  <span className="text-[11px] text-muted-foreground font-medium">
                                    {cliente}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="text-[11px] text-muted-foreground font-medium">
                                Sem turnos ativos
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 align-middle">
                      <Badge
                        variant="outline"
                        className="bg-muted/70 text-foreground border-border font-medium text-[10px] px-2 py-0.5 rounded-lg"
                      >
                        {colab.adiantamento_confirmado ? "Confirmado" : "Pendente"}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 align-middle">
                      <Badge
                        variant="outline"
                        className="bg-muted/70 text-foreground border-border font-medium text-[10px] px-2 py-0.5 rounded-lg"
                      >
                        {colab.pago ? "Confirmado" : "Pendente"}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-right align-middle">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-[12px] text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectColaborador(colab.colaborador_id);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Ver Detalhes</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ResponsiveDataList>
      </div>
    </div>
  );
}
