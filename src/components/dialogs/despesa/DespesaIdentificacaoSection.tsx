import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Banner } from "@/components/ui/Banner";
import {
  CATEGORIA_DESPESA_LABELS,
  ESCOPO_CATEGORIA_FINANCEIRA,
} from "@/constants/financeiro.constants";
import { useCategoriasFinanceirasLabelMap } from "@/hooks/business/useCategoriasFinanceirasBusiness";
import { useLayout } from "@/contexts/LayoutContext";
import { DespesaFormData } from "@/schemas/despesaSchema";
import { Empresa } from "@/types/database";
import { Tags } from "lucide-react";

interface DespesaIdentificacaoSectionProps {
  form: UseFormReturn<DespesaFormData>;
  empresas: Empresa[];
}

export function DespesaIdentificacaoSection({
  form,
  empresas,
}: DespesaIdentificacaoSectionProps) {
  const { openCategoriasFinanceirasDialog } = useLayout();
  const { categorias, categoriasDespesa, getCategoriaLabel } =
    useCategoriasFinanceirasLabelMap();
  const categoriaSelecionada = form.watch("categoria");

  const opcoesCategorias = useMemo(() => {
    const listaBase =
      categoriasDespesa.length > 0
        ? categoriasDespesa.map((c) => ({
            codigo: c.codigo,
            nome: c.nome,
            afeta_dre: c.afeta_dre,
          }))
        : Object.entries(CATEGORIA_DESPESA_LABELS).map(([codigo, nome]) => ({
            codigo,
            nome,
            afeta_dre: true,
          }));

    if (
      categoriaSelecionada &&
      !listaBase.some((item) => item.codigo === categoriaSelecionada)
    ) {
      const catInativa = categorias.find((c) => c.codigo === categoriaSelecionada);
      return [
        ...listaBase,
        {
          codigo: categoriaSelecionada,
          nome: catInativa?.nome || getCategoriaLabel(categoriaSelecionada),
          afeta_dre: catInativa?.afeta_dre ?? true,
        },
      ];
    }

    return listaBase;
  }, [categorias, categoriasDespesa, categoriaSelecionada, getCategoriaLabel]);

  const categoriaSelecionadaAfetaDre = useMemo(() => {
    const found = opcoesCategorias.find((c) => c.codigo === categoriaSelecionada);
    return found?.afeta_dre ?? true;
  }, [opcoesCategorias, categoriaSelecionada]);

  const handleGerenciarCategorias = () => {
    openCategoriasFinanceirasDialog({
      escopoInicial: ESCOPO_CATEGORIA_FINANCEIRA.DESPESA,
      onCategoryCreated: (novaCat) => {
        form.setValue("categoria", novaCat.codigo);
      },
    });
  };

  return (
    <>
      <FormField
        control={form.control}
        name="descricao"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-semibold text-foreground">
              Descrição da Conta <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Ex: Aluguel do Galpão Principal, DAS do mês, Seguro Frota"
                {...field}
                className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-medium"
              />
            </FormControl>
            <FormMessage className="text-xs text-destructive" />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="categoria"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <FormLabel className="text-xs font-semibold text-foreground">
                  Categoria de Despesa <span className="text-destructive">*</span>
                </FormLabel>
                <button
                  type="button"
                  onClick={handleGerenciarCategorias}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                >
                  <Tags className="w-3 h-3" />
                  <span>+ Nova / Gerenciar</span>
                </button>
              </div>
              <FormControl>
                <NativeSelect
                  {...field}
                  className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-semibold"
                >
                  {opcoesCategorias.map((op) => (
                    <option key={op.codigo} value={op.codigo}>
                      {op.nome}
                    </option>
                  ))}
                </NativeSelect>
              </FormControl>
              <FormMessage className="text-xs text-destructive" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="empresa_id"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold text-foreground">
                Empresa Pagadora (CNPJ) <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <NativeSelect
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    form.setValue("is_holding", e.target.value === "holding");
                  }}
                  className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-semibold"
                >
                  <option value="holding">Geral da Holding (Rateio entre CNPJs)</option>
                  {empresas.map((emp) => (
                    <option key={emp.id} value={String(emp.id)}>
                      {emp.nome_fantasia || emp.razao_social}
                    </option>
                  ))}
                </NativeSelect>
              </FormControl>
              <FormMessage className="text-xs text-destructive" />
            </FormItem>
          )}
        />
      </div>

      {!categoriaSelecionadaAfetaDre && (
        <Banner
          variant="info"
          description="Esta categoria é neutra e não afetará o cálculo do DRE (Resultado Real do Mês)."
        />
      )}
    </>
  );
}
