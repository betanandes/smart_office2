// frontend/js/modules/dashboard.js
const BASE = 'http://127.0.0.1:5000/api/gamex';

async function fetchJson(path) {
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

function safeDestroyChart(chartOrCanvas) {
  try {
    // se é uma instância do Chart e tem destroy()
    if (chartOrCanvas && typeof chartOrCanvas.destroy === 'function') {
      chartOrCanvas.destroy();
      return;
    }
    // tenta recuperar pelo canvas usando Chart.getChart (Chart.js v3+)
    if (typeof Chart !== 'undefined' && chartOrCanvas && chartOrCanvas.canvas) {
      const found = Chart.getChart(chartOrCanvas.canvas);
      if (found && typeof found.destroy === 'function') {
        found.destroy();
        return;
      }
    }
    // tenta por id do canvas (fallback)
    const ctx = document.getElementById('acessosChart');
    if (ctx && typeof Chart !== 'undefined') {
      const found2 = Chart.getChart(ctx);
      if (found2 && typeof found2.destroy === 'function') {
        found2.destroy();
        return;
      }
    }
  } catch (e) {
    console.warn('safeDestroyChart: não foi possível destruir chart anterior', e);
  }
}

async function loadDashboard() {
  try {
    const [access, sales, games] = await Promise.all([
      fetchJson('access'),
      fetchJson('sales'),
      fetchJson('games')
    ]);

    // calcular métricas
    const totalAcessos = Array.isArray(access) ? access.reduce((s, r) => s + (r.users || 0), 0) : 0;
    const faturamento = Array.isArray(sales) ? sales.reduce((s, r) => s + (r.amount || 0), 0) : 0;
    const totalGames = Array.isArray(games) ? games.length : 0;

    document.getElementById('totalAcessos').textContent = totalAcessos ? totalAcessos.toLocaleString() : '--';
    document.getElementById('faturamentoMensal').textContent = faturamento ? `R$ ${faturamento.toLocaleString('pt-BR')}` : '--';
    document.getElementById('novosJogos').textContent = totalGames || '--';

    // histórico de acessos
    let labels = [], values = [];
    if (Array.isArray(access) && access.length) {
      const sorted = access.slice().sort((a,b) => new Date(a.date) - new Date(b.date));
      labels = sorted.map(r => r.date);
      values = sorted.map(r => r.users);
    }

    const maxPoints = 14;
    const start = Math.max(0, labels.length - maxPoints);
    const sliceLabels = labels.slice(start);
    const sliceValues = values.slice(start);

    // destrói chart anterior com segurança
    // se window.acessosChart for algo inválido, safeDestroyChart lida com isso
    safeDestroyChart(window.acessosChart);

    // garante que chart global anterior não persista via Chart.getChart
    const canvasEl = document.getElementById('acessosChart');
    const existing = (typeof Chart !== 'undefined' && Chart.getChart) ? Chart.getChart(canvasEl) : null;
    if (existing && typeof existing.destroy === 'function') existing.destroy();

    // cria novo chart e salva instância em window.acessosChart
    const ctx = canvasEl.getContext('2d');
    window.acessosChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: sliceLabels.length ? sliceLabels : ['Sem dados'],
        datasets: [{
          label: 'Acessos',
          data: sliceValues.length ? sliceValues : [0],
          borderColor: '#ff00ff',
          backgroundColor: 'rgba(255,0,255,0.08)',
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#ff00ff'
        }]
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
    console.error('Erro dashboard:', err);
    document.getElementById('totalAcessos').textContent = 'Erro';
    document.getElementById('faturamentoMensal').textContent = '--';
    document.getElementById('novosJogos').textContent = '--';
    // desenhar placeholder vazio no chart
    try {
      safeDestroyChart(window.acessosChart);
      const canvasEl = document.getElementById('acessosChart');
      if (canvasEl) {
        const ctx = canvasEl.getContext('2d');
        if (window.acessosChart && typeof window.acessosChart.destroy === 'function') window.acessosChart.destroy();
        window.acessosChart = new Chart(ctx, {
          type: 'line',
          data: { labels: ['Erro'], datasets: [{ label: 'Acessos', data: [0], borderColor: '#ff00ff' }] },
          options: { plugins: { legend: { display: false } } }
        });
      }
    } catch (e) {
      // nada
    }
  }
}

// executa quando o módulo for carregado
loadDashboard();
