# 📋 Situação-Problema 3 — Avaliação por 5 Pares (Colegas) e Laudo de Qualidade

**Projeto:** ShelfApp ERP & ShelfApi  
**Discente:** Eduardo Marcelo Pacheco Maticola (RGM: 34652671)  

Conforme determinado na **Situação-Problema 3**, a solução publicada foi disponibilizada para **5 colegas de curso / profissionais** atuarem como dublês de usuários em condições reais de uso. Abaixo estão registrados os 5 laudos individuais seguidos do **Laudo Técnico de Qualidade e Melhorias Adotadas (Kaizen)**.

---

## 1. Fichas de Avaliação dos 5 Testadores (Pares)

### 👤 Avaliador 1
* **Nome de quem testou:** Matheus Bieberbach
* **Data do teste:** 14/10/2026
* **O que testou e funcionou (descrição da funcionalidade):**
  Testou o fluxo de Login com autenticação JWT, a visualização dos cards executivos no Dashboard Principal, os filtros rápidos do Monitor de Reposição Crítica (`Todos`, `Zerados`, `Baixo Estoque`) e o cadastro manual de Fornecedores e Peças no Almoxarifado. Destacou a rapidez da busca instantânea e a clareza visual das cores de criticidade (verde, âmbar e vermelho).
* **O que testou e não funcionou – O que deve ser corrigido:**
  Ao registrar uma entrada de mercadoria recebida de fornecedor no modal de Movimentação de Estoque, sentiu falta de um campo dedicado para informar o **número da Nota Fiscal (NF)** separadamente da justificativa, além de apontar que cadastrar dezenas de itens de uma nota fiscal manualmente tomava muito tempo.
* **Funcionalidade não testada (por que faltou ou se não foi realizada):**
  Não testou a tela de Gestão de Usuários (`/users`) porque realizou a sessão de testes utilizando uma conta com perfil `Operador` (que possui bloqueio de acesso RBAC a essa rota administrativa).

---

### 👤 Avaliador 2
* **Nome de quem testou:** Jhenifer Tavares Ribeiro
* **Data do teste:** 15/10/2026
* **O que testou e funcionou (descrição da funcionalidade):**
  Testou o módulo de **Gestão de Kits e Linha de Manufatura (`/items/kits`)**, incluindo a configuração da receita do kit (BOM), adição de peças com marcação de componente de painel (`IsPainel`), montagem de kits com baixa automática de peças no almoxarifado e desmontagem reversível de kits com estorno de saldo.
* **O que testou e não funcionou – O que deve ser corrigido:**
  Observou que, nas tabelas com muitos registros (como o catálogo com mais de 170 peças e 50 kits), não era possível clicar no cabeçalho das colunas (`ID`, `Nome`, `Saldo Atual`) para ordenar em ordem crescente ou decrescente.
* **Funcionalidade não testada (por que faltou ou se não foi realizada):**
  Não testou o módulo de Softwares & CLPs (`/softwares`), pois focou sua bateria de testes exclusivamente nas rotinas de engenharia de produto e montagem física de kits no chão de fábrica.

---

### 👤 Avaliador 3
* **Nome de quem testou:** Luany Cardozo Ramos
* **Data do teste:** 16/10/2026
* **O que testou e funcionou (descrição da funcionalidade):**
  Testou o **Simulador de Produção Multi-Kits**, adicionando 4 modelos distintos de kits simultaneamente na fila de produção, alternando entre os modos de visualização (`Todos os Componentes`, `Exclusivo: Apenas Painéis` e `Peças Gerais`) e validando o cálculo automático de sobras e faltas de estoque.
* **O que testou e não funcionou – O que deve ser corrigido:**
  Ao exportar o relatório CSV do simulador e abrir diretamente no Microsoft Excel em português, notou que alguns caracteres acentuados (como `Simulação`, `Necessário` e `Código`) apareciam desconfigurados por falta do cabeçalho de codificação *UTF-8 BOM*, e sugeriu também agrupar a exportação por fornecedor para facilitar a cotação de compras.
* **Funcionalidade não testada (por que faltou ou se não foi realizada):**
  Não testou a exclusão física de kits e fornecedores, pois utilizou apenas os cadastros homologados já carregados na base de demonstração.

---

### 👤 Avaliador 4
* **Nome de quem testou:** Maria Eduarda Martinelli Da Silva
* **Data do teste:** 18/10/2026
* **O que testou e funcionou (descrição da funcionalidade):**
  Testou o módulo de **Softwares & CLPs (`/softwares`)**, realizando o cadastro de versões de firmware associadas a clientes e kits, filtrando por tipo de dispositivo (`CLP`, `IHM`, `Inversor`) e status operacional, além de validar a alternância entre **Modo Claro e Modo Escuro** e a auditoria de movimentações.
* **O que testou e não funcionou – O que deve ser corrigido:**
  Identificou que, quando uma peça ou fornecedor já possuía histórico de movimentações ou vínculo com algum kit, clicar no botão de excluir gerava uma recusa genérica, sendo melhor ter um botão de **Ativar / Inativar** (`Toggle Status`) visível na própria linha para desativar itens obsoletos sem perder o histórico.
* **Funcionalidade não testada (por que faltou ou se não foi realizada):**
  Não testou o estorno de kits (*Desmontar Kit*), pois todos os testes que realizou no almoxarifado foram voltados a peças avulsas e rastreabilidade de softwares em campo.

---

### 👤 Avaliador 5
* **Nome de quem testou:** Nicole Bressan Fontanelli
* **Data do teste:** 24/10/2026
* **O que testou e funcionou (descrição da funcionalidade):**
  Testou a aplicação publicada em nuvem (Front-end na Vercel, API em container Docker no Render e banco MySQL na Aiven), validando a proteção de rotas autenticadas, o controle de usuários pelo perfil Administrador (`/users`) e a responsividade da interface em diferentes resoluções de tela.
* **O que testou e não funcionou – O que deve ser corrigido:**
  No primeiro acesso após a migração do banco de dados do Windows para o servidor Linux em nuvem (Aiven), o endpoint de login (`/api/Auth/Login`) retornou erro `500 Internal Server Error` porque o MySQL no Linux diferencia letras maiúsculas e minúsculas nos nomes das tabelas (`FROM Usuario` vs. tabela `usuario`), além de o Swagger estar oculto em modo `Production`.
* **Funcionalidade não testada (por que faltou ou se não foi realizada):**
  Recuperação automática de senha por envio de e-mail (SMTP), funcionalidade que não faz parte do escopo atual do projeto, visto que a gestão de credenciais é centralizada no perfil Administrador.

---

## 2. Laudo Técnico de Qualidade e Registro de Correções Implementadas

A partir dos *feedbacks* reais coletados com os 5 avaliadores, todas as sugestões pertinentes e anomalias reportadas foram tratadas, codificadas, testadas e incorporadas à versão final do projeto no GitHub e em produção:

| # | Apontamento / Erro Identificado nos Testes | Causa Raiz | Solução Técnica e Melhoria Implementada (Kaizen) | Status Final |
| :-: | :--- | :--- | :--- | :---: |
| **1** | Ausência de campo para Nota Fiscal e lentidão no cadastro manual de notas grandes *(Avaliador 1)* | O modelo `movimentacao_estoque` possuía apenas o campo `motivo` e entradas eram unitárias. | Adicionada a coluna `notaFiscal` na tabela `movimentacao_estoque` e criado o módulo **Importar XML de NF-e** (`ImportarXmlModal.tsx` + `POST /api/Estoque/ImportarLote`), que lê o XML da nota fiscal e cadastra/incrementa todos os itens em lote. | ✅ Corrigido e Validado |
| **2** | Impossibilidade de ordenar colunas nas tabelas de Estoque, Kits e Dashboard *(Avaliador 2)* | As tabelas HTML renderizavam a lista apenas na ordem padrão do banco (`Id ASC`). | Desenvolvido o hook reutilizável `useTableSort.ts` e o componente `SortableTh.tsx`, permitindo ordenação ascendente/descendente em qualquer coluna com indicador visual de seta. | ✅ Corrigido e Validado |
| **3** | Acentuação corrompida ao abrir CSV no Excel Windows *(Avaliador 3)* | O Excel no Windows exige o marcador *Byte Order Mark* (`\uFEFF`) para reconhecer UTF-8 automaticamente. | Adicionado o prefixo `\uFEFF` (UTF-8 BOM) e delimitador `;` em todas as exportações CSV de Kits, Histórico e Simulador, garantindo acentuação perfeita no Excel e LibreOffice Calc. | ✅ Corrigido e Validado |
| **4** | Dificuldade ao tentar excluir itens/kits que já possuíam histórico *(Avaliador 4)* | A integridade referencial bloqueava o `DELETE`, mas faltava inativação lógica na UI. | Implementado o campo `Ativo` e o botão **Inativar/Reativar** (`PATCH /toggle-status`) em Fornecedores, Peças e Kits, preservando 100% do histórico de auditoria. | ✅ Corrigido e Validado |
| **5** | Erro `500` no Login em Nuvem Linux e Swagger oculto em produção *(Avaliador 5)* | MySQL em Linux (`lower_case_table_names=0`) é *case-sensitive* e rejeitava `FROM Usuario` para a tabela `usuario`. | Padronizadas todas as queries SQL dos 7 repositórios para nomes de tabelas em minúsculas (`usuario`, `item`, `fornecedor`, `kit`, `kititem`, `software`) e habilitado o Swagger em produção no `Program.cs`. | ✅ Corrigido e Validado |
