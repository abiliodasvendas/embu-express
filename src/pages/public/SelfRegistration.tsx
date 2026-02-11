import { SelfRegistrationForm } from "@/components/features/register/SelfRegistrationForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useSelfRegistrationForm } from "@/hooks/ui/useSelfRegistrationForm";
import { mockGenerator } from "@/utils/mocks/generator";
import { ArrowLeft, CheckCircle2, Wand2 } from "lucide-react";

export default function SelfRegistration() {
  const { form, isLoading, success, onSubmit, navigate } = useSelfRegistrationForm();

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
              Seu cadastro foi enviado para análise. <br/>
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
        
        <Card className="w-full max-w-xl shadow-xl border-0">
            <CardHeader className="space-y-1 relative group">
                <Button 
                    variant="ghost" 
                    className="w-fit p-0 hover:bg-transparent -ml-2 text-gray-500 mb-2"
                    onClick={() => navigate("/login")}
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Voltar
                </Button>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold">Cadastro de Motoboy</CardTitle>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            const mockData = mockGenerator.selfRegistration();
                            Object.keys(mockData).forEach((key) => {
                                // @ts-ignore
                                form.setValue(key, mockData[key]);
                            });
                        }}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full text-blue-600 hover:bg-blue-50"
                        title="Preencher Mock"
                    >
                        <Wand2 className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-sm text-gray-500">
                    Preencha seus dados para solicitar acesso à plataforma.
                </p>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <SelfRegistrationForm form={form} onSubmit={onSubmit} />
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
