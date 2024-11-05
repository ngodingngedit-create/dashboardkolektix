import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import Config from '../Config';

type FetchResponse<T = any> = {
    status?: boolean;
    data?: T;
    error?: any;
    errors?: any;
    message?: string | string[];
    messages?: string | string[];
}

interface FetchOptions<T, D> extends AxiosRequestConfig<T> {
    before?: () => void;
    success?: (response: FetchResponse<D>, rawresponse?: AxiosResponse<T>) => void;
    error?: (error: any) => void;
    complete?: () => void;
}

async function fetch<ReqType = { [key: string]: string | Blob }, ResType = any>(options: FetchOptions<ReqType, ResType>) {
    const { before, success, error, complete, data, ...axiosOptions } = options;

    if (before) before();

    try {
        const formData = new FormData();
        for (const val in data) {
            if (data[val]) formData.append(val, data[val] as (string | Blob));
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
    } finally {
        if (complete) complete();
    }
}

export default fetch;
