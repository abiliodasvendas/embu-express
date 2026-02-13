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
import { ChangePasswordFormData, changePasswordSchema } from "@/schemas/userSchema";
import { api } from "@/services/api/client";
import { sessionManager } from "@/services/sessionManager";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound, Loader2, Lock, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface AlterarSenhaDialogProps {
  isOpen: boolean;
  onClose: () => void;
}


export default function AlterarSenhaDialog({
  isOpen,
  onClose,
}: AlterarSenhaDialogProps) {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      senhaAtual: "",
      novaSenha: "",
    },
  });

  const handleSubmit = async (data: ChangePasswordFormData) => {
    if (!profile?.cpf || !profile?.email) {
      toast.error(messages.erro.operacao, {
        description: "Não foi possível identificar o usuário logado.",
      });
      return;
    }

    if (data.senhaAtual === data.novaSenha) {
      toast.error(messages.erro.operacao, {
        description: "A nova senha deve ser diferente da senha atual.",
      });
      return;
    }

    try {
      await api.put("/auth/update-password", {
          password: data.novaSenha,
          oldPassword: data.senhaAtual
      });

      toast.success(messages.auth.sucesso.senhaAlterada, {
        description: "Você será desconectado para acessar com a nova senha.",
      });

      await new Promise((res) => setTimeout(res, 1500));

      await sessionManager.signOut();
      window.location.href = "/login";
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.error || messages.erro.operacao;
      toast.error("Erro ao alterar senha", {
        description: msg === "Senha atual incorreta." ? messages.auth.erro.senhaIncorreta : msg,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-full max-w-sm p-0 gap-0 bg-gray-50 flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
        hideCloseButton
      >
        <div className="bg-blue-600 p-4 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Fechar</span>
          </DialogClose>
          
          <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
            <KeyRound className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Alterar Senha
          </DialogTitle>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50/30">
          <Form {...form}>
            <form
              id="change-password-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
            >
              <FormField
                control={form.control}
                name="senhaAtual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-bold">Senha Atual <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          className="pl-10 pr-10 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all shadow-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="novaSenha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-bold">Nova Senha <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          className="pl-10 pr-10 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all shadow-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={form.formState.isSubmitting}
            className="w-full h-11 rounded-xl border-gray-200 font-medium text-gray-700 hover:bg-white"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            form="change-password-form"
            disabled={form.formState.isSubmitting}
            className="w-full h-11 rounded-xl shadow-lg shadow-blue-500/20 font-bold bg-blue-600 hover:bg-blue-700 transition-all hover:-translate-y-0.5"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Alterar Senha"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
