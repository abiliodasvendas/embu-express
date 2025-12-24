// React
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

// React Router
import { useNavigate } from "react-router-dom";

// Third-party
import { cpfSchema } from "@/schemas/common";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { z } from "zod";

// Components - UI
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
import { supabase } from "@/integrations/supabase/client";

// Utils
import { messages } from "@/constants/messages";
import { useSEO } from "@/hooks/useSEO";
import { cpfMask } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";

export default function Login() {
  // Permitir indexação da página de login
  useSEO({
    noindex: true,
    title: "Login - Embu Express | Área Administrativa",
    description: "Acesse a área administrativa do Embu Express.",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

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

  const handleForgotPassword = useCallback(async () => {
    const cpfDigits = form.getValues("cpfcnpj")?.replace(/\D/g, "");
    if (!cpfDigits) {
      toast.info(messages.auth.info.informeCpfDescricao);
      return;
    }

    try {
      setRefreshing(true);

      const { data: usuario, error } = await (supabase as any)
        .from("usuarios")
        .select("email")
        .eq("cpf", cpfDigits)
        .single();

      if (error || !usuario?.email) {
        toast.error(messages.auth.erro.cpfNaoEncontrado, {
          description: messages.auth.erro.cpfNaoEncontradoDescricao,
        });
        return;
      }

      const maskedEmail = (() => {
        const [user, domain] = usuario.email.split("@");
        const maskedUser =
          user.length <= 3
            ? user[0] + "*".repeat(user.length - 1)
            : user.slice(0, 3) + "*".repeat(user.length - 3);
        const domainParts = domain.split(".");
        const maskedDomain =
          domainParts[0].slice(0, 3) +
          "*".repeat(Math.max(0, domainParts[0].length - 3));
        return `${maskedUser}@${maskedDomain}.${domainParts
          .slice(1)
          .join(".")}`;
      })();

      const redirectUrl = `${
        import.meta.env.VITE_PUBLIC_APP_DOMAIN
      }/nova-senha`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        usuario.email,
        { redirectTo: redirectUrl }
      );

      if (resetError) throw resetError;

      toast.success(messages.auth.sucesso.emailEnviado, {
        description: `Enviamos o link para ${maskedEmail}. Verifique sua caixa de entrada e o spam.`,
      });
    } catch (err: any) {
      toast.error(messages.auth.erro.emailEnviado, {
        description: "Tente novamente em alguns minutos ou entre em contato com o suporte.",
      });
    } finally {
      setRefreshing(false);
    }
  }, [form]);

  const handleLogin = async (data: any) => {
    setLoading(true);

    try {
      const cpfcnpjDigits = data.cpfcnpj.replace(/\D/g, "");
      const { data: usuario, error: usuarioError } = await (supabase as any)
        .from("usuarios")
        .select(`
          email,
          perfil:perfis (nome)
        `)
        .eq("cpf", cpfcnpjDigits)
        .single();

      if (usuarioError || !usuario) {
        form.setError("cpfcnpj", {
          type: "manual",
          message: "CPF não encontrado",
        });
        setLoading(false);
        return;
      }

      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: usuario.email,
        password: data.senha,
      });

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          form.setError("senha", {
            type: "manual",
            message: "Senha incorreta",
          });
        } else {
          form.setError("root", {
            type: "manual",
            message: "Erro inesperado: " + signInError.message,
          });
        }
        setLoading(false);
        return;
      }

      const roleName = (usuario.perfil as any)?.nome;
      const allowedAdminRoles = ["admin", "super_admin"];

      if (roleName && allowedAdminRoles.includes(roleName)) {
        localStorage.setItem("app_role", roleName);
        navigate("/controle-ponto", { replace: true });
      } else if (roleName === "motoboy") {
        await supabase.auth.signOut();
        toast.info(messages.auth.info.appMobileDesenvolvimento, {
            description: messages.auth.info.aguardeLancamento
        });
        setLoading(false);
      } else {
        await supabase.auth.signOut();
        toast.error(messages.auth.erro.naoAutorizado, {
            description: "Seu perfil não possui permissão para acessar esta área."
        });
        setLoading(false);
      }
      
    } catch (error: any) {
      toast.error(messages.auth.erro.login, {
        description: error.message || messages.erro.generico,
      });
      form.setError("root", {
        type: "manual",
        message: "Erro inesperado",
      });
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
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Área Administrativa
                </h1>
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
