# 🤖 ELRAY Bot - Assistente de Cotações (WhatsApp)

Bot de atendimento automatizado desenvolvido em Node.js com o WhatsApp (via Baileys) e inteligência artificial (OpenAI GPT-3.5) para agilizar o processo de cotação de planos de saúde e envio de redes hospitalares para os vendedores e clientes da **ELRAY Serviços e Corretora de Seguros**.

---

## 🚀 Funcionalidades

* **Atendimento Automatizado via WhatsApp:** Responde instantaneamente a dúvidas e pedidos de cotação de forma natural.
* **Inteligência Artificial (Ray):** Utiliza o modelo da OpenAI para extrair automaticamente a idade, a cidade e o estado informados pelo utilizador na mesma mensagem.
* **Cotação Dinâmica:** Calcula os valores dos planos de saúde com base na cidade e nas idades informadas.
* **Envio de Documentação (PDF):** Localiza e envia automaticamente o PDF da rede hospitalar (Book) correspondente ao estado solicitado.
* **Gestão de Vigência e Prazos:** Calcula de forma automática as regras de vigência baseadas no dia do mês (corte dia 23) e orienta sobre o pagamento e carências.
* **Painel Web para QR Code:** Inclui uma interface web em Express para exibir o QR Code de autenticação do WhatsApp com facilidade e nitidez na nuvem.

---

## 🛠️ Tecnologias Utilizadas

* **Node.js** & **Express** (Servidor e rotas web)
* **@whiskeysockets/baileys** (Conexão e automação do WhatsApp)
* **OpenAI API (GPT-3.5-turbo)** (Processamento de linguagem natural e extração de dados)
* **Dotenv** (Gestão de variáveis de ambiente)
* **Pino** (Registo de logs)

---

## ⚙️ Configuração e Instalação Local

1. Clone o repositório para o seu computador:
   ```bash
   git clone https://github.com/SEU_UTILIZADOR/elray-bot.git
   cd elray-bot
   ```

2. Instale as dependências necessárias:
   ```bash
   npm install
   ```

3. Crie um arquivo `.env` na raiz do projeto e configure a sua chave da OpenAI:
   ```env
   OPENAI_API_KEY=sua-chave-aqui
   PORT=3000
   ```

4. Inicie o bot:
   ```bash
   node index.js
   ```

---

## 🌐 Deploy na Nuvem (Render)

O bot está optimizado para correr em serviços de cloud gratuitos como o **Render**:
* **Build Command:** `npm install`
* **Start Command:** `node index.js`
* **Variáveis de Ambiente:** Adicionar `OPENAI_API_KEY` com a sua chave secreta no painel do Render.

Para manter o serviço ativo 24 horas por dia sem entrar em modo de suspensão, pode utilizar um serviço de monitorização como o **UptimeRobot** a efetuar pings regulares ao link principal do Render (`https://elray-bot.onrender.com/`).

---

## 📄 Estrutura de Pastas

* `index.js` - Ponto de entrada, servidor web e lógica de eventos do WhatsApp.
* `src/calculadora.js` - Motor de cálculo das cotações por região/cidade.
* `books/` - Pastas divididas por estados contendo os arquivos PDF das redes hospitalares.
* `auth_info_baileys/` - Ficheiros de sessão persistente do WhatsApp (gerados automaticamente).

---
Desenvolvido para otimizar o fluxo de trabalho da equipa comercial da ELRAY.