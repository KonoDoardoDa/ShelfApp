export interface User {
  id: number;
  nome: string;
  email: string;
  role: "Admin" | "Operador" | "Visualizador" | string;
  ativo: boolean;
  dataCriacao: string;
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface RegisterCredentials {
  nome: string;
  email: string;
  senha: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  usuario: User;
  expiresAt: string;
}
