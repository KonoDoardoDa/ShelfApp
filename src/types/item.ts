export interface Item {
  id: number;
  nome: string;
  fornecedorId: number;
  descricao?: string | null;
  quantidadeEstoque?: number;
}

export interface CreateItemDto {
  nome: string;
  fornecedorId: number;
  descricao?: string | null;
}

export interface UpdateItemDto {
  id: number;
  nome: string;
  fornecedorId: number;
  descricao?: string | null;
}

export interface MovimentarEstoqueDto {
  itemId: number;
  tipo: "Entrada" | "Saida";
  quantidade: number;
  motivo?: string | null;
  usuarioNome?: string | null;
}

export interface MovimentacaoResponse {
  itemId: number;
  novoSaldo: number;
  tipo: string;
  quantidade: number;
  motivo?: string | null;
  usuarioNome?: string;
  message: string;
}

export interface MovimentacaoHistorico {
  id: number;
  itemId: number;
  nomeItem: string;
  tipo: "Entrada" | "Saida";
  quantidade: number;
  saldoAnterior: number;
  saldoPosterior: number;
  motivo?: string | null;
  usuarioId?: number | null;
  usuarioNome: string;
  dataMovimentacao: string;
}
