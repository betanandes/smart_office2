async function carregarDashboard() {
  const res = await fetch("http://127.0.0.1:5000/api/dashboard");
  const d = await res.json();
  document.getElementById("acessos").textContent = d.acessos;
  document.getElementById("faturamento").textContent = `R$ ${d.faturamento}`;
  document.getElementById("jogos").textContent = d.jogos_inseridos;

  const ctx = document.getElementById("grafico");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Acessos", "Faturamento", "Jogos"],
      datasets: [{
        label: "Métricas GameX",
        data: [d.acessos, d.faturamento / 100, d.jogos_inseridos],
        backgroundColor: ["#ff00ff", "#976acf", "#c864ff"]
      }]
    },
    options: { responsive: true }
  });
}

async function carregarMonitoramento() {
  const res = await fetch("http://127.0.0.1:5000/api/monitoramento");
  const d = await res.json();
  document.getElementById("usuariosOnline").textContent = d.usuarios_online;
  document.getElementById("vendasDia").textContent = d.vendas_dia;
  document.getElementById("novosJogos").textContent = d.novos_jogos;
}

async function carregarInsights() {
  const res = await fetch("http://127.0.0.1:5000/api/insights");
  const d = await res.json();
  const lista = document.getElementById("listaInsights");
  lista.innerHTML = "";
  d.tendencias.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    lista.appendChild(li);
  });
  document.getElementById("retencao").textContent = d.kpis.retencao;
  document.getElementById("satisfacao").textContent = d.kpis.satisfacao;
  document.getElementById("tempoMedio").textContent = d.kpis.tempo_medio_sessao;
}

async function gerarRelatorio() {
  const res = await fetch("http://127.0.0.1:5000/api/relatorio", { method: "POST" });
  const data = await res.json();
  document.getElementById("textoRelatorio").textContent = data.relatorio || data.erro;
}

function mostrar(modulo) {
  document.querySelectorAll(".modulo").forEach(m => m.classList.remove("ativo"));
  document.getElementById(modulo).classList.add("ativo");

  document.querySelectorAll(".sidebar a").forEach(a => a.classList.remove("active"));
  event.target.classList.add("active");

  if (modulo === "dashboard") carregarDashboard();
  if (modulo === "monitoramento") carregarMonitoramento();
  if (modulo === "insights") carregarInsights();
}

carregarDashboard();
