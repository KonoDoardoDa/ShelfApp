export interface Software {
  id: number;
  nomeSoftware: string;
  versao: string;
  cliente: string;
  kitId?: number | null;
  nomeKit?: string | null;
  tipoDispositivo: string; // 'CLP' | 'Inversor' | 'IHM' | 'Servo' | 'Outro'
  dataInstalacao: string; // ISO date-time string
  status: string; // 'Operacional' | 'Em Testes' | 'Aguardando Homologação' | 'Descontinuado'
  observacoes?: string | null;
  dataCriacao?: string;
}

export interface CreateSoftwareDto {
  nomeSoftware: string;
  versao: string;
  cliente: string;
  kitId?: number | null;
  nomeKit?: string | null;
  tipoDispositivo: string;
  dataInstalacao: string;
  status: string;
  observacoes?: string | null;
}

export interface UpdateSoftwareDto {
  id: number;
  nomeSoftware: string;
  versao: string;
  cliente: string;
  kitId?: number | null;
  nomeKit?: string | null;
  tipoDispositivo: string;
  dataInstalacao: string;
  status: string;
  observacoes?: string | null;
}
