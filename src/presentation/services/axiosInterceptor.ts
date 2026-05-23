import axios, { AxiosError, AxiosHeaders, AxiosInstance } from "axios";
import { tokenManager } from "./tokenManager";

export function setupAxiosInterceptors(axiosInstance: AxiosInstance): void {
        axiosInstance.interceptors.request.use(
                (config) => {
                        const token = tokenManager.getToken();
                        const headers = AxiosHeaders.from(config.headers);
                        const existingAuth = headers.get('Authorization') ?? headers.get('authorization');

                        if (token && !existingAuth) {
                                headers.set('Authorization', `Bearer ${token}`);
                        }

                        if ((config.method ?? 'get').toLowerCase() !== 'get' && !headers.get('Content-Type')) {
                                headers.set('Content-Type', 'application/json');
                        }

                        config.headers = headers as any;
                        return config;
                },
                (error) => Promise.reject(error)
        );

    axiosInstance.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
            if (error.response?.status === 401) {
                console.error('401 recibido en Axios (sesión no cerrada por ahora):', {
                    url: error.config?.url,
                    method: error.config?.method,
                    message: error.message,
                });
            }

            return Promise.reject(error);
        }
    );
}


export const createAxiosInstance = (baseURL: string): AxiosInstance => {
    const instance = axios.create({
        baseURL,
        timeout: 10000,
    });

    setupAxiosInterceptors(instance);
    return instance;
};
