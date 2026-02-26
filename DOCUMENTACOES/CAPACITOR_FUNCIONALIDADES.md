# Funcionalidades e Possibilidades com Capacitor

O **Capacitor** atua como uma ponte (bridge) entre o código Web (React/Vite) e as APIs nativas do Android e iOS, permitindo que o app utilize recursos de hardware e sistema operacional que não estão disponíveis em uma aplicação web tradicional.

## 1. Hardware e Recursos do Dispositivo
- **Câmera e Escaneamento:** Captura de fotos para comprovantes e leitura de códigos de barras/QR Codes.
- **Biometria (Fingerprint/FaceID):** Autenticação segura e rápida sem necessidade de digitar senhas.
- **Haptics (Vibração):** Feedback tátil para confirmações de ações (ex: ao bater o ponto).
- **Filesystem (Sistema de Arquivos):** Armazenamento local de documentos, fotos e relatórios para acesso offline.
- **Bateria:** Monitoramento do nível e estado da bateria.

## 2. Monitoramento e Notificações
- **Push Notifications:** Notificações em tempo real enviadas do servidor (ex: novos alertas).
- **Local Notifications:** Notificações agendadas localmente (ex: lembretes de horários).
- **Network (Rede):** Detecção de estado online/offline para sincronização posterior (Modo Offline).
- **Background Tasks:** Execução de lógica mesmo quando o app está em segundo plano.

## 3. Experiência do Usuário (Nativa)
- **Deep Links:** Links que abrem o app diretamente em uma tela específica.
- **Splash Screen:** Tela de abertura personalizada.
- **Status Bar & Navegação:** Controle total sobre as barras de sistema (cores, visibilidade).
- **Share API:** Compartilhamento nativo de conteúdo para outros apps (WhatsApp, E-mail, etc).
- **App Tracking Transparency (iOS):** Gestão de permissões de rastreio.

## 4. Sugestões Estratégicas para o projeto
- **Scanner de QR Code:** Para validação de local físico no registro de ponto.
- **Geolocalização em Segundo Plano:** Rastreamento contínuo para rotas e entregas (mesmo com celular bloqueado).
- **Mapas Nativos:** Integração com o SDK nativo do Google Maps para maior performance e fluidez.

---
*Documento gerado em suporte à exploração de capacidades nativas para o ecossistema Embu Express.*
