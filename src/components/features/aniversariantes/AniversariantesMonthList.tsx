import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AniversarianteItem } from "@/services/api/aniversariante.api";
import { getPerfilLabel } from "@/utils/formatters/perfil";
import { Cake } from "lucide-react";

interface AniversariantesMonthListProps {
  itens: AniversarianteItem[];
  nomeMesSelecionado: string;
  isLoading: boolean;
  temBusca: boolean;
}

function formatarDiaMes(dia: number, mes: number): string {
  return `${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}`;
}

export function AniversariantesMonthList({
  itens,
  nomeMesSelecionado,
  isLoading,
  temBusca,
}: AniversariantesMonthListProps) {
  return (
    <Card className="rounded-[24px] border border-[#e5e5e5] bg-white shadow-xs">
      <CardHeader className="px-5 py-4 border-b border-[#e5e5e5] flex flex-row items-center justify-between space-y-0">
        <div className="space-y-0.5">
          <CardTitle className="text-base font-semibold text-foreground">
            Aniversariantes de {nomeMesSelecionado}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Colaboradores ativos ordenados pelo dia do mês
          </p>
        </div>
        <Badge variant="secondary" className="rounded-[18px]">
          {itens.length}
        </Badge>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton key={idx} className="h-12 w-full rounded-[14px]" />
            ))}
          </div>
        ) : itens.length === 0 ? (
          <div className="px-5 py-10 text-center space-y-2">
            <div className="w-10 h-10 rounded-[14px] bg-[#f5f5f5] border border-[#e5e5e5] mx-auto flex items-center justify-center text-muted-foreground">
              <Cake className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {temBusca
                ? "Nenhum aniversariante encontrado para esta busca"
                : `Nenhum aniversariante ativo em ${nomeMesSelecionado}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {temBusca
                ? "Tente outro nome ou limpe o filtro de busca."
                : "Navegue para outro mês para consultar o calendário."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#e5e5e5]">
            {itens.map((item) => (
              <li
                key={item.id}
                className={
                  item.eh_hoje
                    ? "px-5 py-3.5 flex items-center justify-between gap-4 bg-[#fafafa]"
                    : "px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-[#fafafa] transition-colors"
                }
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={
                      item.eh_hoje
                        ? "w-14 h-9 rounded-[18px] bg-[#171717] text-[#fafafa] text-xs font-semibold flex items-center justify-center shrink-0"
                        : "w-14 h-9 rounded-[18px] bg-[#f5f5f5] text-foreground border border-[#e5e5e5] text-xs font-medium flex items-center justify-center shrink-0"
                    }
                  >
                    {formatarDiaMes(item.dia, item.mes)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.nome_completo}
                      </p>
                      {item.eh_hoje && (
                        <Badge className="rounded-[18px] bg-[#171717] text-[#fafafa] hover:bg-[#171717] text-[11px] px-2 py-0.5">
                          Hoje
                        </Badge>
                      )}
                    </div>
                    {item.perfil_nome && (
                      <p className="text-xs text-muted-foreground truncate">
                        {getPerfilLabel(item.perfil_nome)}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
