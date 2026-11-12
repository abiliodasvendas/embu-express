import { Control } from "react-hook-form";
import {
  ModoLancamentoAvulso,
  MovimentacaoAvulsaFormData,
} from "@/schemas/movimentacaoAvulsaSchema";
import { MODO_LANCAMENTO_AVULSO } from "@/constants/financeiro.constants";
import { Empresa, ContaBancaria } from "@/types/database";
import { formatContaBancaria } from "@/utils/formatters";
import { Banner } from "@/components/ui/Banner";
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
import { Tags } from "lucide-react";

export interface CategoriaOpcaoItem {
  codigo: string;
  nome: string;
  afeta_dre?: boolean;
}

interface MovimentacaoAvulsaCamposProps {
  control: Control<MovimentacaoAvulsaFormData>;
  modo: ModoLancamentoAvulso;
  empresas: Empresa[];
  contasEmpresa: ContaBancaria[];
  todasContas: ContaBancaria[];
  contaOrigemId?: string;
  categoriasOpcoes: CategoriaOpcaoItem[];
  categoriaSelecionadaAfetaDre?: boolean;
  onGerenciarCategorias: () => void;
}

export function MovimentacaoAvulsaCampos({
  control,
  modo,
  empresas,
  contasEmpresa,
  todasContas,
  contaOrigemId,
  categoriasOpcoes,
  categoriaSelecionadaAfetaDre = true,
  onGerenciarCategorias,
}: MovimentacaoAvulsaCamposProps) {
  if (modo === MODO_LANCAMENTO_AVULSO.TRANSFERENCIA) {
    const contasDestinoDisponiveis = todasContas.filter(
      (c) => c.id !== contaOrigemId
    );

    return (
      <>
        <Banner
          variant="info"
          description="Transferências geram saída na conta de origem e entrada na conta de destino no extrato, sem impactar o DRE (Resultado da Empresa)."
        />

        <FormField
          control={control}
          name="conta_bancaria_id"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold text-foreground">
                Conta de Origem (Saída -) <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <NativeSelect
                  value={field.value && field.value !== "none" ? field.value : ""}
                  onChange={field.onChange}
                  className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-semibold"
                >
                  <option value="">Selecione a conta de onde o valor sairá</option>
                  {todasContas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {formatContaBancaria(c, c.empresa?.nome_fantasia)}
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
          name="conta_destino_id"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold text-foreground">
                Conta de Destino (Entrada +) <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <NativeSelect
                  value={field.value || ""}
                  onChange={field.onChange}
                  className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-semibold"
                >
                  <option value="">Selecione a conta que receberá o valor</option>
                  {contasDestinoDisponiveis.map((c) => (
                    <option key={c.id} value={c.id}>
                      {formatContaBancaria(c, c.empresa?.nome_fantasia)}
                    </option>
                  ))}
                </NativeSelect>
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
                  Valor Transferido (R$) <span className="text-destructive">*</span>
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
                  Data da Transferência <span className="text-destructive">*</span>
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

        <FormField
          control={control}
          name="descricao"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold text-foreground">
                Descrição / Observação (Opcional)
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Transferência para cobertura de folha Omie"
                  {...field}
                  className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-medium"
                />
              </FormControl>
              <FormMessage className="text-xs text-destructive" />
            </FormItem>
          )}
        />
      </>
    );
  }

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
                Conta Bancária <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <NativeSelect
                  value={field.value || "none"}
                  onChange={field.onChange}
                  className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-semibold"
                >
                  <option value="none">Selecione a conta bancária</option>
                  {contasEmpresa.map((c) => (
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
            <div className="flex items-center justify-between gap-2">
              <FormLabel className="text-xs font-semibold text-foreground">
                Categoria <span className="text-destructive">*</span>
              </FormLabel>
              <button
                type="button"
                onClick={onGerenciarCategorias}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
              >
                <Tags className="w-3 h-3" />
                <span>+ Nova / Gerenciar Categorias</span>
              </button>
            </div>
            <FormControl>
              <NativeSelect
                {...field}
                className="h-11 rounded-[18px] bg-background text-xs sm:text-sm font-semibold"
              >
                {categoriasOpcoes.map((cat) => (
                  <option key={cat.codigo} value={cat.codigo}>
                    {cat.nome}
                  </option>
                ))}
              </NativeSelect>
            </FormControl>
            <FormMessage className="text-xs text-destructive" />
          </FormItem>
        )}
      />

      {!categoriaSelecionadaAfetaDre && (
        <Banner
          variant="info"
          description="Esta categoria é neutra e não afetará o cálculo do DRE (Resultado Real do Mês)."
        />
      )}

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
