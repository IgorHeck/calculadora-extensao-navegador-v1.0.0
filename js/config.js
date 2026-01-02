const Config = {
    decimais: 2,
    darkMode: false,

    init() {
        const saved = localStorage.getItem('calc_cfg');
        if (saved) {
            const cfg = JSON.parse(saved);
            this.decimais = cfg.decimais || 2;
            this.darkMode = cfg.darkMode || false;
        }
        this.apply();
        this.bind();
    },

    bind() {
        document.getElementById('toggleDarkMode').addEventListener('change', (e) => {
            this.darkMode = e.target.checked;
            this.apply();
            this.save();
        });
        document.getElementById('selectDecimais').addEventListener('change', (e) => {
            this.decimais = parseInt(e.target.value);
            this.save();
        });
        document.getElementById('btnLimparDados').addEventListener('click', () => {
            localStorage.clear();
            location.reload();
        });
    },

    apply() {
        document.body.classList.toggle('dark-mode', this.darkMode);
        document.getElementById('toggleDarkMode').checked = this.darkMode;
        document.getElementById('selectDecimais').value = this.decimais;
    },

    save() {
        localStorage.setItem('calc_cfg', JSON.stringify({
            decimais: this.decimais,
            darkMode: this.darkMode
        }));
    },

    parseMoeda(valor) {
        if (!valor) return 0;
        // Remove R$, pontos de milhar e troca vírgula por ponto
        return parseFloat(valor.replace(/\D/g, "")) / 100;
    },

    formatarMoeda(valor) {
        return valor.toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL', 
            minimumFractionDigits: this.decimais 
        });
    }
};