interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
  tokenKey: string;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

interface ApiError {
  message: string;
  status: number;
  data?: any;
}

type RequestInterceptor = (config: RequestInit & { url: string }) => RequestInit & { url: string };
type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

const defaultConfig: ApiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  tokenKey: 'shieldnet_auth_token',
};

class ApiClient {
  private config: ApiConfig;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(this.config.tokenKey);
    } catch {
      return null;
    }
  }

  setToken(token: string | null): void {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem(this.config.tokenKey, token);
    } else {
      localStorage.removeItem(this.config.tokenKey);
    }
  }

  getTokenKey(): string {
    return this.config.tokenKey;
  }

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: any,
    options: RequestInit & { signal?: AbortSignal; params?: Record<string, string> } = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const url = new URL(`${this.config.baseURL}${path}`, window.location.origin);

    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const headers: Record<string, string> = {
      ...this.config.headers,
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (body instanceof FormData) {
      delete headers['Content-Type'];
    }

    let requestConfig: RequestInit & { url: string } = {
      url: url.toString(),
      method,
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      signal: options.signal,
    };

    for (const interceptor of this.requestInterceptors) {
      requestConfig = interceptor(requestConfig);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      let response = await fetch(requestConfig.url, {
        method: requestConfig.method,
        headers: requestConfig.headers,
        body: requestConfig.body,
        signal: requestConfig.signal || controller.signal,
      });

      for (const interceptor of this.responseInterceptors) {
        response = await interceptor(response);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const error: ApiError = {
          message: errorData?.message || errorData?.error || `HTTP ${response.status}`,
          status: response.status,
          data: errorData,
        };
        throw error;
      }

      const data = await response.json();

      return {
        data: data as T,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw { message: 'Request timeout', status: 408 } as ApiError;
      }
      if (err.status) {
        if (err.status === 401) {
          this.setToken(null);
        }
        throw err;
      }
      throw { message: err.message || 'Network error', status: 0 } as ApiError;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async get<T>(path: string, options?: RequestInit & { params?: Record<string, string> }): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, undefined, options);
  }

  async post<T>(path: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, body, options);
  }

  async put<T>(path: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, body, options);
  }

  async patch<T>(path: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', path, body, options);
  }

  async delete<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path, undefined, options);
  }
}

export const apiClient = new ApiClient();

export type { ApiConfig, ApiResponse, ApiError, RequestInterceptor, ResponseInterceptor };
export { ApiClient };
