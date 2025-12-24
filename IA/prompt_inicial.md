Atue como um Engenheiro de Software Sênior especialista em React, Vite, Tailwind, Shadcn UI e Supabase.

CONTEXTO DO PROJETO:
Estou migrando um projeto existente de gestão escolar ("Van360") para um novo produto de logística chamado "Embu Express".
- Este repositório é um CLONE do Van360.
- NÃO DELETE NENHUM ARQUIVO ANTIGO AGORA. Use os arquivos existentes (em /src tem components, consntats, hooks, pages, integrations etc) como referência estrita de arquitetura (como fazer queries, mutations, toasts, formulários com zod).
- O objetivo agora é criar a "casca" funcional da nova Versão Administrativa.

OBJETIVO DA SPRINT:
Criar as novas telas e rotas administrativas funcionais (apenas estrutura e UI, mockando dados se necessário ou preparando os hooks).

1. DEFINIÇÕES DE BANCO DE DADOS (Referência para Types):
Considere que o Supabase já possui estas tabelas. Crie os arquivo em `src/types` com as interfaces:
- `clients` (id, nome_fantasia, razao_social, cnpj, status [ativo/inativo], endereco...).
- `roles` (id, name [admin, motoboy]).
- `profiles` (id, nome_completo, cpf, role_id, cliente_atual_id, horario_base_entrada, horario_base_saida, ativo, primeiro_acesso).
- `time_records` (id, profile_id, data_referencia, entrada_hora, saida_hora, status_entrada, status_saida [calculados no front ou back]).

2. NOVAS TELAS E COMPONENTES A CRIAR (OU AJUSTAR SE EXISTIR):

A. Login (`src/pages/Login.tsx`):
- Atualize a tela de login para pedir apenas CPF (com máscara) e Senha.
- Lógica de Redirecionamento:
  - Se `role === 'admin'`: Redirecionar para `/controle-ponto`.
  - Se `role === 'motoboy'`: Exibir um Toast (use o componente `sonner` ou `toast` já instalado) dizendo "App Mobile em desenvolvimento" e impedir login.

B. Layout Administrativo (reaproveitar) (`src/layouts/AppLayout.tsx`):
  - As opções do Menu devem ser:
    1. Controle de Ponto (Rota: `/controle-ponto`) - Ícone: Clock.
    2. Funcionários (Rota: `/funcionarios`) - Ícone: Users.
    3. Clientes (Rota: `/clientes`) - Ícone: Building.

C. Tela 1: Controle de Ponto (`src/pages/admin/TimeTracking.tsx`):
- Esta é a "Home" do Admin.
- Header com filtros: Data (DatePicker), Filtro de Status (Select), Filtro de Cliente.
- Tabela (use shadcn Table) listando os registros do dia.
- Exibir APENAS funcionários com `ativo: true`.
- Colunas: Funcionário, Cliente, Entrada (Hora + Badge Status), Saída (Hora + Badge Status).

D. Tela 2: Gestão de Funcionários (`src/pages/admin/Employees.tsx`):
- CRUD simples.
- Tabela listando nome, CPF, Perfil e Cliente Atual.
- Botão "Novo Funcionário" que abre um Sheet/Dialog com formulário (use `react-hook-form` + `zod`).

E. Tela 3: Gestão de Clientes (`src/pages/admin/Clients.tsx`):
- CRUD simples.
- Tabela listando Nome Fantasia e CNPJ.
- Botão "Novo Cliente".

3. TAREFAS DE EXECUÇÃO:

1. Crie os arquivos de tipagems em `src/types.ts`.
2. Reaproveitar o `AppLayout.tsx` reaproveitando componentes de UI existentes.
3. Crie os arquivos das páginas (`TimeTracking`, `Employees`, `Clients`) com a estrutura básica de UI (Tabela + Header).
4. Configure as novas rotas no `src/routes.tsx` (ou `App.tsx`), apontando `/` para o Login e protegendo as rotas `/controle-ponto`, `/funcionarios` e `/clientes` com a checagem de auth do Supabase.

IMPORTANTE:
- boa parte dos arquivos já existem, entao voce pode reaproveitar, nao precisa reinventar. Em casos como o menu que tem varias opções (e rotas), voce pode remover TODAS as outras que tem a ver com o van360, pq nao usaremos nesse projeto. 
O que queremos aqui é reaproveitar o maximo da estrutura, alguns components genericos etc, e depois iremos remover TUDO referente van360, assim que a casca estiver pronta.
O target dessa entrega (desse prompt) é ter o sistema de login funcionando para o perfil/role admin e, ao logar, cair na tela de controle de ponto, e tres menus apenas: controle de ponto, funcionarios e clientes, conforme as instruções acima. As telas ainda nao precisam funcionar, basta existirem e ter um titulo nela, identificando-as.

Se tiver duvidas, gere um arquivo nessa mesma pasta (IA) com as duvidas e um espaço apra resposta. APós as repostas e quando voce estiver pronto, pode começar os ajustes.