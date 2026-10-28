# ChargeVolt - Sprint 4 (Solução Final Integrada)

**Challenge GoodWe 2026 - Turma 1CCPY**

## Equipe
* Gabriela Caetano - RM: 572738
* Laura Pícari - RM: 569914
* Lucas Neves - RM: 572679
* João Victor - RM: 571630
* Beatriz Araújo - RM: 570619

---

## 1. O que é o ChargeVolt?
O ChargeVolt é um sistema completo para eletropostos (postos de recarga de carros elétricos). Ele resolve o problema da falta de controle de energia e automatiza o pagamento. O sistema tem duas partes que conversam entre si: um **aplicativo mobile** (para o motorista) e um **servidor em Python** (que gerencia a energia e o dinheiro).

## 2. Arquitetura e Integração
*   **Frontend (App):** Feito em **React Native (Expo)**. É a tela onde o usuário faz login, escolhe quantos KWh quer, seleciona a estação, cadastra cartão e paga (via Pix simulado ou Cartão).
*   **Backend (Servidor):** Feito em **Python com FastAPI**. Ele recebe os pedidos do app, calcula a energia solar/bateria e salva tudo num banco de dados **SQLite**. Tudo fica salvo no banco (histórico de recargas, agendamentos e usuários).
*   **Integração:** O app e o servidor se comunicam via API (usando JSON). Quando o usuário clica em "Confirmar", o app envia os dados e o Python responde com o valor final e a divisão de lucros.

## 3. Alinhamento com a GoodWe e Sustentabilidade
O grande diferencial inovador é o **EMS (Energy Management System)** simulado no Python. Ele gerencia de onde vem a energia para carregar o carro:
1.  **Prioridade Solar:** Entre 10h e 16h, o sistema usa a energia gerada por painéis solares (GoodWe).
2.  **Uso da Bateria:** No horário de pico (18h às 21h), quando a energia da rede é mais cara, o sistema usa a bateria carregada durante o dia.
3.  **Rede Elétrica:** Apenas se o solar e a bateria não forem suficientes.

**Divisão de Receita:** Toda a transação financeira foi programada para seguir o modelo de negócios: **90% do valor fica para o estabelecimento** (dono do posto) e **10% é repassado para a GoodWe** pelo uso da tecnologia.

## 4. Resultados Obtidos (Simulação de 1 dia)
Realizamos uma simulação de 1 dia inteiro dividido em faixas de 2 horas para provar a eficiência do sistema:
*   **Energia Renovável:** 59,4% da energia entregue aos carros veio de fontes limpas (Solar + Bateria).
*   **Economia Financeira:** O posto economizou **R$ 68,55** por não precisar comprar toda a energia da rede no horário de pico.
*   **Redução de Carbono:** O sistema evitou a emissão de **5,94 kg de CO₂** em apenas um dia de operação.

## 5. Tecnologias Utilizadas
*   **Linguagens:** Python e JavaScript.
*   **Frameworks:** FastAPI (Backend), Expo / React Native (Frontend).
*   **Banco de Dados:** SQLite.
*   **Design:** Interface amigável com suporte a 3 temas (Azul, Roxo e Pêssego) e simulação de leitor de QR Code.

---

## Como rodar o projeto na sua máquina

Você vai precisar de dois terminais abertos (um para o Backend e outro para o Frontend).

### Passo 1: Rodar o Backend (Python)
Abra o terminal na pasta raiz do projeto e digite:
```bash
# Entre na pasta do backend
cd backend

# Instale as dependências (caso não tenha o arquivo requirements)
pip install fastapi uvicorn

# Inicie o servidor
uvicorn main:app --reload --host 0.0.0.0

### Passo 2: Rodar o Frontend (App)
# Entre na pasta do frontend
cd frontend

# Instale as bibliotecas do Node
npm install

# Inicie o Expo
npx expo start

Como testar:

No terminal do Expo, aperte a tecla w para abrir o aplicativo no seu navegador web.
