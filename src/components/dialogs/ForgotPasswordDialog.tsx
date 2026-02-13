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
import { api } from "@/services/api/client";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email("E-mail inválido").min(1, "E-mail obrigatório"),
});

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: data.email });
      toast.success("E-mail enviado!", {
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.error || "Erro ao solicitar recuperação.";
      toast.error("Erro", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-sm p-0 gap-0 bg-gray-50 flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl" hideCloseButton>
        <div className="bg-blue-600 p-6 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Fechar</span>
          </DialogClose>
          
          <div className="mx-auto bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-xl font-black text-white uppercase tracking-tight">Recuperar Senha</DialogTitle>
          <p className="text-blue-50 text-xs mt-2 font-medium">Informe seu e-mail para receber o link de recuperação.</p>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-8 bg-gray-50/30">
          <Form {...form}>
            <form id="forgot-password-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-gray-700 font-bold ml-1">Seu E-mail</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                {...field}
                                placeholder="exemplo@gmail.com"
                                className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all shadow-none"
                            />
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </form>
          </Form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
          <Button
            type="submit"
            form="forgot-password-form"
            className="w-full h-12 rounded-xl text-lg font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95 text-white"
            disabled={loading}
          >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando...
                </>
            ) : (
                "Enviar Link de Acesso"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
