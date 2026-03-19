# Plano de Implementação: Flexibilização de Horários por Dia da Semana (Final)

Este plano visa permitir que o sistema suporte horários de entrada, saída e tolerância de pausa diferentes para cada dia da semana dentro de um único vínculo (turno). 

## User Review Required

> [!IMPORTANT]
> Decisões finais consolidadas:
>
> 1. **Sem Migração Automática**: Não haverá script de migração para os campos `hora_inicio` e `hora_fim`. O usuário irá remover os vínculos atuais e recadastrá-los após a atualização.
> 2. **Pausa Variável**: A tolerância de pausa será configurada individualmente por dia da semana.
> 3. **Independência de Escala**: A escala do colaborador no vínculo define sua obrigação.
> 4. **Feriados**: A expectativa de horário (escala) permanece ativa em feriados. Se o colaborador não trabalhar num dia em que tem escala, será contado como ausência, mesmo sendo feriado.

## Proposed Changes

### 1. Banco de Dados (Supabase)

#### [NEW] `colaborador_cliente_horarios`
Tabela para armazenar os detalhes diários.
- `id`: serial/int (PK)
- `colaborador_cliente_id`: int (FK para `colaborador_clientes`, CASCADE delete)
- `dia_semana`: int (1-7, onde 1=Segunda, 7=Domingo)
- `hora_inicio`: time
- `hora_fim`: time
- `tolerancia_pausa_min`: int (default 0)

---

### 2. Backend (Fastify/Node.js)

#### [MODIFY] [database.ts](file:///c:/Users/thiag/Desktop/PROJETOS/embu-express-backend/src/types/database.ts)
- Adicionar interface `ColaboradorClienteHorario`.
- Atualizar [ColaboradorCliente](file:///c:/Users/thiag/Desktop/PROJETOS/embu-express-backend/src/types/database.ts#161-181) para incluir `horarios?: ColaboradorClienteHorario[]`.

#### [MODIFY] [colaborador-cliente.service.ts](file:///c:/Users/thiag/Desktop/PROJETOS/embu-express-backend/src/services/colaborador-cliente.service.ts)
- Refatorar [syncLinks](file:///c:/Users/thiag/Desktop/PROJETOS/embu-express-backend/src/services/colaborador-cliente.service.ts#8-54) para também persistir os horários na nova tabela.
- Garantir que buscas de links retornem seus horários aninhados.

#### [MODIFY] [ponto-calculator.service.ts](file:///c:/Users/thiag/Desktop/PROJETOS/embu-express-backend/src/services/ponto-calculator.service.ts)
- Alterar [calculateStatus](file:///c:/Users/thiag/Desktop/PROJETOS/embu-express-backend/src/services/ponto-calculator.service.ts#30-187) para buscar na nova tabela `colaborador_cliente_horarios` o horário configurado para o dia da semana da data de referência.

#### [MODIFY] [ponto.service.ts](file:///c:/Users/thiag/Desktop/PROJETOS/embu-express-backend/src/services/ponto.service.ts)
- Refatorar [listPontos](file:///c:/Users/thiag/Desktop/PROJETOS/embu-express-backend/src/services/ponto.service.ts#351-568) (lógica de Mocks/Ausentes) para identificar ausências apenas nos dias/horários configurados na nova tabela.

---

### 3. Frontend (React + Shadcn/UI)

#### [MODIFY] `CollaboratorTurnDialog.tsx`
- Implementar interface visual para configurar a grade semanal de horários com inputs de Início, Fim e Pausa para cada dia ativo.

#### [MODIFY] `TimeMirrorDailyCard.tsx`
- Ajustar exibição do horário esperado para refletir a configuração diária.

## Verification Plan

### Automated/Dev Tests
- Simular inserção de escala variada (ex: Sábado diferente).
- Validar cálculos de `status_entrada` e `saldo_minutos` para o Sábado.

### Manual Verification
- Testar salvamento de escala variada no Dialog de Colaborador.
- Verificar se o controle de ponto e espelho mostram os horários corretos para cada dia configurado.

