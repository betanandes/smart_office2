import Chart from "https://cdn.jsdelivr.net/npm/chart.js";

async function getData(endpoint) {
  const res = await fetch(`http://127.0.0.1:5000/api/gamex/${endpoint}`);
  return await res.json();
}

async function loadInsights() {
  const [accessData, salesData, gamesData] = await Promise.all([
    getData("access"),
    getData("sales"),
    getData("games")
  ]);

  // === Correlação Acessos x Faturamento ===
  const correlationCtx = document.getElementById("chartCorrelation");
  new Chart(correlationCtx, {
    type: "line",
    data: {
      labels: salesData.months,
      datasets: [
        {
          label: "Acessos (mil)",
          data: accessData.values.map(v => v / 1000),
          borderColor: "#ff00ff",
          yAxisID: 'y',
          tension: 0.3
        },
        {
          label: "Faturamento (R$ mil)",
          data: salesData.values.map(v => v / 1000),
          borderColor: "#976acf",
          yAxisID: 'y1',
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          type: 'linear',
          position: 'left',
          ticks: { color: '#ff00ff' }
        },
        y1: {
          type: 'linear',
          position: 'right',
          ticks: { color: '#976acf' },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });

  // === Lançamentos vs Receita ===
  new Chart(document.getElementById("chartGamesRevenue"), {
    type: "bar",
    data: {
      labels: gamesData.devs,
      datasets: [
        {
          label: "Jogos Publicados",
          data: gamesData.counts,
          backgroundColor: "#ff00ff"
        },
        {
          label: "Receita Média (R$ mil)",
          data: gamesData.counts.map(c => c * 2 + 5), // simulação
          backgroundColor: "#976acf"
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  // === Conclusões Automáticas ===
  const insightsDiv = document.getElementById("insightsText");

  const avgAccess = accessData.values.reduce((a, b) => a + b, 0) / accessData.values.length;
  const avgSales = salesData.values.reduce((a, b) => a + b, 0) / salesData.values.length;
  const avgGames = gamesData.counts.reduce((a, b) => a + b, 0) / gamesData.counts.length;

  let insights = [];

  if (avgAccess > 5000 && avgSales > 20000) {
    insights.push("🚀 Alta correlação entre aumento de acessos e crescimento do faturamento.");
  }
  if (avgGames > 5) {
    insights.push("🎮 Desenvolvedores estão lançando novos jogos com frequência — o ecossistema está ativo.");
  }
  if (avgSales < 10000) {
    insights.push("⚠️ O faturamento está abaixo da média esperada. Estratégias de marketing podem ser otimizadas.");
  }
  if (insights.length === 0) {
    insights.push("Tudo está dentro dos padrões esperados. Continue monitorando regularmente! 💪");
  }

  insightsDiv.innerHTML = insights.map(i => `<p>${i}</p>`).join("");
}

loadInsights();

<script src="js/modules/insights.js"></script>
