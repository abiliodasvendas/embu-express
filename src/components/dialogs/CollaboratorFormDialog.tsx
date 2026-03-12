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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { messages } from "@/constants/messages";
import { ROLES } from "@/constants/permissions.enum";
import { STATUS_CADASTRO } from "@/constants/cadastro";
import { cn } from "@/lib/utils";
import { useCreateCollaborator, useEmpresas, useLayout, useRoles, useUpdateCollaborator } from "@/hooks";
import { useCollaboratorForm } from "@/hooks/ui/useCollaboratorForm";
import { CollaboratorFormData } from "@/schemas/collaboratorSchema";
import { Perfil, Usuario } from "@/types/database";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { getPerfilLabel } from "@/utils/formatters";
import { aplicarMascaraPlaca, cnpjMask, cpfMask, phoneMask } from "@/utils/masks";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { Briefcase, CreditCard, DollarSign, Loader2, User, UserPlus, Wand2, X } from "lucide-react";
import { useEffect, useState } from "react";
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

  const { openConfirmationDialog, closeConfirmationDialog, openCollaboratorFormDialog, openCollaboratorTurnDialog, openSuccessRegistrationDialog } = useLayout();
  const createCollaborator = useCreateCollaborator();
  const updateCollaborator = useUpdateCollaborator();

  const { form } = useCollaboratorForm({
    open,
    collaboratorToEdit
  });

  const perfilIdWatch = form.watch("perfil_id");
  const isMotoboy = form.watch("isMotoboy");

  useEffect(() => {
    if (roles && open && perfilIdWatch) {
      const selectedRole = roles.find(r => r.id.toString() === perfilIdWatch);
      const isMotoboySelected = selectedRole?.nome?.toLowerCase() === ROLES.MOTOBOY.toLowerCase();

      form.setValue("isMotoboy", !!isMotoboySelected, { shouldValidate: true });

      // Só limpamos se estivermos trocando manualmente de um motoboy para não-motoboy
      // e não quando o formulário está apenas inicializando
      if (perfilIdWatch && !isMotoboySelected && !collaboratorToEdit) {
        form.setValue("cnh_registro", "");
        form.setValue("cnh_vencimento", "");
        form.setValue("cnh_categoria", "");
        form.setValue("moto_modelo", "");
        form.setValue("moto_placa", "");
        form.setValue("moto_cor", "");
        form.setValue("moto_ano", "");
      }
    }
  }, [perfilIdWatch, roles, form, open, collaboratorToEdit]);

  const onFormError = (errors: any) => {
    toast.error(messages.validacao.formularioComErros);
    setOpenSections(["personal", "cnh", "moto", "financial"]);
  };

  /* Helper to convert DD/MM/YYYY to YYYY-MM-DD */
  const parseDateBr = (dateStr: string | undefined) => {
    if (!dateStr || dateStr.length !== 10) return null;
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  };

  const handleFillMock = async () => {
    const mockData = mockGenerator.collaborator();
    const address = mockGenerator.address();
    const moto = mockGenerator.moto();
    const cnh = mockGenerator.cnh();

    // Perfil e Status
    const motoboyRole = roles?.find(r => (r.nome as string).toLowerCase().includes("motoboy"));
    if (motoboyRole) {
      form.setValue("perfil_id", motoboyRole.id.toString() as any);
      form.setValue("isMotoboy", true);
    }
    form.setValue("status", STATUS_CADASTRO.ATIVO);

    // Personal
    form.setValue("nome_completo", mockData.nome_completo);
    form.setValue("email", mockData.email);
    form.setValue("cpf", cpfMask(mockData.cpf));
    form.setValue("rg", mockGenerator.rg());

    // Fix: Format Date of Birth as DD/MM/YYYY for the mask
    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - 25);
    const day = birthDate.getDate().toString().padStart(2, '0');
    const month = (birthDate.getMonth() + 1).toString().padStart(2, '0');
    const year = birthDate.getFullYear();
    form.setValue("data_nascimento", `${day}/${month}/${year}`);

    form.setValue("data_inicio", new Date().toISOString().split('T')[0]);
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
    form.setValue("cnh_vencimento", cnh.cnh_vencimento); // Already DD/MM/YYYY from mock
    form.setValue("cnh_categoria", cnh.cnh_categoria);

    // Financial
    form.setValue("cnpj", cnpjMask(mockGenerator.cnpj()));
    form.setValue("tipo_chave_pix", "CPF");
    form.setValue("chave_pix", cpfMask(mockGenerator.cpf()));
  };

  const onSubmit = async (vals: CollaboratorFormData) => {
    try {
      const values = vals as any;
      // Convert dates from DD/MM/YYYY to YYYY-MM-DD
      const formattedBirthDate = parseDateBr(values.data_nascimento);
      const formattedCnhDate = values.cnh_vencimento ? parseDateBr(values.cnh_vencimento) : null;

      const data = {
        ...values,
        data_nascimento: formattedBirthDate || values.data_nascimento, // Fallback if parse fails or already ISO (unlikely with mask)
        cnh_vencimento: formattedCnhDate || values.cnh_vencimento,
        perfil_id: parseInt(values.perfil_id)
      };

      if (collaboratorToEdit) {
        // @ts-ignore - links not needed for partial personal update
        await updateCollaborator.mutateAsync({ id: collaboratorToEdit.id, ...data, silent: true });
        onSuccess?.();
        safeCloseDialog(() => onClose());
      } else {
        // Execute creation with 'silent' to handle feedback with the success dialog
        const result = await createCollaborator.mutateAsync({ ...data, silent: true } as any);
        onSuccess?.(result);
        safeCloseDialog(() => {
          onClose();
          // Small delay to ensure the registration dialog is fully closed
          setTimeout(() => {
            openSuccessRegistrationDialog({ collaborator: result });
          }, 100);
        });
      }
    } catch (error: any) {
      console.error("Erro ao salvar colaborador:", error);
      const message = error.response?.data?.error || error.message || "";

      // Map backend error messages to form fields
      if (message.toLowerCase().includes("cpf")) {
        const errorMessage = messages.usuario.erro.cpfJaExiste;
        form.setError("cpf", { message: errorMessage });
        toast.error(errorMessage);
        setOpenSections(prev => prev.includes("personal") ? prev : [...prev, "personal"]);
      } else if (message.toLowerCase().includes("email") || message.toLowerCase().includes("e-mail")) {
        const errorMessage = messages.usuario.erro.emailJaExiste;
        form.setError("email", { message: errorMessage });
        toast.error(errorMessage);
        setOpenSections(prev => prev.includes("personal") ? prev : [...prev, "personal"]);
      } else if (message.toLowerCase().includes("cnpj")) {
        const errorMessage = messages.usuario.erro.cnpjJaExiste;
        form.setError("cnpj", { message: errorMessage });
        toast.error(errorMessage);
        setOpenSections(prev => prev.includes("personal") ? prev : [...prev, "personal"]);
      } else if (message.toLowerCase().includes("chave_pix")) {
        const errorMessage = "Esta chave PIX já está em uso";
        form.setError("chave_pix", { message: errorMessage });
        toast.error(errorMessage);
        setOpenSections(prev => prev.includes("financial") ? prev : [...prev, "financial"]);
      } else {
        toast.error(message || messages.erro.salvar);
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
                        <SelectContent className="rounded-xl shadow-xl">
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

                    {isMotoboy && (
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
