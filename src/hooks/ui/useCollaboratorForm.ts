import { STATUS_CADASTRO } from "@/constants/cadastro";
import { Usuario } from "@/types/database";
import { formatDateToBR } from "@/utils/formatters/date";
import { cnpjMask, cpfMask, phoneMask, rgMask } from "@/utils/masks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { CollaboratorFormValues, collaboratorSchema } from "../../schemas/collaboratorSchema";

interface UseCollaboratorFormProps {
  open: boolean;
  collaboratorToEdit?: Usuario | null;
}

export function useCollaboratorForm({ open, collaboratorToEdit }: UseCollaboratorFormProps) {
  const form = useForm<CollaboratorFormValues>({
    resolver: zodResolver(collaboratorSchema),
    defaultValues: {
      id: "",
      nome_completo: "",
      email: "",
      cpf: "",
      perfil_id: "",
      isMotoboyOrFiscal: false,
      status: STATUS_CADASTRO.PENDENTE,
      senha_padrao: true,
      rg: "",
      data_nascimento: "",
      nome_mae: "",
      endereco_completo: "",
      telefone: "",
      telefone_recado: "",
      data_inicio: "",
      cnh_registro: "",
      cnh_vencimento: "",
      cnh_categoria: "",
      cnpj: "", // This is MEI CNPJ
      valor_mei: "",
      tipo_chave_pix: "",
      chave_pix: "",
      moto_modelo: "",
      moto_cor: "",
      moto_ano: "",
      moto_placa: ""
    },
  });

  useEffect(() => {
    if (open) {
      if (collaboratorToEdit) {
        form.reset({
          id: collaboratorToEdit.id,
          nome_completo: collaboratorToEdit.nome_completo,
          email: collaboratorToEdit.email,
          cpf: cpfMask(collaboratorToEdit.cpf),
          perfil_id: collaboratorToEdit.perfil_id.toString(),
          isMotoboyOrFiscal: false, // Updated later by useEffect in Dialog
          status: collaboratorToEdit.status || STATUS_CADASTRO.ATIVO,
          senha_padrao: !!collaboratorToEdit.senha_padrao,
          rg: collaboratorToEdit.rg ? rgMask(collaboratorToEdit.rg) : "",
          data_nascimento: collaboratorToEdit.data_nascimento ? formatDateToBR(collaboratorToEdit.data_nascimento) : "",
          nome_mae: collaboratorToEdit.nome_mae || "",
          endereco_completo: collaboratorToEdit.endereco_completo || "",
          telefone: collaboratorToEdit.telefone ? phoneMask(collaboratorToEdit.telefone) : "",
          telefone_recado: collaboratorToEdit.telefone_recado ? phoneMask(collaboratorToEdit.telefone_recado) : "",
          data_inicio: collaboratorToEdit.data_inicio || "",

          cnh_registro: collaboratorToEdit.cnh_registro || "",
          cnh_vencimento: collaboratorToEdit.cnh_vencimento ? formatDateToBR(collaboratorToEdit.cnh_vencimento) : "",
          cnh_categoria: collaboratorToEdit.cnh_categoria || "",
          cnpj: collaboratorToEdit.cnpj ? cnpjMask(collaboratorToEdit.cnpj) : "",
          valor_mei: collaboratorToEdit.valor_mei ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(collaboratorToEdit.valor_mei as number) : "",
          tipo_chave_pix: collaboratorToEdit.tipo_chave_pix || "",
          chave_pix: collaboratorToEdit.chave_pix || "",
          moto_modelo: collaboratorToEdit.moto_modelo || "",
          moto_cor: collaboratorToEdit.moto_cor || "",
          moto_ano: collaboratorToEdit.moto_ano || "",
          moto_placa: collaboratorToEdit.moto_placa || ""
        });
      } else {
        form.reset({
          id: "",
          nome_completo: "",
          email: "",
          cpf: "",
          perfil_id: "",
          isMotoboyOrFiscal: false,
          status: STATUS_CADASTRO.PENDENTE,
          rg: "",
          data_nascimento: "",
          nome_mae: "",
          endereco_completo: "",
          telefone: "",
          telefone_recado: "",
          data_inicio: "",
          cnh_registro: "",
          cnh_vencimento: "",
          cnh_categoria: "",
          cnpj: "",
          valor_mei: "",
          tipo_chave_pix: "",
          chave_pix: "",
          moto_modelo: "",
          moto_cor: "",
          moto_ano: "",
          moto_placa: ""
        });
      }
    }
  }, [open, collaboratorToEdit, form]);

  return { form };
}
