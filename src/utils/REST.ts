import Axios from 'axios';
import Cookies from 'js-cookie';
import router from 'next/router';
import Config from '../Config';

export const Post = async (url: string, params: any) => {
  const token = Cookies.get('token');

  if (!!token) Axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  return new Promise((resolve, reject) => {
    Axios.post(`${Config.wsUrl}${url}`, JSON.stringify(params), {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then(async (res: any) => {
        if (res.data !== undefined) {
          resolve(res.data);
        }
      })
      .catch((err: any) => {
        reject(err);
      });
  });
};

export const Get = async (url: string, params: any) => {
  let stringParams: string = '';
  const token = Cookies.get('token');

  if (!!token) Axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  if (Object.keys(params).length !== 0) {
    let paramsArr: string[] = [];
    Object.keys(params).forEach((key) => {
      paramsArr.push(`${key}=${params[key]}`);
    });

    let paramJoin = paramsArr.join('&');

    stringParams = `?${paramJoin}`;
  }

  return new Promise((resolve, reject) => {
    const token = Cookies.get('token');

    if (!!token) Axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    Axios.get(`${Config.wsUrl}${url}${stringParams}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then(async (res: any) => {
        if (res.data !== undefined) {
          resolve(res.data);
        }
      })
      .catch((err: any) => {
        if (err.response.status == 401) {
          Cookies.remove('token');
          Cookies.remove('user_data');
          setTimeout(() => {
            router.push('/login');
          }, 1000);
        }

        reject(err);
      });
  });
};

export const Put = async (url: string, params: any) => {
  const token = Cookies.get('token');

  if (!!token) Axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  return new Promise((resolve, reject) => {
    Axios.put(`${Config.wsUrl}${url}`, JSON.stringify(params), {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then(async (res: any) => {
        if (res.data !== undefined) {
          resolve(res.data);
        }
      })
      .catch((err: any) => {
        reject(err);
      });
  });
};

export const Delete = async (url: string, params: any) => {
  let stringParams: string = '';
  const token = Cookies.get('token');

  if (!!token) Axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  if (Object.keys(params).length !== 0) {
    let paramsArr: string[] = [];
    Object.keys(params).forEach((key) => {
      paramsArr.push(`${key}=${params[key]}`);
    });

    let paramJoin = paramsArr.join('&');

    stringParams = `?${paramJoin}`;
  }

  return new Promise((resolve, reject) => {
    Axios.delete(`${Config.wsUrl}${url}${stringParams}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then(async (res: any) => {
        if (res.data !== undefined) {
          resolve(res.data);
        }
      })
      .catch((err: any) => {
        reject(err);
      });
  });
};

export function isJson(str: any) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return isNaN(str);
}
