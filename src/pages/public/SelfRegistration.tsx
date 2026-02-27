import { SelfRegistrationForm } from "@/components/features/register/SelfRegistrationForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useRoles } from "@/hooks";
import { useSelfRegistrationForm } from "@/hooks/ui/useSelfRegistrationForm";
import { mockGenerator } from "@/utils/mocks/generator";
import { ArrowLeft, CheckCircle2, UserPlus, Wand2 } from "lucide-react";

export default function SelfRegistration() {
  const { form, isLoading, success, onSubmit, navigate } = useSelfRegistrationForm();
  const { data: roles } = useRoles(true);

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="pt-6 pb-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Cadastro Recebido!</h2>
            <p className="text-gray-600">
              Seu cadastro foi enviado para análise. <br />
              Você receberá um aviso assim que seu acesso for liberado pelo administrador.
            </p>
            <Button
              className="mt-6 w-full"
              variant="outline"
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <LoadingOverlay active={isLoading} text="Enviando cadastro..." />

      <Card className="w-full max-w-xl shadow-2xl border-0 rounded-[2.5rem] overflow-hidden bg-white">
        <div className="bg-blue-600 p-8 text-center relative shrink-0">
          <Button
            variant="ghost"
            className="absolute left-6 top-6 text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
            onClick={() => navigate("/login")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              const mockData = mockGenerator.selfRegistration();
              const motoboyRole = roles?.find(r => (r.nome as string).toLowerCase().includes("motoboy"));

              Object.keys(mockData).forEach((key) => {
                // @ts-ignore
                form.setValue(key, mockData[key]);
              });

              if (motoboyRole) {
                form.setValue("perfil_id", motoboyRole.id.toString());
                form.setValue("isMotoboy", true);
              }
            }}
            className="absolute top-6 right-6 w-10 h-10 rounded-xl text-white/70 hover:text-white hover:bg-white/10 border border-white/20 backdrop-blur-sm"
            title="Preencher Mock"
          >
            <Wand2 className="h-5 w-5" />
          </Button>

          <div className="mx-auto bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm shadow-inner">
            <UserPlus className="w-6 h-6 text-white" />
          </div>

          <CardTitle className="text-2xl font-black text-white uppercase tracking-tight">
            Solicitação de Cadastro
          </CardTitle>
          <p className="text-blue-100 text-sm mt-2 opacity-90 max-w-xs mx-auto">
            Escolha seu cargo e preencha seus dados para solicitar acesso à plataforma.
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
