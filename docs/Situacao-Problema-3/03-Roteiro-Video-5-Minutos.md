# 🎬 Situação-Problema 3 — Roteiro Cronometrado para o Vídeo de Apresentação (5 Minutos)

**Projeto:** ShelfApp ERP & ShelfApi  
**Apresentador:** Eduardo Marcelo Pacheco Maticola (RGM: 34652671)  
**Duração Alvo:** 4 min 45 seg a 5 min 00 seg  
**Ferramenta Sugerida para Gravação:** OBS Studio, Loom ou Gravador Nativo do Windows (`Win + G`)  

---

## 💡 Preparação Rápida Antes de Apertar "Gravar"
1. Deixe 3 abas abertas no navegador:
   * **Aba 1:** Repositório do GitHub (`https://github.com/KonoDoardoDa/ShelfApp`) mostrando a pasta `/docs`.
   * **Aba 2:** Swagger da API em produção no Render (`https://shelfapi.onrender.com/swagger`).
   * **Aba 3:** Tela de Login do **ShelfApp** na Vercel (faça um login de teste 2 minutos antes para garantir que o servidor do Render já esteja "acordado" e rápido).
2. Tenha um arquivo `.xml` de Nota Fiscal fácil na Área de Trabalho caso queira demonstrar o modal de importação XML.

---

## ⏱️ Roteiro Minuto a Minuto (O que mostrar na tela e o que falar)

### 🔹 Bloco 1: Introdução, Escopo e Arquitetura em Nuvem (00:00 – 01:00)
* **[Na Tela]:** Comece na aba do GitHub (`ShelfApp/docs`) e depois mostre rapidamente a aba do Swagger (`shelfapi.onrender.com/swagger`).
* **[O que falar]:**
  > *"Olá! Meu nome é Eduardo Maticola, estudante de Engenharia de Software, e este é o vídeo de apresentação do meu Projeto Integrador Transdisciplinar II: o **ShelfApp ERP**.*  
  > *O objetivo do projeto é resolver um problema real da indústria de montagem de máquinas e painéis elétricos: o controle unificado de almoxarifado, a manufatura de kits baseados em listas de materiais (BOM) e a simulação de demanda de compras.*  
  > *Seguindo o padrão arquitetural em camadas e MVC proposto na disciplina, construí o back-end em **C# com .NET 9 e Dapper** (a `ShelfApi`), o banco de dados relacional em **MySQL 8** hospedado na Aiven Cloud, e o front-end em **React 19 com TypeScript** hospedado na Vercel. Todo o código e a documentação das Situações-Problema 1, 2 e 3 estão organizados aqui no meu repositório do GitHub."*

---

### 🔹 Bloco 2: Login, IHC/UX e Dashboard Executivo (01:00 – 02:00)
* **[Na Tela]:** Mude para a aba do **ShelfApp**, alterne o botão de **Modo Claro / Modo Escuro**, faça login e mostre o **Dashboard Principal (`/`)**.
* **[O que falar]:**
  > *"Aplicando os princípios de Interface Humano-Computador (IHC) e UX, a interface conta com suporte nativo a Modo Claro e Modo Escuro e feedback visual imediato.*  
  > *Ao autenticar via token JWT, chegamos ao **Dashboard Executivo**. No topo temos os 4 KPIs em tempo real: Total de Itens, Baixo Estoque, Estoque Zerado e Fornecedores. Logo abaixo temos o **Monitor de Reposição Crítica**, que destaca apenas as peças que precisam de atenção imediata, permitindo filtrar itens zerados ou com baixo estoque e ir direto para a reposição."*

---

### 🔹 Bloco 3: Almoxarifado Unificado e Melhorias Pós-Testes dos Colegas (02:00 – 03:15)
* **[Na Tela]:** Clique em **Estoque & Peças (`/items/estoque`)**. Mostre a ordenação clicando no cabeçalho de uma coluna, abra o modal de **Movimentar Estoque**, o modal de **Importar XML** e o **Histórico de Auditoria**.
* **[O que falar]:**
  > *"Na Situação-Problema 3, submetemos o sistema à avaliação de 5 colegas e implementamos melhorias importantes no ciclo Kaizen:*  
  > *1. Primeiro, adicionamos **ordenação dinâmica em todas as colunas** das tabelas.*  
  > *2. Segundo, criamos o botão de **Inativar/Reativar** registros para preservar a integridade referencial sem perder o histórico.*  
  > *3. Terceiro, a partir do feedback sobre entrada de mercadorias, adicionamos o vínculo de **Nota Fiscal** nas movimentações e criamos a **Importação Automatizada de XML de NF-e**, que lê o arquivo fiscal, cadastra peças novas e soma o saldo em lote dentro de uma transação SQL segura.*  
  > *Além disso, em **Histórico de Auditoria**, temos a rastreabilidade completa de quem movimentou cada peça, data, hora, saldo anterior, saldo posterior e justificativa."*

---

### 🔹 Bloco 4: Manufatura de Kits e Simulador de Produção Multi-Kits (03:15 – 04:30)
* **[Na Tela]:** Acesse **Kits & Montagens (`/items/kits`)**. Abra a **Composição (BOM)** de um kit para mostrar as peças e a flag `Painel`. Depois abra o **Simulador de Montagem**, adicione 2 ou 3 kits na fila, alterne os filtros (`Apenas Painéis` / `Todos`) e clique em **Exportar CSV**.
* **[O que falar]:**
  > *"Aqui no módulo de **Kits**, o sistema calcula automaticamente a **Capacidade de Montagem** em tempo real com base na peça mais escassa do estoque. Quando o operador clica em **Montar Kit**, o back-end executa uma transação atômica: dá baixa automática em todas as peças da receita e incrementa o saldo do kit pronto. E se precisar estornar, a função **Desmontar Kit** devolve 100% das peças ao almoxarifado.*  
  > *Para o setor de compras e PCP, criamos o **Simulador de Produção Multi-Kits**: podemos simular a fabricação simultânea de vários modelos de kits, filtrar apenas componentes de painel elétrico ou peças gerais, visualizar exatamente quais peças faltam comprar e exportar a planilha em CSV com codificação UTF-8 BOM corrigida após os testes dos colegas."*

---

### 🔹 Bloco 5: Softwares/CLPs, Controle de Usuários e Encerramento (04:30 – 05:00)
* **[Na Tela]:** Passe brevemente por **Softwares & CLPs (`/softwares`)** e **Usuários (`/users`)**.
* **[O que falar]:**
  > *"Por fim, temos o módulo de **Softwares e CLPs**, que registra qual versão de firmware foi instalada em cada cliente e máquina em campo, e o módulo de **Usuários**, restrito ao perfil Administrador.*  
  > *Durante os testes na nuvem, também identificamos e corrigimos a sensibilidade a maiúsculas e minúsculas do MySQL no ambiente Linux, deixando toda a solução 100% estável e validada. Muito obrigado!"*
