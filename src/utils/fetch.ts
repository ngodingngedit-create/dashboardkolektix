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

        const response = await axios({
            ...axiosOptions,
            url: `${Config.wsUrl}${axiosOptions.url}`,
            data: data,
            headers: {
                'Authorization': `Bearer ${Cookies.get('token')}`,
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
    } catch (err) {
        if (error) error(err);
        if (invalid && isAxiosError(err)) invalid(err?.response?.data.invalid)
    } finally {
        if (complete) complete();
    }
}

export default fetch;
