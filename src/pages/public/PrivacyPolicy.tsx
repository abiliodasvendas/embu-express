import { Shield, Mail, ArrowLeft, Clock, MapPin, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center bg-background p-4 sm:p-8 selection:bg-primary/20 selection:text-primary">
      <div className="w-full max-w-4xl mb-6 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center gap-4">
          <img
            src="/assets/logo-embuexpress.png"
            alt="Embu Express"
            className="h-10 sm:h-12 w-auto select-none object-contain drop-shadow-xs"
          />
        </div>
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="rounded-[14px] gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <Card className="w-full max-w-4xl bg-white rounded-3xl border border-border shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.06),0_20px_25px_-5px_rgba(0,0,0,0.04)] overflow-hidden animate-in zoom-in-95 duration-300">
        <CardContent className="p-6 sm:p-12">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
            <div className="w-12 h-12 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
              <Shield className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Política de Privacidade</h1>
              <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">Última atualização: Abril de 2026</p>
            </div>
          </div>

          <ScrollArea className="h-full pr-2 sm:pr-4">
            <div className="space-y-8 text-foreground text-xs sm:text-sm leading-relaxed">
              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 flex items-center gap-2.5">
                  <span className="w-1.5 h-5 bg-foreground rounded-full" />
                  1. Introdução
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  A <strong className="text-foreground">Embu Express</strong> ("nós", "nosso") está comprometida em proteger a privacidade dos dados de seus colaboradores e clientes. Esta política explica como coletamos, usamos e protegemos as informações em nosso sistema ERP de gestão logística e controle operacional.
                </p>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 flex items-center gap-2.5">
                  <span className="w-1.5 h-5 bg-foreground rounded-full" />
                  2. Coleta de Dados
                </h2>
                <p className="text-muted-foreground mb-4">Para o funcionamento pleno de nossas atividades operacionais de gestão, coletamos os seguintes tipos de informações:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 sm:p-5 rounded-[18px] bg-secondary/40 border border-border flex gap-3.5 items-start">
                    <div className="w-8 h-8 rounded-[10px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0 mt-0.5">
                      <Database className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">Identificação Pessoal</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Nome completo, CPF, e-mail e dados de contato necessários para o vínculo operacional ou contratual.</p>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 rounded-[18px] bg-secondary/40 border border-border flex gap-3.5 items-start">
                    <div className="w-8 h-8 rounded-[10px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">Geolocalização</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Capturada no momento do registro de ponto ou reporte de atividade operacional para auditoria e conformidade.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 flex items-center gap-2.5">
                  <span className="w-1.5 h-5 bg-foreground rounded-full" />
                  3. Finalidade do Tratamento
                </h2>
                <p className="text-muted-foreground mb-3">Os dados coletados são utilizados estritamente para:</p>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li><strong className="text-foreground">Controle de Jornada:</strong> Registro de entrada, saída e pausas operacionais.</li>
                  <li><strong className="text-foreground">Gestão Logística:</strong> Atribuição de tarefas e acompanhamento de entregas.</li>
                  <li><strong className="text-foreground">Obrigações Legais:</strong> Cumprimento de normas trabalhistas e fiscais brasileiras.</li>
                  <li><strong className="text-foreground">Comunicação Interna:</strong> Alertas sobre escalas, pagamentos e avisos corporativos.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 flex items-center gap-2.5">
                  <span className="w-1.5 h-5 bg-foreground rounded-full" />
                  4. Segurança e Armazenamento
                </h2>
                <div className="flex gap-3.5 p-4 sm:p-5 rounded-[18px] bg-secondary/40 border border-border items-start">
                  <div className="w-8 h-8 rounded-[10px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="h-4 w-4" />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Utilizamos infraestrutura de nuvem moderna e criptografia. Seus dados são armazenados de forma segura e o acesso é estritamente controlado via níveis de permissão (RBAC).
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 flex items-center gap-2.5">
                  <span className="w-1.5 h-5 bg-foreground rounded-full" />
                  5. Exclusão de Dados (LGPD)
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de solicitar a correção ou exclusão definitiva de seus dados pessoais do nosso sistema após o término do vínculo contratual, respeitando os prazos legais de guarda de documentos.
                </p>
                <div className="p-4 sm:p-5 rounded-[18px] bg-secondary/40 border border-border flex gap-3.5 items-start">
                  <div className="w-8 h-8 rounded-[10px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      Para solicitar a exclusão de seus dados, envie um e-mail para:
                    </p>
                    <a 
                      href="mailto:embuexpress@gmail.com" 
                      className="text-sm sm:text-base font-bold text-primary hover:underline transition-colors"
                    >
                      embuexpress@gmail.com
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-muted-foreground text-xs">
        <p>© {new Date().getFullYear()} Embu Express - Todos os direitos reservados.</p>
      </div>
    </div>
  );
}
