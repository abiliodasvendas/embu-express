import { apiClient } from "./client";

export const authApi = {
  register: (data: any): Promise<any> =>
    apiClient.post(`/auth/register`, data).then(res => res.data),
};
