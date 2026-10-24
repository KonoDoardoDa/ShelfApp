# 🎬 Roteiros Cronometrados dos 2 Vídeos do PIT II

**Projeto:** ShelfApp ERP & ShelfApi  
**Apresentador:** Eduardo Marcelo Pacheco Maticola (RGM: 34652671)  
**Ferramenta Sugerida para Gravação:** OBS Studio, Loom ou Gravador Nativo do Windows (`Win + G`)

> **Por que são 2 vídeos no relatório oficial?**
> Assim como no relatório aprovado de referência (`Relatório-Cupcake.docx`), o template da Cruzeiro do Sul possui **dois campos distintos de vídeo**:
> 1. **Vídeo 1 (Página 2 — Tabela `Codificação` / Situação-Problema 2):** exige **no mínimo 5 minutos** apresentando a arquitetura do código-fonte (Front-end, Back-end e Banco de Dados) e o funcionamento geral da aplicação sem erros.
> 2. **Vídeo 2 (Página 6 — Tabela `Vídeo da Solução atualizada` / Situação-Problema 3):** exige **até 5 minutos** (pode ter entre **2 min 30 s e 4 min**) apresentando especificamente as correções dos bugs e melhorias apontadas nos testes dos 5 colegas.

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

### 🔹 00:00 – 00:35 | Contextualização dos 5 Testes e Ciclo Kaizen
* **[Na Tela]:** Mostre rapidamente o histórico de commits no GitHub (`https://github.com/KonoDoardoDa/ShelfApp/commits/main`) e a tela de **Kits & Montagens (`/items/kits`)**.
* **[O que falar]:**
  > *"Olá! Neste segundo vídeo, referente à Situação-Problema 3, vou apresentar na prática as correções dos bugs e melhorias implementadas no **ShelfApp ERP** após a bateria de testes realizada com os 5 colegas avaliadores."*

### 🔹 00:35 – 01:35 | Correção dos Testes 1 e 2 (Duplicidade de Item no Kit e Limite Numérico na Edição)
* **[Na Tela]:** Na tela de **Kits (`/items/kits`)**, abra a **Composição do Kit** de um kit (ex.: `A80 220V.2`):
  1. **Teste 1:** Selecione no dropdown um item que já esteja listado abaixo (ex.: `D-ST 4` ou `LC1D32B7`) e clique em **`+ Adicionar`**. Mostre o aviso amigável amarelo (`toastWarning`) orientando a incrementar a quantidade em vez de estourar `MySqlException: Duplicate entry`.
  2. **Teste 2:** Clique no ícone de editar um item da composição (`Editar Parâmetros`), digite `99999999999999` na `Quantidade` e clique em **`Salvar`**. Mostre a mensagem em português (`"A quantidade deve ser entre 1 e 1.000.000 unidades."`) sem dar erro 400 em inglês.
* **[O que falar]:**
  > *"No **Teste 1**, quando o avaliador tentou adicionar na composição do kit uma peça que já fazia parte daquele mesmo kit, o banco disparava uma exceção técnica `MySqlException: Duplicate entry`. Para corrigir, criamos a exceção `DuplicateKitItemException` no back-end e a validação preventiva no front-end: agora, ao tentar adicionar um item repetido, o sistema bloqueia a duplicidade e exibe um aviso amigável orientando o operador a incrementar a quantidade do item existente na tabela.*  
  > *No **Teste 2**, ao editar a quantidade de uma peça do kit com um número exageradamente grande, ocorria estouro de inteiro de 32 bits na API com a mensagem em inglês `'One or more validation errors occurred'`. Aplicamos a validação de intervalo de 1 a 1 milhão tanto no modelo `KitItem.cs` quanto no formulário, exibindo agora uma mensagem clara em português."*

### 🔹 01:35 – 02:20 | Correção do Teste 3 (Fechamento Acidental do Modal ao Clicar no Fundo Escuro)
* **[Na Tela]:** Vá em **Softwares & CLPs (`/softwares`)**, clique em **`+ Nova Implantação`**, digite algum texto no campo `Nome do Software` e clique várias vezes na área escura fora do modal (`backdrop`). Mostre que o modal **não fecha** e **não perde os dados digitados**.
* **[O que falar]:**
  > *"No **Teste 3**, durante o preenchimento do formulário de **Nova Implantação de Software**, um clique acidental fora da janela modal fechava o formulário imediatamente e descartava tudo o que o usuário havia digitado. Ajustamos o componente `Modal.tsx` com a propriedade `closeOnBackdrop = false`: agora, clicar no fundo escuro não fecha a janela acidentalmente, protegendo os dados preenchidos até que o usuário clique explicitamente em `Cancelar` ou no `X`."*

### 🔹 02:20 – 03:15 | Correção dos Testes 4 e 5 (Inativação Lógica, Importação de XML, Ordenação de Colunas e CSV UTF-8 BOM)
* **[Na Tela]:** Vá em **Estoque & Peças (`/items/estoque`)**:
  1. Mostre o botão **Ativar/Inativar** na linha de uma peça e abra rapidamente o modal **Importar XML (NF-e)**.
  2. Clique nos cabeçalhos das colunas (**ID**, **Nome**, **Saldo Atual**) mostrando a ordenação dinâmica, e mencione a exportação CSV com UTF-8 BOM no Simulador.
* **[O que falar]:**
  > *"No **Teste 4**, implementamos a **inativação lógica** (`Ativo/Inativo`) para permitir ocultar peças, kits e fornecedores obsoletos que já possuem histórico de auditoria, além do vínculo de **Nota Fiscal** e da **Importação em Lote via arquivo XML de NF-e**.*  
  > *E no **Teste 5**, adicionamos a **ordenação dinâmica** ao clicar no cabeçalho de qualquer coluna das tabelas (`SortableTh`) e corrigimos a exportação CSV do **Simulador de Produção** com codificação **UTF-8 BOM** e agrupamento por fornecedor para abrir com acentuação perfeita no Excel. Todas as correções foram registradas no GitHub. Muito obrigado!"*
