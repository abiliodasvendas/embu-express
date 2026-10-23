import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { useLayout } from "@/contexts/LayoutContext";
import {
  useCategoriasQuery,
  useCreateCategoria,
  useDeleteCategoria,
  useUpdateCategoria,
} from "@/hooks/api/useItensEquipamentos";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { Check, Edit2, Loader2, Plus, Tag, Trash2 } from "lucide-react";
import { useState } from "react";

interface CategoriasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoriasDialog({ open, onOpenChange }: CategoriasDialogProps) {
  const { data: categorias = [], isLoading } = useCategoriasQuery();
  const createCategoria = useCreateCategoria();
  const updateCategoria = useUpdateCategoria();
  const deleteCategoria = useDeleteCategoria();
  const { openConfirmationDialog, closeConfirmationDialog } = useLayout();

  const [novaCategoria, setNovaCategoria] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingNome, setEditingNome] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaCategoria.trim()) return;

    try {
      await createCategoria.mutateAsync({ nome: novaCategoria.trim() });
      setNovaCategoria("");
    } catch {
      // toast disparado pelo hook
    }
  };

  const handleStartEdit = (id: number, nome: string) => {
    setEditingId(id);
    setEditingNome(nome);
  };

  const handleSaveEdit = async (id: number) => {
    if (!editingNome.trim()) return;

    try {
      await updateCategoria.mutateAsync({ id, nome: editingNome.trim() });
      setEditingId(null);
    } catch {
      // toast disparado pelo hook
    }
  };

  const handleDelete = (id: number, nome: string) => {
    openConfirmationDialog({
      title: "Excluir Categoria",
      description: `Tem certeza que deseja excluir a categoria "${nome}"? Esta ação não pode ser desfeita e só será permitida se não houver itens associados.`,
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
      variant: "destructive",
      onConfirm: async () => {
        await deleteCategoria.mutateAsync(id);
        safeCloseDialog(closeConfirmationDialog);
      },
    });
  };

  const isMutating =
    createCategoria.isPending || updateCategoria.isPending || deleteCategoria.isPending;

  return (
    <BaseDialog
      open={open}
      onOpenChange={(val) => !val && safeCloseDialog(() => onOpenChange(false))}
      maxWidth="md"
    >
      <BaseDialog.Header
        icon={<Tag className="h-5 w-5" />}
        title="Categorias de Itens"
        subtitle="Gerencie as categorias de classificação dos itens e equipamentos"
        onClose={() => safeCloseDialog(() => onOpenChange(false))}
      />

      <BaseDialog.Body className="p-6 space-y-4">
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            placeholder="Nome da nova categoria..."
            value={novaCategoria}
            onChange={(e) => setNovaCategoria(e.target.value)}
            disabled={isMutating}
            className="h-11 rounded-[16px] bg-background border-border text-xs font-medium focus-visible:ring-primary/20 flex-1"
          />
          <Button
            type="submit"
            disabled={isMutating || !novaCategoria.trim()}
            className="h-11 px-4 rounded-[16px] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shrink-0 gap-1.5 active:scale-95 transition-all"
          >
            {createCategoria.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </>
            )}
          </Button>
        </form>

        <div className="border-t border-border/60 pt-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground font-medium">Carregando categorias...</p>
            </div>
          ) : categorias.length > 0 ? (
            <div className="rounded-2xl border border-border bg-card divide-y divide-border/60 max-h-[350px] overflow-y-auto">
              {categorias.map((cat) => (
                <div key={cat.id} className="p-3.5 flex items-center justify-between gap-3 group">
                  <div className="flex-1 min-w-0">
                    {editingId === cat.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={editingNome}
                          onChange={(e) => setEditingNome(e.target.value)}
                          disabled={isMutating}
                          className="h-9 px-3 rounded-[12px] bg-background border-border text-xs font-medium"
                          autoFocus
                        />
                        <Button
                          size="icon"
                          onClick={() => handleSaveEdit(cat.id)}
                          disabled={isMutating || !editingNome.trim()}
                          className="h-9 w-9 bg-primary hover:bg-primary-hover text-primary-foreground rounded-[12px] shrink-0"
                        >
                          {updateCategoria.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    ) : (
                      <span className="font-semibold text-foreground text-sm leading-tight truncate block">
                        {cat.nome}
                      </span>
                    )}
                  </div>
                  {editingId !== cat.id && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleStartEdit(cat.id, cat.nome)}
                        disabled={isMutating}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-surface-alt rounded-lg cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(cat.id, cat.nome)}
                        disabled={isMutating}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <UnifiedEmptyState
              icon={Tag}
              title="Nenhuma categoria cadastrada"
              description="Crie a primeira categoria utilizando o campo acima."
            />
          )}
        </div>
      </BaseDialog.Body>
    </BaseDialog>
  );
}
