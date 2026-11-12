import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ESCOPO_CATEGORIA_FINANCEIRA } from "@/constants/financeiro.constants";
import {
  CategoriaFinanceira,
  EscopoCategoriaFinanceira,
  GrupoDreCategoriaFinanceira,
} from "@/types/database";
import { useCategoriasFinanceirasDialogViewModel } from "@/hooks/ui/financeiro/useCategoriasFinanceirasDialogViewModel";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Tags } from "lucide-react";
import { CategoriaFinanceiraItemRow } from "./categorias-financeiras/CategoriaFinanceiraItemRow";

export interface CategoriasFinanceirasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  escopoInicial?: EscopoCategoriaFinanceira;
  onCategoryCreated?: (categoria: CategoriaFinanceira) => void;
}

const ABAS_ESCOPO: Array<{ id: EscopoCategoriaFinanceira; label: string }> = [
  { id: ESCOPO_CATEGORIA_FINANCEIRA.SAIDA_AVULSA, label: "Saídas Avulsas" },
  { id: ESCOPO_CATEGORIA_FINANCEIRA.ENTRADA_AVULSA, label: "Entradas Avulsas" },
  { id: ESCOPO_CATEGORIA_FINANCEIRA.DESPESA, label: "Contas a Pagar / Despesas" },
];

export function CategoriasFinanceirasDialog({
  open,
  onOpenChange,
  escopoInicial,
  onCategoryCreated,
}: CategoriasFinanceirasDialogProps) {
  const vm = useCategoriasFinanceirasDialogViewModel({
    open,
    onOpenChange,
    escopoInicial,
    onCategoryCreated,
  });

  return (
    <BaseDialog
      open={open}
      onOpenChange={(val) => !val && vm.handleClose()}
      maxWidth="2xl"
    >
      <BaseDialog.Header
        icon={<Tags className="h-5 w-5 text-foreground" />}
        title="Categorias Financeiras"
        subtitle="Crie, edite o nome ou ajuste o impacto contábil no DRE das categorias de lançamentos."
        onClose={vm.handleClose}
      />

      <BaseDialog.Body className="space-y-4">
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-[18px] bg-surface-alt border border-border">
          {ABAS_ESCOPO.map((aba) => {
            const ativo = vm.escopoAtivo === aba.id;
            return (
              <button
                key={aba.id}
                type="button"
                onClick={() => vm.handleSelectEscopo(aba.id)}
                className={cn(
                  "h-9 px-3 rounded-[18px] text-xs font-semibold transition-all cursor-pointer select-none",
                  ativo
                    ? "bg-card text-foreground shadow-xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {aba.label}
              </button>
            );
          })}
        </div>

        <Banner
          variant="info"
          description="Categorias com lançamentos vinculados não podem ser excluídas para preservar o histórico do DRE e Extrato, mas podem ter o nome editado ou ser inativadas."
        />

        <form
          onSubmit={vm.handleAdd}
          className="rounded-[24px] border border-border bg-surface-alt/40 p-4 space-y-3"
        >
          <p className="text-xs font-semibold text-foreground">
            Nova Categoria em{" "}
            {ABAS_ESCOPO.find((a) => a.id === vm.escopoAtivo)?.label}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-6">
              <Input
                placeholder="Ex: Pedágio Avulso, Taxa Maquininha, Reembolso..."
                value={vm.novoNome}
                onChange={(e) => vm.setNovoNome(e.target.value)}
                disabled={vm.isMutating}
                className="h-10 rounded-[18px] bg-background border-border text-xs font-medium"
              />
            </div>
            <div className="sm:col-span-4">
              <NativeSelect
                value={vm.novoGrupoDre}
                onChange={(e) =>
                  vm.setNovoGrupoDre(e.target.value as GrupoDreCategoriaFinanceira)
                }
                disabled={vm.isMutating}
                className="h-10 rounded-[18px] bg-background border-border text-xs font-medium"
              >
                {vm.opcoesGrupoDre.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="sm:col-span-2">
              <Button
                type="submit"
                disabled={vm.isMutating || !vm.novoNome.trim()}
                className="w-full h-10 px-3 rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs gap-1.5 cursor-pointer"
              >
                {vm.isCreating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Criar</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        <div className="space-y-2">
          {vm.isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground font-medium">
                Carregando categorias...
              </p>
            </div>
          ) : vm.categoriasDoEscopo.length > 0 ? (
            <div className="rounded-[24px] border border-border bg-card divide-y divide-border/60 max-h-[340px] overflow-y-auto">
              {vm.categoriasDoEscopo.map((cat) => (
                <CategoriaFinanceiraItemRow
                  key={cat.id}
                  categoria={cat}
                  isEditing={vm.editingId === cat.id}
                  editingNome={vm.editingNome}
                  onEditingNomeChange={vm.setEditingNome}
                  editingGrupoDre={vm.editingGrupoDre}
                  onEditingGrupoDreChange={vm.setEditingGrupoDre}
                  opcoesGrupoDre={vm.opcoesGrupoDre}
                  isMutating={vm.isMutating}
                  isUpdating={vm.isUpdating}
                  onStartEdit={vm.handleStartEdit}
                  onCancelEdit={vm.handleCancelEdit}
                  onSaveEdit={vm.handleSaveEdit}
                  onToggleAtivo={vm.handleToggleAtivo}
                  onDelete={vm.handleDelete}
                />
              ))}
            </div>
          ) : (
            <UnifiedEmptyState
              icon={Tags}
              title="Nenhuma categoria encontrada"
              description="Utilize o formulário acima para criar uma nova categoria."
            />
          )}
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Fechar"
          variant="secondary"
          onClick={vm.handleClose}
          type="button"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
export default CategoriasFinanceirasDialog;
