export interface Fornecedor {
  id: number;
  nome: string;
}

export interface CreateFornecedorDto {
  nome: string;
}

export interface UpdateFornecedorDto {
  id: number;
  nome: string;
}
