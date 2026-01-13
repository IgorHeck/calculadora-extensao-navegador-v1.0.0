Calculadora
Extensão para navegadores baseados em Chromium (Google Chrome, Microsoft Edge, Brave) destinada ao cálculo de impostos sobre a folha de pagamento. O sistema integra as regras vigentes de INSS e IRRF, com suporte especial à nova sistemática de Redutor Legal prevista para 2026.

Funcionalidades Principais
Imposto de Renda (IRRF)
O sistema oferece dois modelos de cálculo alternáveis:

Modelo até 2025 (Tradicional): Baseado na tabela progressiva mensal, aplicando alíquota e dedução sobre a base de cálculo.

Modelo 2026 (Redutor Legal): Implementa o novo cálculo de isenção via Redutor Legal, utilizando a fórmula:

Redutor = 978,62 - (0,133145 x Rendimento)

Previdência Social (INSS)
Cálculo progressivo conforme as faixas salariais vigentes.

Aplicação automática do teto previdenciário.

Modelos de Exportação e Cópia
Área dedicada para geração de explicações detalhadas do cálculo, ideal para suporte e atendimento:

Modelos de Mensagem: Texto formatado para WhatsApp e E-mail, com inteligência de faixas salariais.

Modelos Jira: Formatação em sintaxe Wiki Jira (Negrito, Sublinhado e Cores) para descrições de chamados.

Modelos de Tabela: Formatação tabular para Excel e Jira.

or .btn-copy-icon -> executes corresponding copy function]

Tecnologias Utilizadas
HTML5 e CSS3 (Variáveis CSS para Modo Escuro).

JavaScript (ES6+) sem dependências externas (Vanilla JS).

Bootstrap 5 para interface responsiva.

Manifest V3 (Padrão atual de extensões Chrome).

Estrutura de Arquivos
Plaintext

├── manifest.json        # Configuração da extensão
├── index.html           # Interface principal (Popup)
├── css/
│   └── styles.css       # Estilização e temas
├── js/
│   ├── app.js           # Lógica de interface e eventos
│   ├── config.js        # Utilitários de formatação
│   ├── inss.js          # Motor de cálculo INSS
│   └── irrf.js          # Motor de cálculo IRRF
└── data/
    ├── tabelas-inss.json
    └── tabelas-irrf.json
Como Instalar (Modo Desenvolvedor)
Faça o download ou clone este repositório para uma pasta local.

Abra o navegador e acesse a página de extensões (chrome://extensions/).

No canto superior direito, ative a opção Modo do desenvolvedor.

Clique no botão Carregar sem compactação.

Selecione a pasta onde os arquivos do projeto foram salvos.

A extensão aparecerá na sua barra de ferramentas.

Configurações
Modo Escuro
O sistema detecta e salva a preferência de tema (Claro ou Escuro) através do localStorage, garantindo consistência entre as sessões de uso.

Tabelas de Referência
A aba "Tabelas" carrega dinamicamente os dados de arquivos JSON externos, permitindo atualizações de alíquotas sem a necessidade de alterar a lógica do código principal.

Versão: 1.0.0

Licença: MIT

Desenvolvido para máxima precisão fiscal.
