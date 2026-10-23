import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ScaleIndicators } from "@/components/common/ScaleIndicators";
import { MapPin, MapPinned, Plus, Edit2, Trash2, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { cnpjMask } from "@/utils/masks";
import { AnimatePresence, motion } from "framer-motion";
import { Unidade } from "@/types/database";

interface ClientUnidadesSectionProps {
  unidades?: Unidade[];
  isLoading: boolean;
  paginatedUnidades: Unidade[];
  unitPage: number;
  totalUnitPages: number;
  onPageChange: (newPage: number) => void;
  onAddUnidade: () => void;
  onEditUnidade: (unidade: Unidade) => void;
  onDeleteUnidade: (unidade: Unidade) => void;
  onNavigateToUnit: (unidadeId: number) => void;
}

export function ClientUnidadesSection({
  unidades,
  isLoading,
  paginatedUnidades,
  unitPage,
  totalUnitPages,
  onPageChange,
  onAddUnidade,
  onEditUnidade,
  onDeleteUnidade,
  onNavigateToUnit,
}: ClientUnidadesSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">
          Unidades / Filiais
        </h3>
        {unidades && unidades.length > 0 && (
          <Button
            onClick={onAddUnidade}
            className="h-10 rounded-[14px] px-4 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs gap-1.5 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Unidade</span>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-32 rounded-[18px]" />
          <Skeleton className="h-32 rounded-[18px]" />
        </div>
      ) : !unidades || unidades.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-[18px] border border-dashed border-border p-6">
          <div className="h-12 w-12 rounded-[14px] bg-muted/70 text-muted-foreground border border-border flex items-center justify-center mx-auto mb-3">
            <MapPin className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-foreground">
            Nenhuma unidade encontrada
          </h4>
          <p className="text-muted-foreground mt-1 max-w-xs mx-auto text-xs">
            Comece cadastrando a primeira unidade operacional do cliente.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={onAddUnidade}
            className="mt-4 h-9 rounded-[14px] border-border text-foreground hover:bg-muted/40 font-medium text-xs"
          >
            Adicionar Unidade
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={unitPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3"
            >
              {paginatedUnidades.map((unidade) => (
                <div
                  key={unidade.id}
                  className="bg-card p-5 rounded-[18px] border border-border shadow-xs hover:border-primary/40 transition-colors group cursor-pointer relative"
                  onClick={() => onNavigateToUnit(unidade.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex gap-3.5">
                      <div className="mt-0.5 shrink-0">
                        <div className="h-10 w-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center">
                          <MapPinned className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                            {unidade.nome_unidade}
                          </h4>
                          <StatusBadge status={unidade.ativo} />
                          <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-all">
                            <button
                              type="button"
                              className="p-1 rounded-[8px] hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditUnidade(unidade);
                              }}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              className="p-1 rounded-[8px] hover:bg-muted/50 text-muted-foreground hover:text-destructive transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteUnidade(unidade);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">
                          CNPJ: {cnpjMask(unidade.cnpj)}
                        </p>
                        <p className="text-xs text-muted-foreground max-w-md capitalize">
                          {unidade.logradouro.toLowerCase()}, {unidade.numero}
                          {unidade.complemento && ` - ${unidade.complemento}`}.
                          {" "}{unidade.bairro.toLowerCase()}, {unidade.cidade.toLowerCase()} - {unidade.estado}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2.5 shrink-0">
                      <div className="flex items-center gap-1.5 bg-muted/40 border border-border px-3 py-1.5 rounded-[12px]">
                        <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold text-foreground">
                          {unidade.km_contratados || 0} KM / Mês
                        </span>
                      </div>
                      <ScaleIndicators
                        activeDays={unidade.escala_semanal || []}
                        variant="light"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          {totalUnitPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground font-medium">
                Página {unitPage} de {totalUnitPages}
              </p>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  disabled={unitPage === 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPageChange(Math.max(1, unitPage - 1));
                  }}
                  className="h-9 w-9 rounded-[12px] border border-border flex items-center justify-center hover:bg-muted/40 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronLeft className="h-4 w-4 text-foreground" />
                </button>
                <button
                  type="button"
                  disabled={unitPage >= totalUnitPages}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPageChange(unitPage + 1);
                  }}
                  className="h-9 w-9 rounded-[12px] border border-border flex items-center justify-center hover:bg-muted/40 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronRight className="h-4 w-4 text-foreground" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
