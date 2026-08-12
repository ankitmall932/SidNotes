import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

interface RefreshResponse
{
    accessToken: string;
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig
{
    _retry?: boolean;
}

const api = axios.create( {
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
} );

api.interceptors.request.use(
    ( config: InternalAxiosRequestConfig ) =>
    {
        const token = localStorage.getItem( "accessToken" );
        if ( token )
        {
            config.headers.Authorization = `Bearer ${ token }`;
        }
        return config;
    }
);

api.interceptors.response.use(
    ( res ) => res,
    async ( err: AxiosError ) =>
    {
        const original = err.config as CustomAxiosRequestConfig | undefined;
        if (
            err.response?.status === 401 &&
            original &&
            !original._retry &&
            !original.url?.includes( "/auth/refresh" )
        )
        {
            original._retry = true;
            try
            {
                const res = await api.post<RefreshResponse>( "/auth/refresh" );
                const newAccessToken = res.data.accessToken;
                localStorage.setItem( "accessToken", newAccessToken );
                original.headers.Authorization = `Bearer ${ newAccessToken }`;
                return api( original );
            } catch ( error )
            {
                localStorage.removeItem( "accessToken" );
                return Promise.reject( error );
            }
        }
        return Promise.reject( err );
    }
);

export default api;