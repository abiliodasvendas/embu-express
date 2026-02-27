# Proposta de Implementação: Suporte a CLT

Este documento registra a análise inicial e as perguntas pendentes para a futura implementação de suporte a CLT no sistema.

## Visão Geral

Atualmente o sistema é focado no modelo PJ (Contratos/CNPJ). A migração para CLT exige a inclusão de lógica de tributação (INSS, IRRF), benefícios com desconto (VT) e geração de holerites.

## Arquitetura Proposta

### 1. Modelo de Dados
- **Tipo de Contratação**: Campo `tipo_contratacao` (PJ ou CLT).
- **Dados Fixos**: Salário bruto, quantidade de dependentes, opção de Vale Transporte.
- **Tabelas de Referência**: Configuração de faixas de INSS e IRRF (anual).

### 2. Módulo de Cálculo
- Utilitário para cálculo de INSS progressivo.
- Utilitário para cálculo de IRRF (após deduções).
- Lógica de desconto de VT (teto de 6%).

### 3. Interface de Usuário
- Visualização mensal de folha de pagamento.
- Gerador de Holerites (Visualização e PDF).

## Perguntas Pendentes (A esclarecer com o usuário)

1. **Cálculo Automático**: O sistema deve calcular tudo baseado em tabelas internas ou aceitar apenas valores manuais digitados?
2. **Benefícios Adicionais**: Além de VT e VR, existem descontos variáveis (Seguro de Vida, Farmácia, Convênios)?
3. **Formato do Holerite**: A visualização em tela é suficiente ou o PDF oficial é mandatório?
4. **Histórico Salarial**: É necessário guardar o histórico de alterações (ex: promoções)?

---
*Documento gerado em 27/02/2026*
