import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { cpfSchema } from "@/schemas/common";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, User, Wand2 } from "lucide-react";
import { z } from "zod";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Banner } from "@/components/ui/Banner";
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
import { api } from "@/services/api/client";
import { sessionManager } from "@/services/sessionManager";
import { ROUTES } from "@/constants/routes";
import { messages } from "@/constants/messages";
import { cn } from "@/lib/utils";
import { cpfMask } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
import { onlyNumbers } from "@/utils/string";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [refreshing] = useState(false);

  const formSchema = z.object({
    cpfcnpj: cpfSchema,
    senha: z.string().min(1, "Senha obrigatória"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cpfcnpj: "",
      senha: "",
    },
  });

  const handleLogin = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);

    try {
      const cpfcnpjDigits = onlyNumbers(data.cpfcnpj);

      const response = await api.post("/auth/login", {
        cpf: cpfcnpjDigits,
        password: data.senha
      });

      const session = response.data;
      await sessionManager.setSession(session.access_token, session.refresh_token);

      const user = session.user;

      if (user.senha_padrao) {
        toast.info("Primeiro acesso detectado", { description: "Por favor, defina uma nova senha para sua segurança." });
        navigate("/nova-senha", { replace: true, state: { forced: true } });
      } else {
        navigate("/inicio", { replace: true });
      }

    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string; error?: string } } };
      const msg = axiosError.response?.data?.message || axiosError.response?.data?.error || messages.auth.erro.login;

      if (msg.includes("CPF não encontrado")) {
        form.setError("cpfcnpj", { message: msg });
      } else if (msg.includes("Senha inválida")) {
        form.setError("senha", { message: msg });
      } else if (msg.includes("não foi aprovado") || msg.includes("inativa") || msg.includes("análise")) {
        form.setError("root", { message: msg });
      } else {
        toast.error("Erro ao entrar", { description: msg });
      }
      setLoading(false);
    }
  };

  return (
    <>
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
            <Form {...form}>
              <div className="text-center mb-6 relative">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  Área Administrativa
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Acesse sua conta para gerenciar operações
                </p>

                {import.meta.env.DEV && (
                  <Button
                    type="button"
                    variant="tonal"
                    size="icon"
                    onClick={() => {
                      form.setValue("cpfcnpj", "030.755.445-74");
                      form.setValue("senha", "Ogaiht+1");
                    }}
                    className="absolute -top-1 -right-1 w-8 h-8 rounded-full"
                    title="Acesso Rápido de Teste"
                  >
                    <Wand2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="cpfcnpj"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-foreground ml-1">
                        CPF do Colaborador
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <Input
                            {...field}
                            autoFocus
                            placeholder="000.000.000-00"
                            autoComplete="username"
                            className={cn(
                              "pl-10 h-11 rounded-[18px] bg-secondary/50 border transition-all text-sm text-foreground placeholder:text-muted-foreground focus:bg-white",
                              fieldState.error
                                ? "border-destructive focus:border-destructive"
                                : "border-border focus:border-primary"
                            )}
                            onChange={(e) => field.onChange(cpfMask(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs ml-1 text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="senha"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-foreground ml-1">
                        Senha de Acesso
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Digite sua senha"
                            autoComplete="current-password"
                            className={cn(
                              "pl-10 pr-10 h-11 rounded-[18px] bg-secondary/50 border transition-all text-sm text-foreground placeholder:text-muted-foreground focus:bg-white",
                              fieldState.error
                                ? "border-destructive focus:border-destructive"
                                : "border-border focus:border-primary"
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
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
                      <FormMessage className="text-xs ml-1 text-destructive" />
                    </FormItem>
                  )}
                />

                {form.formState.errors.root && (
                  <Banner
                    variant="destructive"
                    description={form.formState.errors.root.message}
                  />
                )}

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-11 rounded-[18px] text-sm font-semibold shadow-xs"
                    disabled={loading}
                  >
                    {loading ? "Acessando..." : "Entrar no Sistema"}
                  </Button>
                </div>

                <div className="flex flex-col items-center gap-3 mt-4">
                  <div className="relative w-full py-1 flex items-center justify-center">
                    <div className="w-full border-t border-border" />
                    <span className="absolute bg-white px-3 text-xs text-muted-foreground font-medium select-none">
                      ou
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Não possui conta?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/cadastro")}
                      className="text-primary font-bold hover:underline cursor-pointer ml-0.5"
                    >
                      Cadastre-se aqui
                    </button>
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.PUBLIC.PRIVACY_POLICY)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer pt-1"
                  >
                    Política de Privacidade & Termos Operacionais
                  </button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <LoadingOverlay active={refreshing} text="Aguarde..." />
    </>
  );
}
