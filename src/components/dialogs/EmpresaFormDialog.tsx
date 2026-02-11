import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { messages } from "@/constants/messages";
import { useCreateEmpresa, useUpdateEmpresa } from "@/hooks/api/useEmpresaMutations";
import { Empresa } from "@/types/database";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { cnpjMask } from "@/utils/masks";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Loader2, Wand2, X, Zap } from "lucide-react";
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

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EmpresaFormValues>({
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
        reset({
          nome_fantasia: empresaToEdit.nome_fantasia,
          razao_social: empresaToEdit.razao_social || "",
          cnpj: cnpjMask(empresaToEdit.cnpj || ""),
        });
      } else {
        reset({
          nome_fantasia: "",
          razao_social: "",
          cnpj: "",
        });
      }
    }
  }, [open, empresaToEdit, reset]);

  const handleFillMock = () => {
    const mockData = mockGenerator.empresa();
    reset({
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

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("cnpj", cnpjMask(e.target.value));
  };

  return (
    <Dialog open={open} onOpenChange={() => safeCloseDialog(() => onOpenChange(false))}>
      <DialogContent className="sm:max-w-[425px] p-0 gap-0 bg-gray-50 flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl" hideCloseButton>
        <div className="bg-primary p-4 text-center relative shrink-0">
            <div className="absolute left-4 top-4 flex gap-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-8 w-8"
                    onClick={handleFillMock}
                    title="Preencher com dados fictícios"
                >
                    <Wand2 className="h-4 w-4" />
                </Button>
                {!isEditing && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-white/70 hover:text-cyan-300 hover:bg-white/10 rounded-full h-8 w-8"
                        onClick={handleQuickCreate}
                        title="Criação Rápida (Um clique)"
                    >
                        <Zap className="h-4 w-4" />
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
            <div className="text-white/80 text-sm mt-1">
                {isEditing
                ? "Ajuste as informações da empresa selecionada."
                : "Preencha os dados para cadastrar uma nova empresa."}
            </div>
        </div>

        <div className="p-6 bg-white space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="nome_fantasia">Nome Fantasia <span className="text-red-500">*</span></Label>
                <Input
                id="nome_fantasia"
                placeholder="Ex: Flow Logistics"
                {...register("nome_fantasia")}
                className="h-11 rounded-xl bg-gray-50"
                />
                {errors.nome_fantasia && (
                <p className="text-sm text-red-500">{errors.nome_fantasia.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="razao_social">Razão Social</Label>
                <Input
                id="razao_social"
                placeholder="Ex: Flow Logistics LTDA"
                {...register("razao_social")}
                className="h-11 rounded-xl bg-gray-50"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                id="cnpj"
                placeholder="00.000.000/0000-00"
                {...register("cnpj")}
                onChange={(e) => {
                    handleCnpjChange(e);
                }}
                className="h-11 rounded-xl bg-gray-50"
                />
            </div>

            <DialogFooter className="pt-4">
                <Button
                type="button"
                variant="outline"
                onClick={() => safeCloseDialog(() => onOpenChange(false))}
                disabled={isLoading}
                className="h-11 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-100 font-medium"
                >
                Cancelar
                </Button>
                <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg transition-all active:scale-95"
                >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Atualizar" : "Salvar"}
                </Button>
            </DialogFooter>
            </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
