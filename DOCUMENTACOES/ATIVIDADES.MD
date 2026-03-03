# PLANO DE IMPLEMENTAÇÃO DETALHADO

## ETAPA 1: BANCO DE DADOS E INFRAESTRUTURA (BACKEND)
*Objetivo: Preparar a estrutura de dados para suportar as novas funcionalidades.*

- [x] **1.1 Migração PIX**: Adicionar colunas `tipo_chave_pix` (text) e `chave_pix` (text) na tabela `usuarios`.
- [x] **1.2 Migração Financeira**: Adicionar `valor_mei` (crédito), `data_inicio` e `valor_adiantamento` (débito) na tabela `colaborador_clientes`.
- [x] **1.3 Migração Ocorrências**: Criar tabelas `public.tipos_ocorrencia` (CRUD) e `public.ocorrencias` (vínculo com colaborador, tipo, valor, impacto financeiro).
- [x] **1.4 Migração Clientes**: Adicionar `dias_trabalhados` (int), `km_contratados` (int) e `escala_semanal` (int[]) na tabela `clientes`.
- [x] **1.5 Migração Ponto (KM)**: Adicionar `distancia_trabalho` e `distancia_pausa` na tabela `registros_pausas`, e `saida_distancia_trabalho` na tabela `registros_ponto`.
- [x] **1.7 View Relatório (no Schema)**: Atualizar `v_relatorio_mensal_ponto` no `initial_schema.sql` com soma de KM e Tempos (Trabalho vs Pausa).
- [x] **1.6 Seed Data**: Popular novos módulos de permissão (`modulo: 'ocorrencias'`) e sementes para tipos de ocorrência.

> [!TIP]
> **Confirmação de Lógica (KM/Tempo)**: Sim, a estrutura atual permite consolidar todos os totais (Trabalho vs Pausa) tanto em KM quanto em Horas para o espelho mensal de forma eficiente.

## ETAPA 2: LÓGICA DE NEGÓCIO E SERVIÇOS (BACKEND)
*Objetivo: Implementar as regras de validação e processamento de dados.*

- [x] **2.1 UsuarioService**: Implementar persistência dos campos PIX (`tipo_chave_pix`, `chave_pix`) e inclusão do status "PENDENTE" no fluxo de CRUD.
- [x] **2.1.2 UsuarioService (CNPJ Opcional)**: Garantir que CNPJ/MEI seja opcional para todos os perfis no backend e frontend.
- [x] **2.2 PontoService (Timezone)**: Normalizar todas as datas para `-03:00` (Brasília) em todas as operações de escrita e leitura de ponto.
- [x] **2.3 PontoService (KM Relativo)**: Implementar cálculo da diferença de KM entre marcações para separar rodagem em serviço vs rodagem em pausa:
    - **Início Pausa**: Calcula `distancia_trabalho` (KM atual - KM da última marcação). Isso registra quanto ele rodou *trabalhando* até parar.
    - **Fim Pausa**: Calcula `distancia_pausa` (KM atual - KM de início da pausa). Isso registra quanto ele rodou *em pausa* (ex: deslocamento pessoal).
    - **Saída (Fim Turno)**: Calcula `saida_distancia_trabalho` (KM atual - KM da última marcação).
- [x] **2.4 PontoService (Validação Distância Max)**: Impedir fechamento de ponto ou pausa se o KM informado for > 500km do KM anterior (prevenção de erro de digitação).
- [x] **2.5 TurnoService**: Ajustar criação/edição de vínculos para suportar os novos campos financeiros. (Implementado em `colaborador-cliente.service.ts`)
- [x] **2.7 Relatório Financeiro (Logic)**: Lógica turno-a-turno via **Agenda Dinâmica**:
    - **Base de Cálculo**: O divisor do salário (`dias_trabalhados`) não é mais fixo. Ele é o total de dias da escala existentes NO MÊS específico.
    - **Calculo Pro-rata**: `Saldo_Fixo_Turno / (Dias_Potenciais_do_Mes) * Dias_Uteis_Trabalhados`. Aplicado apenas no mês de início (`data_inicio`).
- [x] **2.8 Vínculo Ocorrência-Turno**:
    - **Regra**: Ocorrências com `impacto_financeiro = true` OBRIGATORIAMENTE devem estar ligadas a um `colaborador_cliente_id` (turno).
    - **Objetivo**: Garantir que o crédito/débito seja atribuído à linha correta (cliente específico) no extrato mensal.

## ETAPA 3: FORMULÁRIOS E DIALOGS (FRONTEND)
*Objetivo: Atualizar a interface de cadastro e edição de dados.*

- [x] **3.1 CollaboratorFormDialog**:
    - Incluir opção "Pendente" no status.
    - Implementar seletor e validação de PIX (Padrão: CPF, Email, Telefone, Aleatória).
    - Tornar CNH/Moto visíveis para todos (obrigatórios apenas para Motoboy/Fiscal).
    - Corrigir toast de erro quando não há alterações.
- [x] **3.2 ClientFormDialog**: Incluir campos `km contratados` e `escala semanal`.
- [x] **3.3 ShiftDialog (Turnos)**: Separar configurações em blocos VISÍVEIS de ENTRADA (Créditos + MEI + Aluguel Moto) e SAÍDA (Adiantamento). Removido `data_fim` (sistema puramente baseado em início e vigência contínua).

## ETAPA 4: OPERACIONAL E MONITORAMENTO (FRONTEND)
*Objetivo: Melhorar a visão de quem está trabalhando e a segurança.*

- [ ] **4.1 RegistrarPonto**: Exibir split de KMs (Trabalho vs Pausa) e resumo de tempos totais na tela do motoboy.
- [ ] **4.2 Tela de Colaboradores (Admin)**: Ajustar listagem para `Left Join`, permitindo ver quem NÃO registrou ponto no dia (Monitoramento completo).
- [ ] **4.3 Segurança (Logout)**: Implementar logout forçado caso o usuário seja desativado (Status != ATIVO).
- [ ] **4.4 Tela de Ocorrências**: Criar página de listagem geral de ocorrências com filtros de data e autor.

## ETAPA 5: FINANCEIRO E RELATÓRIOS (FRONTEND/LOGIC)
*Objetivo: Consolidar os dados para fechamento mensal.*

- [ ] **5.1 Ficha do Colaborador**: Refatorar para interface de abas/menus (Mobile First) e criar aba de Ocorrências.
- [ ] **5.2 Espelho de Ponto**: Criar visualização mensal com saldo de horas `(Trabalhado - Esperado)`.
- [ ] **5.3 Relatório Financeiro (Draft)**: Visualização dinâmica baseada em configurações atuais e ocorrências. Independente de logs de ponto.
    - O sistema calcula o rascunho "on-the-fly" para qualquer mês futuro assim que houver um turno ativo.
- [ ] **5.4 Fechamento e Snapshot**: 
    - Implementar ação de "Fechar Mês" que congela o cálculo dinâmico em um registro estático (`fechamentos_financeiros`).
    - **Imutabilidade**: Uma vez fechado, alterações em valores de turnos não afetam o passado.
    - Registro de pagamento e download de PDF/Comprovante.

## ETAPA 6: POLIMENTO E GESTÃO DE FERIADOS (UX)
- [x] **6.1 Gestão de Feriados**: Implementado CRUD completo de feriados com filtro por ano no Admin.
- [ ] **6.2 Tela de Configurações**: Melhorar textos descritivos e adicionar exemplos práticos para usuários leigos.
