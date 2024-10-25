import { useState, useEffect } from 'react';
import { UserProps } from './globalInterface';
import Cookies from 'js-cookie';

export default function useLoggedUser() {
  const [userData, setUserData] = useState<UserProps>();
  useEffect(() => {
    setUserData(JSON.parse(Cookies.get('user_data') || '{}'));
  }, []);

  return userData;
}
