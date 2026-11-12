import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
  GRUPO_DRE_CATEGORIA,
  GRUPO_DRE_LABELS,
} from "@/constants/financeiro.constants";
import {
  CategoriaFinanceira,
  GrupoDreCategoriaFinanceira,
} from "@/types/database";
import { cn } from "@/lib/utils";
import {
  Check,
  Edit2,
  Eye,
  EyeOff,
  Loader2,
  Trash2,
  X,
} from "lucide-react";

interface CategoriaFinanceiraItemRowProps {
  categoria: CategoriaFinanceira;
  isEditing: boolean;
  editingNome: string;
  onEditingNomeChange: (val: string) => void;
  editingGrupoDre: GrupoDreCategoriaFinanceira;
  onEditingGrupoDreChange: (val: GrupoDreCategoriaFinanceira) => void;
  opcoesGrupoDre: Array<{ value: GrupoDreCategoriaFinanceira; label: string }>;
  isMutating: boolean;
  isUpdating: boolean;
  onStartEdit: (cat: CategoriaFinanceira) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string) => void;
  onToggleAtivo: (cat: CategoriaFinanceira) => void;
  onDelete: (cat: CategoriaFinanceira) => void;
}

export function CategoriaFinanceiraItemRow({
  categoria: cat,
  isEditing,
  editingNome,
  onEditingNomeChange,
  editingGrupoDre,
  onEditingGrupoDreChange,
  opcoesGrupoDre,
  isMutating,
  isUpdating,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onToggleAtivo,
  onDelete,
}: CategoriaFinanceiraItemRowProps) {
  const vinculos = cat.vinculos_count ?? 0;
  const podeExcluir = !cat.is_sistema && vinculos === 0;

  return (
    <div
      className={cn(
        "p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors",
        !cat.ativo && "opacity-60 bg-surface-alt/30"
      )}
    >
      {isEditing ? (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          <Input
            value={editingNome}
            onChange={(e) => onEditingNomeChange(e.target.value)}
            disabled={isMutating}
            className="h-9 px-3 rounded-[18px] bg-background border-border text-xs font-medium flex-1"
            autoFocus
          />
          <NativeSelect
            value={editingGrupoDre}
            onChange={(e) =>
              onEditingGrupoDreChange(e.target.value as GrupoDreCategoriaFinanceira)
            }
            disabled={isMutating}
            className="h-9 rounded-[18px] bg-background border-border text-xs font-medium sm:w-56"
          >
            {opcoesGrupoDre.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </NativeSelect>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              size="icon"
              onClick={() => onSaveEdit(cat.id)}
              disabled={isMutating || !editingNome.trim()}
              className="h-9 w-9 bg-primary hover:bg-primary-hover text-primary-foreground rounded-[18px] cursor-pointer"
            >
              {isUpdating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={onCancelEdit}
              disabled={isMutating}
              className="h-9 w-9 rounded-[18px] text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-foreground text-xs sm:text-sm leading-tight truncate">
                {cat.nome}
              </span>
              {!cat.ativo && (
                <Badge
                  variant="outline"
                  className="rounded-[18px] text-[10px] px-2 py-0 bg-muted text-muted-foreground border-border"
                >
                  Inativa
                </Badge>
              )}
              {cat.grupo_dre === GRUPO_DRE_CATEGORIA.NAO_AFETA_DRE ? (
                <Badge
                  variant="outline"
                  className="rounded-[18px] text-[10px] px-2 py-0 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                >
                  Não afeta DRE
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="rounded-[18px] text-[10px] px-2 py-0 bg-surface-alt text-muted-foreground border-border"
                >
                  {GRUPO_DRE_LABELS[cat.grupo_dre] || cat.grupo_dre}
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {vinculos > 0
                ? `${vinculos} lançamento(s) vinculado(s)`
                : "Sem lançamentos vinculados"}
              {cat.is_sistema ? " • Padrão do Sistema" : " • Personalizada"}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              title="Editar nome ou comportamento no DRE"
              onClick={() => onStartEdit(cat)}
              disabled={isMutating}
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-surface-alt rounded-[18px] cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              title={
                cat.ativo
                  ? "Inativar categoria (ocultar de novos lançamentos)"
                  : "Reativar categoria"
              }
              onClick={() => onToggleAtivo(cat)}
              disabled={isMutating}
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-surface-alt rounded-[18px] cursor-pointer"
            >
              {cat.ativo ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
              )}
            </Button>
            {podeExcluir && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                title="Excluir categoria"
                onClick={() => onDelete(cat)}
                disabled={isMutating}
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-[18px] cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
