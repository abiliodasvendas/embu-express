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
import { cn } from "@/lib/utils";
import { ChangePasswordFormData, changePasswordSchema } from "@/schemas/userSchema";
import { api } from "@/services/api/client";
import { sessionManager } from "@/services/sessionManager";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound, Loader2, Lock } from "lucide-react";
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
        oldPassword: data.senhaAtual,
      });

      toast.success(messages.auth.sucesso.senhaAlterada, {
        description: "Você será desconectado para acessar com a nova senha.",
      });

      await new Promise((res) => setTimeout(res, 1500));

      await sessionManager.signOut();
      window.location.href = "/login";
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      const msg = axiosError.response?.data?.error || messages.erro.operacao;
      toast.error("Erro ao alterar senha", {
        description: msg === "Senha atual incorreta." ? messages.auth.erro.senhaIncorreta : msg,
      });
    }
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={onClose} maxWidth="sm">
      <BaseDialog.Header
        title="Alterar Senha"
        subtitle="Atualize suas credenciais com segurança"
        icon={<KeyRound className="w-5 h-5 text-foreground" />}
        onClose={onClose}
      />

      <BaseDialog.Body className="p-6">
        <Form {...form}>
          <form
            id="change-password-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="senhaAtual"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-foreground">
                    Senha Atual <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className={cn(
                          "pl-10 pr-10",
                          fieldState.error && "border-destructive focus:border-destructive"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-destructive ml-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="novaSenha"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-foreground">
                    Nova Senha <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className={cn(
                          "pl-10 pr-10",
                          fieldState.error && "border-destructive focus:border-destructive"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-destructive ml-1" />
                </FormItem>
              )}
            />
          </form>
        </Form>
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
          form="change-password-form"
          disabled={form.formState.isSubmitting}
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
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
