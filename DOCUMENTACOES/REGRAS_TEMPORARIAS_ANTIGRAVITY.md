# Regras Globais de Desenvolvimento - Antigravity

## 1. Comunicação e Idioma
- **Planos de Implementação:** Devem ser SEMPRE escritos em **Português**. Devem conter uma análise clara da lógica antes de qualquer alteração de código.
- **Respostas Diretas:** Use Português para todas as explicações, diálogos e feedback técnico.
- **Sugestões:** Sugestões de melhorias, refatorações ou novas abordagens são sempre BEM-VINDAS, mas devem ser apenas apresentadas para consulta, nunca implementadas sem aprovação explícita do usuário.

## 2. Padrões de Código e "Clean Code"
- **Comentários no Código:** **PROIBIDO** incluir comentários explicativos ou óbvios dentro do código (ex: `// faz x`, `// useEffect para y`). O código deve ser autoexplicativo através de nomes claros para variáveis, funções e componentes. 
- **Exceção de Comentários:** Use comentários apenas para explicar "hacks" inevitáveis, decisões de arquitetura muito complexas ou avisos críticos de efeitos colaterais.
- **Preservação de Escopo:** Em caso de correção de bugs (bug fixes) pontuais, evite refatorar arquivos inteiros por questões estéticas. Mantenha o foco na correção para minimizar riscos de regressão.
- **Tipagem:** Uso de `any` é desencorajado. Sempre busque a tipagem real, preferencialmente baseada no banco de dados.

## 3. Eficiência e Economia de Tokens
- **Exibição de Código:** Não repita arquivos inteiros se apenas uma parte foi alterada. Utilize blocos de código focados ou formatos de `diff` para mostrar as modificações.
- **Pesquisa Inteligente:** Antes de ler (`view_file`) arquivos extensos ( > 500 linhas), utilize ferramentas de busca como `grep` ou `find` para localizar o contexto necessário.
- **Filtro de Arquivos:** Ignore pastas de dependências (`node_modules`), builds (`dist`, `build`) e arquivos de log.

## 4. Arquitetura Unificada (Frontend & Backend)
Esta arquitetura deve ser seguida em todos os projetos (Embu Express, Van360, etc.):

### 🏗️ Padrões de Frontend (React + Vite + Tailwind + Supabase)
- **Constantes > Magic Strings:** **PROIBIDO** usar strings puras para status, tipos ou rotas.
    - Use Enums em `src/types/enums.ts`.
    - Use Rotas em `src/constants/routes.ts`.
    - Use Mensagens/Toasts em `src/constants/messages.ts`.
- **Organização de Hooks (`src/hooks`):**
    - `api/`: Apenas React Query (Queries/Mutations). Sem lógica de negócio.
    - `business/`: Lógica de negócio pura (TS somente, sem JSX).
    - `ui/`: Lógica de interface e View Models.
    - `form/`: Lógica de formulários (Hook Form + Zod).
- **Organização de Componentes (`src/components`):**
    - `ui/`: Atômicos (Shadcn/UI).
    - `features/`: Componentes específicos de funcionalidades.
    - `dialogs/`: Todos os diálogos de negócio **DEVEM** ser centralizados no `LayoutContext` e chamados via `useLayout()`. Proibida a instanciação local.

### ⚙️ Padrões de Backend (Fastify + Zod + Supabase)
- **Controller Magro, Service Gordo:** A lógica de negócios **DEVE** residir nos services (`src/services`). Os controllers (`src/controllers`) apenas validam a entrada, chamam o serviço e retornam a resposta.
- **Validação com Zod:** Toda entrada de dados (body, query, params) deve ser validada por schemas do Zod antes de processar.
- **Source of Truth (DB):** O esquema do banco de dados (Supabase) é a verdade absoluta.
- **Tipagem:** Use DTOs em `src/types/dtos` para validar entradas e tipar saídas.

### 🗄️ Consistência Full-Stack
- **Localização do Backend:** Sempre que houver dúvida sobre lógica de servidor ou persistência, consulte o serviço correspondente em:
    - Embu Express: `c:\Users\thiag\Desktop\PROJETOS\embu-express-backend\src\services\*`
    - Van360: `c:\Users\thiag\Desktop\PROJETOS\van360-backend\src\services\*`
- **Verificação de Schema:** Antes de sugerir tipos ou mudanças no Front, valide os relacionamentos e colunas nos arquivos de migration do Backend (`supabase/migrations/*.sql`).
- **Sincronia:** Garanta que os Enums no Front correspondam exatamente aos tipos/check constraints definidos no SQL do Back.

## 5. Obediência às Diretrizes
- O Antigravity deve sempre validar se o workspace possui uma pasta de `DOCUMENTACOES`. O conteúdo específico desses documentos tem prioridade máxima caso haja alguma regra de negócio única, mas os padrões de estrutura acima são a base técnica.
