# 📘 Manual Operacional do Usuário — ShelfApp ERP

**Guia Prático e Descomplicado de Uso para o Almoxarifado, Montagem de Kits, Compras e Suporte**

> **Público-Alvo:** Almoxarifes, Operadores de Montagem, Compradores, Técnicos e Gestores  
> **Objetivo:** Explicar o que cada tela faz, por que usar e o passo a passo prático para cada situação do dia a dia  
> **Arquivos Editáveis Disponíveis:** `Documentacao_Pratica_ShelfApp.odt` (Nativo LibreOffice) e `Documentacao_Pratica_ShelfApp.docx` (Word)  
> **Versão do Sistema:** ShelfApp 2.0 (Frontend Integrado com ShelfApi)

---

## 1. Visão Geral do Sistema e Conceitos Básicos

O **ShelfApp** é o sistema criado para descomplicar e organizar a rotina do almoxarifado e da linha de montagem da nossa fábrica. Ele funciona como o coração da operação física, garantindo que nunca falte material para montagem, que cada entrada e saída de produto seja registrada com justificativa e que tenhamos total visibilidade de custos e viabilidade de entrega.

### 5 Conceitos Essenciais do Chão de Fábrica:
1. **Peças & Componentes Avulsos:** São as peças individuais compradas dos fornecedores (parafusos, bornes, disjuntores, relés, fios, cabos e trilhos DIN). Elas chegam com nota fiscal e ficam guardadas nas gavetas e prateleiras.
2. **Kit Pré-Montado:** É um produto acabado montado pela nossa fábrica reunindo várias peças individuais em uma caixa ou quadro (ex: *Kit Painel de Automação Solar*, *Kit Bomba Trifásica*). O kit possui seu próprio saldo físico quando pronto.
3. **Composição (BOM / Receita de Montagem):** É a lista de materiais do kit (como uma receita de bolo). Indica exatamente quais peças e quantas unidades de cada uma são necessárias para produzir 1 kit completo.
4. **Saldo Físico vs. Capacidade de Montagem:**
   - **Saldo Físico:** Quantidade de kits prontos na prateleira, embalados e prontos para despacho imediato.
   - **Capacidade de Montagem:** Cálculo inteligente em tempo real que diz: *"com as peças avulsas que temos hoje no estoque, conseguimos montar no máximo X kits"*. O limitador é sempre a peça mais escassa.
5. **Peça de Painel (`isPainel`):** No sistema, separamos o que é montado internamente no quadro elétrico (Painel) do que são ferragens externas, canaletas e suportes mecânicos (Peças Gerais). Isso permite que a bancada de elétrica trabalhe focada no que é de sua responsabilidade.

> 💡 **Regra de Ouro do Almoxarifado:** No ShelfApp, nenhuma peça entra ou sai do estoque sem que você informe a quantidade e o **MOTIVO**. Isso protege você e toda a equipe, permitindo saber exatamente quando uma peça foi consumida, se houve quebra ou qual nota fiscal deu origem ao saldo.

---

## 2. Acesso, Autenticação e Navegação Básica

### 2.1 Tela de Login (`/login`)
A porta de entrada do sistema. Garante que apenas colaboradores autorizados acessem os dados operacionais da empresa.
- **Como Entrar:** Insira seu e-mail corporativo cadastrado (ex: `operador@empresa.com`) e sua senha.
- **Visualizar Senha:** Clique no ícone de olho para checar se digitou a senha corretamente.
- **Alternar Tema Claro / Escuro:** No canto superior direito, há um botão com ícone de Sol/Lua. O Modo Escuro reduz significativamente o cansaço visual em tablets de bancada e ambientes de fábrica.

> ℹ️ **Perfis de Acesso (Segurança):** Existem dois perfis:
> - **Operador:** Realiza todas as rotinas normais de estoque, consulta, movimentação, montagem de kits e simulação.
> - **Administrador:** Tem acesso exclusivo à tela de Gestão de Usuários (`/users`) para criar novos logins e gerenciar permissões.

### 2.2 Barra Superior e Menu Lateral
- **Sidebar (Menu Lateral):** Permite saltar com um clique entre o Painel Principal, Almoxarifado, Kits, Fornecedores e Softwares.
- **Topbar (Barra Superior):** Exibe a trilha de navegação (onde você está), seu nome de usuário logado, perfil, alternador de tema e o botão de Sair (Logout).

---

## 3. Painel Principal (Dashboard) — O Termômetro da Fábrica

A página inicial (`/`) foi projetada para ser consultada logo no primeiro minuto do expediente. Em poucos segundos, qualquer operador ou gestor identifica a situação geral da fábrica.

### 3.1 Cards de Indicadores (KPIs Executivos)

| Indicador | O Que Significa | Ação Prática do Colaborador |
| :--- | :--- | :--- |
| **Total de Itens** | Variedade total de modelos de peças cadastrados no catálogo. | Clique no card para abrir o Almoxarifado completo. |
| **Baixo Estoque** | Peças que têm entre 1 e 10 unidades sobrando (Alerta Preventivo). | **Clique no card:** o almoxarifado abre filtrado direto nessas peças para providenciar compras. |
| **Estoque Zerado** | Peças com 0 unidades (totalmente esgotadas). Risco crítico de parada! | **Clique no card:** veja imediatamente quais componentes estão travando a produção. |
| **Fornecedores** | Quantidade de parceiros comerciais homologados e ativos. | Acesso rápido à cadeia de suprimentos. |

### 3.2 Monitor de Reposição & Estoque Crítico
Localizado logo abaixo dos cartões, é uma tabela inteligente que filtra exclusivamente os itens que exigem atenção imediata.
- **Filtro `[Todos]`:** Exibe itens zerados e itens com estoque baixo juntos.
- **Filtro `[Zerados]`:** Destaca peças totalmente esgotadas (badge vermelho). Prioridade máxima para compras!
- **Filtro `[Baixo Estoque]`:** Destaca peças entre 1 e 10 unidades (badge âmbar). Sinal amarelo para planejar compras antes que acabe.
- **Botão "Repor Estoque":** Ao lado de cada peça crítica, há um botão direto que leva para o Almoxarifado para registrar a chegada de mercadoria.
- **Paginação:** Exibe inicialmente 5 itens por página para manter a tela limpa, com opções para 10, 20 ou 50 itens.

> 💡 **Situação Ideal — "Estoque 100% Regularizado":** Quando nenhuma peça estiver zerada ou abaixo de 10 unidades, a tabela de alertas dá lugar a um card verde com a mensagem *"Estoque 100% Regularizado"*, sinalizando estabilidade total de suprimentos.

---

## 4. Almoxarifado & Estoque Unificado (`/items/estoque`)

Tela central de trabalho diário para conferência física, lançamento de compras e baixas operacionais.

### 4.1 Visão Integrada: Peças Avulsas e Kits no Mesmo Local
Você pode alternar a visualização da tabela através dos botões de categorias no topo:
- **`[Todos os Estoques]`:** Mostra todas as peças individuais somadas aos kits prontos (patrimônio global).
- **`[Peças & Componentes]`:** Apenas peças avulsas compradas de fornecedores externos.
- **`[Kits Pré-Montados]`:** Apenas kits montados internamente pela fábrica (marcados com tag roxa `[KIT]` e código `#K{id}`).

### 4.2 Guia Prático: Como Dar Entrada de Peças (Chegada de Compras)
*Exemplo prático: Chegou uma caixa com 50 disjuntores da Siemens com a Nota Fiscal 12345.*
1. **Localizar a Peça:** Digite o nome ou código da peça na barra de pesquisa.
2. **Abrir Movimentação:** Clique no botão com ícone de setas para cima/baixo (*Movimentar Estoque*).
3. **Selecionar Entrada:** Escolha a opção **Entrada** (destacada em verde).
4. **Digitar a Quantidade:** Informe `50`. O sistema mostra a prévia: *Saldo Atual: 10 un ➔ Novo Saldo: 60 un*.
5. **Preencher o Motivo:** Escreva: `Recebimento NF 12345 - Fornecedor Siemens`.
6. **Confirmar:** Clique em *Confirmar Movimentação*. O saldo atualiza na hora e a auditoria é gravada.

### 4.3 Guia Prático: Como Dar Saída de Peças (Descarte ou Manutenção)
*Exemplo prático: Um conector trincou na bancada de testes ou uma peça foi cedida avulsa.*
1. **Localizar a Peça:** Encontre o item na lista.
2. **Abrir Movimentação:** Clique em *Movimentar Estoque*.
3. **Selecionar Saída:** Escolha a opção **Saída** (destacada em vermelho).
4. **Digitar Quantidade:** Informe o valor a retirar.
5. **Justificar com Precisão:** Preencha o motivo real (ex: `Peça danificada na bancada - Descarte`).
6. **Confirmar:** Clique em Confirmar.

> 🛑 **Proteção Contra Saldo Negativo:** O sistema nunca permite dar saída em quantidade maior que o saldo existente. Se você tentar tirar 5 peças e houver apenas 3, a ação é bloqueada com aviso de *Saldo insuficiente*, evitando furos no estoque.

### 4.4 Cadastrar Nova Peça
1. Clique no botão azul **+ Novo Item** no topo da tela.
2. Preencha o **Nome do Item** de forma padronizada (ex: `Disjuntor Bipolar 20A Curva C - Schneider`).
3. Selecione o **Fornecedor Homologado**.
4. Adicione uma **Descrição Técnica** se necessário (código do fabricante, aplicação).
5. Clique em Salvar. O item inicia com saldo 0 un, pronto para receber sua primeira entrada.

### 4.5 Inativar vs. Excluir Peças
Se uma peça deixar de ser usada, **não a exclua**. Use o botão de **Alternar Status** (ícone de energia) para inativá-la. Dessa forma, ela não polui as compras atuais, mas todo o histórico de notas fiscais e montagens passadas é preservado.

### 4.6 Histórico e Auditoria Completa
Clicando no botão **Histórico de Auditoria** (no topo ou na linha de uma peça), uma janela detalhada apresenta:
- Data e Hora exatas do lançamento;
- Tipo de movimentação (Entrada ou Saída);
- Quantidade movimentada;
- Saldo Anterior ➔ Novo Saldo;
- Nome do Operador responsável;
- Motivo/justificativa digitada.

---

## 5. Linha de Manufatura & Gestão de Kits (`/items/kits`)

O coração produtivo do ShelfApp, projetado para transformar peças soltas em produtos finais montados.

### 5.1 Os Dois Indicadores Vitais do Kit
- **Estoque Físico (Prontos):** Quantos kits já estão fisicamente montados, conferidos e guardados na prateleira de expedição.
- **Capacidade de Montagem:** Quantos novos kits a fábrica consegue produzir agora com as peças avulsas do almoxarifado. O sistema verifica automaticamente todos os itens da receita e calcula o limite imposto pela peça mais escassa.

### 5.2 Guia Prático: Como Montar um Kit (Produzir)
*Exemplo: Produzir 3 unidades do "Kit Painel Solar 5kW".*
1. Localize o kit e confira se a *Capacidade de Montagem* é de pelo menos 3.
2. Clique no ícone de **Martelo (Montar Kit)**.
3. Digite `3`.
4. O sistema abre o **Breakdown de Peças**, mostrando exatamente quais peças serão consumidas do estoque e quanto vai sobrar de cada uma.
5. Digite a justificativa (ex: `Ordem de Produção #450 - Atendimento Pedido Cliente X`).
6. Clique em **Confirmar Montagem**.

> 💡 **Baixa Automática Atômica:** Você não precisa dar saída manual em cada um dos 15 componentes do kit! O ShelfApp debita todos os fios, disjuntores e parafusos automaticamente e incrementa +3 no saldo do kit pronto em uma única operação.

### 5.3 Guia Prático: Como Desmontar um Kit (Estorno / Reaproveitamento)
*Exemplo: Um pedido foi cancelado ou precisamos de peças urgentes presas dentro de um kit.*
1. Clique no ícone de **Caixa com Seta (Desmontar Kit)**.
2. Digite a quantidade a ser desfeita.
3. Informe o motivo: `Desmontagem para reaproveitamento de insumos em assistência técnica`.
4. Confirme: o saldo do kit diminui e 100% das peças da receita retornam para o almoxarifado como peças avulsas.

### 5.4 Ficha Técnica e Receita (BOM - Bill of Materials)
Clicando no ícone de **Engrenagem (Composição)**, você configura a receita do kit:
- **Adicionar Componente:** Escolha a peça no estoque e defina quantas unidades vão em cada kit.
- **Editar Quantidade:** Modifique o consumo caso a engenharia atualize o projeto.
- **Peça de Painel (`isPainel`):** Marque essa opção para componentes que ficam dentro do quadro elétrico.
- **Remover Componente:** Exclui uma peça obsoleta da receita.

### 5.5 Exportar Ficha Técnica em Planilha (CSV)
Clicando no ícone de **Planilha (Exportar CSV)** na linha do kit, o sistema gera instantaneamente uma planilha estruturada com a lista de materiais, dividida em dois blocos claros:
1. *Componentes Exclusivos do Painel* (relés, contatores, bornes);
2. *Componentes Gerais* (cabos de descida, prensa-cabos, caixas, suportes).

---

## 6. Simulador de Produção Multi-Kits & Planejamento de Demanda

Acessado pelo botão azul **Simular Montagem** no topo da tela de Kits. Ferramenta indispensável para o setor de **Compras, PCP e Vendas**.

### 6.1 Como Fazer uma Simulação Passo a Passo
1. **Abrir o Simulador:** Clique no botão *Simular Montagem*.
2. **Adicionar Kits à Fila:** Selecione os modelos e as quantidades que planeja fabricar (ex: 10 Kits Modelo A + 5 Kits Modelo B + 2 Kits Modelo C).
3. **Analisar os Indicadores:** O simulador calcula na hora:
   - **Total de SKUs:** Variedade total de peças exigidas;
   - **Peças Suficientes (Verde):** Quantos itens temos em estoque para cumprir o plano;
   - **Peças em Falta (Vermelho):** Quantos itens precisam ser comprados.
4. **Verificar a Tabela de Balanço:** Mostra cada insumo, saldo atual, consumo planejado e saldo pós-montagem estimado.

### 6.2 Modos de Foco Operacional
- **`[Todos os Componentes]`:** Visão macro de fábrica para compradores e gerentes.
- **`[⚡ Exclusivo: Apenas Painéis]`:** Foco dedicado na oficina de montagem de painéis elétricos, filtrando apenas bornes, relés e comandos.
- **`[📦 Peças Gerais / Não-Painel]`:** Foco em ferragens, canaletas, parafusos e periféricos mecânicos.

### 6.3 Exportação da Lista de Compras para o LibreOffice Calc
Clique no botão **Exportar Relatório CSV**. O arquivo gerado é 100% formatado para abrir no LibreOffice Calc ou Excel. O comprador só precisa filtrar as linhas com sinal negativo (`-`) para obter a cotação pronta para os fornecedores.

> ℹ️ **Segurança Total:** O simulador é um ambiente de testes matemáticos. Nenhuma peça do estoque real é debitada durante a simulação!

---

## 7. Gestão de Fornecedores (`/items/fornecedores`)

Cadastro centralizado dos parceiros comerciais e distribuidores de insumos.
- **Cadastrar:** Clique em `+ Novo Fornecedor`, informe a razão social ou nome fantasia e salve.
- **Editar:** Corrija dados cadastrais no ícone de lápis.
- **Inativar:** Desative fornecedores que não atendem mais a empresa sem quebrar o vínculo com notas e peças compradas no passado.

---

## 8. Softwares, Versões & CLPs (`/softwares`)

Prontuário técnico de automação das máquinas e kits entregues a clientes.

| Campo | O Que Preencher | Importância Prática no Suporte |
| :--- | :--- | :--- |
| **Nome do Software** | Nome do programa ou código de firmware (ex: `Firmware Estação Solar`). | Identifica o projeto exato. |
| **Versão Homologada** | Versão gravada no equipamento (ex: `v2.4.1`). | Fundamental: permite ao suporte saber exatamente o que está rodando em campo sem viajar até o cliente. |
| **Cliente** | Nome do cliente onde a máquina opera (ex: `Fazenda Boa Esperança`). | Facilita a busca em chamados de garantia e assistência técnica. |
| **Kit Vinculado** | Modelo do kit onde o software foi instalado. | Rastreabilidade entre produto físico e lógica digital. |
| **Tipo de Dispositivo** | CLP, IHM, Inversor, Servidor, Gateway IoT, etc. | Indica as ferramentas e cabos de conexão necessários para manutenção. |
| **Data de Instalação** | Data em que a instalação foi concluída. | Controle de prazo de garantia. |
| **Status Operacional** | *Operacional*, *Em Testes*, *Descontinuado* ou *Necessita Atualização*. | Saúde operacional do parque de equipamentos em campo. |

---

## 9. Gestão de Usuários & Segurança (`/users`)

Módulo restrito a usuários com perfil de **Administrador**.
- **Cadastrar Novo Usuário:** Informe Nome Completo, E-mail, Senha e Perfil (*Operador* ou *Administrador*).
- **Remoção Segura:** Exclua acessos de colaboradores desligados com trava que impede a exclusão da própria conta conectada.
- **Uso Individual:** Cada funcionário deve ter sua própria conta para garantir a confiabilidade dos registros de auditoria no almoxarifado.

---

## 10. Roteiros Práticos do Cotidiano (Guia Rápido)

### Cenário A: Chegada de Encomenda da Transportadora
1. Confira a quantidade física de caixas com o espelho da Nota Fiscal.
2. No ShelfApp, acesse **Estoque**.
3. Localize cada item, clique em **Movimentar**, escolha **Entrada**, informe a quantidade e anote o número da NF no motivo.
4. Verifique se o saldo na tela bate com o que foi guardado na prateleira.

### Cenário B: Montagem de 5 Kits para Expedição
1. Acesse **Kits** e confira se a *Capacidade de Montagem* é de pelo menos 5.
2. Clique no **Martelo (Montar Kit)**, digite 5 e preencha o número da Ordem de Produção.
3. Retire as peças físicas listadas nas gavetas do almoxarifado e leve para a bancada.
4. Conclua: o sistema debita as peças e adiciona +5 kits prontos para despacho.

### Cenário C: Cotação Comercial de Grande Porte (Ex: 40 Kits)
1. Abra o **Simulador de Montagem**.
2. Adicione 40 kits na fila.
3. Observe os itens com balanço negativo na tabela (sinal vermelho de falta).
4. Clique em **Exportar Relatório CSV** e envie a lista diretamente para o setor de compras.

### Cenário D: Peça Danificada na Bancada de Montagem
1. Localize a peça em **Estoque**.
2. Clique em **Movimentar**, escolha **Saída**, informe a quantidade quebrada e justifique: `Peça trincada durante encaixe mecânico - Descarte`.
3. O saldo é mantido 100% confiável sem distorções no inventário.

---

## 11. Perguntas Frequentes (FAQ)

**P: Busquei uma peça no estoque e ela não aparece. O que pode ser?**  
*R:* Confira se o campo de busca não contém espaços extras, se o filtro de categoria não está travado em "Kits Pré-Montados" e se o filtro de status não está em "Inativos". Selecione "Todos os Estoques" e "Todos os Níveis".

**P: Por que a Capacidade de Montagem de um kit está zerada se temos quase todas as peças?**  
*R:* A capacidade é calculada com base na peça mais escassa da receita. Se o kit precisa de 4 parafusos específicos e o estoque desses parafusos estiver com 0 unidades, o kit não pode ser montado. Abra a Composição (ícone de engrenagem) para identificar qual peça está travando a montagem.

**P: Posso desmontar um kit pronto para recuperar suas peças?**  
*R:* Sim! Basta clicar no ícone de desmontagem (caixa com seta). O kit pronto é estornado e todas as suas peças constituintes voltam integralmente para o saldo avulso do almoxarifado.

**P: Como alternar entre o Modo Claro e o Modo Escuro?**  
*R:* Clique no botão com ícone de Sol / Lua no canto superior direito da tela (ou na tela de login). A sua preferência fica salva automaticamente no navegador.

**P: Como abrir e editar esta documentação no LibreOffice?**  
*R:* Na pasta do projeto, você encontrará o arquivo `Documentacao_Pratica_ShelfApp.odt` (formato nativo do LibreOffice Writer) e `Documentacao_Pratica_ShelfApp.docx`. Basta clicar com o botão direito no arquivo e escolher **"Abrir com LibreOffice Writer"**. Você pode editar textos, incluir fotos da fábrica, alterar cabeçalhos ou exportar para PDF a qualquer momento!
