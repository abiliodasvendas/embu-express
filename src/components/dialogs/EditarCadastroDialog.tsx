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
import { messages } from "@/constants/messages";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { supabase } from "@/integrations/supabase/client";
import { UserProfileFormData, userProfileSchema } from "@/schemas/userSchema";
import { cpfMask } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import { cleanString } from "@/utils/string";
import { zodResolver } from "@hookform/resolvers/zod";
import { Hash, Loader2, Mail, User, X } from "lucide-react";
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

  // Carrega dados do perfil no form
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

      const { error } = await (supabase as any)
        .from("usuarios")
        .update({
          nome_completo,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast.success(messages.usuario.sucesso.perfilAtualizado);

      await refreshProfile();
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro ao salvar as alterações.";
      toast.error(messages.usuario.erro.atualizacao, {
        description: errorMessage,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-full max-w-md p-0 gap-0 bg-gray-50 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        <div className="bg-blue-600 p-4 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Fechar</span>
          </DialogClose>
          
          <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
            <User className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Editar Perfil
          </DialogTitle>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent bg-gray-50/30">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <Form {...form}>
                <form
                    id="edit-profile-form"
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                >
                    <FormField
                        control={form.control}
                        name="nome_completo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-700 font-bold">Nome Completo <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Seu nome completo"
                                            {...field}
                                            className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all shadow-none"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="cpf"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-700 font-bold">CPF</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                                        <Input
                                            {...field}
                                            readOnly
                                            className="pl-10 h-11 rounded-xl bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed shadow-none"
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
                                <FormLabel className="text-gray-700 font-bold">E-mail</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                                        <Input
                                            {...field}
                                            readOnly
                                            className="pl-10 h-11 rounded-xl bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                                        />
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
          )} 
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={form.formState.isSubmitting}
            className="w-full h-11 rounded-xl border-gray-200 font-medium text-gray-700 hover:bg-white transition-colors"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            form="edit-profile-form"
            disabled={form.formState.isSubmitting}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
