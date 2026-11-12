import { useMemo } from "react";
import { useCategoriasFinanceirasQuery } from "@/hooks/api/useCategoriasFinanceiras";
import {
  CATEGORIA_DESPESA_LABELS,
  CATEGORIA_MOVIMENTACAO_AVULSA,
  CATEGORIA_MOVIMENTACAO_AVULSA_LABELS,
  ESCOPO_CATEGORIA_FINANCEIRA,
} from "@/constants/financeiro.constants";

export function useCategoriasFinanceirasLabelMap() {
  const { data: categorias = [], isLoading } = useCategoriasFinanceirasQuery();

  const labelMap = useMemo(() => {
    const map: Record<string, string> = {
      ...CATEGORIA_DESPESA_LABELS,
      ...CATEGORIA_MOVIMENTACAO_AVULSA_LABELS,
    };
    for (const cat of categorias) {
      map[cat.codigo] = cat.nome;
    }
    return map;
  }, [categorias]);

  const categoriasEntrada = useMemo(
    () =>
      categorias.filter(
        (c) => c.escopo === ESCOPO_CATEGORIA_FINANCEIRA.ENTRADA_AVULSA && c.ativo
      ),
    [categorias]
  );

  const categoriasSaida = useMemo(
    () =>
      categorias.filter(
        (c) =>
          c.escopo === ESCOPO_CATEGORIA_FINANCEIRA.SAIDA_AVULSA &&
          c.ativo &&
          c.codigo !== CATEGORIA_MOVIMENTACAO_AVULSA.TRANSFERENCIA_ENTRE_CONTAS
      ),
    [categorias]
  );

  const categoriasDespesa = useMemo(
    () =>
      categorias.filter(
        (c) => c.escopo === ESCOPO_CATEGORIA_FINANCEIRA.DESPESA && c.ativo
      ),
    [categorias]
  );

  const getCategoriaLabel = (codigo?: string | null): string => {
    if (!codigo) return "-";
    return labelMap[codigo] || codigo;
  };

  return {
    categorias,
    categoriasEntrada,
    categoriasSaida,
    categoriasDespesa,
    labelMap,
    getCategoriaLabel,
    isLoading,
  };
}
