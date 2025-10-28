<div align="center">

# 🎮 GameX Analytics Dashboard

Um sistema completo de **monitoramento e análise de dados da plataforma GameX**, com foco em métricas de acessos, faturamento, inserção de jogos, geração de relatórios com **IA (Gemini)** e visualização em tempo real.

</div>

---

## 🚀 Tecnologias Utilizadas

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-Framework-black?logo=flask)
![Google Gemini](https://img.shields.io/badge/Gemini-API-blue?logo=google)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Framework-38B2AC?logo=tailwindcss&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-Frontend-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Styling-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Frontend-F7DF1E?logo=javascript&logoColor=black)

---

## 📂 Estrutura do Projeto

GameX/<br>
│<br>
├── backend/<br>
│ ├── app.py # Servidor Flask com rotas e integração à API Gemini<br>
│ ├── db.txt # Banco de dados fictício em formato JSON<br>
│ └── requirements.txt # Dependências do backend<br>
│<br>
├── frontend/<br>
│ ├── index.html # Interface principal com os 4 módulos<br>
│ ├── css/<br>
│ │ └── style.css # Estilo com a paleta roxa da GameX<br>
│ └── js/<br>
│ └── script.js # Requisições e interação com o backend<br>
│<br>
└── README.md

---

## 🎨 Paleta de Cores (Colorimetria GameX)

| Nome | Cor | Hex |
|------|------|------|
| Fundo principal | ![#10002d](https://placehold.co/15x15/10002d/10002d.png) | `#10002d` |
| Sidebar | ![#4b1664](https://placehold.co/15x15/4b1664/4b1664.png) | `#4b1664` |
| Destaques / Ícones | ![#ff00ff](https://placehold.co/15x15/ff00ff/ff00ff.png) | `#ff00ff` |
| Seleções / Hover | ![#976acf](https://placehold.co/15x15/976acf/976acf.png) | `#976acf` |

---

## 🧠 Módulos do Sistema

### 📊 1. Dashboard de Gerenciamento
- Mostra métricas principais:
  - Acessos à plataforma
  - Faturamento total
  - Jogos inseridos
- KPIs visuais e resumo geral do desempenho da GameX

---

### ⚡ 2. Monitoramento em Tempo Real
- Atualização dos dados de:
  - Usuários online
  - Vendas diárias
  - Inserções de novos jogos

---

### 💡 3. Módulo de Insights e Análises
- Exibe tendências e insights baseados nos dados do `db.txt`
- Mostra métricas de:
  - Retenção de usuários
  - Satisfação média
  - Tempo médio de sessão

---

### 🧾 4. Relatórios com IA (Gemini)
- Gera relatórios automáticos de status e desempenho.
- Integração com **Google Gemini API** para geração de texto com IA.
- Exemplo de uso:
  - “Gerar Relatório de Status” → resumo executivo com KPIs e insights.

---

## 🧰 Configuração do Ambiente (Passo a Passo)

### 1️⃣ Clonar o repositório

```bash
git clone https://github.com/seuusuario/gamex-analytics.git
cd gamex-analytics/backend
```

2️⃣ Criar o ambiente virtual (venv)
```bash
python -m venv .venv
```
Ativar o ambiente:
🪟 Windows PowerShell
```bash
.venv\Scripts\Activate.ps1
```
🐧 Linux / macOS
```bash
source .venv/bin/activate
```
3️⃣ Instalar as dependências
```bash
pip install -r requirements.txt
```
Se você ainda não tiver o arquivo requirements.txt, use:
```bash
pip install flask flask-cors google-generativeai
pip freeze > requirements.txt
```
4️⃣ Configurar a API Key do Gemini
Crie um arquivo .env dentro da pasta backend com:
```bash
GEMINI_API_KEY=SUA_CHAVE_API_AQUI
```
Depois, edite o app.py para ler essa variável:
```bash
import os
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
```
5️⃣ Rodar o backend
```bash
python app.py
```
O servidor será iniciado em:
👉 http://127.0.0.1:5000

6️⃣ Rodar o frontend
Abra o arquivo frontend/index.html diretamente no navegador
ou use o Live Server (VSCode) para ter atualização em tempo real.

### 🧩 Endpoints da API
| Endpoint             | Método | Descrição                          |
| -------------------- | ------ | ---------------------------------- |
| `/api/dashboard`     | GET    | Retorna métricas gerais            |
| `/api/monitoramento` | GET    | Retorna dados de monitoramento     |
| `/api/insights`      | GET    | Retorna insights e tendências      |
| `/api/relatorio`     | POST   | Gera relatório automatizado via IA |

---

### 📈 Futuras Melhorias

- Autenticação de administradores.
- Histórico de relatórios gerados.
- Dashboard comparativo de períodos.
- Exportação de relatórios em PDF.
  
---

<div align="center">
Desenvolvido por Roberta Fernandes<br>
Estagiária e Desenvolvedora Front-End 💜
</div> 

