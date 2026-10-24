export interface Kit {
  id: number;
  nome: string;
  ativo?: boolean;
}

export interface CreateKitDto {
  nome: string;
  ativo?: boolean;
}

export interface UpdateKitDto {
  id: number;
  nome: string;
  ativo?: boolean;
}

export interface KitItem {
  kitId: number;
  itemId: number;
  quantidade: number;
  isPainel: boolean;
}

export interface KitItemDetail {
  itemId: number;
  itemNome?: string | null;
  quantidade: number;
  isPainel: boolean;
}

export interface KitDetails {
  id: number;
  nome: string;
  ativo?: boolean;
  items: KitItemDetail[];
}

export interface CreateKitItemDto {
  kitId: number;
  itemId: number;
  quantidade: number;
  isPainel: boolean;
}

export interface UpdateKitItemDto {
  kitId: number;
  itemId: number;
  quantidade: number;
  isPainel: boolean;
}
