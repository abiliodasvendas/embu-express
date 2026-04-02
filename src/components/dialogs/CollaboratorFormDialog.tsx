import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PIX_TYPES } from "@/constants/financeiro.constants";
import { messages } from "@/constants/messages";
import { useCreateCollaborator, useEmpresas, useLayout, useRoles, useUpdateCollaborator } from "@/hooks";
import { useCollaboratorForm } from "@/hooks/form/useCollaboratorForm";
import { cn } from "@/lib/utils";
import { CollaboratorFormData, CollaboratorFormValues } from "@/schemas/collaboratorSchema";
import { Perfil, Usuario } from "@/types/database";
import { StatusUsuario } from "@/types/enums";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { getPerfilLabel } from "@/utils/formatters";
import { isMotoboy, isMotoboyOrFiscal } from "@/utils/business/roles";
import { aplicarMascaraPlaca, cnpjMask, cpfMask, phoneMask } from "@/utils/masks";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { Briefcase, CreditCard, DollarSign, Loader2, User, UserPlus, Wand2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FieldErrors } from "react-hook-form";
import { CollaboratorFormFinancial } from "../features/collaborator/form/CollaboratorFormFinancial";
import { CollaboratorFormPersonal } from "../features/collaborator/form/CollaboratorFormPersonal";
import { CollaboratorFormCNH, CollaboratorFormMoto } from "../features/collaborator/form/CollaboratorFormProfessional";

interface CollaboratorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collaboratorToEdit?: Usuario | null;
  onSuccess?: (data?: any) => void;
}

export function CollaboratorFormDialog({
  open,
  onOpenChange,
  collaboratorToEdit = null,
  onSuccess,
}: CollaboratorFormProps) {
  const onClose = () => onOpenChange(false);

  const { data: roles } = useRoles();
  const { data: empresas } = useEmpresas();
  const [openSections, setOpenSections] = useState(["personal", "cnh", "moto", "financial"]);

  const { openSuccessRegistrationDialog } = useLayout();
  const createCollaborator = useCreateCollaborator();
  const updateCollaborator = useUpdateCollaborator();

  const { form } = useCollaboratorForm({
    open,
    collaboratorToEdit
  });

  const perfilIdWatch = form.watch("perfil_id");

  const selectedRole = roles?.find(r => r.id.toString() === perfilIdWatch);
  const checkIsMotoboy = isMotoboy(selectedRole?.nome);

  useEffect(() => {
    if (open && perfilIdWatch && !checkIsMotoboy && !collaboratorToEdit) {
      form.setValue("cnh_registro", "");
      form.setValue("cnh_vencimento", "");
      form.setValue("cnh_categoria", "");
      form.setValue("moto_modelo", "");
      form.setValue("moto_placa", "");
      form.setValue("moto_cor", "");
      form.setValue("moto_ano", "");
    }
  }, [perfilIdWatch, checkIsMotoboy, form, open, collaboratorToEdit]);

  const onFormError = (errors: FieldErrors<CollaboratorFormValues>) => {
    toast.error(messages.validacao.formularioComErros);
    // Garantir que as seções com erro fiquem abertas
    const sectionsWithError = new Set<string>();
    if (errors.nome_completo || errors.email || errors.cpf || errors.rg || errors.data_nascimento) sectionsWithError.add("personal");
    if (errors.cnh_registro || errors.cnh_vencimento || errors.cnh_categoria) sectionsWithError.add("cnh");
    if (errors.moto_modelo || errors.moto_cor || errors.moto_ano || errors.moto_placa) sectionsWithError.add("moto");
    if (errors.cnpj || errors.valor_mei || errors.tipo_chave_pix || errors.chave_pix) sectionsWithError.add("financial");

    setOpenSections(prev => Array.from(new Set([...prev, ...Array.from(sectionsWithError)])));
  };

  const handleFillMock = async () => {
    const mockData = mockGenerator.collaborator();
    const address = mockGenerator.address();
    const moto = mockGenerator.moto();
    const cnh = mockGenerator.cnh();

    // Perfil e Status
    const motoboyRole = roles?.find(r => isMotoboy(r.nome));
    if (motoboyRole) {
      form.setValue("perfil_id", motoboyRole.id.toString() as any);
    }
    form.setValue("status", StatusUsuario.ATIVO);

    // Personal
    form.setValue("nome_completo", mockData.nome_completo);
    form.setValue("email", mockData.email);
    form.setValue("cpf", cpfMask(mockData.cpf));
    form.setValue("rg", mockGenerator.rg());
    form.setValue("data_nascimento", mockData.data_nascimento);

    form.setValue("nome_mae", mockGenerator.name());
    form.setValue("telefone", phoneMask(mockGenerator.phone()));
    form.setValue("telefone_recado", phoneMask(mockGenerator.phone()));

    // Address
    form.setValue("endereco_completo", `${address.logradouro}, ${address.numero} - ${address.bairro}, ${address.cidade} - ${address.estado}, ${address.cep}`);

    // Professional / Moto
    form.setValue("moto_modelo", moto.moto_modelo);
    form.setValue("moto_cor", moto.moto_cor);
    form.setValue("moto_ano", moto.moto_ano.toString());
    form.setValue("moto_placa", aplicarMascaraPlaca(moto.moto_placa));

    form.setValue("cnh_registro", cnh.cnh_registro);
    form.setValue("cnh_vencimento", cnh.cnh_vencimento);
    form.setValue("cnh_categoria", cnh.cnh_categoria);

    // Financial
    form.setValue("cnpj", cnpjMask(mockGenerator.cnpj()));
    form.setValue("tipo_chave_pix", PIX_TYPES.CPF);
    form.setValue("chave_pix", cpfMask(mockGenerator.cpf()));
  };

  const onSubmit = async (values: CollaboratorFormData) => {
    try {
      if (collaboratorToEdit) {
        const result = await updateCollaborator.mutateAsync({
          id: collaboratorToEdit.id,
          ...values,
          silent: true
        });

        onSuccess?.(result);
        safeCloseDialog(onClose);
      } else {
        const result = await createCollaborator.mutateAsync({
          ...values,
          silent: true
        });

        onSuccess?.(result);
        safeCloseDialog(() => {
          onClose();
          setTimeout(() => {
            openSuccessRegistrationDialog({ collaborator: result });
          }, 100);
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "";
      const errorMsgLower = errorMessage.toLowerCase();

      // Mapeamento de erros comuns do backend para campos do formulário
      const errorFieldMapping: Record<string, { field: keyof CollaboratorFormValues; section: string }> = {
        "cpf": { field: "cpf", section: "personal" },
        "email": { field: "email", section: "personal" },
        "e-mail": { field: "email", section: "personal" },
        "cnpj": { field: "cnpj", section: "financial" },
        "chave_pix": { field: "chave_pix", section: "financial" },
        "chave pix": { field: "chave_pix", section: "financial" },
        "rg": { field: "rg", section: "personal" }
      };

      const matchedError = Object.entries(errorFieldMapping).find(([key]) => errorMsgLower.includes(key));

      if (matchedError) {
        const [, { field, section }] = matchedError;
        form.setError(field, { message: errorMessage });
        toast.error(errorMessage);
        setOpenSections(prev => prev.includes(section) ? prev : [...prev, section]);
      } else {
        toast.error(errorMessage || messages.erro.salvar);
      }
    }
  };

  const isSubmitting = createCollaborator.isPending || updateCollaborator.isPending;

  return (
    <Dialog open={open} onOpenChange={() => safeCloseDialog(onClose)}>
      <DialogContent
        className="w-full max-w-3xl p-0 gap-0 bg-gray-50 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        <div className="bg-blue-600 p-4 text-center relative shrink-0">
          {import.meta.env.DEV && (
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
            </div>
          )}

          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Fechar</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
            <User className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            {collaboratorToEdit ? "Editar Colaborador" : "Novo Colaborador"}
          </DialogTitle>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent bg-gray-50/30">
          <Form {...form}>
            <form id="collaborator-form" onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-6">
              {/* 0. SELEÇÃO DE CARGO */}
              <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm mb-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-800 leading-none">Perfil do Colaborador</h3>
                    <p className="text-xs text-gray-500 mt-1">Selecione o cargo para liberar o formulário</p>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="perfil_id"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">
                        Cargo / Permissão <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger
                            className={cn(
                              "h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all",
                              form.formState.errors.perfil_id && "border-red-500 focus:ring-red-200 ring-offset-0 focus:ring-2",
                            )}
                          >
                            <SelectValue placeholder="Selecione o cargo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl shadow-xl" side="bottom" sideOffset={4}>
                          {roles?.map((role: Perfil) => (
                            <SelectItem key={role.id} value={role.id.toString()} className="h-10 rounded-lg cursor-pointer">
                              {getPerfilLabel(role.nome)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {perfilIdWatch ? (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                  <Accordion
                    type="multiple"
                    value={openSections}
                    onValueChange={setOpenSections}
                    className="space-y-4"
                  >
                    <AccordionItem value="personal" className="border rounded-2xl px-4 bg-white shadow-sm border-gray-100">
                      <AccordionTrigger className="hover:no-underline py-4 font-bold text-gray-700">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-600" />
                          Dados Pessoais
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-6 pt-2">
                        <CollaboratorFormPersonal roles={roles} />
                      </AccordionContent>
                    </AccordionItem>

                    {checkIsMotoboy && (
                      <>
                        <AccordionItem value="cnh" className="border rounded-2xl px-4 bg-white shadow-sm border-gray-100">
                          <AccordionTrigger className="hover:no-underline py-4 font-bold text-gray-700">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-blue-600" />
                              Dados da CNH
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-6 pt-2">
                            <CollaboratorFormCNH />
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="moto" className="border rounded-2xl px-4 bg-white shadow-sm border-gray-100">
                          <AccordionTrigger className="hover:no-underline py-4 font-bold text-gray-700">
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-blue-600" />
                              Dados da Moto
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-6 pt-2">
                            <CollaboratorFormMoto />
                          </AccordionContent>
                        </AccordionItem>
                      </>
                    )}

                    <AccordionItem value="financial" className="border rounded-2xl px-4 bg-white shadow-sm border-gray-100">
                      <AccordionTrigger className="hover:no-underline py-4 font-bold text-gray-700">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          Financeiro
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-6 pt-2">
                        <CollaboratorFormFinancial empresas={empresas} />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              ) : (
                <div className="py-16 text-center space-y-4 opacity-40">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <Briefcase className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Selecione um cargo para visualizar o restante do formulário.</p>
                </div>
              )}

            </form>
          </Form>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full h-11 rounded-xl border-gray-200 font-medium text-gray-700 hover:bg-white"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="collaborator-form"
            className="w-full h-11 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              collaboratorToEdit ? "Salvar Alterações" : "Criar Colaborador"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
