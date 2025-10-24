// Variável global para armazenar as instâncias dos gráficos
let graficoMundoRealInstance = null; // 🌟 NOVO: Para o gráfico de Acessos/Faturamento/Jogos
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


/**
 * 🌟 ATUALIZADO: Cria um gráfico de LINHAS comparando as 3 principais métricas.
 * @param {number} acessos
 * @param {number} faturamento
 * @param {number} jogos
 */
function criarGraficoDashboardMundoReal(acessos, faturamento, jogos) {
    const ctx = document.getElementById("graficoDashboardMundoReal");

    if (graficoMundoRealInstance) {
        graficoMundoRealInstance.destroy();
    }

    // Simplificando os dados para melhor visualização (valores grandes)
    const valorAcessos = Math.round(acessos / 1000); // Exibir em milhares
    const valorFaturamento = Math.round(faturamento / 10000); // Exibir em dezenas de milhares (para escala)
    const valorJogos = jogos;
    
    // Configuração dos dados
    const dadosMundoReal = {
        labels: ['Acessos (milhares)', 'Faturamento (x10k R$)', 'Jogos Inseridos'],
        datasets: [{
            label: 'Volume de Métricas',
            data: [valorAcessos, valorFaturamento, valorJogos],
            // 🌟 AJUSTES PARA LINHA 🌟
            borderColor: '#ff00ff', // Cor principal da linha
            backgroundColor: 'rgba(255, 0, 255, 0.4)', // Cor de preenchimento abaixo da linha
            pointBackgroundColor: '#ff00ff',
            pointRadius: 6,
            tension: 0.3, // Suaviza a linha
            fill: true, // Preenche a área abaixo da linha
            borderWidth: 2
        }]
    };

    graficoMundoRealInstance = new Chart(ctx, {
        type: 'line', // 🌟 TIPO MUDADO PARA LINHA 🌟
        data: dadosMundoReal,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Métricas em Escalas Comparáveis',
                    color: 'white'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                // Formatação mais amigável no tooltip
                                if (context.dataIndex === 0) {
                                    return `Acessos: ${context.parsed.y * 1000} Total`;
                                } else if (context.dataIndex === 1) {
                                    return `Faturamento: R$ ${(context.parsed.y * 10000).toLocaleString('pt-BR')}`;
                                } else {
                                    return `Jogos: ${context.parsed.y}`;
                                }
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Valores Escalonados', color: 'white' },
                    grid: { color: 'rgba(75, 22, 100, 0.5)' },
                    ticks: { color: 'white' }
                },
                x: {
                    grid: { color: 'rgba(75, 22, 100, 0.5)' },
                    ticks: { color: 'white' }
                }
            }
        }
    });
}


async function carregarDashboard() {
    let acessosTotal = 0;
    let faturamentoTotal = 0;
    let jogosInseridos = 0;

    // 1. Carrega dados do dashboard e armazena
    try {
        const res = await fetch("http://127.0.0.1:5000/api/dashboard");
        const d = await res.json();
        
        acessosTotal = parseInt(d.acessos.replace(/\D/g, '')); // Limpa e converte
        faturamentoTotal = parseFloat(d.faturamento.replace('R$', '').replace('.', '').replace(',', '.'));
        jogosInseridos = parseInt(d.jogos_inseridos);

        document.getElementById("acessos").textContent = d.acessos || '--';
        document.getElementById("faturamento").textContent = `R$ ${d.faturamento || '--'}`;
        document.getElementById("jogos").textContent = d.jogos_inseridos || '--';
        
    } catch (e) {
        console.warn("API de dashboard indisponível. Usando dados mockados.");
        
        // Dados Mockados para o cálculo e exibição:
        acessosTotal = 120000;
        faturamentoTotal = 450000.75;
        jogosInseridos = 350;

        document.getElementById("acessos").textContent = '120.000';
        document.getElementById("faturamento").textContent = `R$ 450.000,75`;
        document.getElementById("jogos").textContent = '350';
    }


    // 2. Cria o NOVO Gráfico de Métricas (Acessos/Faturamento/Jogos)
    // Passa os valores coletados/mockados
    criarGraficoDashboardMundoReal(acessosTotal, faturamentoTotal, jogosInseridos);

    // 3. Carrega a Matriz de Riscos, agora com base nas métricas
    // Passa os valores das métricas para a matriz de riscos
    await carregarMatrizRiscos(acessosTotal, faturamentoTotal, jogosInseridos); 
    
    
    // (Mantido) Carrega dados simulados para Velocity, CPI, SPI (Remova se não precisar mais)
    const velocityData = { velocity: 18, descricao: "Média das últimas 3 Sprints" };
    const cpiData = { cpi: 1.05, descricao: "Abaixo do custo orçado" };
    const spiData = { spi: 0.98, descricao: "Levemente atrasado" };

    // Esses elementos foram removidos do HTML na sua request, mas mantidos no JS caso precise reativar
    // if (document.getElementById("velocity")) document.getElementById("velocity").textContent = velocityData.velocity;
    // if (document.getElementById("velocity-descricao")) document.getElementById("velocity-descricao").textContent = velocityData.descricao;
    // if (document.getElementById("cpi")) document.getElementById("cpi").textContent = cpiData.cpi;
    // if (document.getElementById("cpi-descricao")) document.getElementById("cpi-descricao").textContent = cpiData.descricao;
    // if (document.getElementById("spi")) document.getElementById("spi").textContent = spiData.spi;
    // if (document.getElementById("spi-descricao")) document.getElementById("spi-descricao").textContent = spiData.descricao;
}


/**
 * 🌟 ALTERADO: Carrega Matriz de Riscos, agora com 1 risco dinâmico baseado nas métricas.
 * @param {number} acessos
 * @param {number} faturamento
 * @param {number} jogos
 */
async function carregarMatrizRiscos(acessos, faturamento, jogos) {
    const tabelaRiscosBody = document.getElementById("tabelaRiscosBody");
    tabelaRiscosBody.innerHTML = ''; 

    // Riscos Padrão
    const riscosPadrao = [
        { "id": "R-01", "risco": "Instabilidade no servidor", "probabilidade": "Alta", "impacto": "Alto", "acao": "Monitoramento proativo e planos de contingência." },
        { "id": "R-03", "risco": "Concorrência acirrada", "probabilidade": "Média", "impacto": "Alto", "acao": "Inovação contínua e pesquisa de mercado." }
    ];
    
    // Risco Dinâmico baseado nas métricas de negócio
    let riscoDinamico = {
        "id": "R-04",
        "risco": "Queda de Engajamento e Receita",
        "probabilidade": "Baixa",
        "impacto": "Médio",
        "acao": "Análise de funil e promoção de jogos."
    };
    
    if (acessos < 100000 || faturamento < 400000) {
        riscoDinamico.id = "R-02";
        riscoDinamico.risco = "Risco de Receita Abaixo da Meta";
        riscoDinamico.acao = "Priorizar o desenvolvimento de jogos com alto potencial de receita e campanhas de up-sell/cross-sell.";

        if (acessos < 80000 && faturamento < 300000) {
            riscoDinamico.probabilidade = "Alta";
            riscoDinamico.impacto = "Alto";
        } else if (acessos < 100000 || faturamento < 400000) {
            riscoDinamico.probabilidade = "Média";
            riscoDinamico.impacto = "Médio";
        }
    }
    
    const riscos = [...riscosPadrao, riscoDinamico];


    riscos.forEach(risco => {
        // Função utilitária para limpar e padronizar o nome da classe
        const getClass = (texto) => {
            let classe = texto.toLowerCase(); 
            classe = classe.replace('média', 'media'); 
            classe = classe.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return classe;
        };
        
        // Padronização para Probabilidade e Impacto
        const classeProbabilidade = getClass(risco.probabilidade);
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
        document.getElementById("usuariosOnline").textContent = '540';
        document.getElementById("vendasDia").textContent = '1.200';
        document.getElementById("novosJogos").textContent = '5';
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
            li.innerHTML = `<span style="margin-right: 10px; color: #ff00ff;"></span>${t}`;
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