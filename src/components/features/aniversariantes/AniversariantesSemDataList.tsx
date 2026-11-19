import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Usuario } from "@/types/database";
import { getPerfilLabel } from "@/utils/formatters/perfil";
import { CalendarOff, Pencil } from "lucide-react";

interface AniversariantesSemDataListProps {
  colaboradores: Usuario[];
  isLoading: boolean;
  canEdit: boolean;
  temBusca: boolean;
  onEditar: (colaborador: Usuario) => void;
}

export function AniversariantesSemDataList({
  colaboradores,
  isLoading,
  canEdit,
  temBusca,
  onEditar,
}: AniversariantesSemDataListProps) {
  return (
    <Card className="rounded-[24px] border border-[#e5e5e5] bg-white shadow-xs">
      <CardHeader className="px-5 py-4 border-b border-[#e5e5e5] flex flex-row items-center justify-between space-y-0">
        <div className="space-y-0.5">
          <CardTitle className="text-base font-semibold text-foreground">
            Sem data de nascimento cadastrada
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Colaboradores ativos pendentes de preenchimento da data de nascimento
          </p>
        </div>
        <Badge variant="secondary" className="rounded-[18px]">
          {colaboradores.length}
        </Badge>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-12 w-full rounded-[14px]" />
            ))}
          </div>
        ) : colaboradores.length === 0 ? (
          <div className="px-5 py-10 text-center space-y-2">
            <div className="w-10 h-10 rounded-[14px] bg-[#f5f5f5] border border-[#e5e5e5] mx-auto flex items-center justify-center text-muted-foreground">
              <CalendarOff className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {temBusca
                ? "Nenhum colaborador pendente encontrado para esta busca"
                : "Todos os colaboradores ativos possuem data de nascimento"}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#e5e5e5]">
            {colaboradores.map((colaborador) => (
              <li
                key={colaborador.id}
                className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-[#fafafa] transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {colaborador.nome_completo}
                  </p>
                  {colaborador.perfil?.nome && (
                    <p className="text-xs text-muted-foreground truncate">
                      {getPerfilLabel(colaborador.perfil.nome)}
                    </p>
                  )}
                </div>

                {canEdit && (
                  <Button
                    type="button"
                    variant="tonal"
                    size="sm"
                    onClick={() => onEditar(colaborador)}
                    className="shrink-0"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Preencher data
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
