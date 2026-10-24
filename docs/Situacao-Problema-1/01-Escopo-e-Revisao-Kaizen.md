# 📋 Situação-Problema 1 — Revisão de Escopo, Requisitos e Melhoria Contínua (Kaizen)

**Projeto:** ShelfApp ERP & ShelfApi  
**Autor:** Eduardo Marcelo Pacheco Maticola (RGM: 34652671)  

---

## 1. Contextualização e Problema de Negócio

Em ambientes industriais de montagem de painéis elétricos e máquinas automatizadas, o controle de estoque em planilhas isoladas gera graves gargalos operacionais:
1. **Ruptura inesperada de estoque:** A falta de um único componente de baixo valor (como um borne ou disjuntor) paralisa toda a linha de montagem de um kit industrial.
2. **Ausência de baixa atômica da BOM (*Bill of Materials*):** Quando um kit é montado manualmente, os operadores esquecem de deduzir individualmente as 20 ou 30 peças que compõem o conjunto.
3. **Dificuldade no planejamento de compras (PCP):** Calcular manualmente quantas peças faltam para produzir uma carteira de múltiplos pedidos diferentes (ex: 10 Kits Modelo A + 5 Kits Modelo B) é lento e propenso a erros humanos.
4. **Falta de rastreabilidade e auditoria:** Não há histórico confiável de quem retirou peças, qual Nota Fiscal originou a entrada ou qual versão de firmware/software de CLP foi instalada em cada cliente.

---

## 2. Revisão de Escopo sob a Filosofia *Kaizen* (Melhoria Contínua)

Seguindo a orientação da **Situação-Problema 1**, o planejamento inicial elaborado no *Projeto Integrador Transdisciplinar I* foi revisitado e aprimorado através de um ciclo **Kaizen**, incorporando novos conceitos de Engenharia de Software, Modelagem de Dados, UX/IHC e Computação em Nuvem:

| Aspecto do Projeto | Escopo Inicial (PIT I) | Evolução e Adequação Kaizen (PIT II) |
| :--- | :--- | :--- |
| **Controle de Estoque** | Cadastro simples de peças e fornecedores (CRUD básico). | **Estoque Unificado** (Peças Avulsas + Kits Pré-Montados) com movimentação auditada (saldo anterior, saldo posterior, operador, motivo e Nota Fiscal). |
| **Entrada de Mercadorias** | Digitação manual item a item. | **Importação Automatizada de XML de NF-e:** Leitura de arquivos XML fiscais com pré-visualização, criação automática de itens novos e incremento em lote via transação SQL. |
| **Manufatura de Kits** | Associação estática entre Kit e Peça. | **Motor de Montagem e Desmontagem Atômica:** Cálculo em tempo real da *Capacidade de Montagem* baseada no item gargalo, baixa automática de insumos na montagem e estorno reversível na desmontagem. |
| **Planejamento (PCP)** | Inexistente no planejamento inicial. | **Simulador de Produção Multi-Kits:** Projeção matemática de demanda para múltiplos kits simultâneos, com filtros operacionais (*Apenas Painel* vs. *Peças Gerais*) e exportação CSV UTF-8. |
| **Rastreabilidade de Campo** | Inexistente no planejamento inicial. | **Módulo de Softwares & CLPs:** Registro de versões de firmware/programas instalados por cliente, kit e tipo de dispositivo (CLP, IHM, Inversor). |
| **Infraestrutura e Deploy** | Execução local (`localhost`). | **Arquitetura em Nuvem Distribuída:** Front-end na Vercel, API .NET 9 conteinerizada com Docker no Render e MySQL 8 gerenciado na Aiven Cloud com SSL obrigatório. |

---

## 3. Especificação de Requisitos Revisada

### 3.1 Requisitos Funcionais (RF)

* **RF01 — Autenticação e Controle de Acesso (RBAC):** O sistema deve autenticar usuários via JWT (*JSON Web Token*) utilizando senha criptografada com `BCrypt`, diferenciando permissões entre os perfis `Admin` e `Operador`.
* **RF02 — Gestão de Fornecedores:** O sistema deve permitir cadastrar, listar, pesquisar, editar, inativar/reativar e excluir fornecedores homologados (impedindo a exclusão física caso possuam peças vinculadas).
* **RF03 — Catálogo de Peças e Componentes:** O sistema deve permitir gerenciar peças vinculadas a um fornecedor, exibindo seu saldo atual e status semântico (*Normal > 10 un*, *Baixo Estoque 1 a 10 un*, *Zerado 0 un*).
* **RF04 — Movimentação Auditada de Estoque:** Toda entrada ou saída manual de peça deve exigir quantidade positiva, validar saldo suficiente nas saídas e gravar registro imutável de auditoria contendo operador, data/hora, motivo, número de Nota Fiscal e saldos antes/depois.
* **RF05 — Importação em Lote via XML de NF-e:** O sistema deve processar arquivos `.xml` de Notas Fiscais Eletrônicas, identificando fornecedor, número da NF e lista de produtos (`<det>`), permitindo cadastrar novas peças e somar saldos existentes em uma única transação atômica.
* **RF06 — Gestão de Kits e Composição (BOM):** O sistema deve permitir criar modelos de kits e configurar sua ficha técnica (quais peças o compõem, quantidade necessária por kit e flag booleana `IsPainel` para segregar componentes do quadro elétrico).
* **RF07 — Montagem e Desmontagem de Kits:** O sistema deve permitir montar kits (deduzindo automaticamente todas as peças da receita do estoque avulso e incrementando o saldo físico do kit) e desmontar kits (estornando os componentes ao almoxarifado).
* **RF08 — Simulador de Produção Multi-Kits:** O sistema deve calcular a viabilidade de produção para uma fila customizada de kits e quantidades, apontando sobras e faltas por componente e permitindo filtrar por *Todos*, *Apenas Painel* ou *Peças Gerais*.
* **RF09 — Exportação de Relatórios CSV:** O sistema deve exportar a ficha técnica de kits e os relatórios analíticos de simulação/compras em formato `.csv` (codificação UTF-8 com BOM, compatível com Microsoft Excel e LibreOffice Calc).
* **RF10 — Gestão de Softwares e CLPs:** O sistema deve registrar os softwares e firmwares instalados em equipamentos de clientes, vinculando versão, data de instalação, tipo de dispositivo e status operacional.
* **RF11 — Dashboard Executivo de Criticidade:** A tela inicial deve apresentar KPIs em tempo real e um monitor exclusivo de itens em ruptura (*Zerados*) ou atenção (*Baixo Estoque*), com atalhos diretos de reposição.
* **RF12 — Gestão de Usuários:** Usuários com perfil `Admin` devem poder listar, criar e remover contas de acesso, com trava de segurança contra autoexclusão.

### 3.2 Requisitos Não Funcionais (RNF)

* **RNF01 — Usabilidade e IHC:** A interface deve seguir os princípios de clareza, consistência, feedback imediato (notificações *toast*), prevenção de erros e suporte nativo a **Modo Claro e Modo Escuro** com persistência local.
* **RNF02 — Integridade Transacional (ACID):** Operações compostas (montagem/desmontagem de kits e importação XML em lote) devem utilizar transações de banco de dados (`BeginTransaction` / `Commit` / `Rollback`), garantindo que nenhuma falha parcial corrompa os saldos.
* **RNF03 — Segurança da Informação:** Senhas devem ser armazenadas exclusivamente como hashes `BCrypt` (fator de trabalho 11); rotas da API devem exigir Bearer Token JWT válido; a comunicação com o banco em nuvem deve utilizar criptografia `SSL/TLS Required`.
* **RNF04 — Arquitetura em Camadas e Padrão MVC:** O back-end deve separar estritamente as responsabilidades em *Controllers*, *Services*, *Repositories* e *Models/DTOs*, facilitando manutenção e testabilidade.
* **RNF05 — Portabilidade e Conteinerização:** O back-end deve ser empacotado em imagem Docker *multi-stage* baseada em Linux (`.NET 9.0 ASP.NET Runtime`), com consultas SQL padronizadas para bancos *case-sensitive*.
* **RNF06 — Desempenho e Paginação:** Todas as listagens críticas devem contar com paginação configurável, ordenação por colunas e busca instantânea em memória para tempo de resposta visual inferior a 100ms após o carregamento.
