from flask import Flask, jsonify, request
import json, os
from flask_cors import CORS
import google.generativeai as genai


app = Flask(__name__)
CORS(app)


# IMPORTANTE: Desativa a conversão para ASCII em jsonify para suportar acentuação (UTF-8)
app.config['JSON_AS_ASCII'] = False


# AVISO: É importante usar sua chave API real aqui.
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
    # Usar ensure_ascii=False e encoding="utf-8" para gravar o JSON corretamente
    with open(DB_PATH, "w", encoding="utf-8") as f:
        f.write(json.dumps(data, ensure_ascii=False))


def read_db():
    # Abrir o arquivo com encoding="utf-8" para ler corretamente
    with open(DB_PATH, "r", encoding="utf-8") as f:
        return json.loads(f.read())


@app.route("/api/dashboard")
def get_dashboard():
    # O jsonify agora respeita app.config['JSON_AS_ASCII'] = False
    return jsonify(read_db()["dashboard"])


@app.route("/api/monitoramento")
def get_monitoramento():
    return jsonify(read_db()["monitoramento"])


@app.route("/api/insights")
def get_insights():
    return jsonify(read_db()["insights"])


# ROTA 1: RELATÓRIO DE STATUS
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
        # Modelo atualizado conforme recomendado
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        return jsonify({"relatorio": response.text})
    except Exception as e:
        return jsonify({"erro": str(e)})


# ROTA 2: LIÇÕES APRENDIDAS
@app.route("/api/licoes-aprendidas", methods=["POST"])
def gerar_licoes_aprendidas():
    dados = read_db()
   
    # Prepara os dados de Insights e Riscos para o Prompt
    tendencias = "\n".join([f"- {t}" for t in dados['insights']['tendencias']])
    riscos = "\n".join([f"- {r['risco']} (Impacto: {r['impacto']})" for r in dados['riscos']])
   
    prompt = f"""
    Com base nas informações operacionais e de mercado da GameX, gere um relatório executivo de "Lições Aprendidas e Riscos".
   
    O relatório deve ser dividido em duas seções principais:
   
    1. LIÇÕES APRENDIDAS (com base nas Tendências e KPIs):
       - Identifique e explique 2-3 lições-chave de sucesso/oportunidade.
       - Use os seguintes dados de tendências:
         {tendencias}
       - Use os KPIs: Retenção ({dados['insights']['kpis']['retencao']}), Satisfação ({dados['insights']['kpis']['satisfacao']}), Tempo Médio de Sessão ({dados['insights']['kpis']['tempo_medio_sessao']}).


    2. RISCOS IDENTIFICADOS E AÇÕES SUGERIDAS:
       - Para cada risco listado abaixo, sugira uma ação de mitigação breve e profissional.
       - Riscos atuais:
         {riscos}
         
    Use um tom analítico e focado em melhoria contínua.
    """


    try:
        
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        # Retorna a resposta no campo 'licoes'
        return jsonify({"licoes": response.text})
    except Exception as e:
        # Em caso de erro, retorna a mensagem
        return jsonify({"erro": f"Erro ao gerar Lições Aprendidas: {str(e)}"})


# INICIALIZAÇÃO DA APLICAÇÃO
if __name__ == "__main__":
    app.run(debug=True)
