import { SelfRegistrationForm } from "@/components/features/register/SelfRegistrationForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useRoles } from "@/hooks";
import { useSelfRegistrationForm } from "@/hooks/form/useSelfRegistrationForm";
import { mockGenerator } from "@/utils/mocks/generator";
import { isMotoboy } from "@/utils/business/roles";
import { ArrowLeft, CheckCircle2, UserPlus, Wand2 } from "lucide-react";
import { Path } from "react-hook-form";
import { SelfRegistrationFormData } from "@/schemas/selfRegistrationSchema";

export default function SelfRegistration() {
  const { form, isLoading, success, onSubmit, navigate } = useSelfRegistrationForm();
  const { data: roles } = useRoles(true);

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 selection:bg-primary/20 selection:text-primary">
        <Card className="w-full max-w-md bg-white rounded-3xl border border-border shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.06),0_20px_25px_-5px_rgba(0,0,0,0.04)]">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="mx-auto w-14 h-14 bg-muted/70 text-foreground border border-border rounded-[18px] flex items-center justify-center mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Cadastro Recebido!</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Seu cadastro foi enviado para análise operacional. <br />
              Você receberá um aviso assim que seu acesso for liberado pelo administrador.
            </p>
            <Button
              className="mt-6 w-full h-11 rounded-[18px] text-sm font-semibold"
              onClick={() => navigate("/login")}
            >
              Voltar para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8 selection:bg-primary/20 selection:text-primary">
      <LoadingOverlay active={isLoading} text="Enviando cadastro..." />

      <div className="w-full max-w-2xl mb-4 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
        <img
          src="/assets/logo-embuexpress.png"
          alt="Embu Express"
          className="h-12 w-auto mb-2 select-none object-contain drop-shadow-xs"
        />
      </div>

      <Card className="w-full max-w-2xl bg-white rounded-3xl border border-border shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.06),0_20px_25px_-5px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="bg-secondary/40 border-b border-border p-6 sm:p-8 text-center relative shrink-0">
          <Button
            variant="ghost"
            className="absolute left-4 top-4 sm:left-6 sm:top-6 text-muted-foreground hover:text-foreground rounded-[14px] text-xs font-semibold"
            onClick={() => navigate("/login")}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Voltar
          </Button>

          {import.meta.env.DEV && (
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-1.5">
              <Button
                type="button"
                variant="tonal"
                size="icon"
                onClick={() => {
                  form.reset();
                  const mockData = mockGenerator.selfRegistrationMandatory();
                  const motoboyRole = roles?.find(r => isMotoboy(r.nome));

                  Object.entries(mockData).forEach(([key, value]) => {
                    form.setValue(key as Path<SelfRegistrationFormData>, value as never, { shouldValidate: true });
                  });

                  if (motoboyRole) {
                    form.setValue("perfil_id", motoboyRole.id.toString());
                  }
                }}
                className="w-8 h-8 rounded-full"
                title="Preenchimento Parcial (Obrigatórios)"
              >
                <Wand2 className="h-3.5 w-3.5" />
              </Button>

              <Button
                type="button"
                variant="tonal"
                size="icon"
                onClick={() => {
                  const mockData = mockGenerator.selfRegistration();
                  const motoboyRole = roles?.find(r => isMotoboy(r.nome));

                  Object.entries(mockData).forEach(([key, value]) => {
                    form.setValue(key as Path<SelfRegistrationFormData>, value as never, { shouldValidate: true });
                  });

                  if (motoboyRole) {
                    form.setValue("perfil_id", motoboyRole.id.toString());
                  }
                }}
                className="w-8 h-8 rounded-full"
                title="Preenchimento Completo"
              >
                <Wand2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="mx-auto bg-muted/70 text-foreground border border-border w-11 h-11 rounded-[14px] flex items-center justify-center mb-3">
            <UserPlus className="w-5 h-5" />
          </div>

          <CardTitle className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Cadastro de Motoboy
          </CardTitle>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1 max-w-sm mx-auto">
            Preencha seus dados abaixo para solicitar seu cadastro na plataforma.
          </p>
        </div>

        <CardContent className="p-6 sm:p-8">
          <Form {...form}>
            <SelfRegistrationForm
              form={form}
              onSubmit={(values) => onSubmit(values, roles)}
              roles={roles}
            />
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
