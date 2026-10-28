# ChargeVolt - Sprint 4 

**Challenge GoodWe 2026 - Turma 1CCPY**

## Equipe
* Gabriela Caetano - RM: 572738
* Laura Pícari - RM: 569914
* Lucas Neves - RM: 572679
* João Victor - RM: 571630
* Beatriz Araújo - RM: 570619

---

## 1. O que é o ChargeVolt?
O ChargeVolt é um sistema completo para eletropostos (postos de recarga de carros elétricos). Ele resolve o problema da falta de controle de energia e automatiza o pagamento. O sistema tem duas partes que conversam entre si: um aplicativo web (para o motorista) e um servidor em Python (que gerencia a energia, o financeiro e o banco de dados).

## 2. Arquitetura e Integração
*   **Frontend (App):** Feito em React Native (Expo). É a tela onde o usuário faz login, escolhe quantos KWh quer, seleciona a estação, cadastra cartão, paga (Pix/Cartão) e gerencia seu perfil e histórico.
*   **Backend (Servidor):** Feito em Python com FastAPI. Ele recebe os pedidos do app, calcula a energia (EMS), aplica as regras de preço (Normal/Pico/Taxa) e salva tudo num banco de dados SQLite. (Dentro do código você tem acesso ao banco dedos).
*   **Integração:** O app e o servidor se comunicam via API (usando JSON). Quando o usuário confirma o pagamento, o app envia os dados e o Python responde com o valor final, a divisão de lucros e os pontos de fidelidade gerados.

## 3. Alinhamento com a GoodWe e Sustentabilidade
O grande diferencial inovador é o EMS (Energy Management System) simulado no Python. Ele gerencia de onde vem a energia para carregar o carro:
1.  **Prioridade Solar:** Entre 10h e 16h, o sistema usa a energia gerada por painéis solares (GoodWe).
2.  **Uso da Bateria:** No horário de pico (12h às 14h e 18h às 21h), quando a energia da rede é mais cara, o sistema usa a bateria carregada durante o dia.
3.  **Rede Elétrica:** Apenas se o solar e a bateria não forem suficientes.

**Divisão de Receita:** Toda a transação financeira foi programada para seguir o modelo de negócios: 80% do valor fica para o estabelecimento e 20% é repassado para a GoodWe pelo uso da tecnologia.

## 4. Tecnologias Utilizadas
*   **Linguagens:** Python e JavaScript.
*   **Frameworks:** FastAPI (Backend), Expo / React Native (Frontend).
*   **Banco de Dados:** SQLite.
*   **Design:** Interface amigável com 3 temas (Azul, Roxo e Pêssego) e simulação de leitor de QR Code.

---

## Como rodar o código na sua máquina

Você vai precisar de dois terminais abertos no VS Code (um para o Backend e outro para o Frontend).

### Passo 1: Rodar o Backend (Python)
Abra o terminal na pasta raiz do projeto e digite:
```bash
# Entre na pasta do backend
digite: cd backend

# Instale as dependências (caso não tenha instalado ainda)
digite: pip install fastapi uvicorn

# Inicie o servidor
digite: uvicorn main:app --reload --host 0.0.0.0
```
### Passo 2: Rodar o Frontend (Aplicação Web)
```bash
# Entre na pasta do frontend
digite: cd frontend

# Instale as bibliotecas do Node
digite: npm install

# Inicie o Expo (O app abrirá automaticamente no navegador)
digite: npm start
