import axios, { AxiosRequestConfig, Method } from "axios";
import { env } from "../config/env.config";

const apiClient = axios.create({
  baseURL: env.CORE_PLATFORM_BACKEND_URL,
  timeout: 15000,
});

type ApiRequestOptions<TData = unknown> = {
  endpoint: string;
  method?: Method;
  data?: TData;
  params?: Record<string, any>;
  headers?: Record<string, string>;
};

export async function coreApiRequest<TResponse = any, TData = any>({
  endpoint,
  method = "GET",
  data,
  params,
  headers,
}: ApiRequestOptions<TData>): Promise<TResponse> {
  try {
    const config: AxiosRequestConfig = {
      url: endpoint,
      method,
      data,
      params,
      headers,
    };

    const response = await apiClient.request<TResponse>(config);
    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      (typeof error === "string" ? error : JSON.stringify(error)) ||
      "API request failed";

    throw new Error(message);
  }
}
