import axios, { AxiosError } from "axios";

const baseURL = import.meta.env.VITE_API_URL || "https://localhost:7024/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request Interceptor para injetar JWT Bearer Token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("shelfapp_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor para capturar 401 Unauthorized e redirecionar ao login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/Auth/Login")
    ) {
      localStorage.removeItem("shelfapp_token");
      localStorage.removeItem("shelfapp_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ message?: string; title?: string; errors?: Record<string, string[]> } | string>;
    if (err.response?.data) {
      if (typeof err.response.data === "string") {
        return err.response.data;
      }
      if (err.response.data.message) {
        return err.response.data.message;
      }
      if (err.response.data.title) {
        return err.response.data.title;
      }
    }
    if (err.code === "ECONNABORTED") {
      return "Tempo de requisição esgotado. Verifique se a ShelfApi está em execução.";
    }
    if (err.code === "ERR_NETWORK") {
      return "Não foi possível conectar à ShelfApi. Verifique se o backend está rodando em " + baseURL;
    }
    return err.message || "Erro na comunicação com a API.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Ocorreu um erro desconhecido.";
}

export default api;