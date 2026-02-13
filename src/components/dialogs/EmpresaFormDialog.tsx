import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle
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
import { messages } from "@/constants/messages";
import { useCreateEmpresa, useUpdateEmpresa } from "@/hooks/api/useEmpresaMutations";
import { Empresa } from "@/types/database";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { cnpjMask } from "@/utils/masks";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, FileText, Hash, Loader2, Wand2, X, Zap } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { EmpresaFormValues, empresaSchema } from "@/schemas/empresaSchema";

interface EmpresaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresaToEdit?: Empresa;
}

export function EmpresaFormDialog({
  open,
  onOpenChange,
  empresaToEdit,
}: EmpresaFormDialogProps) {
  const createEmpresa = useCreateEmpresa();
  const updateEmpresa = useUpdateEmpresa();

  const isEditing = !!empresaToEdit;
  const isLoading = createEmpresa.isPending || updateEmpresa.isPending;

  const form = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      nome_fantasia: "",
      razao_social: "",
      cnpj: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (empresaToEdit) {
        form.reset({
          nome_fantasia: empresaToEdit.nome_fantasia,
          razao_social: empresaToEdit.razao_social || "",
          cnpj: cnpjMask(empresaToEdit.cnpj || ""),
        });
      } else {
        form.reset({
          nome_fantasia: "",
          razao_social: "",
          cnpj: "",
        });
      }
    }
  }, [open, empresaToEdit, form]);

  const handleFillMock = () => {
    const mockData = mockGenerator.empresa();
    form.reset({
        nome_fantasia: mockData.nome_fantasia,
        razao_social: mockData.razao_social,
        cnpj: cnpjMask(mockData.cnpj),
    });
    toast.success(messages.mock.sucesso.preenchido);
  };

  const handleQuickCreate = async () => {
    try {
      const mockData = mockGenerator.empresa();
      const empresaData = {
        ...mockData,
        ativo: true,
      };
      await createEmpresa.mutateAsync(empresaData);
      toast.success(messages.empresa.sucesso.criadaRapida);
      safeCloseDialog(() => onOpenChange(false));
    } catch (error: any) {
      toast.error(messages.empresa.erro.quickCreate, { description: error.message });
    }
  };

  const onSubmit = async (data: EmpresaFormValues) => {
    try {
      if (isEditing && empresaToEdit) {
        await updateEmpresa.mutateAsync({ id: empresaToEdit.id, ...data });
      } else {
        await createEmpresa.mutateAsync(data as any); 
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar empresa:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && safeCloseDialog(() => onOpenChange(false))}>
      <DialogContent className="w-full max-w-lg p-0 gap-0 bg-gray-50 flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl" hideCloseButton>
        <div className="bg-blue-600 p-4 text-center relative shrink-0">
            <div className="absolute left-4 top-4 flex gap-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 rounded-full h-10 w-10 shadow-sm border border-white/20"
                    onClick={handleFillMock}
                    title="Preencher com dados fictícios"
                >
                    <Wand2 className="h-5 w-5" />
                </Button>
                {!isEditing && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 rounded-full h-10 w-10 shadow-sm border border-white/20"
                        onClick={handleQuickCreate}
                        title="Criação Rápida"
                    >
                        <Zap className="h-5 w-5" />
                    </Button>
                )}
            </div>

            <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
                <X className="h-6 w-6" />
                <span className="sr-only">Fechar</span>
            </DialogClose>

            <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
                <Building2 className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">
                {isEditing ? "Editar Empresa" : "Nova Empresa"}
            </DialogTitle>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent bg-gray-50/30">
            <Form {...form}>
                <form id="empresa-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <FormField
                        control={form.control}
                        name="nome_fantasia"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome Fantasia <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Ex: Flow Logistics"
                                            className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors"
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
                        name="razao_social"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Razão Social</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Ex: Flow Logistics LTDA"
                                            className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors"
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
                        name="cnpj"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>CNPJ</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="00.000.000/0000-00"
                                            className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                            {...field}
                                            onChange={(e) => field.onChange(cnpjMask(e.target.value))}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full h-11 rounded-xl border-gray-200 font-medium text-gray-700 hover:bg-white"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="empresa-form"
            disabled={isLoading}
            className="w-full h-11 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isEditing ? (
              "Salvar Alterações"
            ) : (
              "Criar Empresa"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
