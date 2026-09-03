import axios, {
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { getSession, signOut } from "next-auth/react";
import { safeParse, type ZodType, z } from "zod";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

declare module "axios" {
  export interface AxiosRequestConfig {
    responseSchema?: ZodType;
  }
}

export const publicApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const privateApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

publicApi.interceptors.response.use((response: AxiosResponse) => {
  const schema = response.config.responseSchema;
  if (schema) {
    const result = schema.safeParse(response.data);
    if (!result.success) {
      console.error(
        `[Zod Error] API: ${response.config.url}`,
        z.prettifyError(result.error),
      );
      return Promise.reject(new Error("Wrong data format from server"));
    }
    response.data = result.data;
    return response;
  }
  return response;
});

privateApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const session = await getSession();
    if (!session || !session.accessToken) {
      throw new Error("UNAUTHORIZED");
    }
    if (session.error === "RefreshAccessTokenError") {
      await signOut({ callbackUrl: "/login" });
      throw new Error("SESSION_EXPIRED");
    }
    config.headers.set("Authorization", `Bearer ${session.accessToken}`);
    config.headers.setContentType("application/json");

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

privateApi.interceptors.response.use(
  (response: AxiosResponse) => {
    const schema = response.config.responseSchema;
    if (schema) {
      const result = safeParse(schema, response.data);
      if (result.success) {
        response.data = result.data;
        return response;
      } else {
        console.error(
          `[Zod Error] API: ${response.config.url}`,
          z.prettifyError(result.error),
        );
        return Promise.reject(new Error("Wrong data format from server"));
      }
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (typeof window !== "undefined") {
        await signOut({ callbackUrl: "/login" });
      }
    }
    return Promise.reject(error);
  },
);
