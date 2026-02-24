import { sessionManager } from "@/services/sessionManager";
import axios, { AxiosInstance } from "axios";

// Environment variable for API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

let cachedToken: string | null = null;

// Listen to session changes to update cached token
sessionManager.onAuthStateChange((_event, session) => {
  cachedToken = session?.access_token ?? null;
});

async function getAccessToken() {
  const { data } = await sessionManager.getSession();
  cachedToken = data.session?.access_token ?? null;
  return cachedToken;
}

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers = (config.headers || {}) as any;
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 403 (Forbidden) logic - immediate sign out
    if (error.response && error.response.status === 403) {
      sessionManager.signOut().catch(() => { });
      // const message = handleApiError(error);
      // (error as AxiosError & { userMessage?: string }).userMessage = message;
      return Promise.reject(error);
    }

    // 401 (Unauthorized) Logic
    if (error.response && error.response.status === 401) {
      // Ignora interceptação global de logout se for na própria tela de login ou refresh
      if (originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/refresh")) {
        return Promise.reject(error);
      }

      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Attempt to refresh
          const { success } = await sessionManager.refreshToken();

          if (success) {
            const { data } = await sessionManager.getSession();
            const newToken = data.session?.access_token;

            if (newToken) {
              originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
              return api(originalRequest);
            }
          }
        } catch (refreshErr) {
          // Refresh failed
        }
      }

      // Logout se falhar o refresh
      sessionManager.signOut().catch(() => { });
      console.warn('[ApiClient] 401 Interceptor: Sessão revogada ou não recuperável. Usuário deslogado.');
    }

    return Promise.reject(error);
  }
);

export const apiClient = api;
export default api;
