# 💻 ShelfApp — ERP Industrial & Manufatura de Kits (PIT II)

Projeto Integrador Transdisciplinar em Engenharia de Software II desenvolvido para o curso de **Engenharia de Software** da **Universidade Cruzeiro do Sul**.
- **Autor:** Eduardo Marcelo Pacheco Maticola (RGM: 34652671)
- **Repositório Front-end & Documentação (`/docs`):** [https://github.com/KonoDoardoDa/ShelfApp](https://github.com/KonoDoardoDa/ShelfApp)
- **Repositório Back-end (API C# / .NET 9):** [https://github.com/KonoDoardoDa/ShelfAPI](https://github.com/KonoDoardoDa/ShelfAPI)
- **Aplicação Publicada (Vercel):** [https://shelf-app.vercel.app/](https://shelf-app.vercel.app/)
- **API & Swagger em Produção (Render):** [https://shelfapi.onrender.com/swagger](https://shelfapi.onrender.com/swagger)

---

## 📚 Documentação Acadêmica — PIT II (`/docs`)

Toda a documentação de Engenharia de Software exigida nas **Situações-Problema 1, 2 e 3** está estruturada na pasta [`/docs`](./docs/README.md):

1. **Situação-Problema 1 — Revisão e Atualização da Documentação**
   - [01 - Escopo do Projeto, Atores e Revisão Kaizen](./docs/Situacao-Problema-1/01-Escopo-e-Revisao-Kaizen.md)
   - [02 - Modelagem UML (Classes, Casos de Uso, Sequência e Atividades)](./docs/Situacao-Problema-1/02-Modelagem-UML.md)
   - [03 - Projeto de Interface Humano-Computador (IHC) e UX](./docs/Situacao-Problema-1/03-Projeto-IHC-e-UX.md)
   - [04 - Projeto Conceitual, Lógico (DER 3FN), Físico (DDL) e Dicionário de Dados](./docs/Situacao-Problema-1/04-Projeto-Banco-de-Dados-e-Dicionario.md)
2. **Situação-Problema 2 — Codificação e Implantação em Nuvem**
   - [01 - Arquitetura MVC/REST, Stack Tecnológica e Hospedagem Cloud](./docs/Situacao-Problema-2/01-Arquitetura-MVC-e-Codificacao.md)
   - [02 - Manual Prático do Usuário (Linguagem Simples)](./docs/Situacao-Problema-2/02-Manual-Pratico-do-Usuario.md)
3. **Situação-Problema 3 — Testes da Solução, Laudo de Qualidade e Vídeo**
   - [01 - Verificação e Validação (Modelo V) e Casos de Teste](./docs/Situacao-Problema-3/01-Verificacao-e-Validacao-Modelo-V.md)
   - [02 - Fichas de Testes dos 5 Colegas e Laudo Técnico de Qualidade](./docs/Situacao-Problema-3/02-Laudos-de-Testes-5-Colegas-e-Qualidade.md)
   - [03 - Roteiro Narrado para Gravação do Vídeo de 5 Minutos](./docs/Situacao-Problema-3/03-Roteiro-Video-5-Minutos.md)

---

Interface web corporativa desenvolvida em **React 19**, **TypeScript** e **Vite**, construída para oferecer uma experiência fluida, ágil e visualmente moderna no controle de almoxarifado, gestão de compras, linha de montagem e manufatura de kits, planejamento de produção e auditoria operacional.

---

## 🛠️ Tecnologias Utilizadas

- **Core**: [React 19](https://react.dev/) com Hooks modernos (`useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`)
- **Linguagem**: [TypeScript 5](https://www.typescriptlang.org/) (tipagem estrita com zero erros de build)
- **Bundler & Dev Server**: [Vite 7](https://vitejs.dev/) com Hot Module Replacement (HMR) ultrarrápido
- **Roteamento**: [React Router DOM 7](https://reactrouter.com/) com rotas protegidas por autenticação e perfis (RBAC)
- **Cliente HTTP**: [Axios](https://axios-http.com/) com interceptors para injeção automática de Bearer Token JWT e tratamento global de erros
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Design System**: CSS nativo com tokens de variáveis customizadas (`UI.css`), suporte nativo a **Modo Escuro / Modo Claro** com transições suaves e design responsivo

---

## 🌟 Módulos e Funcionalidades

### 1. 📊 Dashboard Principal (`/`)
- **Cards de Indicadores (KPIs Executivos)**:
  - **Total de Itens**: Acesso rápido ao catálogo de peças.
  - **Baixo Estoque**: Filtro de 1 a 10 unidades com redirecionamento direto para reposição.
  - **Estoque Zerado**: Alerta visual crítico de itens esgotados (0 un).
  - **Fornecedores Homologados**: Quantitativo de parceiros ativos na cadeia de suprimentos.
- **Monitor de Reposição & Estoque Crítico**:
  - Tabela dinâmica que lista exclusivamente os itens em situação de ruptura ou atenção.
  - **Paginação Inicial Otimizada**: Configurada para exibir inicialmente **5 itens por página** (com opções ajustáveis de 5, 10, 20 ou 50 itens).
  - Filtros rápidos: `[ Todos ]`, `[ Zerados ]` e `[ Baixo Estoque ]`.
- **Acessos Rápidos**: Navegação direta para Almoxarifado, Kits, Fornecedores e Softwares/CLPs.

---

### 2. 📦 Almoxarifado & Estoque Unificado (`/items/estoque`)
- **Visão Integrada de Estoque**:
  - Consolida tanto **Peças e Insumos Físicos** quanto **Kits Pré-Montados** em uma única tabela.
  - Seletor de categorias por pills:
    - `[ Todos os Estoques ]`
    - `[ Peças & Componentes ]`
    - `[ Kits Pré-Montados ]` (com código `#K{id}` e tag de identificação estilizada `[KIT]`).
- **Operação Rápida**:
  - Modal de movimentação de estoque: entrada ou saída com preenchimento obrigatório de justificativa/motivo para auditoria.
  - Indicadores de criticidade com badges semânticos (Verde para regular, Âmbar para baixo, Vermelho para zerado).
  - Paginação configurável (10, 20, 50 itens por página).

---

### 3. 🔨 Gestão de Kits & Linha de Manufatura (`/items/kits`)
- **Monitoramento em Tempo Real**:
  - **Estoque Físico (Prontos)**: Quantidade de conjuntos montados e disponíveis para expedição.
  - **Capacidade de Montagem**: Cálculo dinâmico da BOM que indica a quantidade máxima de kits que podem ser montados agora com as peças disponíveis no depósito.
- **Ações Rápidas por Kit**:
  - 🔨 **Montar Kit**: Modal seguro com breakdown das peças exigidas, validação de saldo e baixa automática atômica de insumos.
  - 📦 **Desmontar Kit**: Estorno imediato de kits prontos com devolução de todos os componentes ao estoque.
  - ⚙️ **Composição da BOM**: Gestão de peças vinculadas, quantidades necessárias e marcação de peças exclusivas do painel (`isPainel`).
  - 📜 **Histórico de Auditoria**: Modal com rastreabilidade detalhada de todas as montagens, saídas, saldos antes/depois, operador e justificativa.
  - 📄 **Exportação CSV do Kit**: Gera a ficha técnica completa do kit em arquivo `.csv` estruturado com segregação explícita entre **Componentes Exclusivos do Painel** e **Componentes Gerais**.

---

### 4. 🧮 Simulador de Produção Multi-Kits & Planejamento de Demanda
Acessado através do botão **"Simular Montagem"** na tela de Kits:
- **Fila de Montagem Multi-Modelos**: Adicione múltiplos kits simultaneamente com quantidades personalizadas (ex: Kit Solar: 10 un, Kit Inversor: 5 un, Kit Bateria: 2 un).
- **Modos de Foco Operacional**:
  - `[ Todos os Componentes ]`: Visão global da fábrica.
  - `[ ⚡ Exclusivo: Apenas Painéis ]`: Foco dedicado na oficina de montagem de painéis elétricos, recalculando a viabilidade e identificando faltas exclusivamente para itens de painel.
  - `[ 📦 Peças Gerais / Não-Painel ]`: Foco em ferragens, cabos e estruturas.
- **Balanço Estimado & Detecção de Gargalos**:
  - Tabela analítica com código `#ID`, Insumo, Kits de Origem com proporção de uso, Necessidade Total, Saldo Atual, Balanço Pós-Montagem (`+` verde / `-` vermelho) e status.
- **Exportação CSV Analítica**:
  - Exporta planilha estruturada com codificação **UTF-8 com BOM (`\uFEFF`)** e delimitador ponto e vírgula (`;`), abrindo com acentuação impecável no Microsoft Excel e Google Sheets.

---

### 5. 🚚 Fornecedores, Softwares & Segurança
- **Fornecedores (`/items/fornecedores`)**: Cadastro e manutenção de parceiros da cadeia de suprimentos.
- **Softwares & CLPs (`/softwares`)**: Gestão de softwares de automação, versões homologadas e controle de licenças.
- **Controle de Usuários & RBAC (`/users`)**:
  - Restrito a usuários com perfil de **Administrador**.
  - Operadores têm acesso operacional sem visualização das telas de gestão de usuários.
- **Seletor de Tema Segmentado**: Alternância instantânea entre Modo Escuro e Modo Claro na barra superior com persistência local.

---

## 📁 Estrutura de Pastas

```
ShelfApp/
├── public/                  # Favicon e ativos públicos
├── src/
│   ├── api/                 # Cliente HTTP Axios e interceptors de token JWT
│   │   └── http.ts
│   ├── components/          # Componentes reutilizáveis do Design System
│   │   ├── ConfirmModal.tsx
│   │   ├── Modal.tsx
│   │   ├── Pagination.tsx
│   │   ├── SimuladorMontagemModal.tsx  # Modal analítico multi-kits
│   │   ├── ToastContainer.tsx
│   │   └── UI.css           # Design system tokens e classes globais
│   ├── hooks/               # Custom hooks (autenticação, tema, notificações toast)
│   │   ├── useAuth.tsx
│   │   ├── useTheme.tsx
│   │   └── useToast.tsx
│   ├── layout/              # Estrutura principal da aplicação
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx       # Barra de navegação, breadcrumbs e tema
│   │   └── Layout.css
│   ├── pages/               # Páginas e rotas do ERP
│   │   ├── Home.tsx         # Dashboard executivo
│   │   ├── Login.tsx        # Tela de login
│   │   ├── Softwares.tsx    # Licenças e softwares de CLPs
│   │   ├── Users.tsx        # Gestão de usuários (Admin)
│   │   ├── About.tsx        # Sobre o sistema
│   │   └── Items/
│   │       ├── Estoque.tsx      # Controle unificado de almoxarifado
│   │       ├── Fornecedores.tsx # Cadeia de suprimentos
│   │       └── Kits.tsx         # Manufatura, kits e montagem
│   ├── services/            # Serviços de integração com a ShelfApi
│   │   ├── authService.ts
│   │   ├── estoqueKitService.ts
│   │   ├── estoqueService.ts
│   │   ├── fornecedorService.ts
│   │   ├── itemService.ts
│   │   ├── kitItemService.ts
│   │   ├── kitService.ts
│   │   └── softwareService.ts
│   ├── types/               # Tipagens estritas TypeScript (DTOs e entidades)
│   │   ├── auth.ts
│   │   ├── estoqueKit.ts
│   │   ├── fornecedor.ts
│   │   ├── item.ts
│   │   ├── kit.ts
│   │   └── software.ts
│   ├── App.tsx              # Definição de rotas e providers
│   ├── main.tsx             # Ponto de entrada React
│   └── index.css            # Reset e variáveis CSS base
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior.
- [npm](https://www.npmjs.com/) ou [pnpm](https://pnpm.io/).
- Backend **ShelfApi** em execução (por padrão em `https://localhost:7024` ou `http://localhost:5029`).

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar URL da API (Opcional)
Por padrão, o arquivo `src/api/http.ts` se conecta automaticamente ao backend local:
- `https://localhost:7024/api` (ou porta configurada).
Caso necessário, configure uma variável de ambiente criando um arquivo `.env`:
```env
VITE_API_URL=https://localhost:7024/api
```

### 3. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
O Vite iniciará a aplicação e disponibilizará o link local (geralmente em `http://localhost:5173`).

### 4. Comandos de Validação e Produção
```bash
# Executar verificação de linting com ESLint
npm run lint

# Compilar para produção com TypeScript e empacotamento Vite
npm run build

# Pré-visualizar o build de produção localmente
npm run preview
```
