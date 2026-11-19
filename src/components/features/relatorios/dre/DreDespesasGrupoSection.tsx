import { useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/formatters/currency";
import { DreGrupoDespesas } from "@/services/api/dre.api";

interface DreDespesasGrupoSectionProps {
  titulo: string;
  tituloTotal: string;
  grupo?: DreGrupoDespesas;
  emptyMessage: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function DreDespesasGrupoSection({
  titulo,
  tituloTotal,
  grupo,
  emptyMessage,
  actionLabel,
  onAction,
}: DreDespesasGrupoSectionProps) {
  const [categoriasExpandidas, setCategoriasExpandidas] = useState<Record<string, boolean>>({});

  const categorias = grupo?.por_categoria ?? [];
  const itensSoltos = grupo?.itens ?? [];
  const usarAgrupamento = categorias.length > 0;
  const semLancamentos = usarAgrupamento ? categorias.length === 0 : itensSoltos.length === 0;

  const toggleCategoria = (codigo: string) => {
    setCategoriasExpandidas((prev) => ({
      ...prev,
      [codigo]: !prev[codigo],
    }));
  };

  return (
    <>
      <div className="px-6 py-2 bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
        {titulo}
      </div>

      {usarAgrupamento &&
        categorias.map((categoria) => {
          const expandida = Boolean(categoriasExpandidas[categoria.categoria_codigo]);
          return (
            <div key={categoria.categoria_codigo} className="divide-y divide-border/60">
              <button
                type="button"
                aria-expanded={expandida}
                onClick={() => toggleCategoria(categoria.categoria_codigo)}
                className="w-full flex justify-between items-center px-6 sm:px-8 py-2.5 text-left text-xs hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2 min-w-0 pr-3 text-foreground font-medium">
                  {expandida ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  )}
                  <span className="truncate">{categoria.categoria_nome}</span>
                  <Badge
                    variant="outline"
                    className="rounded-[18px] text-[10px] px-2 py-0 bg-muted/60 text-muted-foreground border-border font-medium shrink-0"
                  >
                    {categoria.quantidade}{" "}
                    {categoria.quantidade === 1 ? "lançamento" : "lançamentos"}
                  </Badge>
                </span>
                <span className="text-rose-600 dark:text-rose-400 font-semibold shrink-0">
                  {formatCurrency(categoria.total)}
                </span>
              </button>

              {expandida && (
                <div className="bg-muted/15 divide-y divide-border/40">
                  {categoria.itens.map((item, idx) => (
                    <div
                      key={`${categoria.categoria_codigo}-${idx}`}
                      className="flex justify-between items-center pl-12 sm:pl-14 pr-6 sm:pr-8 py-1.5 text-muted-foreground text-xs"
                    >
                      <span className="truncate pr-3">• {item.descricao}</span>
                      <span className="text-rose-600/90 dark:text-rose-400/90 font-medium shrink-0">
                        {formatCurrency(item.valor)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

      {!usarAgrupamento &&
        itensSoltos.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center px-8 py-1.5 text-muted-foreground text-xs"
          >
            <span>• {item.descricao}</span>
            <span className="text-rose-600 dark:text-rose-400 font-medium">
              {formatCurrency(item.valor)}
            </span>
          </div>
        ))}

      {semLancamentos && (
        <div className="flex items-center justify-between px-8 py-2 text-xs">
          <span className="text-muted-foreground italic">{emptyMessage}</span>
          {actionLabel && onAction && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAction}
              className="h-7 rounded-[18px] text-xs text-foreground hover:bg-muted/40 font-medium gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{actionLabel}</span>
            </Button>
          )}
        </div>
      )}

      <div className="flex justify-between items-center px-6 py-2.5 font-bold text-foreground bg-muted/20 text-xs">
        <span>{tituloTotal}</span>
        <span className="text-rose-600 dark:text-rose-400 font-bold">
          (-) {formatCurrency(grupo?.total ?? 0)}
        </span>
      </div>
    </>
  );
}
