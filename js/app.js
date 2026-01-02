document.addEventListener('DOMContentLoaded', () => {

    // --- 1. MÁSCARA DE MOEDA ---
    const inputsMoeda = document.querySelectorAll('.input-moeda');
    inputsMoeda.forEach(input => {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, "");
            value = (value / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
            e.target.value = value;
        });
    });

    // --- 2. GERENCIAMENTO DE ABAS ---
    const initTabs = () => {
        const buttons = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.tab-pane-custom');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.getAttribute('data-tab');
                
                buttons.forEach(b => b.classList.remove('active'));
                sections.forEach(s => s.classList.remove('active'));
                
                btn.classList.add('active');
                const targetSection = document.getElementById(target);
                if (targetSection) targetSection.classList.add('active');

                if (target === 'tab-tabelas') {
                    renderizarTabelas();
                }
            });
        });
    };

    // --- 3. MODO ESCURO COM MEMÓRIA ---
    const initDarkMode = () => {
        const darkModeToggle = document.getElementById('toggleDarkMode');
        const savedTheme = localStorage.getItem('theme');
        const shouldBeDark = savedTheme === null ? true : savedTheme === 'dark';

        if (shouldBeDark) {
            document.body.classList.add('dark-mode');
            if (darkModeToggle) darkModeToggle.checked = true;
        }

        darkModeToggle?.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
            }
        });
    };

    // --- 4. ALTERNÂNCIA DE CAMPOS IRRF COM LIMPEZA ---
    const initIRRFToggle = () => {
        const irrfToggle = document.getElementById('novoCalculo2026');
        const campos2025 = document.getElementById('camposAte2025');
        const campos2026 = document.getElementById('campos2026');
        const resultadoIRRFBox = document.getElementById('resultadoIRRFBox');
        const areaModelos = document.getElementById('areaModelos2026');

        irrfToggle?.addEventListener('change', (e) => {
            const isChecked = e.target.checked;

            if (campos2026) campos2026.classList.toggle('hidden', !isChecked);
            if (campos2025) campos2025.classList.toggle('hidden', isChecked);
            if (areaModelos) areaModelos.classList.add('hidden');

            const tabIRRF = document.getElementById('tab-irrf');
            tabIRRF?.querySelectorAll('input').forEach(input => input.value = '');
            resultadoIRRFBox?.classList.add('hidden');
        });
    };

    // --- 5. LÓGICA DO TOOLTIP (INTERROGAÇÃO) ---
    const initTooltip = () => {
        const helpIcon = document.getElementById('btnHelp2026');
        const tooltip = document.getElementById('tooltip2026');

        if (helpIcon && tooltip) {
            helpIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                tooltip.classList.toggle('show');
            });

            document.addEventListener('click', () => {
                tooltip.classList.remove('show');
            });
        }
    };

    // --- 6. BOTÃO LIMPAR GERAL ---
    document.getElementById('btnLimparDados')?.addEventListener('click', () => {
        document.querySelectorAll('input').forEach(i => i.value = '');
        document.querySelectorAll('.result-box').forEach(b => b.classList.add('hidden'));
    });

    // --- 7. SISTEMA DE CÓPIA (Delegação de Eventos) ---
    document.addEventListener('click', (e) => {
        const btnTable = e.target.closest('.btn-copy-icon');
        if (btnTable) {
            const tipo = btnTable.getAttribute('data-tipo');
            executarCopiaTabela(tipo, btnTable);
            return;
        }

        const btnAction = e.target.closest('[data-action]');
        if (btnAction) {
            const action = btnAction.getAttribute('data-action');
            const targetId = btnAction.getAttribute('data-target');
            
            if (action === 'copy-value') {
                copiarApenasValor(targetId, btnAction);
            } else if (action === 'copy-full') {
                copiarResumoCompleto(targetId, btnAction);
            } else if (action === 'copy-msg-text') {
                gerarModeloTexto(IRRF.dadosUltimoCalculo, btnAction);
            } else if (action === 'copy-msg-table') {
                gerarModeloTabela(IRRF.dadosUltimoCalculo, btnAction);
            } else if (action === 'copy-msg-jira') {
                gerarModeloJira(IRRF.dadosUltimoCalculo, btnAction, 'texto');
            } else if (action === 'copy-msg-jira-table') {
                gerarModeloJira(IRRF.dadosUltimoCalculo, btnAction, 'tabela');
            }
        }
    });

    initTabs();
    initDarkMode();
    initIRRFToggle();
    initTooltip();

    if (typeof IRRF !== 'undefined') IRRF.init().catch(err => console.error(err));
    if (typeof INSS !== 'undefined') INSS.init().catch(err => console.error(err));
});

// --- FUNÇÕES GLOBAIS ---

async function renderizarTabelas() {
    const containerIRRF = document.getElementById('containerTabelaIRRF');
    const containerINSS = document.getElementById('containerTabelaINSS');

    // Se as tabelas ainda não carregaram do JSON, exibe o carregando e tenta de novo em 500ms
    if (!IRRF.tabelas || !INSS.tabelas) {
        if (containerIRRF) containerIRRF.innerHTML = `<div class="text-center p-3"><div class="spinner-border spinner-border-sm text-primary"></div></div>`;
        if (containerINSS) containerINSS.innerHTML = `<div class="text-center p-3"><div class="spinner-border spinner-border-sm text-primary"></div></div>`;
        setTimeout(renderizarTabelas, 500);
        return;
    }

    try {
        // --- RENDERIZAR TABELA IRRF ---
        const dadosIRRF = IRRF.tabelas.ate2025["2025"]["02"];
        if (containerIRRF) {
            containerIRRF.innerHTML = `
                <table id="tabelaDadosIRRF" class="table table-sm table-hover">
                    <thead>
                        <tr><th>Base de Cálculo</th><th class="text-center">Aliq.</th><th class="text-end">Dedução</th></tr>
                    </thead>
                    <tbody>
                        ${dadosIRRF.faixas.map(f => `
                            <tr>
                                <td class="fw-medium">${f.ate > 999999 ? 'Acima de 4.664,68' : 'Até ' + Config.formatarMoeda(f.ate)}</td>
                                <td class="td-center"><span class="badge ${f.aliquota > 0 ? 'bg-primary' : 'bg-secondary'}">${f.aliquota}%</span></td>
                                <td class="td-money">${Config.formatarMoeda(f.parcela)}</td>
                            </tr>`).join('')}
                    </tbody>
                </table>`;
        }

        // --- RENDERIZAR TABELA INSS ---
        // Pegando os dados de 2025
        const dadosINSS = INSS.tabelas["2025"]["01"];
        if (containerINSS) {
            containerINSS.innerHTML = `
                <table id="tabelaDadosINSS" class="table table-sm table-hover">
                    <thead>
                        <tr><th>Salário de Contribuição</th><th class="text-center">Alíquota</th></tr>
                    </thead>
                    <tbody>
                        ${dadosINSS.faixas.map(f => `
                            <tr>
                                <td class="fw-medium">${f.ate > 9999 ? 'Acima de 7.786,02 (Teto)' : 'Até ' + Config.formatarMoeda(f.ate)}</td>
                                <td class="td-center"><span class="badge bg-primary">${f.aliquota}%</span></td>
                            </tr>`).join('')}
                    </tbody>
                </table>`;
        }
    } catch (error) { 
        console.error("Erro ao renderizar tabelas:", error); 
    }
}

// --- GERAÇÃO DE MODELOS (TEXTO / JIRA) ---

function gerarModeloTexto(d, btn) {
    if (!d) return;
    const f = Config.formatarMoeda;
    let texto = "";

    if (d.rend <= 5000) {
        texto = `Rendimento bruto até ${f(5000)}\n\nO IRRF é calculado sobre a base de cálculo (rendimento bruto de ${f(d.rend)} menos deduções de ${f(d.ded)}, totalizando ${f(d.base)}), aplicando a alíquota da tabela e a parcela a deduzir, resultando em IRRF de ${f(d.irBruto)}.\n\nEm seguida, o redutor legal é calculado exclusivamente sobre o rendimento bruto de ${f(d.rend)}, sendo aplicado no mesmo valor do imposto apurado (${f(d.redutor)}), o que zera o IRRF, resultando em valor final de R$ 0,00.\nFórmula do Redutor: 978,62 − (0,133145 × ${f(d.rend)}) = ${f(d.redutor)}`;
    } else if (d.rend <= 7350) {
        texto = `Rendimento bruto entre R$ 5.000,01 e R$ 7.350,00\n\nO IRRF é calculado sobre a base de cálculo de ${f(d.base)} (rendimento bruto de ${f(d.rend)} menos deduções de ${f(d.ded)}), conforme a tabela vigente, totalizando IRRF de ${f(d.irBruto)}.\n\nNa sequência, é aplicado o redutor legal calculado apenas sobre o rendimento bruto de ${f(d.rend)}, no valor de ${f(d.redutor)}, reduzindo o imposto para ${f(d.irFinal)}.\nFórmula do Redutor: 978,62 − (0,133145 × ${f(d.rend)}) = ${f(d.redutor)}`;
    } else {
        texto = `Rendimento bruto acima de R$ 7.350,00\n\nO IRRF é apurado sobre a base de cálculo de ${f(d.base)} (rendimento bruto de ${f(d.rend)} menos deduções de ${f(d.ded)}), com aplicação da alíquota da tabela e da parcela a deduzir, resultando em IRRF de ${f(d.irFinal)}.\n\nPara esse valor de rendimento, não há aplicação de redutor legal, e o cálculo segue integralmente conforme a regra tradicional.\nFórmula do Redutor: 978,62 − (0,133145 × ${f(d.rend)}) = R$ 0,00`;
    }
    processarCopia(texto, btn, btn);
}

function gerarModeloJira(d, btn, tipo) {
    if (!d) return;
    const f = Config.formatarMoeda;
    let texto = "";

    if (tipo === 'texto') {
        if (d.rend <= 5000) {
            texto = `*Rendimento bruto até ${f(5000)}*\n\nO IRRF é calculado sobre a base de cálculo (rendimento bruto de ${f(d.rend)} menos deduções de ${f(d.ded)}, totalizando ${f(d.base)}), aplicando a alíquota da tabela e a parcela a deduzir, resultando em IRRF de ${f(d.irBruto)}.\n\nEm seguida, +o redutor legal é calculado exclusivamente sobre o rendimento bruto de ${f(d.rend)}+, sendo aplicado no mesmo valor do imposto apurado (${f(d.redutor)}), o que zera o IRRF, resultando em *valor final de R$ 0,00.*\n\n- *Fórmula do Redutor:* 978,62 − (0,133145 × ${f(d.rend)}) = ${f(d.redutor)}\n- *IRRF:* IRRF S/redutor (${f(d.irBruto)}) - Redutor (${f(d.redutor)}) = *{color:#14892c}IRRF Final R$ 0,00{color}*`;
        } else if (d.rend <= 7350) {
            texto = `*Rendimento bruto entre R$ 5.000,01 e R$ 7.350,00*\n\nO IRRF é calculado sobre a base de cálculo de ${f(d.base)} (rendimento bruto de ${f(d.rend)} menos deduções de ${f(d.ded)}), conforme a tabela vigente, totalizando IRRF de ${f(d.irBruto)}.\n\nNa sequência, é aplicado +o redutor legal calculado apenas sobre o rendimento bruto de ${f(d.rend)}+, no valor de ${f(d.redutor)}, reduzindo o imposto para *${f(d.irFinal)}*.\n\n- *Fórmula do Redutor:* 978,62 − (0,133145 × ${f(d.rend)}) = ${f(d.redutor)}\n- *IRRF:* IRRF S/redutor (${f(d.irBruto)}) - Redutor (${f(d.redutor)}) = *{color:#14892c}IRRF Final ${f(d.irFinal)}{color}*`;
        } else {
            texto = `*Rendimento bruto acima de R$ 7.350,00*\n\nO IRRF é apurado sobre a base de cálculo de ${f(d.base)} (rendimento bruto de ${f(d.rend)} menos deduções de ${f(d.ded)}), com aplicação da alíquota da tabela e da parcela a deduzir, resultando em IRRF de ${f(d.irFinal)}.\n\nPara esse valor de rendimento, não há aplicação de redutor legal, e o cálculo segue integralmente conforme a regra tradicional.\n\n- *Fórmula do Redutor:* 978,62 − (0,133145 × ${f(d.rend)}) = R$ 0,00\n- *{color:#14892c}IRRF Final ${f(d.irFinal)}{color}*`;
        }
    } else {
        texto = `*Tabela de Cálculo - IRRF 2026*\n\n|| ITEM || VALOR ||\n| Rendimento Bruto | ${f(d.rend)} |\n| Deduções | ${f(d.ded)} |\n| Base de Cálculo | ${f(d.base)} |\n| IRRF (Tabela) | ${f(d.irBruto)} |\n| Redutor Legal | {color:red}-${f(d.redutor)}{color} |\n| *IRRF FINAL* | *{color:#14892c}${f(d.irFinal)}{color}* |`;
    }
    processarCopia(texto, btn, btn);
}

function gerarModeloTabela(d, btn) {
    if (!d) return;
    const f = Config.formatarMoeda;
    const tabela = `ITEM\tVALOR\nRendimento Bruto\t${f(d.rend)}\nDeduções\t${f(d.ded)}\nBase de Cálculo\t${f(d.base)}\nIRRF (Tabela)\t${f(d.irBruto)}\nRedutor Legal\t-${f(d.redutor)}\nIRRF FINAL\t${f(d.irFinal)}`;
    processarCopia(tabela, btn, btn);
}

// --- FUNÇÕES DE CÓPIA GENÉRICAS ---

function executarCopiaTabela(tipo, btn) {
    const idTabela = tipo === 'irrf' ? 'tabelaDadosIRRF' : 'tabelaDadosINSS';
    const tabela = document.getElementById(idTabela);
    if (!tabela) return;

    let textoFinal = "";
    tabela.querySelectorAll('tr').forEach(linha => {
        const colunas = linha.querySelectorAll('th, td');
        textoFinal += Array.from(colunas).map(c => c.innerText.trim()).join('\t') + '\n';
    });
    processarCopia(textoFinal, btn, btn.querySelector('.icon-label'));
}

function copiarApenasValor(targetId, btn) {
    const elemento = document.getElementById(targetId);
    if (!elemento) return;
    navigator.clipboard.writeText(elemento.innerText.trim()).then(() => {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = "✅";
        setTimeout(() => { btn.innerHTML = originalHTML; }, 1500);
    });
}

function copiarResumoCompleto(targetId, btn) {
    const box = document.getElementById(targetId);
    if (!box) return;
    const isIRRF = targetId.includes('IRRF');
    const titulo = isIRRF ? "RESUMO CÁLCULO IRRF" : "RESUMO CÁLCULO INSS";
    let detalhes = "";
    box.querySelectorAll('.result-item').forEach(item => {
        const spans = item.querySelectorAll('span');
        if (spans.length === 2) detalhes += `${spans[0].innerText} ${spans[1].innerText}\n`;
    });
    const textoFinal = `${titulo}\n\nVALOR TOTAL: ${box.querySelector('h4').innerText}\n\nDETALHES:\n${detalhes}`;
    processarCopia(textoFinal, btn, btn.querySelector('.copy-label') || btn);
}

function processarCopia(texto, btn, labelElement) {
    navigator.clipboard.writeText(texto).then(() => {
        const originalText = labelElement?.innerText || "";
        if (labelElement) labelElement.innerText = "Copiado!";
        btn.classList.add('btn-copy-success');
        setTimeout(() => {
            if (labelElement) labelElement.innerText = originalText;
            btn.classList.remove('btn-copy-success');
        }, 2000);
    });
}