import axios, { AxiosRequestConfig, AxiosResponse, isAxiosError } from 'axios';
import Cookies from 'js-cookie';
import Config from '../Config';

type FetchResponse<T = any> = {
    status?: boolean;
    data?: T;
    error?: any;
    errors?: any;
    message?: string | string[];
    messages?: string | string[];
    [key: string]: any;
}

interface FetchOptions<T, D> extends AxiosRequestConfig<T> {
    before?: () => void;
    success?: (response: FetchResponse<D>, rawresponse?: AxiosResponse<T>) => void;
    error?: (error: any) => void;
    complete?: () => void;
    invalid?: (data: { [key: string]: string[] }) => void;
    nofilter?: boolean;
}

async function fetch<ReqType = { [key: string]: string | Blob }, ResType = any>(options: FetchOptions<ReqType, ResType>) {
    const { before, success, error, complete, invalid, data, nofilter, ...axiosOptions } = options;

    if (before) before();

    try {
        const formData = new FormData();
        for (const val in data) {
            if (nofilter) {
                formData.append(val, !(data[val] instanceof Blob) ? String(data[val]) : data[val]);
            } else {
                if (data[val]) formData.append(val, data[val] as (string | Blob));
            }
        }

        const token = Cookies.get('token');
        
        // Validasi bearer token sebelum melakukan request
        if (!token) {
            throw new Error('Bearer token tidak ditemukan. Silakan login kembali.');
        }

        const response = await axios({
            ...axiosOptions,
            url: `${Config.wsUrl}${axiosOptions.url}`,
            data: data,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': axiosOptions.method == 'PUT' ? 'application/json' : 'multipart/form-data',
                ...options.headers
            }
        });

        if (success && String(response.status).startsWith('2')) {
            success(response.data, response);
        } else {
            throw response;
        }
        return response.data;
    } catch (err: any) {
        // Handle 401 Unauthorized - token invalid atau expired
        if (isAxiosError(err) && err.response?.status === 401) {
            // Hapus token dan user data
            Cookies.remove('token');
            Cookies.remove('user_data');
            
            // Redirect ke login
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            
            if (error) error({ message: 'Sesi Anda telah berakhir. Silakan login kembali.' });
            return;
        }
        
        if (error) error(err);
        if (invalid && isAxiosError(err)) invalid(err?.response?.data.invalid)
    } finally {
        if (complete) complete();
    }
}

export default fetch;
