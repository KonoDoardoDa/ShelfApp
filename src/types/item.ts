export interface Item {
  id: number;
  nome: string;
  fornecedorId: number;
  descricao?: string | null;
  quantidadeEstoque?: number;
  ativo?: boolean;
}

export interface CreateItemDto {
  nome: string;
  fornecedorId: number;
  descricao?: string | null;
  ativo?: boolean;
}

export interface UpdateItemDto {
  id: number;
  nome: string;
  fornecedorId: number;
  descricao?: string | null;
  ativo?: boolean;
}

export interface MovimentarEstoqueDto {
  itemId: number;
  tipo: "Entrada" | "Saida";
  quantidade: number;
  motivo?: string | null;
  notaFiscal?: string | null;
  usuarioNome?: string | null;
}

export interface MovimentacaoResponse {
  itemId: number;
  novoSaldo: number;
  tipo: string;
  quantidade: number;
  motivo?: string | null;
  notaFiscal?: string | null;
  usuarioNome?: string;
  message: string;
}

export interface MovimentacaoHistorico {
  id: number;
  itemId: number;
  nomeItem: string;
  fornecedorNome?: string | null;
  tipo: "Entrada" | "Saida";
  quantidade: number;
  saldoAnterior: number;
  saldoPosterior: number;
  motivo?: string | null;
  notaFiscal?: string | null;
  usuarioId?: number | null;
  usuarioNome: string;
  dataMovimentacao: string;
}

export interface ImportarItemLoteDto {
  nome: string;
  codigoReferencia?: string;
  fornecedorId?: number;
  quantidade: number;
  descricao?: string;
}

export interface ImportarLoteRequestDto {
  notaFiscal?: string;
  fornecedorIdPadrao?: number;
  novoFornecedorNome?: string;
  usuarioNome?: string;
  itens: ImportarItemLoteDto[];
}

export interface ImportarLoteResultadoDto {
  itensCriados: number;
  itensAtualizados: number;
  totalQuantidadeMovimentada: number;
  fornecedorId?: number;
  fornecedorNome: string;
  message: string;
}
