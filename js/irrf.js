const IRRF = {
    tabelas: null,
    dadosUltimoCalculo: null, // Armazena o estado para os botões de "Modelo de Texto"

    async init() {
        await this.carregarTabelas();
        this.popularSelects();
        this.setupEventListeners();
    },

    async carregarTabelas() {
        try {
            const response = await fetch('data/tabelas-irrf.json');
            this.tabelas = await response.json();
            console.log("Tabelas IRRF carregadas com sucesso.");
        } catch (error) {
            console.error('Erro ao carregar JSON de IRRF:', error);
        }
    },

    popularSelects() {
        if (!this.tabelas) return;
        const popular = (id, chave) => {
            const el = document.getElementById(id);
            if (el && this.tabelas[chave]) {
                const anos = Object.keys(this.tabelas[chave]).sort((a, b) => b - a);
                el.innerHTML = anos.map(a => `<option value="${a}">${a}</option>`).join('');
            }
        };
        popular('anoIRRF', 'ate2025');
        popular('ano2026', 'a2026');
    },

    setupEventListeners() {
        document.getElementById('btnCalcularIRRF')?.addEventListener('click', () => this.calcular());
    },

    buscarTabela(categoria, ano, mes) {
        const dadosAno = this.tabelas[categoria][ano];
        if (!dadosAno) return null;
        const meses = Object.keys(dadosAno).sort((a, b) => b - a);
        const mesRef = meses.find(m => parseInt(m) <= parseInt(mes)) || meses[meses.length - 1];
        return dadosAno[mesRef];
    },

    calcular() {
        const is2026 = document.getElementById('novoCalculo2026').checked;
        if (is2026) {
            this.calcular2026();
        } else {
            this.calcularAte2025();
        }
    },

    /**
     * CÁLCULO MODELO 2026 (Com Redutor Legal)
     * Regra: Imposto Bruto - Redutor
     */
    calcular2026() {
        const ano = document.getElementById('ano2026').value;
        const mes = document.getElementById('mes2026').value;
        const rend = Config.parseMoeda(document.getElementById('rendimentosTributaveis').value);
        const ded = Config.parseMoeda(document.getElementById('deducao').value);

        const dados = this.buscarTabela('a2026', ano, mes);
        if (!dados) return;

        // 1. Base de Cálculo (Tradicional)
        const baseIR = Math.max(0, rend - ded);

        // 2. Localizar Faixa e calcular Imposto Bruto
        const faixa = dados.faixas.find(f => baseIR <= f.ate) || dados.faixas[dados.faixas.length - 1];
        const impostoBruto = Math.max(0, (baseIR * (faixa.aliquota / 100)) - faixa.parcela);

        // 3. Cálculo do Redutor Legal
        // Fórmula: $Redutor = A - (B \times Rendimento)$
        let valorRedutor = 0;
        const config = dados.isencao;

        if (rend > 0) {
            if (rend <= config.limite_total) {
                valorRedutor = impostoBruto; 
            } else if (rend <= config.limite_parcial) {
                valorRedutor = config.formula_a - (config.formula_b * rend);
                // O redutor não pode ser negativo nem maior que o imposto bruto
                valorRedutor = Math.max(0, Math.min(valorRedutor, impostoBruto));
            }
        }

        const irFinal = Math.max(0, impostoBruto - valorRedutor);

        // SALVA DADOS PARA OS MODELOS DE TEXTO (Utilizado no app.js)
        this.dadosUltimoCalculo = {
            rend: rend,
            ded: ded,
            base: baseIR,
            irBruto: impostoBruto,
            redutor: valorRedutor,
            irFinal: irFinal,
            aliquota: faixa.aliquota
        };

        // Exibe área de modelos de texto
        document.getElementById('areaModelos2026')?.classList.remove('hidden');

        this.exibirResultado(irFinal, `
            <div class="result-item"><span>Rendimento Bruto:</span> <span>${Config.formatarMoeda(rend)}</span></div>
            <div class="result-item"><span>Deduções:</span> <span>${Config.formatarMoeda(ded)}</span></div>
            <div class="result-item border-bottom pb-1 mb-1"><span>Base de Cálculo:</span> <span>${Config.formatarMoeda(baseIR)}</span></div>
            
            <div class="result-item"><span>Alíquota (Tabela):</span> <span>${faixa.aliquota}%</span></div>
            <div class="result-item"><span>IRRF s/ Tabela:</span> <span>${Config.formatarMoeda(impostoBruto)}</span></div>
            
            <div class="result-item text-success mt-2"><span>Redutor Legal:</span> <span>- ${Config.formatarMoeda(valorRedutor)}</span></div>
            <div class="info mt-2 border-top pt-1 small text-muted">
                Fórmula: ${config.formula_a} - (${config.formula_b} × Rendimento)
            </div>
        `);
    },

    /**
     * CÁLCULO MODELO ATÉ 2025 (Tradicional)
     */
    calcularAte2025() {
        const ano = document.getElementById('anoIRRF').value;
        const mes = document.getElementById('mesIRRF').value;
        const base = Config.parseMoeda(document.getElementById('baseCalculoIRRF').value);

        const dados = this.buscarTabela('ate2025', ano, mes);
        if (!dados) return;

        const faixa = dados.faixas.find(f => base <= f.ate) || dados.faixas[dados.faixas.length - 1];
        const irrf = Math.max(0, (base * (faixa.aliquota / 100)) - faixa.parcela);

        // Limpa dados de 2026 e esconde modelos de texto
        this.dadosUltimoCalculo = null;
        document.getElementById('areaModelos2026')?.classList.add('hidden');

        this.exibirResultado(irrf, `
            <div class="result-item"><span>Base de Cálculo:</span> <span>${Config.formatarMoeda(base)}</span></div>
            <div class="result-item"><span>Alíquota Aplicada:</span> <span>${faixa.aliquota}%</span></div>
            <div class="result-item"><span>Parcela a Deduzir:</span> <span>${Config.formatarMoeda(faixa.parcela)}</span></div>
            <div class="info mt-2 border-top pt-1 small text-muted text-center">
                Referência: ${mes}/${ano}
            </div>
        `);
    },

    exibirResultado(valor, htmlDetalhes) {
        const box = document.getElementById('resultadoIRRFBox');
        const res = document.getElementById('resultadoIRRF');
        const det = document.getElementById('detalhesIRRF');

        if (box && res && det) {
            box.classList.remove('hidden');
            res.textContent = Config.formatarMoeda(valor);
            det.innerHTML = htmlDetalhes;
            
            // Scroll suave para o resultado
            box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
};