async function getData(endpoint) {
  const res = await fetch(`http://127.0.0.1:5000/api/gamex/${endpoint}`);
  return await res.json();
}

async function generateReport() {
  const [accessData, salesData, gamesData] = await Promise.all([
    getData("access"),
    getData("sales"),
    getData("games")
  ]);

  // Simulação de IA (texto dinâmico)
  const avgAccess = Math.round(accessData.values.reduce((a, b) => a + b, 0) / accessData.values.length);
  const totalSales = salesData.values.reduce((a, b) => a + b, 0);
  const totalGames = gamesData.counts.reduce((a, b) => a + b, 0);

  const report = `
  🚀 **Relatório de Status – GameX**
  • Média de acessos recentes: ${avgAccess}
  • Faturamento acumulado: R$${totalSales.toLocaleString("pt-BR")}
  • Jogos publicados: ${totalGames}

  📊 Análise:
  O sistema apresenta uma performance sólida, com crescimento constante de acessos e boa atividade dos desenvolvedores. 
  O faturamento segue alinhado ao número de lançamentos, o que demonstra engajamento entre público e criadores.
  `;

  return report;
}

async function generateLessons() {
  const report = `
  🧠 **Lições Aprendidas – GameX**
  • A correlação entre novos lançamentos e faturamento reforça a importância de incentivar devs independentes.
  • Melhorar campanhas de marketing durante períodos de baixo tráfego.
  • Manter monitoramento ativo das métricas para evitar quedas abruptas.
  • Explorar análises preditivas para prever picos de vendas e tráfego.
  • Automatizar mais relatórios para reduzir tempo de análise manual.
  `;
  return report;
}

document.getElementById("btnStatus").addEventListener("click", async () => {
  const box = document.getElementById("statusReport");
  box.innerHTML = "<p>Gerando relatório...</p>";
  const text = await generateReport();
  box.innerHTML = `<pre>${text}</pre>`;
});

document.getElementById("btnLessons").addEventListener("click", async () => {
  const box = document.getElementById("lessonsReport");
  box.innerHTML = "<p>Gerando lições aprendidas...</p>";
  const text = await generateLessons();
  box.innerHTML = `<pre>${text}</pre>`;
});


<script src="js/modules/relatorios.js"></script>