import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  acertoIntercompanyFormSchema,
  AcertoIntercompanyFormData,
} from "@/schemas/acertoIntercompanySchema";
import { toLocalDateString } from "@/utils/formatters/date";
import { TransferenciaIntercompany } from "@/types/database";

export interface UseAcertoIntercompanyFormProps {
  open: boolean;
  transferencia?: TransferenciaIntercompany | null;
}

export function useAcertoIntercompanyForm({
  open,
  transferencia,
}: UseAcertoIntercompanyFormProps) {
  const form = useForm<AcertoIntercompanyFormData>({
    resolver: zodResolver(acertoIntercompanyFormSchema),
    defaultValues: {
      data_acerto: toLocalDateString(),
      observacao: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        data_acerto: toLocalDateString(),
        observacao: "",
      });
    }
  }, [open, transferencia, form]);

  return { form };
}
