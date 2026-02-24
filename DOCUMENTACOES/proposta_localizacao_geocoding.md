# Proposta Técnica: Localização, Geofencing e Mapas

Este documento descreve a estratégia para implementação de recursos geográficos no Embu Express, visando garantir que os registros de ponto ocorram nos locais corretos dos clientes.

## 1. Geocodificação de Clientes (Base)
Atualmente, o sistema possui apenas o endereço textual dos clientes. Para exibir mapas e calcular distâncias, precisamos converter esses endereços em coordenadas `(latitude, longitude)`.

- **Ação:** Adicionar colunas `latitude` (decimal) e `longitude` (decimal) na tabela `clientes`.
- **Processo:** Criar um serviço de Geocoding (usando a API gratuita do **OpenStreetMap/Nominatim**) que seja disparado ao cadastrar ou atualizar o endereço de um cliente.

## 2. Cerca Eletrônica (Geofencing)
Uma regra matemática no Backend para validar a posição do motoboy no momento do registro.

- **Lógica:** Calcular a distância haversine entre a coordenada do registro (Motoboy) e a coordenada do Cliente.
- **Regra:** Se a distância for superior a um limite definido (ex: 300 metros), o registro é marcado com uma flag de **"Divergência de Localização"**.
- **Benefício:** Evita fraudes onde o ponto é batido fora do local de trabalho.

## 3. Visualização de Mapas (Frontend)
Utilização da biblioteca **Leaflet** (Open Source e Gratuita) para renderização dos mapas.

### Cenário de Uso: Painel do Administrador
- Um mapa visual dentro dos detalhes do ponto.
- **Ponto A (Azul):** Sede/Local do Cliente.
- **Ponto B (Vermelho):** Local real onde o botão foi clicado.
- Uma linha conectando ambos com o cálculo de distância em metros destacado.

### Cenário de Uso: Painel do Motoboy
- Mini-mapa de confirmação ao iniciar o turno, reforçando que o sistema está monitorando a localização para o cliente selecionado.

---

## Próximos Passos Sugeridos
1. Migração do Banco de Dados para incluir as coordenadas em `clientes`.
2. Implementação da biblioteca `Leaflet` nos painéis de controle.
3. Criação da cron/script de saneamento para geocodificar clientes já existentes.
