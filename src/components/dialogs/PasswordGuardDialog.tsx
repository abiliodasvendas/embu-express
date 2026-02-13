import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { api } from "@/services/api/client";
import { sessionManager } from "@/services/sessionManager";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound, Lock, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface PasswordGuardDialogProps {
  open: boolean;
  onSuccess: () => void;
}

const formSchema = z
  .object({
    senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmarSenha: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

export function PasswordGuardDialog({ open, onSuccess }: PasswordGuardDialogProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      senha: "",
      confirmarSenha: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      
      await api.put("/auth/update-password", { 
          password: data.senha 
      });

      await sessionManager.refreshToken();
      
      toast.success("Senha definida com sucesso!", {
        description: "Agora você já pode acessar o sistema com sua nova senha.",
      });

      onSuccess();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.error || messages.erro.atualizar;
      toast.error("Erro ao definir senha", {
        description: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="w-full max-w-md p-0 gap-0 bg-gray-50 flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        hideCloseButton={true}
      >
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white flex flex-col items-center text-center relative shrink-0">
            <div className="bg-white/20 p-3 rounded-2xl mb-4 backdrop-blur-sm shadow-inner">
                <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black mb-2 text-white uppercase tracking-tight">Segurança Obrigatória</DialogTitle>
            <DialogDescription className="text-blue-50/90 text-sm font-medium leading-relaxed">
                Identificamos que você ainda está usando a senha padrão. Por favor, defina uma nova senha pessoal para continuar.
            </DialogDescription>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-8 bg-gray-50/30">
          <Form {...form}>
            <form id="guard-password-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-bold ml-1">
                      Nova Senha
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-12 pr-10 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all shadow-none"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                          tabIndex={-1}
                        >
                          {showPassword ? (
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
                name="confirmarSenha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-bold ml-1">
                      Confirmar Senha
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-12 pr-10 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all shadow-none"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
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

        <div className="p-6 bg-gray-50 border-t border-gray-100 shrink-0">
          <Button
            type="submit"
            form="guard-password-form"
            className="w-full h-12 rounded-xl text-lg font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1 active:scale-95 text-white"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Definir Senha e Entrar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
