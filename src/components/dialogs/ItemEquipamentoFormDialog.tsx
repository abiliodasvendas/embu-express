import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { messages } from "@/constants/messages";
import {
  useCategoriasQuery,
  useCreateItem,
  useUpdateItem,
} from "@/hooks/api/useItensEquipamentos";
import { cn } from "@/lib/utils";
import { itemEquipamentoSchema } from "@/schemas/itensEquipamentosSchema";
import { ItemEquipamento } from "@/types/database";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Loader2, Package, Tag, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface ItemEquipamentoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemToEdit?: ItemEquipamento | null;
}

type ItemFormValues = z.infer<typeof itemEquipamentoSchema>;

export function ItemEquipamentoFormDialog({
  open,
  onOpenChange,
  itemToEdit,
}: ItemEquipamentoFormDialogProps) {
  const { data: categorias = [] } = useCategoriasQuery();
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();

  const isEditing = !!itemToEdit;
  const isLoading = createItem.isPending || updateItem.isPending;

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemEquipamentoSchema),
    defaultValues: {
      nome: "",
      categoria_id: undefined as any,
      ativo: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (itemToEdit) {
        form.reset({
          nome: itemToEdit.nome,
          categoria_id: itemToEdit.categoria_id,
          ativo: itemToEdit.ativo,
        });
      } else {
        const defaultCategoriaId = categorias.length === 1 ? categorias[0].id : undefined;
        form.reset({
          nome: "",
          categoria_id: defaultCategoriaId as any,
          ativo: true,
        });
      }
    }
  }, [open, itemToEdit, form, categorias]);

  const onSubmit = async (values: ItemFormValues) => {
    try {
      const payload = {
        nome: values.nome,
        categoria_id: values.categoria_id,
        ativo: values.ativo ?? true,
      };

      if (isEditing && itemToEdit) {
        await updateItem.mutateAsync({
          id: itemToEdit.id,
          ...payload,
        });
      } else {
        await createItem.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(isEditing ? messages.itemEquipamento.erro.atualizar : messages.itemEquipamento.erro.criar, {
        description: error.response?.data?.message || error.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && safeCloseDialog(() => onOpenChange(false))}>
      <DialogContent
        className="w-full max-w-md p-0 gap-0 h-[100dvh] sm:h-auto sm:max-h-[90vh] bg-white flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        <div className="bg-blue-600 p-4 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Fechar</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
            <Package className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            {isEditing ? "Editar Item" : "Novo Item"}
          </DialogTitle>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 bg-white">
          <Form {...form}>
            <form id="item-equipamento-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                      Nome do Item <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          className={cn(
                            "pl-10 h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all shadow-sm",
                            form.formState.errors.nome && "border-red-500 focus-visible:ring-red-200"
                          )}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoria_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                      Categoria <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={cn(
                            "h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all shadow-sm",
                            form.formState.errors.categoria_id && "border-red-500"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-gray-400" />
                            <SelectValue placeholder="Selecione uma categoria" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-gray-100">
                        {categorias.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <div className="p-4 border-t border-gray-100 bg-white shrink-0 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full h-12 rounded-xl border-gray-200 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="item-equipamento-form"
            disabled={isLoading}
            className="w-full h-12 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isEditing ? (
              "Salvar Alterações"
            ) : (
              "Criar Item"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
