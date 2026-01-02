const INSS = {
    tabelas: null,

    async init() {
        await this.carregarTabelas();
        this.popularAnos();
        document.getElementById('btnCalcularINSS')?.addEventListener('click', () => this.calcular());
    },

    async carregarTabelas() {
        try {
            const response = await fetch('data/tabelas-inss.json');
            this.tabelas = await response.json();
        } catch (error) {
            console.error('Erro ao carregar tabelas INSS:', error);
        }
    },

    popularAnos() {
        const select = document.getElementById('anoINSS');
        if (!select || !this.tabelas) return;
        const anos = Object.keys(this.tabelas).sort((a, b) => b - a);
        select.innerHTML = anos.map(ano => `<option value="${ano}">${ano}</option>`).join('');
    },

    calcular() {
        const base = Config.parseMoeda(document.getElementById('baseCalculoINSS').value);
        const ano = document.getElementById('anoINSS').value;
        const tabela = this.tabelas[ano]["01"];

        let totalInss = 0;
        let baseAnterior = 0;
        let detalhesHtml = '';
        const teto = tabela.faixas[tabela.faixas.length - 1].ate;
        const baseEfetiva = Math.min(base, teto);

        // Cálculo Progressivo por Faixas
        tabela.faixas.forEach((faixa, index) => {
            if (baseEfetiva > baseAnterior) {
                const limiteFaixa = faixa.ate || baseEfetiva;
                const baseCalculavel = Math.min(baseEfetiva, limiteFaixa) - baseAnterior;
                
                if (baseCalculavel > 0) {
                    const valorFaixa = baseCalculavel * (faixa.aliquota / 100);
                    totalInss += valorFaixa;

                    // Mostra apenas a porcentagem e o quanto descontou daquela parte
                    detalhesHtml += `
                        <div class="result-item">
                            <span>Desconto ${faixa.aliquota}%:</span>
                            <span>${Config.formatarMoeda(valorFaixa)}</span>
                        </div>`;
                }
                baseAnterior = limiteFaixa;
            }
        });

        if (base > teto) {
            detalhesHtml += `<div class="text-center small text-warning mt-2">Cálculo limitado ao teto de ${Config.formatarMoeda(teto)}</div>`;
        }

        this.exibir(totalInss, detalhesHtml);
    },

    exibir(valor, detalhes) {
        const box = document.getElementById('resultadoINSSBox');
        box.classList.remove('hidden');
        document.getElementById('resultadoINSS').textContent = Config.formatarMoeda(valor);
        document.getElementById('detalhesINSS').innerHTML = detalhes;
    }
};