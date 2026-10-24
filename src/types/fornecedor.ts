export interface Fornecedor {
  id: number;
  nome: string;
  ativo?: boolean;
}

export interface CreateFornecedorDto {
  nome: string;
  ativo?: boolean;
}

export interface UpdateFornecedorDto {
  id: number;
  nome: string;
  ativo?: boolean;
}
