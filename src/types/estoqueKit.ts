export interface KitItemDisponibilidade {
  itemId: number;
  nomeItem: string;
  fornecedorId?: number | null;
  nomeFornecedor?: string;
  quantidadeNecessaria: number;
  saldoEstoqueItem: number;
  isPainel: boolean;
  montagensPossiveis: number;
}

export interface KitSaldo {
  kitId: number;
  nomeKit: string;
  saldoFisico: number;
  capacidadeMontagem: number;
  totalItensComposicao: number;
  itens: KitItemDisponibilidade[];
}

export interface MontarKitDto {
  kitId: number;
  quantidade: number;
  motivo?: string | null;
  usuarioNome?: string;
}

export interface DesmontarKitDto {
  kitId: number;
  quantidade: number;
  motivo?: string | null;
  usuarioNome?: string;
}

export interface MovimentarKitManualDto {
  kitId: number;
  tipo: "Entrada" | "Saida";
  quantidade: number;
  motivo?: string | null;
  usuarioNome?: string;
}

export interface MovimentacaoKitDetalhe {
  id: number;
  kitId: number;
  nomeKit: string;
  tipo: string;
  quantidade: number;
  saldoAnterior: number;
  saldoPosterior: number;
  motivo?: string | null;
  usuarioId?: number | null;
  usuarioNome: string;
  dataMovimentacao: string;
}

export interface ResultadoOperacaoKit {
  kitId: number;
  nomeKit: string;
  novoSaldoKit: number;
  mensagem: string;
}

export interface ItemSimulacaoInput {
  kitId: number;
  quantidade: number;
}

export interface ItemSimulacaoKitOrigem {
  kitId: number;
  nomeKit: string;
  quantidadeKit: number;
  quantidadePorKit: number;
  subtotalNecessario: number;
  isPainel?: boolean;
}

export interface ItemSimulacaoResultado {
  itemId: number;
  nomeItem: string;
  fornecedorId?: number | null;
  nomeFornecedor?: string;
  quantidadeTotalNecessaria: number;
  saldoEstoqueItem: number;
  saldoAposMontagem: number;
  faltaEstoque: number;
  suficiente: boolean;
  isPainel: boolean;
  kitsOrigem: ItemSimulacaoKitOrigem[];
}

export interface SimulacaoProducaoResultado {
  totalKitsSolicitados: number;
  totalTiposKits: number;
  totalComponentesDistintos: number;
  totalComponentesAtendidos: number;
  totalComponentesFaltantes: number;
  producaoTotalmenteViavel: boolean;
  itens: ItemSimulacaoResultado[];
}

