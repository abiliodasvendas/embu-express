import { messages } from "@/constants/messages";
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
        cpfcnpj: "",
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
      },
      mode: "onChange",
    });
  
    const onSubmit = async (values: SelfRegistrationFormData) => {
      setIsLoading(true);
      try {
        // Use our custom backend registration API instead of direct Supabase signUp
        const payload = {
            ...values,
            email: values.email,
            password: values.senha,
            data_nascimento: values.data_nascimento ? formatDateToISO(values.data_nascimento) : values.data_nascimento,
            cnh_vencimento: values.cnh_vencimento ? formatDateToISO(values.cnh_vencimento) : values.cnh_vencimento,
            // Map cpfcnpj to cpf or cnpj based on length (formatted or not)
            // CPF formatted is 14 chars, CNPJ formatted is 18 chars
            // Unformatted CPF is 11, CNPJ is 14
            cpf: values.cpfcnpj.length <= 14 ? values.cpfcnpj : undefined,
            cnpj: values.cpfcnpj.length > 14 ? values.cpfcnpj : undefined,
            perfil_id: 3, // Default to Motoboy for self-registration
        };
        // Remove cpfcnpj from payload if not needed by backend, but keeping it doesn't hurt usually
        // unless strict validation.

        // This ensures the public.usuarios record is created first/sequentially
        await authApi.register(payload);
  
        setSuccess(true);
        toast.success(messages.sucesso.operacao);
  
      } catch (error: any) {
        console.error(error);
        toast.error(messages.erro.operacao, {
          description: error.response?.data?.error || error.message || messages.erro.generico
        });
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
