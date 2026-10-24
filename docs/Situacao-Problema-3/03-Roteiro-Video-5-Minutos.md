# 🎬 Roteiros Cronometrados dos 2 Vídeos do PIT II

**Projeto:** ShelfApp ERP & ShelfApi  
**Apresentador:** Eduardo Marcelo Pacheco Maticola (RGM: 34652671)  
**Ferramenta Sugerida para Gravação:** OBS Studio, Loom ou Gravador Nativo do Windows (`Win + G`)

> **Por que são 2 vídeos no relatório oficial?**
> Assim como no relatório aprovado de referência (`Relatório-Cupcake.docx`), o template da Cruzeiro do Sul possui **dois campos distintos de vídeo**:
> 1. **Vídeo 1 (Página 2 — Tabela `Codificação` / Situação-Problema 2):** exige **no mínimo 5 minutos** apresentando a arquitetura do código-fonte (Front-end, Back-end e Banco de Dados) e o funcionamento geral da aplicação sem erros.
> 2. **Vídeo 2 (Página 6 — Tabela `Vídeo da Solução atualizada` / Situação-Problema 3):** exige **até 5 minutos** (pode ter entre **2 min 30 s e 4 min**) apresentando especificamente as melhorias e correções implementadas após os feedbacks dos 5 colegas.
>
> 💡 **Dica de Ouro:** Você **não precisa desfazer nenhuma linha de código** para gravar os dois vídeos! No **Vídeo 1**, você mostra o código no VS Code e faz o fluxo básico do sistema (sem tocar nas funções de Importar XML, ordenar colunas, inativar ou exportar CSV). Depois, no **Vídeo 2**, você foca diretamente em demonstrar essas 5 melhorias na prática e os commits no GitHub!

---

## 🎥 VÍDEO 1 — Código-Fonte e Solução em Funcionamento (Situação-Problema 2)
* **Onde colar o link:** Página 2 do Word (`Link do vídeo narrado (no mínimo 5 min)`)
* **Duração Alvo:** **5 min 10 seg a 5 min 40 seg** (importante passar de 5:00 para cumprir o requisito "no mínimo 5 min")

### 🔹 00:00 – 01:30 | Apresentação e Explicação do Código Back-end (`ShelfApi`)
* **[Na Tela]:** Abra o VS Code na solução `ShelfApi` (ou o GitHub da `ShelfAPI`). Mostre as pastas `Controllers`, `Services`, `Repositories`, `Models` e o arquivo `Program.cs`.
* **[O que falar]:**
  > *"Olá! Meu nome é Eduardo Marcelo Pacheco Maticola, estudante de Engenharia de Software, e neste primeiro vídeo vou apresentar a codificação e o funcionamento do **ShelfApp ERP**, desenvolvido para o Projeto Integrador Transdisciplinar II.*  
  > *O sistema resolve o controle de almoxarifado industrial, montagem de kits baseados em lista de materiais (BOM) e gestão de softwares de automação.*  
  > *Começando pelo Back-end, construí a **ShelfApi** em **C# com .NET 9**, estruturada em camadas seguindo o padrão arquitetural MVC/REST:*  
  > *Aqui na camada de **Models** e **DTOs** temos as entidades que espelham nosso banco de dados MySQL normalizado na 3ª Forma Normal.*  
  > *Na camada de **Repositories**, utilizamos o micro-ORM **Dapper** para executar consultas SQL parametrizadas e transações ACID com `BeginTransaction` e `Commit`, garantindo que nenhuma montagem de kit deixe o estoque inconsistente.*  
  > *Na camada de **Services**, concentramos todas as regras de negócio, como o cálculo de capacidade de montagem e validação de saldo.*  
  > *E nos **Controllers**, expomos os endpoints REST protegidos por autenticação **JWT Bearer** e senhas criptografadas com **BCrypt**."*

### 🔹 01:30 – 02:45 | Explicação do Código Front-end (`ShelfApp`) e Hospedagem Cloud
* **[Na Tela]:** Mude para o VS Code do `ShelfApp` (mostre `src/api/http.ts`, `src/pages`, `src/services`, `src/components`) e depois mostre o navegador com o GitHub (`ShelfApp/docs`) e o Swagger (`shelfapi.onrender.com/swagger`).
* **[O que falar]:**
  > *"No Front-end, o **ShelfApp** foi desenvolvido como uma Single Page Application responsiva utilizando **React 19, TypeScript 5 e Vite**.*  
  > *Organizamos a arquitetura em `services` para comunicação com a API via Axios, `hooks` customizados para controle de autenticação (`useAuth`), tema (`useTheme`) e notificações (`useToast`), e `pages` para cada módulo operacional.*  
  > *Para a implantação em nuvem gratuita com HTTPS: o Front-end está publicado na **Vercel**, a API .NET 9 está conteinerizada com **Docker no Render**, e o banco de dados **MySQL 8** está hospedado na **Aiven Cloud**."*

### 🔹 02:45 – 04:00 | Demonstração Funcional: Login, Dashboard e Almoxarifado
* **[Na Tela]:** Acesse `https://shelf-app.vercel.app`, faça login, mostre o **Dashboard (`/`)**, depois vá em **Fornecedores (`/items/fornecedores`)** e **Estoque & Peças (`/items/estoque`)**. Faça uma movimentação simples de entrada ou saída de peça.
* **[O que falar]:**
  > *"Agora vou demonstrar a solução em funcionamento e sem erros. Ao realizar o login, recebemos o token JWT e acessamos o **Dashboard Executivo**, que apresenta em tempo real o total de itens, peças em baixo estoque, peças zeradas e fornecedores homologados, além do Monitor de Reposição Crítica.*  
  > *Na tela de **Fornecedores**, cadastramos os parceiros da cadeia de suprimentos.*  
  > *Já em **Almoxarifado & Estoque Unificado**, visualizamos tanto peças individuais quanto kits prontos, com badges coloridos de criticidade. Ao clicar em **Movimentar**, registramos uma entrada ou saída informando a quantidade e a justificativa, e o sistema já calcula a prévia do saldo e grava no histórico de auditoria."*

### 🔹 04:00 – 05:20 | Demonstração Funcional: Manufatura de Kits, Softwares e Usuários
* **[Na Tela]:** Acesse **Kits & Montagens (`/items/kits`)**, abra a **Composição (BOM)** de um kit, faça a montagem de 1 kit e mostre o **Simulador de Montagem**. Por fim, passe por **Softwares & CLPs (`/softwares`)** e **Usuários (`/users`)**.
* **[O que falar]:**
  > *"No módulo de **Kits e Manufatura**, configuramos a receita de cada kit (a BOM), definindo quais peças compõem o conjunto e quais pertencem exclusivamente ao painel elétrico. O sistema calcula automaticamente quantos kits podem ser montados agora com base na peça gargalo do estoque. Quando confirmamos a montagem de um kit, a API desconta todas as peças automaticamente do almoxarifado e soma o kit pronto.*  
  > *Também contamos com o **Simulador de Produção Multi-Kits** para planejar ordens de produção sem alterar o estoque físico, o módulo de **Softwares e CLPs** para rastrear versões de firmware instaladas em cada cliente, e a tela de **Gestão de Usuários**, restrita ao perfil Administrador. Com isso concluímos a apresentação do código e do funcionamento geral da solução!"*

---

## 🎥 VÍDEO 2 — Apresentação da Solução Atualizada Pós-Testes (Situação-Problema 3)
* **Onde colar o link:** Página 6 do Word (`Link para o vídeo` na seção `Vídeo da Solução atualizada`)
* **Duração Alvo:** **2 min 45 seg a 4 min 00 seg** (o requisito é "até 5 minutos")

### 🔹 00:00 – 00:40 | Contextualização dos 5 Testes e Ciclo Kaizen
* **[Na Tela]:** Mostre rapidamente o histórico de commits no GitHub (`https://github.com/KonoDoardoDa/ShelfApp/commits/main`) e a tela inicial do ShelfApp.
* **[O que falar]:**
  > *"Olá! Neste vídeo da Situação-Problema 3, vou apresentar as atualizações e melhorias implementadas no **ShelfApp ERP** após a sessão de testes realizada com 5 colegas avaliadores, seguindo o ciclo de melhoria contínua Kaizen."*

### 🔹 00:40 – 01:30 | Melhoria do Teste 1 (Nota Fiscal e Importação de XML NF-e) e Teste 2 (Ordenação nas Tabelas)
* **[Na Tela]:** Vá em **Estoque & Peças (`/items/estoque`)**.
  1. Clique no botão **Movimentar** de uma peça para mostrar o campo **Nota Fiscal** e depois clique no botão **Importar XML (NF-e)** no topo da tela para mostrar o modal de importação em lote.
  2. Em seguida, clique nos cabeçalhos **ID**, **Item / Peça** e **Saldo Atual** para mostrar a ordenação crescente/decrescente.
* **[O que falar]:**
  > *"No **Teste 1**, foi apontada a ausência de um campo próprio para Nota Fiscal e a demora para lançar notas fiscais com muitos itens manualmente. Como correção, adicionamos o campo dedicado de **Nota Fiscal** no modal de movimentação e no histórico de auditoria, e criamos o módulo de **Importação de XML de NF-e**, que lê o arquivo fiscal, pré-visualiza os produtos e dá entrada no estoque em lote dentro de uma transação única.*  
  > *Já no **Teste 2**, foi identificada a falta de ordenação nas tabelas com muitos itens. Implementamos o componente `SortableTh` e o hook `useTableSort`, permitindo clicar em qualquer coluna — como ID, Nome, Saldo ou Capacidade — para ordenar em ordem crescente ou decrescente."*

### 🔹 01:30 – 02:20 | Melhoria do Teste 3 (CSV com UTF-8 BOM e Agrupamento por Fornecedor) e Teste 4 (Inativação Lógica)
* **[Na Tela]:**
  1. Vá em **Kits (`/items/kits`)**, abra o **Simulador de Montagem**, adicione um kit e clique em **Exportar CSV**.
  2. Feche o modal e aponte para o botão de **Inativar/Ativar** e o filtro **Ativos / Inativos** na listagem de Kits ou Peças.
* **[O que falar]:**
  > *"No **Teste 3**, ao exportar a planilha CSV do Simulador de Produção para o Excel, os caracteres acentuados ficavam desconfigurados. Corrigimos a rotina de exportação adicionando o marcador **UTF-8 BOM (`\uFEFF`)**, separador por ponto e vírgula e o agrupamento dos itens por fornecedor para facilitar a cotação de compras.*  
  > *No **Teste 4**, como o sistema bloqueia a exclusão física de itens que já possuem histórico de auditoria, implementamos a **inativação lógica** com o botão de Ativar e Inativar tanto em Fornecedores quanto em Peças e Kits, permitindo ocultar itens obsoletos sem perder o histórico passado."*

### 🔹 02:20 – 03:00 | Melhoria do Teste 5 (Compatibilidade MySQL Linux na Nuvem e Swagger)
* **[Na Tela]:** Mostre a aba do Swagger em produção (`https://shelfapi.onrender.com/swagger`) e o commit de padronização dos repositórios no GitHub (`ShelfAPI`).
* **[O que falar]:**
  > *"Por fim, no **Teste 5**, realizado diretamente no ambiente em nuvem, identificamos que o MySQL em servidor Linux diferenciava maiúsculas e minúsculas nos nomes das tabelas, gerando erro 500 no login, além de o Swagger estar desabilitado em produção. Padronizamos todas as queries SQL dos 7 repositórios da API para nomes de tabelas em letras minúsculas e habilitamos o Swagger em produção no `Program.cs`. Todas as correções estão rastreadas em commits no GitHub e 100% funcionais. Muito obrigado!"*
