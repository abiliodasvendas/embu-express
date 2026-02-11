# ESPECIFICAÇÃO DE MUDANÇAS

## 1. REESTRUTURAÇÃO: COLABORADOR x CLIENTE x TURNO

### Cenário Atual vs. Novo
**Atual:**
- Colaborador tem chave estrangeira direta para 1 Cliente e 1 Empresa.
- Colaborador tem tabela auxiliar de Turnos "soltos" (sem vínculo direto com qual cliente aquele turno se refere).

**Novo Modelo:**
- Colaborador **NÃO** tem mais vínculo direto único de Cliente/Empresa na tabela de usuários.
- Colaborador pode ter **MÚLTIPLOS** vínculos.
- Cada vínculo define: **Qual Cliente** + **Qual Empresa** (responsável) + **Qual Turno** (Inicio/Fim).
- Não existem mais turnos sem clientes.

### Estrutura de Dados (Novas Tabelas)

#### Tabela: `colaborador_clientes`
Responsável por unir o colaborador ao cliente em um contexto de tempo, responsabilidade e **FINANCEIRO**.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | PK | Identificador único do vínculo |
| `colaborador_id` | FK | Vincula ao usuário (colaborador) |
| `cliente_id` | FK | Vincula ao cliente atendido |
| `empresa_id` | FK | Vincula à empresa responsável pelo contrato |
| `hora_inicio` | TIME/STRING | Horário de início do expediente neste cliente |
| `hora_fim` | TIME/STRING | Horário de fim do expediente neste cliente |
| `valor_contrato` | DECIMAL | Valor base do contrato para este vínculo |
| `valor_aluguel` | DECIMAL | Valor do aluguel da moto neste vínculo |
| `valor_bonus` | DECIMAL | Bônus Zero Falta para este vínculo |
| `ajuda_custo` | DECIMAL | Ajuda de custo fixa neste vínculo |
| `mei` | BOOLEAN | Se o contrato é via MEI neste vínculo |

### Regras de Negócio
1. **Múltiplos Vínculos:** Um colaborador pode trabalhar para o Client A de manhã e Client A (ou B) à tarde. Isso gerará 2 registros na tabela `colaborador_clientes`.
2. **Empresa Contextual:** A empresa não define mais o colaborador como um todo, mas sim o contrato naquele horário específico.
3. **Financeiro Contextual:** Cada vínculo tem seu próprio acordo financeiro.

### Estrutura de Dados
Alterações na tabela `usuarios`:

| Coluna | Tipo | Obrigatório (Motoboy) | Descrição |
| :--- | :--- | :--- | :--- |
| `cnh_registro` | TEXT | SIM | Nº Registro CNH |
| `cnh_vencimento` | DATE | SIM | Validade da CNH |
| `cnh_categoria` | TEXT | SIM | Categoria (A, AB) |
| `moto_modelo` | TEXT | SIM | Modelo da moto |
| `moto_placa` | TEXT | SIM | Placa do veículo |
| `moto_ano` | INT | SIM | Ano da moto |

### Regras de Negócio
1. **Obrigatoriedade Condicional:** Motoboys **DEVEM** ter Moto e CNH preenchidos. Outros perfis (Admin/Staff) não precisam.
2. **Aprovação:** Todo auto-cadastro nasce inativo. Apenas admin pode ativar.
3. **Financeiro Privado:** O motoboy informa dados pessoais; o Admin define quanto ele ganha.