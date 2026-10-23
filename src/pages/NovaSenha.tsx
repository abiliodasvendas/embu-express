import { useState } from "react";
import { useForm } from "react-hook-form";
import { ROUTES } from "@/constants/routes";
import { useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Lock } from "lucide-react";
import { api } from "@/services/api/client";
import { sessionManager } from "@/services/sessionManager";
import { messages } from "@/constants/messages";
import { toast } from "@/utils/notifications/toast";
import { cn } from "@/lib/utils";

export default function NovaSenha() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isForced = location.state?.forced;

  const formSchema = z
    .object({
      senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
      confirmarSenha: z.string().min(1, "Confirme sua senha"),
    })
    .refine((data) => data.senha === data.confirmarSenha, {
      message: "As senhas não coincidem",
      path: ["confirmarSenha"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      senha: "",
      confirmarSenha: "",
    },
  });

  const handleRedefinir = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      await api.put("/auth/update-password", {
        password: data.senha,
      });

      await sessionManager.refreshToken();

      setLoading(false);

      toast.success("Senha definida com sucesso!", {
        description: "Agora você já pode acessar o sistema com sua nova senha.",
      });

      setTimeout(() => navigate(ROUTES.PUBLIC.ROOT, { replace: true }), 1200);
    } catch (err: unknown) {
      setLoading(false);
      const error = err as { response?: { data?: { error?: string } } };
      const msg = error.response?.data?.error || messages.erro.atualizar;
      toast.error("Erro ao definir senha", {
        description: msg,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-8 selection:bg-primary/20 selection:text-primary">
      <div className="w-full max-w-md mb-6 flex flex-col items-center animate-in fade-in slide-in-from-bottom-3 duration-500">
        <img
          src="/assets/logo-embuexpress.png"
          alt="Embu Express"
          className="h-14 sm:h-16 w-auto mb-3 select-none object-contain drop-shadow-xs"
        />
      </div>

      <Card className="w-full max-w-md bg-white rounded-3xl border border-border shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.06),0_20px_25px_-5px_rgba(0,0,0,0.04)] overflow-hidden animate-in zoom-in-95 duration-300">
        <CardContent className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              {isForced ? "Definir senha de acesso" : "Redefinir senha"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {isForced
                ? "Para sua segurança, crie uma nova senha pessoal"
                : "Crie uma nova senha segura para sua conta"}
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleRedefinir)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="senha"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-foreground ml-1">
                      Nova senha
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className={cn(
                            "pl-10 h-11 rounded-[18px] bg-secondary/50 border transition-all text-sm text-foreground placeholder:text-muted-foreground focus:bg-white",
                            fieldState.error
                              ? "border-destructive focus:border-destructive"
                              : "border-border focus:border-primary"
                          )}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs ml-1 text-destructive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmarSenha"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-foreground ml-1">
                      Confirmar nova senha
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className={cn(
                            "pl-10 h-11 rounded-[18px] bg-secondary/50 border transition-all text-sm text-foreground placeholder:text-muted-foreground focus:bg-white",
                            fieldState.error
                              ? "border-destructive focus:border-destructive"
                              : "border-border focus:border-primary"
                          )}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs ml-1 text-destructive" />
                  </FormItem>
                )}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-11 rounded-[18px] text-sm font-semibold shadow-xs"
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Redefinir senha"}
                </Button>
              </div>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.PUBLIC.ROOT)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao login
                </button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
