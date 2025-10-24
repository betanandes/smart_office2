// Variável global para armazenar as instâncias dos gráficos
let graficoMundoRealInstance = null;
let graficoMonitoramentoInstance = null;
let monitoramentoInterval = null; // Variável para controlar a atualização automática dos KPIs (10s)
let relogioInterval = null; // Variável para controlar a atualização do relógio (1s)

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
 * Cria um gráfico de LINHAS comparando as 3 principais métricas.
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
        type: 'line',
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
                    backgroundColor: 'rgba(35, 11, 66, 0.9)', 
                    titleColor: '#ff00ff',
                    bodyColor: 'white',
                    borderColor: '#4b1664',
                    borderWidth: 1,
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
        
        // 📈 DADOS PRINCIPAIS AUMENTADOS PARA ATIVAR OS MELHORES INSIGHTS
        acessosTotal = 150000;
        faturamentoTotal = 550000.75; // Alto faturamento para gerar bons Insights
        jogosInseridos = 400;

        document.getElementById("acessos").textContent = '150.000';
        document.getElementById("faturamento").textContent = `R$ 550.000,75`;
        document.getElementById("jogos").textContent = '400';
    }

    // 2. Cria o Gráfico de Métricas (Acessos/Faturamento/Jogos)
    criarGraficoDashboardMundoReal(acessosTotal, faturamentoTotal, jogosInseridos);

    // 3. Carrega a Matriz de Riscos, agora com base nas métricas
    await carregarMatrizRiscos(acessosTotal, faturamentoTotal, jogosInseridos); 
    
    // 🌟 SALVA OS DADOS PARA USO GLOBAL PELAS OUTRAS FUNÇÕES 🌟
    window.acessosTotal = acessosTotal;
    window.faturamentoTotal = faturamentoTotal;
    window.jogosInseridos = jogosInseridos;
}


/**
 * Carrega Matriz de Riscos, agora com 1 risco dinâmico baseado nas métricas.
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


/**
 * 🌟 NOVO: Atualiza um elemento do DOM com o horário atual de Brasília (America/Sao_Paulo).
 */
function atualizarRelogioBrasilia() {
    const now = new Date();
    
    // Formata a data para o fuso horário de São Paulo (que é o de Brasília)
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'America/Sao_Paulo',
        hour12: false // Formato 24h
    };
    
    const timeString = new Intl.DateTimeFormat('pt-BR', options).format(now);
    
    const clockElement = document.getElementById('horarioBrasilia');
    if (clockElement) {
        clockElement.textContent = timeString;
    } 
}


/**
 * Carrega métricas e gráfico de Monitoramento baseados nos dados do Dashboard,
 * adicionando flutuação para simular a dinâmica de tempo real.
 * @param {number} acessos
 * @param {number} faturamento
 * @param {number} jogos
 */
async function carregarMonitoramento(acessos, faturamento, jogos) {
    let usuariosOnline = 0;
    let vendasDia = 0;
    let novosJogos = 0;

    // 🌟 NOVO: Define uma flutuação aleatória para simular o tempo real.
    // Garante que o gráfico e os números mudem a cada 10s.
    const fluctuation = Math.floor(Math.random() * 50) - 25; // Número entre -25 e +24

    // 1. Tenta carregar métricas em tempo real da API
    try {
        const res = await fetch("http://127.0.0.1:5000/api/monitoramento");
        const d = await res.json();
        
        // Se a API funcionar, usa os dados dela (se a API estiver ok, ignore a flutuação)
        usuariosOnline = parseInt(d.usuarios_online.replace(/\D/g, '')) || 0;
        vendasDia = parseInt(d.vendas_dia.replace(/\D/g, '')) || 0;
        novosJogos = parseInt(d.novos_jogos) || 0;

    } catch (e) {
        console.warn("API de monitoramento indisponível. Usando dados mockados baseados no Dashboard com flutuação.");
        
        // 📈 DADOS MOCKADOS COM FLUTUAÇÃO
        // Base calculation: ~0.7% do total de acessos
        let baseUsers = Math.round(acessos * 0.007) + 50;
        
        // Aplica a flutuação à base de usuários
        usuariosOnline = Math.max(1, baseUsers + fluctuation);
        
        // Aplica uma flutuação menor para as vendas e jogos
        vendasDia = Math.max(1, Math.round(acessos * 0.004) + Math.floor(Math.random() * 10) - 5); 
        novosJogos = Math.max(1, Math.round(jogos * 0.05) + Math.floor(Math.random() * 3) - 1); 
    }
    
    // Atualiza o DOM
    document.getElementById("usuariosOnline").textContent = usuariosOnline.toLocaleString('pt-BR');
    document.getElementById("vendasDia").textContent = vendasDia.toLocaleString('pt-BR');
    document.getElementById("novosJogos").textContent = novosJogos.toLocaleString('pt-BR');

    // 2. Configura o Gráfico de Atividade (Simulado - Usuários Ativos)
    const ctx = document.getElementById("graficoMonitoramento");
    
    // Gera dados de atividade simulada com pico próximo ao NOVO valor de usuariosOnline
    const base = usuariosOnline - 100; // Base um pouco menor que o valor final
    const dadosAtividade = {
        labels: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30'],
        datasets: [{
            label: 'Usuários Ativos',
            data: [
                base - 30, 
                base + 5, 
                base + 10, 
                usuariosOnline, // Pico no valor atual (que agora flutua a cada 10s)
                base + 20, 
                base + 40, 
                base + 15
            ], 
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


/**
 * Função que inicia o loop de atualização do Monitoramento (KPIs a cada 10s, Relógio a cada 1s).
 */
function carregarMonitoramentoAutomatico() {
    // 1. Limpa o intervalo anterior, se houver
    pararMonitoramentoAutomatico(); // Chama a função que limpa os dois intervalos

    // Garantir que os dados do dashboard estejam disponíveis
    const acessos = window.acessosTotal || 0;
    const faturamento = window.faturamentoTotal || 0;
    const jogos = window.jogosInseridos || 0;

    // --- LOOP PRINCIPAL (MÉTRICAS) ---
    // Recarrega o módulo de monitoramento a cada 10 segundos
    monitoramentoInterval = setInterval(() => {
        carregarMonitoramento(acessos, faturamento, jogos);
        console.log("Monitoramento de KPIs atualizado automaticamente (10s).");
    }, 10000); 
    
    // --- NOVO LOOP PARA O RELÓGIO (1 SEGUNDO) ---
    relogioInterval = setInterval(() => {
        atualizarRelogioBrasilia();
    }, 1000); 
    
    // 3. Executa a primeira carga imediatamente
    carregarMonitoramento(acessos, faturamento, jogos);
    atualizarRelogioBrasilia(); 
}

/**
 * Função para parar a atualização automática (KPIs e Relógio).
 */
function pararMonitoramentoAutomatico() {
    if (monitoramentoInterval) {
        clearInterval(monitoramentoInterval);
        monitoramentoInterval = null;
    }
    // Para o intervalo do relógio também
    if (relogioInterval) {
        clearInterval(relogioInterval);
        relogioInterval = null;
        console.log("Atualização automática (KPIs e Relógio) parada.");
    }
}


/**
 * Carrega Insights e KPIs, formatando dados brutos da API para display (ex: 0.87 -> 87%).
 * @param {number} acessos
 * @param {number} faturamento
 * @param {number} jogos
 */
async function carregarInsights(acessos, faturamento, jogos) {
    let retencao = '25%';
    let satisfacao = '4.0/5';
    let tempoMedio = '10 min';
    let tendencias = [
        "Aumento de 10% no engajamento de jogos 'Puzzle' no último mês.",
        "Taxa de retenção em declínio na região Sul do país (ação necessária).",
        "Usuários mobile geram 60% do faturamento, mas têm tempo médio de sessão menor."
    ];
    
    // 1. Tenta carregar dados da API
    try {
        const res = await fetch("http://127.0.0.1:5000/api/insights");
        const d = await res.json();
        
        // Formata os valores da API antes de usá-los 
        const retencaoNum = parseFloat(d.kpis.retencao || 0.25);
        const satisfacaoNum = parseFloat(d.kpis.satisfacao || 0.80);
        const tempoMedioStr = d.kpis.tempo_medio_sessao || '10';

        // 1. Retenção: Multiplica por 100 e adiciona %
        retencao = `${Math.round(retencaoNum * 100)}%`; 
        
        // 2. Satisfação: Assumindo que 1.0 é 5/5, transforma a escala para 'X.X/5'
        satisfacao = `${(satisfacaoNum * 5).toFixed(1)}/5`; 
        
        // 3. Tempo Médio: Garante que ' min' esteja presente
        tempoMedio = tempoMedioStr.toString().includes('min') ? tempoMedioStr : `${tempoMedioStr} min`;

        tendencias = d.tendencias || tendencias;

    } catch (e) {
        console.warn("API de insights indisponível. Usando dados mockados coerentes e otimistas.");
        
        // 📈 DADOS MOCKADOS OTIMISTAS
        if (faturamento > 400000) {
            retencao = '65%'; 
            satisfacao = '5.0/5'; 
            tempoMedio = '25 min'; 
            tendencias.unshift("Taxa de retenção recorde! A comunidade está extremamente engajada e fiel à plataforma.");
            tendencias.push("O tempo de sessão está 20% acima da média do mercado, indicando alto valor de conteúdo.");
        } else if (faturamento < 300000) {
            retencao = '15%';
            satisfacao = '3.5/5';
            tempoMedio = '8 min';
            tendencias.unshift("Queda na Retenção: O onboarding de novos usuários precisa ser revisto.");
        } else {
            retencao = '35%';
            satisfacao = '4.5/5';
            tempoMedio = '15 min';
        }
    }

    // 2. Carrega os KPIs nos cards
    document.getElementById("retencao").textContent = retencao;
    document.getElementById("satisfacao").textContent = satisfacao;
    document.getElementById("tempoMedio").textContent = tempoMedio;
    
    // 3. Carrega as Tendências na lista (AGORA COM ÍCONE)
    const lista = document.getElementById("listaInsights");
    lista.innerHTML = ""; 
    tendencias.forEach(t => {
        const li = document.createElement("li");
        li.innerHTML = `<span style="margin-right: 10px; color: #ff00ff;"><i class="fas fa-lightbulb"></i></span>${t}`;
        lista.appendChild(li);
    });
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

/**
 * Função principal que controla qual módulo está ativo e inicia/para os loops de monitoramento.
 */
function mostrar(modulo, clickedElement) {
    // 1. Para qualquer loop de monitoramento ativo antes de mudar de módulo
    pararMonitoramentoAutomatico(); 

    // 2. Oculta todos os módulos e exibe o ativo
    document.querySelectorAll(".modulo").forEach(m => m.classList.remove("ativo"));
    document.getElementById(modulo).classList.add("ativo");

    // 3. Remove 'active' de todos os links e adiciona ao clicado
    document.querySelectorAll(".sidebar a").forEach(a => a.classList.remove("active"));
    if (clickedElement) {
        clickedElement.classList.add("active");
    }
    
    // 4. Carrega os dados específicos
    if (modulo === "dashboard") {
        carregarDashboard();
    } else {
        // Garante que os dados globais estejam disponíveis.
        const acessos = window.acessosTotal || 0;
        const faturamento = window.faturamentoTotal || 0;
        const jogos = window.jogosInseridos || 0;

        if (modulo === "monitoramento") {
            carregarMonitoramentoAutomatico(); // INICIA O LOOP
        } else if (modulo === "insights") {
            carregarInsights(acessos, faturamento, jogos); 
        }
    }
}


// Inicia o dashboard ao carregar a página
carregarDashboard();
