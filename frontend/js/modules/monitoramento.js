// Chart já está disponível globalmente pelo CDN no HTML
const BASE = 'http://127.0.0.1:5000/api/gamex';

async function fetchJson(path) {
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

function safeDestroyChart(chart) {
  try {
    if (chart && typeof chart.destroy === 'function') chart.destroy();
  } catch (e) {
    console.warn('safeDestroyChart: erro ao destruir gráfico', e);
  }
}

async function loadMonitoramento() {
  console.log('loadMonitoramento chamado'); // DEBUG
  try {
    const [access, sales, games] = await Promise.all([
      fetchJson('access'),
      fetchJson('sales'),
      fetchJson('games')
    ]);
    
    console.log('Dados recebidos:', { access, sales, games }); // DEBUG
    // ... resto do código

    // 🧠 Métricas gerais
    const acessosRecentes = Array.isArray(access) ? access.slice(-7) : [];
    const faturamentoMensal = Array.isArray(sales)
      ? sales.reduce((s, r) => s + (r.amount || 0), 0)
      : 0;
    const totalJogos = Array.isArray(games) ? games.length : 0;

    document.getElementById('acessosRecentes').textContent =
      acessosRecentes.length ? acessosRecentes.length : '--';
    document.getElementById('faturamentoMensal').textContent =
      faturamentoMensal ? `R$ ${faturamentoMensal.toLocaleString('pt-BR')}` : '--';
    document.getElementById('insercoesJogos').textContent = totalJogos || '--';

    // 🔥 Gráfico de evolução semanal
    const labels = acessosRecentes.map(r => r.date);
    const values = acessosRecentes.map(r => r.users);

    const ctx = document.getElementById('monitoramentoChart').getContext('2d');
    safeDestroyChart(window.monitoramentoChart);
    window.monitoramentoChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['Sem dados'],
        datasets: [
          {
            label: 'Acessos Recentes',
            data: values.length ? values : [0],
            backgroundColor: 'rgba(255,0,255,0.3)',
            borderColor: '#ff00ff',
            borderWidth: 1
          }
        ]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#e6d6ff' } },
          y: { ticks: { color: '#e6d6ff' }, beginAtZero: true }
        }
      }
    });
  } catch (err) {
    console.error('Erro monitoramento:', err);
  }
}

// Não execute imediatamente - deixe o main.js controlar o carregamento
// loadMonitoramento();
// setInterval(loadMonitoramento, 5000);