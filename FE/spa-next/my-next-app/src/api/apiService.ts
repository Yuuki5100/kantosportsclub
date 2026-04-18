import apiClient from "./apiClient";

export const apiService = {
  get: async <T>(url: string, params?: object): Promise<T> => {
    const response = await apiClient.get<T>(url, { params });
    return response.data;
  },

  post: async <T>(url: string, data: object): Promise<T> => {
    const response = await apiClient.post<T>(url, data);
    return response.data;
  },

  put: async <T>(url: string, data: object): Promise<T> => {
    const response = await apiClient.put<T>(url, data);
    return response.data;
  },

  delete: async <T>(url: string): Promise<T> => {
    const response = await apiClient.delete<T>(url);
    return response.data;
  },
};
