import { useState, useEffect } from 'react';
import { UserProps } from './globalInterface';
import Cookies from 'js-cookie';

export default function useLoggedUser() {
  const [userData, setUserData] = useState<UserProps>();
  useEffect(() => {
    const bookmarked = JSON.parse(Cookies.get('bookmarked') || '[]');
    const user = JSON.parse(Cookies.get('user_data') || '{}')
    setUserData({...user, bookmarked: bookmarked});
  }, []);

  return userData;
}
