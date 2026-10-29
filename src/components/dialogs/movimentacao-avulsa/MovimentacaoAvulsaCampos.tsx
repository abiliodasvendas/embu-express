import { Control } from "react-hook-form";
import { MovimentacaoAvulsaFormData } from "@/schemas/movimentacaoAvulsaSchema";
import { Empresa, ContaBancaria, CategoriaMovimentacaoAvulsa } from "@/types/database";
import { CATEGORIA_MOVIMENTACAO_AVULSA_LABELS } from "@/constants/financeiro.constants";
import { formatContaBancaria } from "@/utils/formatters";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { MoneyInput } from "@/components/ui/MoneyInput";

interface MovimentacaoAvulsaCamposProps {
  control: Control<MovimentacaoAvulsaFormData>;
  empresas: Empresa[];
  contas: ContaBancaria[];
  categoriasDisponiveis: CategoriaMovimentacaoAvulsa[];
}

export function MovimentacaoAvulsaCampos({
  control,
  empresas,
  contas,
  categoriasDisponiveis,
}: MovimentacaoAvulsaCamposProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField
          control={control}
          name="empresa_id"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold text-foreground">
                Empresa (CNPJ) <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <NativeSelect
                  value={field.value ? String(field.value) : ""}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-semibold"
                >
                  <option value="">Selecione a empresa</option>
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

        <FormField
          control={control}
          name="conta_bancaria_id"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold text-foreground">
                Conta Bancária (Opcional)
              </FormLabel>
              <FormControl>
                <NativeSelect
                  value={field.value || "none"}
                  onChange={field.onChange}
                  className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-semibold"
                >
                  <option value="none">Nenhuma conta específica</option>
                  {contas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {formatContaBancaria(c)}
                    </option>
                  ))}
                </NativeSelect>
              </FormControl>
              <FormMessage className="text-xs text-destructive" />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="categoria"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-semibold text-foreground">
              Categoria <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <NativeSelect
                {...field}
                className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-semibold"
              >
                {categoriasDisponiveis.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORIA_MOVIMENTACAO_AVULSA_LABELS[cat] || cat}
                  </option>
                ))}
              </NativeSelect>
            </FormControl>
            <FormMessage className="text-xs text-destructive" />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="descricao"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-semibold text-foreground">
              Descrição do Lançamento <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Ex: Frete extra cliente ABC, Aplicação CDB, Taxa de Manutenção"
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
          control={control}
          name="valor"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold text-foreground">
                Valor (R$) <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <MoneyInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="0,00"
                  className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-semibold"
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="data_movimentacao"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold text-foreground">
                Data da Operação <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-medium"
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive" />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
