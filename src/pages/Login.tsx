// React
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

// React Router
import { useNavigate } from "react-router-dom";

// Third-party
import { cpfSchema } from "@/schemas/common";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, User, Wand2 } from "lucide-react";
import { z } from "zod";

// Components - UI
import { ForgotPasswordDialog } from "@/components/dialogs/ForgotPasswordDialog";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
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

// Services
import { api } from "@/services/api/client";
import { sessionManager } from "@/services/sessionManager";

// Utils
import { messages } from "@/constants/messages";
import { cpfMask } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [showForgotDialog, setShowForgotDialog] = useState(false);

  const formSchema = z.object({
    cpfcnpj: cpfSchema,
    senha: z.string().min(1, "Senha obrigatória"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cpfcnpj: "", // Defaults empty for security
      senha: "",
    },
  });

  const handleForgotPassword = useCallback(() => {
    setShowForgotDialog(true);
  }, []);

  const handleLogin = async (data: any) => {
    setLoading(true);

    try {
      const cpfcnpjDigits = data.cpfcnpj.replace(/\D/g, "");

      // Call Backend Login
      const response = await api.post("/auth/login", {
        cpf: cpfcnpjDigits,
        password: data.senha
      });

      const session = response.data;
      
      // Update Session Manager
      await sessionManager.setSession(session.access_token, session.refresh_token);

      const user = session.user;
      
      // Let's navigate to /inicio and let RedirectByRole handle it
      // BUT if it's first access, force password change
      if (user.senha_padrao) {
          toast.info("Primeiro acesso detectado", { description: "Por favor, defina uma nova senha para sua segurança." });
          navigate("/nova-senha", { replace: true, state: { forced: true } });
      } else {
          navigate("/inicio", { replace: true });
      }
      
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.error || messages.auth.erro.login;
      
      if (msg.includes("Credenciais inválidas") || msg.includes("não encontrado")) {
          form.setError("root", { message: "CPF ou senha incorretos" });
      } else {
          toast.error("Erro ao entrar", { description: msg });
      }
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-blue-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-3 sm:p-8">
        <div className="w-full max-w-md mb-4 sm:mb-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <img
            src="/assets/logo-embuexpress.png"
            alt="Embu Express"
            className="h-16 sm:h-20 w-auto mb-2 sm:mb-4 select-none drop-shadow-sm"
          />
        </div>

        <Card className="w-full max-w-md shadow-2xl border-0 rounded-3xl overflow-hidden animate-in zoom-in-95 duration-500">
          <CardContent className="p-6 sm:p-10 bg-white/80 backdrop-blur-sm">
            <Form {...form}>
              <div className="text-center mb-6 sm:mb-8 relative group">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 text-center">
                  Área Administrativa
                </h1>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    form.setValue("cpfcnpj", "395.423.918-38");
                    form.setValue("senha", "Ogaiht+1");
                  }}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full text-blue-600 hover:bg-blue-50"
                  title="Acesso Rápido"
                >
                  <Wand2 className="h-4 w-4" />
                </Button>
              </div>

              <form
                onSubmit={form.handleSubmit(handleLogin)}
                className="space-y-4 sm:space-y-5"
              >
                <FormField
                  control={form.control}
                  name="cpfcnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium ml-1 text-sm">
                        CPF
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
                          <Input
                            {...field}
                            autoFocus
                            placeholder="000.000.000-00"
                            autoComplete="username"
                            className="pl-12 h-11 sm:h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                            onChange={(e) =>
                              field.onChange(cpfMask(e.target.value))
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="senha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium ml-1 text-sm">
                        Senha
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="pl-12 pr-10 h-11 sm:h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.formState.errors.root && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-start gap-2 text-sm text-red-600 animate-in slide-in-from-top-2">
                    <span className="mt-0.5">⚠️</span>
                    {form.formState.errors.root.message}
                  </div>
                )}

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full h-11 sm:h-12 rounded-xl text-base font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all" 
                    disabled={loading}
                  >
                    {loading ? "Acessando..." : "Entrar"}
                  </Button>
                </div>

                <div className="flex flex-col items-center gap-3 sm:gap-4 mt-4 sm:mt-6">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium"
                  >
                    Esqueci minha senha
                  </button>

                  <div className="border-t border-gray-100 w-full my-2"></div>

                  <p className="text-sm text-gray-600">
                    Não possui conta?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/cadastro")}
                        className="text-blue-600 font-bold hover:underline"
                    >
                        Cadastre-se aqui
                    </button>
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <LoadingOverlay active={refreshing} text="Aguarde..." />
      <ForgotPasswordDialog open={showForgotDialog} onOpenChange={setShowForgotDialog} />
    </>
  );
}
