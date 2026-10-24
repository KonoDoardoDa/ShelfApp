# 📐 Situação-Problema 1 — Modelagem da Solução em UML

**Projeto:** ShelfApp ERP & ShelfApi  
**Autor:** Eduardo Marcelo Pacheco Maticola (RGM: 34652671)  

Conforme abordado no material teórico da disciplina, a **Unified Modeling Language (UML)** fornece os artefatos estruturais e comportamentais que conectam os requisitos de negócio à implementação em código e ao modelo relacional do banco de dados.

---

## 1. Diagrama de Classes de Domínio e Persistência (Estrutural)

Cada classe abaixo foi modelada com seu **Nome** (substantivo representativo do domínio), **Descrição** em linguagem natural, **Atributos** tipados e **Métodos/Operações** que refletem o comportamento no negócio:

```mermaid
classDiagram
    direction TB

    class Usuario {
        +int Id
        +string Nome
        +string Email
        +string SenhaHash
        +string Role
        +bool Ativo
        +DateTime DataCriacao
        +Autenticar(email, senha) AuthResponseDto
        +Registrar(dto) UsuarioResponseDto
    }

    class Fornecedor {
        +int Id
        +string Nome
        +bool Ativo
        +Criar() int
        +Atualizar() bool
        +AlternarStatus() bool
    }

    class Item {
        +int Id
        +string Nome
        +string Descricao
        +int FornecedorId
        +bool Ativo
        +int QuantidadeEstoque
        +Criar() int
        +Atualizar() bool
        +AlternarStatus() bool
    }

    class Estoque {
        +int ItemId
        +int Quantidade
        +ObterSaldo(itemId) int
        +Movimentar(delta, tipo, motivo, nf) int
        +ImportarLoteXml(itens, nf, fornecedor) ImportarLoteResultadoDto
    }

    class MovimentacaoEstoque {
        +int Id
        +int ItemId
        +string Tipo
        +int Quantidade
        +int SaldoAnterior
        +int SaldoPosterior
        +string Motivo
        +string NotaFiscal
        +int UsuarioId
        +string UsuarioNome
        +DateTime DataMovimentacao
    }

    class Kit {
        +int Id
        +string Nome
        +bool Ativo
        +Criar() int
        +Atualizar() bool
        +ObterComItens(kitId) KitDetails
    }

    class KitItem {
        +int KitId
        +int ItemId
        +bool IsPainel
        +int Quantidade
        +AdicionarAoKit() bool
        +AtualizarQuantidade() bool
        +RemoverDoKit() bool
    }

    class EstoqueKit {
        +int KitId
        +int Quantidade
        +CalcularCapacidadeMontagem() int
        +MontarKit(kitId, qtd, motivo) ResultadoOperacaoKitDto
        +DesmontarKit(kitId, qtd, motivo) ResultadoOperacaoKitDto
        +SimularProducaoMultiKits(fila) SimulacaoProducaoResultadoDto
    }

    class MovimentacaoKit {
        +int Id
        +int KitId
        +string Tipo
        +int Quantidade
        +int SaldoAnterior
        +int SaldoPosterior
        +string Motivo
        +int UsuarioId
        +string UsuarioNome
        +DateTime DataMovimentacao
    }

    class Software {
        +int Id
        +string NomeSoftware
        +string Versao
        +string Cliente
        +int KitId
        +string NomeKit
        +string TipoDispositivo
        +DateTime DataInstalacao
        +string Status
        +string Observacoes
        +DateTime DataCriacao
    }

    Fornecedor "1" --> "0..*" Item : fornece >
    Item "1" *-- "1" Estoque : possui saldo >
    Item "1" --> "0..*" MovimentacaoEstoque : gera historico >
    Kit "1" *-- "1..*" KitItem : composto por (BOM) >
    Item "1" --> "0..*" KitItem : integra >
    Kit "1" *-- "1" EstoqueKit : possui saldo pronto >
    Kit "1" --> "0..*" MovimentacaoKit : registra montagem >
    Kit "0..1" --> "0..*" Software : embarcado em >
    Usuario "1" --> "0..*" MovimentacaoEstoque : executa >
    Usuario "1" --> "0..*" MovimentacaoKit : executa >
```

---

## 2. Diagrama de Casos de Uso (Comportamental)

Representa as interações dos atores (**Operador de Almoxarifado/Produção** e **Administrador**) com os módulos do sistema:

```mermaid
flowchart LR
    subgraph Atores
        OP["👷 Operador"]
        ADM["🛡️ Administrador"]
    end

    subgraph ShelfApp["Sistema ShelfApp ERP"]
        UC01(["UC01 - Autenticar no Sistema (JWT)"])
        UC02(["UC02 - Monitorar Dashboard e Reposição Crítica"])
        UC03(["UC03 - Gerenciar Peças e Fornecedores"])
        UC04(["UC04 - Movimentar Estoque (Entrada/Saída com Auditoria)"])
        UC05(["UC05 - Importar Nota Fiscal via XML em Lote"])
        UC06(["UC06 - Configurar Receita do Kit (BOM / IsPainel)"])
        UC07(["UC07 - Montar e Desmontar Kits (Baixa Atômica)"])
        UC08(["UC08 - Simular Produção Multi-Kits e Exportar CSV"])
        UC09(["UC09 - Controlar Softwares e Versões de CLPs"])
        UC10(["UC10 - Gerenciar Usuários e Perfis (RBAC)"])
    end

    OP --> UC01
    OP --> UC02
    OP --> UC03
    OP --> UC04
    OP --> UC05
    OP --> UC06
    OP --> UC07
    OP --> UC08
    OP --> UC09

    ADM --> OP
    ADM --> UC10
```

---

## 3. Diagrama de Sequência — Montagem Atômica de Kit (Comportamental)

Demonstra o fluxo de mensagens entre as camadas **View (React)**, **Controller**, **Service**, **Repository** e **Banco de Dados MySQL** durante a operação crítica de montagem de um kit:

```mermaid
sequenceDiagram
    autonumber
    actor Operador
    participant View as View (Kits.tsx)
    participant Ctrl as EstoqueKitController
    participant Svc as EstoqueKitService
    participant Repo as EstoqueKitRepository
    participant DB as MySQL (Aiven Cloud)

    Operador->>View: Informa quantidade de Kits e Motivo -> Clica em "Confirmar Montagem"
    View->>Ctrl: POST /api/EstoqueKit/Montar (kitId, quantidade, motivo)
    Ctrl->>Svc: MontarKitAsync(dto, usuarioId, usuarioNome)
    Svc->>Repo: MontarKitAsync(kitId, quantidade, motivo, usuarioId, usuarioNome)
    Repo->>DB: BEGIN TRANSACTION
    Repo->>DB: SELECT QuantidadeNecessaria, SaldoEstoqueItem FROM kititem JOIN estoque
    DB-->>Repo: Lista de componentes e saldos atuais
    alt Saldo insuficiente em algum componente
        Repo->>DB: ROLLBACK
        Repo-->>Ctrl: Throw InvalidOperationException (Lista de itens faltantes)
        Ctrl-->>View: HTTP 400 Bad Request { message }
        View-->>Operador: Exibe Toast de Alerta com a peça faltante
    else Todos os componentes possuem saldo suficiente
        loop Para cada peça da composição (BOM)
            Repo->>DB: UPDATE estoque SET quantidade = saldo - consumo
            Repo->>DB: INSERT INTO movimentacao_estoque (Tipo='Saida', Motivo='Montagem Kit...')
        end
        Repo->>DB: INSERT/UPDATE estoque_kit SET quantidade = saldoKit + quantidade
        Repo->>DB: INSERT INTO movimentacao_kit (Tipo='MONTAGEM', saldoAnterior, saldoPosterior)
        Repo->>DB: COMMIT TRANSACTION
        Repo-->>Svc: ResultadoOperacaoKitDto
        Svc-->>Ctrl: ResultadoOperacaoKitDto
        Ctrl-->>View: HTTP 200 OK { novoSaldoKit, mensagem }
        View-->>Operador: Atualiza tabela em tempo real e exibe Toast de Sucesso
    end
```

---

## 4. Diagrama de Atividades — Importação de Nota Fiscal XML (Comportamental)

```mermaid
flowchart TD
    Start([Início: Operador seleciona arquivo .XML da NF-e]) --> Parse[Front-end lê tags XML: emit, ide/nNF e det/prod]
    Parse --> ValidXML{XML é válido e possui itens?}
    ValidXML -- Não --> ErrXML[Exibe alerta de erro de estrutura XML] --> End([Fim])
    ValidXML -- Sim --> Preview[Exibe Modal de Pré-Visualização com itens, quantidades e Fornecedor]
    Preview --> Confirm{Operador confirma importação?}
    Confirm -- Não --> End
    Confirm -- Sim --> PostAPI[Envia POST /api/Estoque/ImportarLote para ShelfApi]
    PostAPI --> BeginTx[Inicia Transação SQL no MySQL]
    BeginTx --> CheckForn{Fornecedor já existe?}
    CheckForn -- Não --> CreateForn[Cria novo Fornecedor ativo no banco]
    CheckForn -- Sim --> LoopItens[Percorre cada item do lote XML]
    CreateForn --> LoopItens
    LoopItens --> CheckItem{Peça já existe pelo Nome?}
    CheckItem -- Não --> CreateItem[Cadastra nova peça em 'item' e inicia 'estoque' com a quantidade da NF]
    CheckItem -- Sim --> UpdateEstoque[Incrementa saldo existente na tabela 'estoque']
    CreateItem --> LogAudit[Registra entrada na tabela 'movimentacao_estoque' com número da NF]
    UpdateEstoque --> LogAudit
    LogAudit --> MoreItems{Há mais itens no XML?}
    MoreItems -- Sim --> LoopItens
    MoreItems -- Não --> CommitTx[COMMIT da Transação SQL]
    CommitTx --> ReturnOK[Retorna resumo de itens criados e atualizados]
    ReturnOK --> End
```
