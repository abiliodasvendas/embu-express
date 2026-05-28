import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLayout } from "@/contexts/LayoutContext";
import {
  useCategoriasQuery,
  useCreateCategoria,
  useDeleteCategoria,
  useUpdateCategoria,
} from "@/hooks/api/useItensEquipamentos";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { Check, Edit2, Loader2, Plus, Tag, Trash2, X } from "lucide-react";
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
    } catch (err) {
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
    } catch (err) {
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
    <Dialog open={open} onOpenChange={(val) => !val && safeCloseDialog(() => onOpenChange(false))}>
      <DialogContent
        onPointerDownOutside={(e) => {
          if (document.querySelector('[role="alertdialog"]')) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (document.querySelector('[role="alertdialog"]')) {
            e.preventDefault();
          }
        }}
        className="w-full max-w-md p-0 gap-0 h-[100dvh] sm:h-auto sm:max-h-[85vh] bg-white flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        <div className="bg-blue-600 p-4 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Fechar</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
            <Tag className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Gerenciar Categorias
          </DialogTitle>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 bg-white space-y-4">
          <form onSubmit={handleAdd} className="flex gap-2 shrink-0">
            <Input
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
              disabled={isMutating}
              className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all font-medium flex-1 shadow-sm"
            />
            <Button
              type="submit"
              disabled={isMutating || !novaCategoria.trim()}
              className="h-11 px-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm shrink-0"
            >
              {createCategoria.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </Button>
          </form>

          <div className="border-t border-gray-100 pt-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <p className="text-xs text-slate-400 font-medium">Carregando categorias...</p>
              </div>
            ) : categorias.length > 0 ? (
              <div className="divide-y divide-gray-50 max-h-[350px] overflow-y-auto pr-1">
                {categorias.map((cat) => (
                  <div key={cat.id} className="py-2.5 flex items-center justify-between gap-3 group">
                    <div className="flex-1 min-w-0">
                      {editingId === cat.id ? (
                        <div className="flex gap-2">
                          <Input
                            value={editingNome}
                            onChange={(e) => setEditingNome(e.target.value)}
                            disabled={isMutating}
                            className="h-9 px-2 rounded-lg bg-gray-50 border-gray-200 focus:bg-white font-medium"
                          />
                          <Button
                            size="icon"
                            onClick={() => handleSaveEdit(cat.id)}
                            disabled={isMutating || !editingNome.trim()}
                            className="h-9 w-9 bg-green-600 hover:bg-green-700 text-white rounded-lg shrink-0"
                          >
                            {updateCategoria.isPending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      ) : (
                        <span className="font-bold text-gray-800 text-sm leading-tight">
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
                          className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(cat.id, cat.nome)}
                          disabled={isMutating}
                          className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50/50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Tag className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-500">Nenhuma categoria cadastrada</p>
                <p className="text-xs text-gray-400 mt-1">Crie a primeira categoria no campo acima.</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-white shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isMutating}
            className="w-full h-11 rounded-xl border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
