# Avaliação de Ajustes Pré-Produção

Este documento detalha a análise técnica dos itens levantados para a preparação do sistema para produção. Cada ponto foi avaliado considerando o comportamento atual do código (backend e frontend).

---

### 1. Turnos que atravessam a meia-noite (ex: 18h às 00h ou 02h)
**Pergunta:** O sistema entende que pode acabar 00h ou depois? Se começou 18h e acabou 1h da manhã, ele entende que trabalhou 7h?

**Análise Atual:**
- **Ponto Positivo:** O cálculo do **tempo trabalhado bruto** no backend (`ponto.service.ts`) e frontend utiliza objetos `Date` completos, o que permite calcular corretamente o intervalo mesmo que atravesse a meia-noite (desde que a data da saída seja o dia seguinte).
- **Ponto Crítico (Bug Identificado):** A lógica de **"Saldo de Minutos"** e **"Tempo Esperado"** no backend (`calculateStatus`) está falha para turnos pernoite. Atualmente, o sistema faz `turnoFimMinutos - turnoInicioMinutos`. Para um turno de 18h (1080 min) às 02h (120 min), o resultado é `-960`, o que resultará em um cálculo de saldo (banco de horas) completamente errado (ex: 480 - (-960) = 1440 min).
- **Conclusão:** O sistema **não está 100% preparado** para pernoite no cálculo de saldo e banco de horas.
- **Ação Necessária:** Ajustar a função `calculateStatus` no backend para detectar se `hora_fim < hora_inicio` e somar 24h (1440 min) ao fim para o cálculo de duração esperada.

### 2. Listagem de colaboradores no dia (Escala Semanal)
**Pergunta:** Se o colaborador não trabalha naquele dia (ex: sábado), ele deve aparecer na lista de controle de ponto?

**Análise Atual:**
- **Comportamento Atual:** A tela de "Controle de Ponto" (Admin) hoje lista **todos os colaboradores ativos** que possuem um vínculo (`colaborador_clientes`) válido na data, independente se o cliente trabalha naquele dia da semana.
- **Conclusão:** Atualmente ele **aparece na lista** como "AUSENTE" mesmo que não seja um dia de trabalho dele.
- **Ação Necessária:** Ajustar a query de listagem no backend (`listPontos` com `incluir_todos: true`) para cruzar com o campo `escala_semanal` da tabela `clientes`. Se o dia da semana atual não estiver no array da escala do cliente, o colaborador não deve ser listado como ausente (pois não é esperado trabalho).

### 3. Colaboradores com dois turnos
**Pergunta:** No controle de ponto, deveria trazer os dois registros (duas linhas) para o mesmo colaborador?

**Análise Atual:**
- **Comportamento Atual:** A listagem administrativa atual tenta agrupar por usuário. No cenário de `incluir_todos`, ela faz um mapeamento dos usuários encontrados. Se um usuário tem 2 vínculos (links), a lógica atual (`u.links?.[0]`) pega apenas o primeiro para gerar o registro de "ausência" ou vinculação.
- **Conclusão:** O sistema **não lida corretamente** com múltiplos turnos na mesma listagem. Ele mostrará apenas uma linha.
- **Ação Necessária:** Refatorar a listagem administrativa para ser baseada em **Vínculos (Links)** e não apenas em Usuários, permitindo que o mesmo colaborador apareça em duas linhas se ele tiver dois turnos distintos configurados.

### 4. Bloqueio de ponto em dias fora da escala
**Pergunta:** Se a escala é seg-sáb e o colaborador abre o app no domingo, ele consegue bater ponto? O sistema deveria bloquear?

**Análise Atual:**
- **Comportamento Atual:** O frontend (`RegistrarPonto.tsx`) carrega todos os links ativos do usuário e permite selecionar qualquer um deles para iniciar o turno. Não há validação da `escala_semanal` do cliente no momento do registro.
- **Conclusão:** Atualmente o colaborador **consegue bater ponto** em qualquer dia, inclusive domingos e feriados (o sistema até tem uma lógica para bônus de feriado, mas não bloqueia o registro).
- **Ação Necessária:** No frontend (`RegistrarPonto.tsx`), ao filtrar os `activeLinks`, adicionar uma verificação do dia da semana atual contra a `escala_semanal` do cliente vinculado. Se o dia atual não estiver na escala, desabilitar o botão de início ou mostrar o aviso conforme sugerido.

---

**Próximos Passos Sugeridos:**
1. Corrigir o cálculo de saldo pernoite no backend.
2. Implementar a filtragem por `escala_semanal` na listagem administrativa.
3. Ajustar o frontend para bloquear registros fora da escala.
4. Refatorar a listagem para suportar múltiplas linhas por colaborador (por turno).
