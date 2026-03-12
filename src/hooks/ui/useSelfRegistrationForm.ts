import { messages } from "@/constants/messages";
import { ROLES } from "@/constants/permissions.enum";
import { authApi } from "@/services/api/auth.api";
import { formatDateToISO } from "@/utils/date";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { SelfRegistrationFormData, selfRegistrationSchema } from "../../schemas/selfRegistrationSchema";

export function useSelfRegistrationForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<SelfRegistrationFormData>({
    resolver: zodResolver(selfRegistrationSchema),
    defaultValues: {
      nome_completo: "",
      email: "",
      cpf: "",
      cnpj: "",
      rg: "",
      telefone: "",
      telefone_recado: "",
      senha: "",
      data_nascimento: "",
      nome_mae: "",
      endereco_completo: "",
      moto_modelo: "",
      moto_placa: "",
      moto_cor: "",
      moto_ano: "",
      cnh_registro: "",
      cnh_vencimento: "",
      cnh_categoria: "",
      chave_pix: "",
      perfil_id: "",
      isMotoboyOrFiscal: false,
    },
    mode: "onChange",
  });

  const onSubmit = async (values: SelfRegistrationFormData, roles?: any[]) => {
    setIsLoading(true);
    try {
      // Find role name by id if roles are provided
      const roleName = roles?.find(r => r.id.toString() === values.perfil_id)?.nome || ROLES.MOTOBOY;

      // Use our custom backend registration API instead of direct Supabase signUp
      const payload = {
        ...values,
        email: values.email,
        password: values.senha,
        data_nascimento: values.data_nascimento ? formatDateToISO(values.data_nascimento) : values.data_nascimento,
        cnh_vencimento: values.cnh_vencimento ? formatDateToISO(values.cnh_vencimento) : values.cnh_vencimento,
        // Send distinct fields
        cpf: values.cpf,
        cnpj: values.cnpj,
        rg: values.rg,
        role: roleName,
      };
      // Remove cpfcnpj from payload if not needed by backend, but keeping it doesn't hurt usually
      // unless strict validation.

      // This ensures the public.usuarios record is created first/sequentially
      await authApi.register(payload);

      setSuccess(true);

    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.error || error.message || "";

      // Map background error messages to specific form fields
      if (message.toLowerCase().includes("cpf")) {
        const errorMessage = messages.usuario.erro.cpfJaExiste;
        form.setError("cpf", { message: errorMessage });
        toast.error(errorMessage);
      } else if (message.toLowerCase().includes("email") || message.toLowerCase().includes("e-mail")) {
        const errorMessage = messages.usuario.erro.emailJaExiste;
        form.setError("email", { message: errorMessage });
        toast.error(errorMessage);
      } else if (message.toLowerCase().includes("cnpj")) {
        const errorMessage = messages.usuario.erro.cnpjJaExiste;
        form.setError("cnpj", { message: errorMessage });
        toast.error(errorMessage);
      } else if (message.toLowerCase().includes("chave_pix")) {
        const errorMessage = "Esta chave PIX já está em uso";
        form.setError("chave_pix", { message: errorMessage });
        toast.error(errorMessage);
      } else {
        toast.error(messages.erro.operacao, {
          description: message || messages.erro.generico
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    success,
    onSubmit,
    navigate
  };
}
