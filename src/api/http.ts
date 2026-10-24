import axios, { AxiosError } from "axios";

const baseURL = import.meta.env.VITE_API_URL || "/api";

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
        // Evita exibir stack traces brutas do servidor na interface
        if (err.response.data.includes("Exception") || err.response.data.includes("at Microsoft.AspNetCore")) {
          if (err.response.data.includes("Duplicate entry")) {
            return "Este registro já existe no sistema (duplicidade detectada).";
          }
          return "Ocorreu um erro interno ao processar a solicitação no servidor.";
        }
        return err.response.data;
      }
      if (err.response.data.message) {
        return err.response.data.message;
      }
      if (err.response.data.errors) {
        const firstErrorList = Object.values(err.response.data.errors)[0];
        if (firstErrorList && firstErrorList.length > 0) {
          const firstMsg = firstErrorList[0];
          if (firstMsg.includes("could not be converted") || firstMsg.includes("is not valid")) {
            return "O valor numérico informado excede o limite permitido.";
          }
          return firstMsg;
        }
      }
      if (err.response.data.title) {
        if (err.response.data.title === "One or more validation errors occurred.") {
          return "Um ou mais campos possuem valores inválidos. Verifique os dados informados.";
        }
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