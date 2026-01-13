# Calculadora

Extensão para navegadores baseados em Chromium (Google Chrome, Microsoft Edge, Brave) destinada ao cálculo de impostos sobre a folha de pagamento. O sistema integra as regras vigentes de INSS e IRRF, com suporte especial à nova sistemática de Redutor Legal prevista para 2026.

---

## Funcionalidades Principais

### Imposto de Renda (IRRF)
O sistema oferece dois modelos de cálculo alternáveis:
* **Modelo até 2025 (Tradicional):** Baseado na tabela progressiva mensal, aplicando alíquota e dedução sobre a base de cálculo.
* **Modelo 2026 (Redutor Legal):** Implementa o novo cálculo de isenção via Redutor Legal.
    * **Fórmula utilizada:** `Redutor = 978,62 - (0,133145 x Rendimento)`

### Previdência Social (INSS)
* Cálculo progressivo conforme as faixas salariais vigentes.
* Aplicação automática do teto previdenciário.

### Modelos de Exportação e Cópia
Área dedicada para geração de explicações detalhadas do cálculo, ideal para suporte e atendimento:
* **Modelos de Mensagem:** Texto formatado para WhatsApp e E-mail, com inteligência de faixas salariais.
* **Modelos Jira:** Formatação em sintaxe Wiki Jira (*Negrito*, +Sublinhado+ e Cores) para descrições de chamados.
* **Modelos de Tabela:** Formatação tabular para Excel e Jira.

---

## Como Instalar (Modo Desenvolvedor)

1. Faça o download ou clone este repositório para uma pasta local.
2. Abra o seu navegador e acesse a página de extensões: `chrome://extensions/`.
3. No canto superior direito, ative a opção **Modo do desenvolvedor**.
4. Clique no botão **Carregar sem compactação**.
5. Selecione a pasta raiz onde os arquivos do projeto foram salvos.
6. A extensão aparecerá na sua barra de ferramentas. Clique no ícone de "alfinete" para fixá-la.

---

## Versão: 1.0.0

## Estrutura do Projeto

```text
├── manifest.json        # Configuração da extensão
├── index.html           # Interface principal (Popup)
├── css/
│   └── styles.css       # Estilização e Temas (Light/Dark)
├── js/
│   ├── app.js           # Lógica de interface e eventos
│   ├── config.js        # Utilitários de formatação
│   ├── inss.js          # Motor de cálculo INSS
│   └── irrf.js          # Motor de cálculo IRRF
└── data/
    ├── tabelas-inss.json
    └── tabelas-irrf.json
