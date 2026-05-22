import apiClient from "./client";

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: string;
  email: string;
  name: string;
}

export interface MessageResponse {
  message: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    return data;
  },

  register: async (
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>("/auth/register", {
      name,
      email,
      password,
    });
    return data;
  },

  forgotPassword: async (email: string): Promise<MessageResponse> => {
    const { data } = await apiClient.post<MessageResponse>(
      "/auth/forgot-password",
      { email }
    );
    return data;
  },

  resetPassword: async (
    token: string,
    newPassword: string
  ): Promise<MessageResponse> => {
    const { data } = await apiClient.post<MessageResponse>(
      "/auth/reset-password",
      { token, newPassword }
    );
    return data;
  },
};
