import api from "../api/http";
import type { User, LoginCredentials, RegisterCredentials, AuthResponse } from "../types/auth";

const TOKEN_KEY = "shelfapp_token";
const USER_KEY = "shelfapp_user";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/Auth/Login", credentials);
    if (response.data.token) {
      this.setSession(response.data.token, response.data.usuario);
    }
    return response.data;
  },

  async register(data: RegisterCredentials): Promise<User> {
    const response = await api.post<User>("/Auth/Register", data);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>("/Auth/Me");
    return response.data;
  },

  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>("/Auth/Users");
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/Auth/Users/${id}`);
  },

  setSession(token: string, user: User) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredUser(): User | null {
    const data = localStorage.getItem(USER_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data) as User;
    } catch {
      return null;
    }
  },
};
