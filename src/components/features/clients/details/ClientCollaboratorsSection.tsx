import { Skeleton } from "@/components/ui/skeleton";
import { CollaboratorCard } from "@/components/common/CollaboratorCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Unidade } from "@/types/database";
import type { FlattenedCollaboratorClient } from "@/hooks/ui/clients";

interface ClientCollaboratorsSectionProps {
  isLoading: boolean;
  flattenedCollaborators: FlattenedCollaboratorClient[];
  paginatedCollaborators: FlattenedCollaboratorClient[];
  collabPage: number;
  totalCollabPages: number;
  unidades?: Unidade[];
  onPageChange: (newPage: number) => void;
  onNavigateToCollaborator: (collabId: string) => void;
}

export function ClientCollaboratorsSection({
  isLoading,
  flattenedCollaborators,
  paginatedCollaborators,
  collabPage,
  totalCollabPages,
  unidades,
  onPageChange,
  onNavigateToCollaborator,
}: ClientCollaboratorsSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">
          Colaboradores
        </h3>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-20 rounded-[18px]" />
          <Skeleton className="h-20 rounded-[18px]" />
        </div>
      ) : flattenedCollaborators.length === 0 ? (
        <div className="text-center py-10 bg-card rounded-[18px] border border-dashed border-border">
          <p className="text-xs text-muted-foreground font-medium">
            Nenhum colaborador vinculado a este cliente.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={collabPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {paginatedCollaborators.map((collab) => {
                const unit = unidades?.find((u) => u.id === collab.link.unidade_id);
                const shiftDays =
                  collab.link.horarios?.map(
                    (h: { dia_semana: number; hora_inicio: string; hora_fim: string }) =>
                      h.dia_semana,
                  ) || [];
                const unitDays = unit?.escala_semanal || [1, 2, 3, 4, 5, 6, 0];
                const shiftInterval = collab.link.horarios?.[0]
                  ? `${collab.link.horarios[0].hora_inicio.substring(0, 5)} - ${collab.link.horarios[0].hora_fim.substring(0, 5)}`
                  : "S/ Horário";

                return (
                  <CollaboratorCard
                    key={collab.uniqueKey}
                    name={collab.nome_completo}
                    status={collab.status}
                    unitName={unit?.nome_unidade}
                    shiftInterval={shiftInterval}
                    shiftDays={shiftDays}
                    unitDays={unitDays}
                    variant="condensed"
                    onClick={() => onNavigateToCollaborator(collab.id)}
                  />
                );
              })}
            </motion.div>
          </AnimatePresence>

          {totalCollabPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground font-medium">
                Página {collabPage} de {totalCollabPages}
              </p>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  disabled={collabPage === 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPageChange(Math.max(1, collabPage - 1));
                  }}
                  className="h-9 w-9 rounded-[12px] border border-border flex items-center justify-center hover:bg-muted/40 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronLeft className="h-4 w-4 text-foreground" />
                </button>
                <button
                  type="button"
                  disabled={collabPage >= totalCollabPages}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPageChange(collabPage + 1);
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
