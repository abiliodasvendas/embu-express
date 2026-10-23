import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { NativeSelect } from "@/components/ui/native-select";
import { PIX_TYPES } from "@/constants/financeiro.constants";
import { messages } from "@/constants/messages";
import { useCreateCollaborator, useEmpresas, useLayout, useRoles, useUpdateCollaborator } from "@/hooks";
import { useCollaboratorForm } from "@/hooks/form/useCollaboratorForm";
import { CollaboratorFormData, CollaboratorFormValues } from "@/schemas/collaboratorSchema";
import { Perfil, Usuario } from "@/types/database";
import { StatusUsuario } from "@/types/enums";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { getPerfilLabel } from "@/utils/formatters";
import { isMotoboy } from "@/utils/business/roles";
import { aplicarMascaraPlaca, cnpjMask, cpfMask, phoneMask } from "@/utils/masks";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { Briefcase, CreditCard, DollarSign, User, UserPlus, Wand2 } from "lucide-react";
import { useEffect } from "react";
import { FieldErrors } from "react-hook-form";
import { CollaboratorFormFinancial } from "../features/collaborator/form/CollaboratorFormFinancial";
import { CollaboratorFormPersonal } from "../features/collaborator/form/CollaboratorFormPersonal";
import { CollaboratorFormCNH, CollaboratorFormMoto } from "../features/collaborator/form/CollaboratorFormProfessional";

interface CollaboratorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collaboratorToEdit?: Usuario | null;
  onSuccess?: (collaborator: Usuario) => void;
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

  const { openSuccessRegistrationDialog } = useLayout();
  const createCollaborator = useCreateCollaborator();
  const updateCollaborator = useUpdateCollaborator();

  const { form } = useCollaboratorForm({
    open,
    collaboratorToEdit,
  });

  const perfilIdWatch = form.watch("perfil_id");

  const selectedRole = roles?.find((r) => r.id.toString() === perfilIdWatch);
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
  };

  const handleFillMock = () => {
    const mockData = mockGenerator.collaborator();
    const address = mockGenerator.address();
    const moto = mockGenerator.moto();
    const cnh = mockGenerator.cnh();

    const motoboyRole = roles?.find((r) => isMotoboy(r.nome));
    if (motoboyRole) {
      form.setValue("perfil_id", motoboyRole.id.toString());
    }
    form.setValue("status", StatusUsuario.ATIVO);

    form.setValue("nome_completo", mockData.nome_completo);
    form.setValue("email", mockData.email);
    form.setValue("cpf", cpfMask(mockData.cpf));
    form.setValue("rg", mockGenerator.rg());
    form.setValue("data_nascimento", mockData.data_nascimento);

    form.setValue("nome_mae", mockGenerator.name());
    form.setValue("telefone", phoneMask(mockGenerator.phone()));
    form.setValue("telefone_recado", phoneMask(mockGenerator.phone()));

    form.setValue(
      "endereco_completo",
      `${address.logradouro}, ${address.numero} - ${address.bairro}, ${address.cidade} - ${address.estado}, ${address.cep}`
    );

    form.setValue("moto_modelo", moto.moto_modelo);
    form.setValue("moto_cor", moto.moto_cor);
    form.setValue("moto_ano", moto.moto_ano.toString());
    form.setValue("moto_placa", aplicarMascaraPlaca(moto.moto_placa));

    form.setValue("cnh_registro", cnh.cnh_registro);
    form.setValue("cnh_vencimento", cnh.cnh_vencimento);
    form.setValue("cnh_categoria", cnh.cnh_categoria);

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
          silent: true,
        });

        onSuccess?.(result);
        safeCloseDialog(onClose);
      } else {
        const result = await createCollaborator.mutateAsync({
          ...values,
          silent: true,
        });

        onSuccess?.(result);
        safeCloseDialog(() => {
          onClose();
          setTimeout(() => {
            openSuccessRegistrationDialog({ collaborator: result });
          }, 100);
        });
      }
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { error?: string; message?: string } };
        message?: string;
      };
      const errorMessage =
        axiosError.response?.data?.error ||
        axiosError.response?.data?.message ||
        axiosError.message ||
        "";
      const errorMsgLower = errorMessage.toLowerCase();

      const errorFieldMapping: Record<string, keyof CollaboratorFormValues> = {
        cpf: "cpf",
        email: "email",
        "e-mail": "email",
        cnpj: "cnpj",
        chave_pix: "chave_pix",
        "chave pix": "chave_pix",
        rg: "rg",
      };

      const matchedKey = Object.keys(errorFieldMapping).find((k) =>
        errorMsgLower.includes(k)
      );

      if (matchedKey) {
        const field = errorFieldMapping[matchedKey];
        form.setError(field, { message: errorMessage });
        toast.error(errorMessage);
      } else {
        toast.error(errorMessage || messages.erro.salvar);
      }
    }
  };

  const isSubmitting = createCollaborator.isPending || updateCollaborator.isPending;

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="3xl"
      description="Formulário de cadastro e edição de colaborador"
    >
      <BaseDialog.Header
        title={collaboratorToEdit ? "Editar Colaborador" : "Novo Colaborador"}
        subtitle="Preencha os dados cadastrais e operacionais do colaborador"
        icon={<User className="h-5 w-5" />}
        onClose={onClose}
        leftAction={
          import.meta.env.DEV ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-[12px] border-border text-muted-foreground hover:text-foreground hover:bg-surface-alt"
              onClick={handleFillMock}
              title="Preencher com dados fictícios"
            >
              <Wand2 className="h-4 w-4" />
            </Button>
          ) : undefined
        }
      />

      <BaseDialog.Body className="p-6 space-y-6">
        <Form {...form}>
          <form
            id="collaborator-form"
            onSubmit={form.handleSubmit(onSubmit, onFormError)}
            className="space-y-6"
          >
            <div className="space-y-3">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground tracking-tight">
                  Perfil & Cargo
                </h4>
                <p className="text-xs text-muted-foreground">
                  Selecione o cargo para definir as regras operacionais e campos
                </p>
              </div>

              <FormField
                control={form.control}
                name="perfil_id"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-xs font-semibold text-foreground">
                      Cargo / Perfil <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <NativeSelect
                        value={field.value || ""}
                        onChange={field.onChange}
                        className="h-11 rounded-[18px] bg-background border-border text-sm font-normal"
                      >
                        <option value="">Selecione o cargo</option>
                        {roles?.map((role: Perfil) => (
                          <option key={role.id} value={role.id.toString()}>
                            {getPerfilLabel(role.nome)}
                          </option>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormMessage className="text-xs text-destructive ml-1" />
                  </FormItem>
                )}
              />
            </div>

            {perfilIdWatch ? (
              <div className="space-y-6">
                <section className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground tracking-tight">
                      Dados Pessoais & Contato
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Documentos, endereço e canais de comunicação
                    </p>
                  </div>
                  <CollaboratorFormPersonal roles={roles} />
                </section>

                {checkIsMotoboy && (
                  <>
                    <section className="space-y-3 pt-1">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-foreground tracking-tight">
                          Habilitação (CNH)
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Registro, validade e categoria da carteira
                        </p>
                      </div>
                      <CollaboratorFormCNH />
                    </section>

                    <section className="space-y-3 pt-1">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-foreground tracking-tight">
                          Veículo (Moto)
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Informações da motocicleta utilizada nas operações
                        </p>
                      </div>
                      <CollaboratorFormMoto />
                    </section>
                  </>
                )}

                <section className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground tracking-tight">
                      Dados Financeiros & MEI
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Dados de chave PIX e faturamento MEI
                    </p>
                  </div>
                  <CollaboratorFormFinancial empresas={empresas} />
                </section>
              </div>
            ) : (
              <div className="py-12 text-center space-y-3 bg-background rounded-[20px] border border-dashed border-border">
                <div className="bg-muted/80 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                  <Briefcase className="w-6 h-6" />
                </div>
                <p className="text-xs text-muted-foreground font-medium max-w-xs mx-auto">
                  Selecione o cargo acima para carregar os campos cadastrais correspondentes.
                </p>
              </div>
            )}
          </form>
        </Form>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={() => safeCloseDialog(onClose)}
          type="button"
        />
        <BaseDialog.Action
          label={collaboratorToEdit ? "Salvar Alterações" : "Criar Colaborador"}
          variant="primary"
          type="submit"
          form="collaborator-form"
          isLoading={isSubmitting}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
