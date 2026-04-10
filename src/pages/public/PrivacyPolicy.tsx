import { Shield, Mail, ArrowLeft, Clock, MapPin, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-blue-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-8">
      <div className="w-full max-w-4xl mb-6 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-4">
          <img
            src="/assets/logo-embuexpress.png"
            alt="Embu Express"
            className="h-10 sm:h-12 w-auto select-none"
          />
        </div>
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="rounded-full gap-2 hover:bg-white/50 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <Card className="w-full max-w-4xl shadow-2xl border-0 rounded-3xl overflow-hidden animate-in zoom-in-95 duration-500 bg-white/90 backdrop-blur-md">
        <CardContent className="p-6 sm:p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Política de Privacidade</h1>
              <p className="text-gray-500 text-sm">Última atualização: Abril de 2026</p>
            </div>
          </div>

          <ScrollArea className="h-full pr-4">
            <div className="space-y-10 text-gray-700 leading-relaxed">
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                  1. Introdução
                </h2>
                <p>
                  A <strong>Embu Express</strong> ("nós", "nosso") está comprometida em proteger a privacidade dos dados de seus colaboradores, clientes e parceiros. Esta política explica como coletamos, usamos e protegemos as informações em nosso sistema ERP de gestão logística e controle operacional.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                  2. Coleta de Dados
                </h2>
                <p className="mb-4">Para o funcionamento pleno de nossas atividades de gestão, coletamos os seguintes tipos de informações:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex gap-3">
                    <Database className="h-5 w-5 text-blue-600 mt-1 shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900">Identificação Pessoal</p>
                      <p className="text-sm">Nome completo, CPF, e-mail e dados de contato necessários para o vínculo empregatício ou contratual.</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-1 shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900">Geolocalização</p>
                      <p className="text-sm">Capturada apenas no momento do registro de ponto ou reporte de atividade operacional para fins de auditoria e conformidade.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                  3. Finalidade do Tratamento
                </h2>
                <p className="mb-4">Os dados coletados são utilizados estritamente para:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Controle de Jornada:</strong> Registro de entrada, saída e pausas operacionais.</li>
                  <li><strong>Gestão Logística:</strong> Atribuição de tarefas e acompanhamento de entregas/entregadores.</li>
                  <li><strong>Obrigações Legais:</strong> Cumprimento de normas trabalhistas e fiscais brasileiras.</li>
                  <li><strong>Comunicação Interna:</strong> Alertas sobre escala, pagamentos e avisos corporativos.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                  4. Segurança e Armazenamento
                </h2>
                <div className="flex gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                  <Clock className="h-6 w-6 text-blue-600 mt-1" />
                  <p className="text-sm text-blue-900">
                    Utilizamos infraestrutura de nuvem moderna e criptografia de ponta a ponta. Seus dados são armazenados de forma segura e o acesso é estritamente controlado via níveis de permissão (RBAC).
                  </p>
                </div>
              </section>

              <section className="p-6 rounded-3xl bg-gray-900 text-white shadow-xl">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Mail className="h-6 w-6 text-blue-400" />
                  5. Exclusão de Dados (LGPD)
                </h2>
                <p className="text-gray-300 mb-6">
                  Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de solicitar a correção ou exclusão definitiva de seus dados pessoais do nosso sistema após o término do vínculo contratual, respeitando os prazos legais de guarda de documentos.
                </p>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                  <p className="text-sm text-gray-400 mb-2 font-medium">Para solicitar a exclusão de seus dados, envie um e-mail para:</p>
                  <a 
                    href="mailto:embuexpress@gmail.com" 
                    className="text-lg sm:text-xl font-bold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    embuexpress@gmail.com
                  </a>
                </div>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Embu Express - Todos os direitos reservados.</p>
      </div>
    </div>
  );
}
