import { Usuario } from "@/types/database";
import { cpfMask } from "@/utils/masks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { CollaboratorFormData, collaboratorSchema } from "../../schemas/collaboratorSchema";

interface UseCollaboratorFormProps {
  open: boolean;
  collaboratorToEdit?: Usuario | null;
}

export function useCollaboratorForm({ open, collaboratorToEdit }: UseCollaboratorFormProps) {
  const form = useForm<CollaboratorFormData>({
    resolver: zodResolver(collaboratorSchema),
    defaultValues: {
      nome_completo: "",
      email: "",
      cpf: "",
      perfil_id: "",
      status: "ATIVO",
      senha_padrao: true,
      links: [],
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
          nome_completo: collaboratorToEdit.nome_completo,
          email: collaboratorToEdit.email,
          cpf: cpfMask(collaboratorToEdit.cpf),
          perfil_id: collaboratorToEdit.perfil_id.toString(),
          status: collaboratorToEdit.status || "ATIVO",
          senha_padrao: !!collaboratorToEdit.senha_padrao,
          links: (collaboratorToEdit as any).links || [],
          
          rg: collaboratorToEdit.rg || "",
          data_nascimento: collaboratorToEdit.data_nascimento || "",
          nome_mae: collaboratorToEdit.nome_mae || "",
          endereco_completo: collaboratorToEdit.endereco_completo || "",
          telefone: collaboratorToEdit.telefone || "",
          telefone_recado: collaboratorToEdit.telefone_recado || "",
          data_inicio: collaboratorToEdit.data_inicio || "",
          
          cnh_registro: collaboratorToEdit.cnh_registro || "",
          cnh_vencimento: collaboratorToEdit.cnh_vencimento || "",
          cnh_categoria: collaboratorToEdit.cnh_categoria || "",
          cnpj: collaboratorToEdit.cnpj || "",
          chave_pix: collaboratorToEdit.chave_pix || "",
          moto_modelo: collaboratorToEdit.moto_modelo || "",
          moto_cor: collaboratorToEdit.moto_cor || "",
          moto_ano: collaboratorToEdit.moto_ano || "",
          moto_placa: collaboratorToEdit.moto_placa || ""
        });
      } else {
        form.reset({
          nome_completo: "",
          email: "",
          cpf: "",
          perfil_id: "",
          status: "ATIVO",
          links: [],
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
