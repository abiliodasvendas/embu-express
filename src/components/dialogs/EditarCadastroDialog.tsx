import { Button } from "@/components/ui/button";
import { BaseDialog } from "@/components/ui/BaseDialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { messages } from "@/constants/messages";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { UserProfileFormData, userProfileSchema } from "@/schemas/userSchema";
import { cpfMask } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import { cleanString } from "@/utils/string";
import { zodResolver } from "@hookform/resolvers/zod";
import { Hash, Loader2, Mail, User } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";

interface EditarCadastroDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditarCadastroDialog({
  isOpen,
  onClose,
}: EditarCadastroDialogProps) {
  const { user } = useSession();
  const { profile, isLoading, refreshProfile } = useProfile(user?.id);

  const form = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      nome_completo: "",
      cpf: "",
      email: "",
    },
  });

  React.useEffect(() => {
    if (profile) {
      form.reset({
        nome_completo: profile.nome_completo || "",
        cpf: profile.cpf ? cpfMask(profile.cpf) : "",
        email: profile.email || "",
      });
    }
  }, [profile, form]);

  const handleSubmit = async (data: UserProfileFormData) => {
    try {
      const nome_completo = cleanString(data.nome_completo, true);

      const client = supabase as unknown as {
        from: (table: string) => {
          update: (values: Record<string, unknown>) => {
            eq: (column: string, value: string) => Promise<{ error: Error | null }>;
          };
        };
      };

      const { error } = await client
        .from("usuarios")
        .update({
          nome_completo,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast.success(messages.usuario.sucesso.perfilAtualizado);

      await refreshProfile();
      safeCloseDialog(onClose);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Ocorreu um erro ao salvar as alterações.";
      toast.error(messages.usuario.erro.atualizacao, {
        description: errorMessage,
      });
    }
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={onClose} maxWidth="md">
      <BaseDialog.Header
        title="Editar Perfil"
        subtitle="Atualize suas informações cadastrais"
        icon={<User className="w-5 h-5 text-foreground" />}
        onClose={onClose}
      />

      <BaseDialog.Body className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form
              id="edit-profile-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="nome_completo"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-foreground">
                      Nome Completo <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                          placeholder="Seu nome completo"
                          {...field}
                          className={cn(
                            "pl-10",
                            fieldState.error && "border-destructive focus:border-destructive"
                          )}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-destructive ml-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-foreground">
                      CPF
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                        <Input
                          {...field}
                          disabled
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-foreground">
                      E-mail
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                        <Input
                          {...field}
                          disabled
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <Button
          type="button"
          variant="outline"
          onClick={() => safeCloseDialog(onClose)}
          disabled={form.formState.isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form="edit-profile-form"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Alterações"
          )}
        </Button>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
