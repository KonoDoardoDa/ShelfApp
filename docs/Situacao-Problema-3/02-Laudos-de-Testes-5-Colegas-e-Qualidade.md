# 🧪 Situação-Problema 3 — Fichas de Testes dos 5 Colegas e Laudo Técnico de Qualidade

**Projeto:** ShelfApp ERP & ShelfApi  
**Autor:** Eduardo Marcelo Pacheco Maticola (RGM: 34652671)  

---

## 1. Avaliação e Testes da Solução por 5 Colegas

A aplicação foi disponibilizada em ambiente web acessível remotamente para que 5 colegas realizassem testes exploratórios e funcionais independentes, registrando o que funcionou, as anomalias/sugestões identificadas (com capturas de tela) e funcionalidades não testadas.

---

### 📋 Avaliador 1 — Matheus Bieberbach
| Campo | Registro da Avaliação |
| :--- | :--- |
| **Nome:** | Matheus Bieberbach |
| **Data do teste:** | 14/10/2026 |
| **O que testou e funcionou:** | Foi realizado o acesso ao módulo de Gestão de Kits e testada a visualização da composição detalhada do kit (`A80 220V.2`), a listagem das peças vinculadas com identificação de componentes exclusivos de painel elétrico e a exportação da ficha técnica do kit em formato CSV. |
| **O que testou e não funcionou – O que deve ser corrigido:** | Ao tentar adicionar à composição do kit um item do estoque (`LC1D32B7`) que já estava cadastrado naquele mesmo kit, o sistema retornou um erro de chave duplicada do banco de dados e exibiu a mensagem técnica da exceção (`MySqlException: Duplicate entry`) na notificação da tela. Deve-se validar previamente se o item já pertence ao kit e exibir um aviso amigável orientando o usuário a alterar a quantidade do item existente na tabela. |
| **Funcionalidade não testada (faltou ou não foi implementada):** | Não foi testada a exclusão física do kit completo, mantendo os testes focados na manutenção dos itens internos da composição. |

---

### 📋 Avaliador 2 — Jhenifer Tavares Ribeiro
| Campo | Registro da Avaliação |
| :--- | :--- |
| **Nome:** | Jhenifer Tavares Ribeiro |
| **Data do teste:** | 15/10/2026 |
| **O que testou e funcionou:** | Foram testadas a abertura do modal `Editar Parâmetros` de um item dentro da composição do kit (`D-ST 4`), a alternância da marcação de componente de painel (`isPainel`) e a atualização da quantidade com valores normais de operação, recalculando corretamente a capacidade de montagem do kit. |
| **O que testou e não funcionou – O que deve ser corrigido:** | Ao preencher o campo `Quantidade` no modal `Editar Parâmetros` com um número excessivamente alto (`99999999999999999999999999`) e salvar, a requisição retornou erro `400 (Bad Request)` por ultrapassar o limite de um número inteiro na API, exibindo a mensagem genérica em inglês `“One or more validation errors occurred.”`. Deve-se limitar o valor máximo permitido para a quantidade e apresentar uma mensagem clara em português. |
| **Funcionalidade não testada (faltou ou não foi implementada):** | Não foi testada a operação de desmontagem de kits prontos, concentrando os testes na validação dos campos de edição da composição. |

---

### 📋 Avaliador 3 — Luany Cardozo Ramos
| Campo | Registro da Avaliação |
| :--- | :--- |
| **Nome:** | Luany Cardozo Ramos |
| **Data do teste:** | 16/10/2026 |
| **O que testou e funcionou:** | Foi testado o módulo de Softwares e CLPs, incluindo a consulta de versões instaladas por cliente e dispositivo, a filtragem por status operacional e o preenchimento do formulário `Cadastrar Nova Implantação de Software` vinculando o registro a um kit da linha de produção (`A40 380V`). |
| **O que testou e não funcionou – O que deve ser corrigido:** | Durante o preenchimento do modal `Cadastrar Nova Implantação de Software`, ao clicar acidentalmente na área externa escura ao redor da janela (`backdrop`), o modal fechou imediatamente sem confirmação e todas as informações que haviam sido digitadas nos campos foram perdidas. Sugere-se desativar o fechamento automático ao clicar fora do modal, mantendo o fechamento apenas pelos botões `Cancelar` ou `X`. |
| **Funcionalidade não testada (faltou ou não foi implementada):** | Não foi testada a tela de Gestão de Usuários, pois a sessão de testes foi dedicada ao módulo de implantações de software e comportamento dos modais. |

---

### 📋 Avaliador 4 — Maria Eduarda Martinelli Da Silva
| Campo | Registro da Avaliação |
| :--- | :--- |
| **Nome:** | Maria Eduarda Martinelli Da Silva |
| **Data do teste:** | 18/10/2026 |
| **O que testou e funcionou:** | Foi realizado o login no sistema com autenticação JWT, a conferência dos indicadores executivos no Dashboard Principal, o uso dos filtros rápidos do Monitor de Reposição Crítica e o registro manual de entradas e saídas de peças no Almoxarifado com consulta ao Histórico de Auditoria. |
| **O que testou e não funcionou – O que deve ser corrigido:** | Durante os testes de almoxarifado e manutenção de cadastros, identificou-se que a exclusão de peças ou fornecedores com histórico de movimentação era bloqueada por integridade referencial sem opção de apenas inativar o registro, além da necessidade de importar entradas de Notas Fiscais Eletrônicas via arquivo XML em lote. |
| **Funcionalidade não testada (faltou ou não foi implementada):** | Não foram testados procedimentos de recuperação automática de senha por e-mail, funcionalidade que não faz parte do escopo atual do sistema. |

---

### 📋 Avaliador 5 — Nicole Bressan Fontanelli
| Campo | Registro da Avaliação |
| :--- | :--- |
| **Nome:** | Nicole Bressan Fontanelli |
| **Data do teste:** | 24/10/2026 |
| **O que testou e funcionou:** | Foi utilizado o Simulador de Produção Multi-Kits adicionando diferentes modelos de kits simultaneamente na fila de produção, testando os filtros de foco operacional (`Todos os Componentes`, `Apenas Painéis` e `Peças Gerais`) e verificando o cálculo automático de sobras e faltas de estoque. |
| **O que testou e não funcionou – O que deve ser corrigido:** | Observou-se que nas tabelas com grande quantidade de registros não era possível clicar no cabeçalho das colunas (`ID`, `Nome`, `Saldo Atual`, `Capacidade`) para ordenar os dados em ordem crescente ou decrescente, e ao exportar o relatório CSV do simulador sugeriu-se incluir codificação UTF-8 BOM e agrupamento por fornecedor para abertura direta no Excel. |
| **Funcionalidade não testada (faltou ou não foi implementada):** | Não foram realizados testes de alteração de permissões entre perfis de acesso, mantendo o foco nas listagens e relatórios. |

---

## 2. Laudo Técnico de Qualidade do Sistema

Foram analisados cinco cenários de teste, contemplando as principais funcionalidades do sistema. Os resultados permitiram identificar e corrigir falhas de validação de entrada, tratamento de exceções e usabilidade em janelas modais e tabelas.

* **Teste 1 – Composição do Kit (Duplicidade de Item):** exibição de exceção técnica do banco (`MySqlException: Duplicate entry`) ao tentar adicionar um item já vinculado ao kit. **Correção:** implementada validação preventiva no front-end (`Kits.tsx`) e no back-end (`DuplicateKitItemException` e retorno HTTP `409 Conflict` em `KitItemController.cs`), exibindo aviso amigável para incrementar a quantidade do item existente.
* **Teste 2 – Edição de Parâmetros (Limite de Quantidade):** erro `400` com mensagem genérica em inglês (`“One or more validation errors occurred.”`) ao digitar valor numérico acima do limite de inteiro de 32 bits (`99999999999999999999999999`). **Correção:** aplicada validação de intervalo entre `1` e `1.000.000` unidades no formulário, no modelo `KitItem.cs` (`[Range(1, 1_000_000)]`), no `KitItemController.cs` e no tratador global `http.ts`, com mensagens traduzidas em português.
* **Teste 3 – Cadastro de Software (Fechamento de Modal):** perda dos dados digitados no formulário ao clicar acidentalmente fora da janela modal (`backdrop`). **Correção:** configurado o componente `Modal.tsx` (`closeOnBackdrop = false`) para impedir o fechamento por clique externo, fechando apenas pelos botões `Cancelar` ou `X`.
* **Teste 4 – Almoxarifado e Manutenção de Cadastros:** impossibilidade de ocultar itens obsoletos com histórico e necessidade de entrada em lote por Nota Fiscal. **Correção:** implementados o botão de ativação/inativação lógica (`Ativo`/`Inativo`), o campo `notaFiscal` e a importação de NF-e via arquivo XML (`ImportarXmlModal.tsx`).
* **Teste 5 – Tabelas e Simulador de Produção:** ausência de ordenação por colunas nas tabelas e desconfiguração de acentos ao abrir o CSV no Excel. **Correção:** implementada a ordenação dinâmica nos cabeçalhos (`SortableTh.tsx` e `useTableSort.ts`) e exportação CSV com prefixo UTF-8 BOM (`\uFEFF`) agrupada por fornecedor.

As alterações foram registradas em commits no repositório GitHub, permitindo a rastreabilidade das correções no front-end e no back-end. As evidências de funcionamento e validação das melhorias estão disponíveis nos vídeos demonstrativos apresentados no relatório.
