# Controle de Tarefas: Flexibilização de Horários por Dia da Semana

Este documento rastreia o progresso da implementação da flexibilização de horários diários para colaboradores.

## 1. Banco de Dados (Supabase)
- [x] Criar tabela `colaborador_cliente_horarios` (PK: id, FK: colaborador_cliente_id, dia_semana, hora_inicio, hora_fim, tolerancia_pause_min).
- [x] Atualizar View `v_relatorio_mensal_ponto` para buscar horários do snapshot `detalhes_calculo`.

## 2. Backend (Fastify/Node.js)
- [x] **Tipagem**: Adicionar `ColaboradorClienteHorario` em `src/types/database.ts`.
- [x] **Vínculos**: Refatorar `colaborador-cliente.service.ts` (`syncLinks`, `updateLink`, `createLink`) para persistir horários diários na nova tabela.
- [x] **Cálculo de Ponto**: Ajustar `ponto-calculator.service.ts` para identificar o turno correto baseado no dia da semana.
- [x] **Listagem de Pontos**: Ajustar `ponto.service.ts` para que a lógica de "Ausentes" e "Mocks" considere os horários da nova tabela.

## 3. Frontend (React)
- [x] **Tipagem**: Atualizar `src/types/database.ts` para incluir suporte a `horarios`. (CUIDADO: Sincronizar com backend).
- [x] **Formulário de Vínculo**: Implementar interface de configuração semanal no `CollaboratorTurnDialog.tsx`.
- [x] **Espelho de Ponto**: Ajustar `TimeMirrorDailyCard.tsx` para exibir o turno correto (diário) do colaborador.
- [x] **Detalhes do Ponto**: Ajustar `TimeRecordDetailsDialog.tsx` para mostrar o Turno Base correto salvo no registro.

## 4. Verificação Final (A TESTAR)
- [ ] Criar um novo vínculo para um colaborador com horários diferentes (Ex: Sabado diferente).
- [ ] Registrar ponto em um dia comum e no dia diferente.
- [ ] Verificar se o "Turno Base" e Status de Entrada aparecem corretamente.
- [ ] Validar no Espelho de Ponto se o "Esperado" reflete o horário configurado para aquele dia específico.
