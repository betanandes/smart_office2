from flask import Flask, jsonify, request
import json, os
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

genai.configure(api_key="AIzaSyDul9kdRnCBkm8LCWHAVzHmrlxLU03Jo_M")

DB_PATH = "db.txt"

# Cria o banco fictício se não existir
if not os.path.exists(DB_PATH):
    data = {
        "dashboard": {
            "acessos": 2456,
            "faturamento": 32190.75,
            "jogos_inseridos": 145
        },
        "monitoramento": {
            "usuarios_online": 128,
            "vendas_dia": 42,
            "novos_jogos": 3
        },
        "insights": {
            "tendencias": [
                "Jogos indie com estética retrô estão em alta.",
                "Promoções aumentam o engajamento em 35%.",
                "Jogos multiplayer mantêm usuários ativos por mais tempo."
            ],
            "kpis": {
                "retencao": 0.87,
                "satisfacao": 0.93,
                "tempo_medio_sessao": "18min"
            }
        },
        "riscos": [
            {"risco": "Instabilidade no servidor", "impacto": "Alto"},
            {"risco": "Baixa taxa de conversão em dias úteis", "impacto": "Médio"}
        ]
    }
    with open(DB_PATH, "w") as f:
        f.write(json.dumps(data))

def read_db():
    with open(DB_PATH, "r") as f:
        return json.loads(f.read())

@app.route("/api/dashboard")
def get_dashboard():
    return jsonify(read_db()["dashboard"])

@app.route("/api/monitoramento")
def get_monitoramento():
    return jsonify(read_db()["monitoramento"])

@app.route("/api/insights")
def get_insights():
    return jsonify(read_db()["insights"])

@app.route("/api/relatorio", methods=["POST"])
def gerar_relatorio():
    dados = read_db()
    prompt = f"""
    Gere um relatório corporativo para a plataforma GameX.
    Inclua: 
    - Resumo geral dos acessos ({dados['dashboard']['acessos']})
    - Faturamento total (R${dados['dashboard']['faturamento']})
    - Jogos inseridos ({dados['dashboard']['jogos_inseridos']})
    - Monitoramento (usuários online, vendas do dia)
    - Principais insights e riscos.

    Use um tom profissional e breve, no estilo de relatório executivo.
    """

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        return jsonify({"relatorio": response.text})
    except Exception as e:
        return jsonify({"erro": str(e)})

if __name__ == "__main__":
    app.run(debug=True)
