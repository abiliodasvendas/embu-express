import { BaseDialog } from "@/components/ui/BaseDialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
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
import { FileText, Package } from "lucide-react";
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
      categoria_id: 0,
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
        const defaultCategoriaId = categorias.length === 1 ? categorias[0].id : 0;
        form.reset({
          nome: "",
          categoria_id: defaultCategoriaId,
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
      safeCloseDialog(() => onOpenChange(false));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(isEditing ? messages.itemEquipamento.erro.atualizar : messages.itemEquipamento.erro.criar, {
        description: err.response?.data?.message || err.message,
      });
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={(val) => !val && safeCloseDialog(() => onOpenChange(false))}
      maxWidth="md"
    >
      <BaseDialog.Header
        icon={<Package className="h-5 w-5" />}
        title={isEditing ? "Editar Item" : "Novo Item"}
        subtitle={
          isEditing
            ? "Atualize os dados e a categoria do item no catálogo"
            : "Cadastre um novo item ou equipamento para alocação na operação"
        }
        onClose={() => safeCloseDialog(() => onOpenChange(false))}
      />

      <BaseDialog.Body className="py-5 px-6">
        <Form {...form}>
          <form id="item-equipamento-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-foreground">
                    Nome do Item <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        placeholder="Ex: Capacete, Celular, Jaqueta..."
                        className={cn(
                          "pl-10 h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all",
                          form.formState.errors.nome && "border-destructive focus-visible:ring-destructive/20"
                        )}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-destructive ml-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoria_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-foreground">
                    Categoria <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <NativeSelect
                      value={field.value ? String(field.value) : ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                      className={cn(
                        "h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all",
                        form.formState.errors.categoria_id && "border-destructive"
                      )}
                    >
                      <option value="">Selecione uma categoria...</option>
                      {categorias.map((cat) => (
                        <option key={cat.id} value={String(cat.id)}>
                          {cat.nome}
                        </option>
                      ))}
                    </NativeSelect>
                  </FormControl>
                  <FormMessage className="text-xs text-destructive ml-1" />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={() => safeCloseDialog(() => onOpenChange(false))}
          disabled={isLoading}
        />
        <BaseDialog.Action
          label={isEditing ? "Salvar Alterações" : "Criar Item"}
          variant="primary"
          type="submit"
          form="item-equipamento-form"
          isLoading={isLoading}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
