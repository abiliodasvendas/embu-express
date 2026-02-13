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
import { Form } from "@/components/ui/form";
import { messages } from "@/constants/messages";
import { useCreateCollaborator, useRoles, useUpdateCollaborator } from "@/hooks";
import { useCollaboratorForm } from "@/hooks/ui/useCollaboratorForm";
import { CollaboratorFormData } from "@/schemas/collaboratorSchema";
import { Usuario } from "@/types/database";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { aplicarMascaraPlaca, cnpjMask, cpfMask, phoneMask } from "@/utils/masks";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { Loader2, User, Wand2, X } from "lucide-react";
import { useState } from "react";
import { CollaboratorFormPersonal } from "../features/collaborator/form/CollaboratorFormPersonal";
import { CollaboratorFormProfessional } from "../features/collaborator/form/CollaboratorFormProfessional";

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
  const [openSections, setOpenSections] = useState(["personal", "professional"]);

  const createCollaborator = useCreateCollaborator();
  const updateCollaborator = useUpdateCollaborator();

  const { form } = useCollaboratorForm({ 
      open, 
      collaboratorToEdit 
  });

  const onFormError = (errors: any) => {
    toast.error(messages.validacao.formularioComErros);
    setOpenSections(["personal", "professional"]);
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
    
    // Personal
    form.setValue("nome_completo", mockData.nome_completo);
    form.setValue("email", mockData.email);
    form.setValue("cpf", cpfMask(mockData.cpf));
    form.setValue("rg", mockGenerator.rg());
    form.setValue("perfil_id", (roles ? roles.find(r => r.nome === 'motoboy')?.id.toString() || "3" : "3") as any);
    
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

    form.setValue("cnpj", cnpjMask(mockGenerator.cnpj()));
    form.setValue("chave_pix", mockGenerator.cpf());
    
    toast.success(messages.mock.sucesso.preenchido);
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
        perfil_id: parseInt(values.perfil_id),
        // Links are no longer managed here
        links: collaboratorToEdit ? [] : undefined 
      };

      if (collaboratorToEdit) {
        // @ts-ignore - links not needed for partial personal update
        await updateCollaborator.mutateAsync({ id: collaboratorToEdit.id, ...data });
      } else {
        await createCollaborator.mutateAsync(data as any);
      }
      onSuccess?.(); 
      safeCloseDialog(() => onClose());
    } catch (error) {
      // Error handled by the mutation or global toast
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

        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-6">
              <Accordion 
                type="multiple" 
                value={openSections} 
                onValueChange={setOpenSections} 
                className="space-y-4"
              >
                <AccordionItem value="personal" className="border rounded-2xl px-4 bg-white shadow-sm border-gray-100">
                  <AccordionTrigger className="hover:no-underline py-4 font-bold text-gray-700">
                    Dados Pessoais
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pt-2">
                    <CollaboratorFormPersonal roles={roles} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="professional" className="border rounded-2xl px-4 bg-white shadow-sm border-gray-100">
                  <AccordionTrigger className="hover:no-underline py-4 font-bold text-gray-700">
                    Profissional & Moto
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pt-2">
                    <CollaboratorFormProfessional />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 grid grid-cols-2 gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose}
                    className="w-full h-11 rounded-xl border-gray-200 font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
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
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
