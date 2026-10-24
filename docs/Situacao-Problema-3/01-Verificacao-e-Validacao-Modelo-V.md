# 🧪 Situação-Problema 3 — Verificação e Validação com o Modelo V

**Projeto:** ShelfApp ERP & ShelfApi  
**Autor:** Eduardo Marcelo Pacheco Maticola (RGM: 34652671)  

---

## 1. Diferenciação entre Verificação e Validação

Conforme fundamentado no material teórico (Figura 1 — *Relação entre o desenvolvimento e os testes com o Modelo V*):
* **Verificação (*"Estamos construindo o produto corretamente?"*):** Ocorre durante o desenvolvimento por meio de análise estática (`TypeScript strict`, compilador Roslyn do C#), revisão de código, inspeção de conformidade com os requisitos e testes de unidade/regras.
* **Validação (*"Construímos o produto certo para o usuário?"*):** Ocorre sobre os módulos integrados e a solução completa em funcionamento, garantindo que as partes interessadas (operadores de almoxarifado, compradores e colegas avaliadores) atinjam seus objetivos reais de negócio.

```mermaid
flowchart TB
    subgraph Verificacao["⬇️ VERIFICAÇÃO (Desenvolvimento)"]
        V1["1. Especificação de Requisitos (RF/RNF)"]
        V2["2. Análise de Domínio (BOM, Estoque, XML)"]
        V3["3. Projeto de Arquitetura (MVC + REST + DER)"]
        V4["4. Codificação (C# .NET 9 + React TypeScript)"]
        V1 --> V2 --> V3 --> V4
    end

    subgraph Validacao["⬆️ VALIDAÇÃO (Testes)"]
        T4["4. Testes de Aceitação (5 Colegas / Usuários)"]
        T3["3. Testes de Sistema (Fluxos End-to-End na Nuvem)"]
        T2["2. Testes de Integração (API + MySQL + Transações)"]
        T1["1. Testes Unitários (Cálculos de BOM, Saldo e Parser XML)"]
        T1 --> T2 --> T3 --> T4
    end

    V1 -. "Valida necessidade do negócio" .-> T4
    V2 -. "Valida fluxos completos" .-> T3
    V3 -. "Valida contratos HTTP e SQL" .-> T2
    V4 -. "Verifica funções e regras" .-> T1
```

---

## 2. Caderno de Testes Executados (Verificação e Validação)

### 2.1 Nível 1 — Testes Unitários (Regras de Negócio e Cálculos)

| ID | Caso de Teste Unitário | Entrada | Resultado Esperado | Resultado Obtido | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TU-01** | Cálculo de `MontagensPossiveis` por componente (`KitItemDisponibilidadeDto`) | `SaldoEstoqueItem = 15`, `QuantidadeNecessaria = 4` | Retornar divisão inteira `3` montagens possíveis | Retornou `3` | ✅ Aprovado |
| **TU-02** | Cálculo de `CapacidadeMontagem` do Kit pelo item gargalo | Kit com 3 peças cujas montagens possíveis são `[12, 0, 5]` | Retornar o mínimo da coleção: `0` | Retornou `0` | ✅ Aprovado |
| **TU-03** | Bloqueio de saída com saldo negativo (`EstoqueRepository.MovimentarAsync`) | `saldoAnterior = 5`, `delta = -8` (`Saida`) | Lançar `InvalidOperationException` ("Saldo insuficiente") | Exceção lançada e capturada | ✅ Aprovado |
| **TU-04** | Parser de XML de NF-e (`xmlParser.ts`) | Arquivo `.xml` padrão SEFAZ `<nfeProc>` com 2 tags `<det>` | Extrair número da NF, nome do emitente e lista de 2 itens com quantidades | Objeto estruturado extraído com precisão | ✅ Aprovado |
| **TU-05** | Normalização de Connection String (`MySqlConnectionFactory`) | URI `mysql://avnadmin:pass@host:12345/defaultdb?ssl-mode=REQUIRED` | Converter automaticamente para formato ADO.NET com `SslMode=Required` | String convertida e conectada | ✅ Aprovado |

---

### 2.2 Nível 2 — Testes de Integração (API + Banco de Dados MySQL)

| ID | Caso de Teste de Integração | Cenário / Endpoint | Resultado Esperado | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TI-01** | Autenticação JWT e Hash BCrypt | `POST /api/Auth/Login` com `admin@shelfapp.com` | Validar hash BCrypt no banco `usuario` e retornar token JWT válido por 8h | ✅ Aprovado |
| **TI-02** | Transação Atômica de Montagem de Kit | `POST /api/EstoqueKit/Montar` (`kitId=6`, `qtd=1`) | Deduzir todas as peças em `estoque`, gravar logs em `movimentacao_estoque`, somar `+1` em `estoque_kit` e gravar log em `movimentacao_kit` na mesma transação | ✅ Aprovado |
| **TI-03** | Rollback Automático em Montagem Inválida | `POST /api/EstoqueKit/Montar` com peça faltante | Fazer `Rollback` sem debitar nenhuma peça parcial e retornar `400 Bad Request` detalhando as peças faltantes | ✅ Aprovado |
| **TI-04** | Importação XML em Lote Transacional | `POST /api/Estoque/ImportarLote` com itens novos e existentes | Criar itens inéditos, somar saldo nos existentes e gravar número da NF na auditoria | ✅ Aprovado |
| **TI-05** | Proteção de Integridade Referencial | `DELETE /api/Item/{id}` em peça vinculada a Kit | Impedir exclusão física e retornar orientação para usar a função *Inativar* | ✅ Aprovado |

---

### 2.3 Nível 3 — Testes de Sistema (End-to-End em Produção: Vercel + Render + Aiven)

| ID | Funcionalidade Testada | Verificação em Ambiente Real | Status |
| :--- | :--- | :--- | :---: |
| **TS-01** | Roteamento SPA em Nuvem | Acesso direto e *refresh* (F5) nas rotas `/items/estoque`, `/items/kits` e `/softwares` na Vercel (`vercel.json`) | ✅ Aprovado |
| **TS-02** | Comunicação CORS Cross-Origin | Chamadas HTTPS do domínio `.vercel.app` para `https://shelfapi.onrender.com/api` com cabeçalho `Authorization` | ✅ Aprovado |
| **TS-03** | Exportação de Planilhas CSV | Download da ficha técnica do Kit e do relatório do Simulador com acentuação UTF-8 BOM no Excel e LibreOffice Calc | ✅ Aprovado |
| **TS-04** | Responsividade e Temas | Alternância instantânea entre Modo Claro e Modo Escuro com persistência no `localStorage` | ✅ Aprovado |
