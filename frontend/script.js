// Variável global para armazenar as instâncias dos gráficos
let graficoBurndownInstance = null;
let graficoMonitoramentoInstance = null;

// Adiciona o event listener para o botão de toggle do menu (mobile)
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelectorAll('.sidebar nav a');

    // Toggle para abrir/fechar a sidebar em mobile
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Fechar o menu ao clicar em um link (apenas em mobile)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 900) {
                sidebar.classList.remove('open');
            }
        });
    });
});


async function carregarDashboard() {
    // 1. Carrega dados do dashboard (existente)
    // Simulação: se sua API não estiver rodando, use um mock para teste
    try {
        const res = await fetch("http://127.0.0.1:5000/api/dashboard");
        const d = await res.json();
        document.getElementById("acessos").textContent = d.acessos || '--';
        document.getElementById("faturamento").textContent = `R$ ${d.faturamento || '--'}`;
        document.getElementById("jogos").textContent = d.jogos_inseridos || '--';
    } catch (e) {
        console.warn("API de dashboard indisponível. Usando dados mockados.");
    }


    // NOVO: Carrega dados simulados para Velocity, CPI, SPI (você pode integrar com a API real futuramente)
    const velocityData = { velocity: 18, descricao: "Média das últimas 3 Sprints" };
    const cpiData = { cpi: 1.05, descricao: "Abaixo do custo orçado" };
    const spiData = { spi: 0.98, descricao: "Levemente atrasado" };

    document.getElementById("velocity").textContent = velocityData.velocity;
    document.getElementById("velocity-descricao").textContent = velocityData.descricao;
    document.getElementById("cpi").textContent = cpiData.cpi;
    document.getElementById("cpi-descricao").textContent = cpiData.descricao;
    document.getElementById("spi").textContent = spiData.spi;
    document.getElementById("spi-descricao").textContent = spiData.descricao;


    // 2. Gráfico de Burndown da Sprint
    const ctxBurndown = document.getElementById("graficoBurndown");

    // Dados de exemplo para o gráfico de Burndown
    const dadosBurndown = {
        labels: ['Dia 1', 'Dia 2', 'Dia 3', 'Dia 4', 'Dia 5', 'Dia 6', 'Dia 7', 'Dia 8', 'Dia 9', 'Dia 10'],
        datasets: [
            {
                label: 'Ideal',
                data: [100, 90, 80, 70, 60, 50, 40, 30, 20, 10], // Linha ideal
                borderColor: '#976acf', // Roxo claro
                backgroundColor: 'rgba(151, 106, 207, 0.1)', // Fundo suave
                tension: 0.4,
                fill: false,
                pointRadius: 4,
                pointBackgroundColor: '#976acf'
            },
            {
                label: 'Real',
                data: [100, 95, 85, 78, 65, 55, 48, 35, 25, 12], // Linha real (simulação de leve atraso)
                borderColor: '#ff00ff', // Magenta
                backgroundColor: 'rgba(255, 0, 255, 0.1)',
                tension: 0.4,
                fill: false,
                pointRadius: 4,
                pointBackgroundColor: '#ff00ff'
            }
        ]
    };

    if (graficoBurndownInstance) {
        graficoBurndownInstance.destroy();
    }

    graficoBurndownInstance = new Chart(ctxBurndown, {
        type: 'line',
        data: dadosBurndown,
        options: {
            responsive: true,
            maintainAspectRatio: false, 
            plugins: {
                legend: {
                    labels: { color: 'white', font: { family: 'Inter' } } 
                },
                tooltip: {
                    backgroundColor: 'rgba(35, 11, 66, 0.9)', // Cor de fundo do tooltip
                    titleColor: '#ff00ff',
                    bodyColor: 'white',
                    borderColor: '#4b1664',
                    borderWidth: 1,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Pontos Restantes', color: 'white' },
                    grid: { color: 'rgba(75, 22, 100, 0.5)' },
                    ticks: { color: 'white' }
                },
                x: {
                    title: { display: true, text: 'Dias da Sprint', color: 'white' },
                    grid: { color: 'rgba(75, 22, 100, 0.5)' },
                    ticks: { color: 'white' }
                }
            }
        }
    });

    // 3. Carrega a Matriz de Riscos
    await carregarMatrizRiscos(); 
}

async function carregarMatrizRiscos() {
    const tabelaRiscosBody = document.getElementById("tabelaRiscosBody");
    tabelaRiscosBody.innerHTML = ''; 

    const riscos = [
        { "id": "R-01", "risco": "Instabilidade no servidor", "probabilidade": "Alta", "impacto": "Alto", "acao": "Monitoramento proativo e planos de contingência." },
        { "id": "R-02", "risco": "Baixa taxa de conversão", "probabilidade": "Baixa", "impacto": "Médio", "acao": "A/B testing e otimização de funil." },
        { "id": "R-03", "risco": "Concorrência acirrada", "probabilidade": "Média", "impacto": "Alto", "acao": "Inovação contínua e pesquisa de mercado." }
    ];

    riscos.forEach(risco => {
        // Função utilitária para limpar e padronizar o nome da classe
        const getClass = (texto) => {
             // 1. Converte para minúsculas
             let classe = texto.toLowerCase(); 
             // 2. Substitui 'média' por 'media'
             classe = classe.replace('média', 'media'); 
             // 3. (Opcional) Remove outros acentos se houver
             classe = classe.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
             return classe;
        };
        
        // Novo valor padronizado para Probabilidade
        const classeProbabilidade = getClass(risco.probabilidade);
        
        // Novo valor padronizado para Impacto
        // OBS: Você já estava tentando substituir 'Médio' por 'Média' no innerHTML, 
        // mas é melhor padronizar a classe E o texto.
        const textoImpacto = risco.impacto.replace('Médio', 'Média');
        const classeImpacto = getClass(risco.impacto);


        const row = tabelaRiscosBody.insertRow();
        row.innerHTML = `
            <td>${risco.id}</td>
            <td>${risco.risco}</td>
            
            <td><span class="badge ${classeProbabilidade}">${risco.probabilidade}</span></td>
            
            <td><span class="badge ${classeImpacto}">${textoImpacto}</span></td>
            
            <td>${risco.acao}</td>
        `;
    });
}


async function carregarMonitoramento() {
    // 1. Carrega métricas (simuladas)
    try {
        const res = await fetch("http://127.0.0.1:5000/api/monitoramento");
        const d = await res.json();
        document.getElementById("usuariosOnline").textContent = d.usuarios_online || '--';
        document.getElementById("vendasDia").textContent = d.vendas_dia || '--';
        document.getElementById("novosJogos").textContent = d.novos_jogos || '--';
    } catch (e) {
        console.warn("API de monitoramento indisponível. Usando dados mockados.");
    }
    
    // 2. Configura o Gráfico de Atividade (Simulado)
    const ctx = document.getElementById("graficoMonitoramento");
    
    const dadosAtividade = {
        labels: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30'],
        datasets: [{
            label: 'Usuários Ativos',
            data: [110, 125, 128, 140, 135, 150, 145], 
            borderColor: '#ff00ff', 
            backgroundColor: 'rgba(255, 0, 255, 0.3)',
            pointBackgroundColor: '#ff00ff',
            tension: 0.4,
            fill: true
        }]
    };
    
    if (graficoMonitoramentoInstance) {
        graficoMonitoramentoInstance.destroy();
    }
    
    graficoMonitoramentoInstance = new Chart(ctx, {
        type: 'line',
        data: dadosAtividade,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(35, 11, 66, 0.9)', 
                    titleColor: '#ff00ff',
                    bodyColor: 'white',
                    borderColor: '#4b1664',
                    borderWidth: 1,
                }
            }, 
            scales: {
                y: { beginAtZero: false, grid: { color: 'rgba(75, 22, 100, 0.5)' }, ticks: { color: 'white' } },
                x: { grid: { color: 'rgba(75, 22, 100, 0.5)' }, ticks: { color: 'white' } }
            }
        }
    });
}


async function carregarInsights() {
    try {
        const res = await fetch("http://127.0.0.1:5000/api/insights");
        const d = await res.json();
        
        // 1. Carrega as Tendências na lista
        const lista = document.getElementById("listaInsights");
        lista.innerHTML = ""; 
        d.tendencias.forEach(t => {
            const li = document.createElement("li");
            li.innerHTML = `<span style="margin-right: 10px; color: #ff00ff;">✨</span>${t}`;
            lista.appendChild(li);
        });
        
        // 2. Carrega os KPIs nos novos cards
        document.getElementById("retencao").textContent = d.kpis.retencao || '--';
        document.getElementById("satisfacao").textContent = d.kpis.satisfacao || '--';
        document.getElementById("tempoMedio").textContent = d.kpis.tempo_medio_sessao || '--';
    } catch (e) {
        console.warn("API de insights indisponível. Usando dados mockados.");
        // Mock se a API falhar
        document.getElementById("retencao").textContent = '35%';
        document.getElementById("satisfacao").textContent = '4.5/5';
        document.getElementById("tempoMedio").textContent = '12 min';
        
        const lista = document.getElementById("listaInsights");
        lista.innerHTML = `<li><span style="margin-right: 10px; color: #ff00ff;">✨</span>Aumento de 20% em jogos indie na última semana.</li>
                            <li><span style="margin-right: 10px; color: #ff00ff;">✨</span>Região Sul com maior taxa de churn (ação necessária).</li>
                            <li><span style="margin-right: 10px; color: #ff00ff;">✨</span>Engajamento mobile superou o desktop em 15%.</li>`;
    }
}


async function gerarRelatorio(tipo) {
    let endpoint = "";
    let resultadoElementId = "";
    
    if (tipo === 'status') {
        endpoint = "http://127.0.0.1:5000/api/relatorio"; 
        resultadoElementId = "textoRelatorioStatus";
    } else if (tipo === 'licoes') {
        endpoint = "http://127.0.0.1:5000/api/licoes-aprendidas";
        resultadoElementId = "textoRelatorioLicoes";
    } else {
        return; 
    }
    
    const resultadoElement = document.getElementById(resultadoElementId);
    resultadoElement.textContent = "Gerando relatório... Por favor, aguarde."; 
    
    try {
        const res = await fetch(endpoint, { method: "POST" });
        const data = await res.json();
        
        resultadoElement.textContent = data.relatorio || data.erro || data.licoes || "Erro desconhecido na geração.";
    } catch (e) {
        resultadoElement.textContent = `Erro de Conexão: Verifique se o backend está rodando em 127.0.0.1:5000. ${e.message}`;
    }
}

// **FUNÇÃO ATUALIZADA**
function mostrar(modulo, clickedElement) {
    // 1. Oculta todos os módulos e exibe o ativo
    document.querySelectorAll(".modulo").forEach(m => m.classList.remove("ativo"));
    document.getElementById(modulo).classList.add("ativo");

    // 2. Remove 'active' de todos os links e adiciona ao clicado
    document.querySelectorAll(".sidebar a").forEach(a => a.classList.remove("active"));
    if (clickedElement) {
        clickedElement.classList.add("active");
    }

    // 3. Carrega os dados específicos
    if (modulo === "dashboard") carregarDashboard();
    if (modulo === "monitoramento") carregarMonitoramento(); 
    if (modulo === "insights") carregarInsights();
    // 'relatorios' não precisa de carregamento inicial
}


// Inicia o dashboard ao carregar a página
carregarDashboard();