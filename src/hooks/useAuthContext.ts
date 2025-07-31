import { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  role_id: number;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const useAuthContext = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // โหลดข้อมูลจาก localStorage เมื่อ component mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser({ ...userData, token: storedToken });
        setToken(storedToken);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        // ถ้า parse ไม่ได้ให้ล้างข้อมูล
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (userData: User, userToken: string) => {
    const userWithToken = { ...userData, token: userToken };
    setUser(userWithToken);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = !!token && !!user;

  return {
    user,
    token,
    login,
    logout,
    isAuthenticated
  };
};

export default useAuthContext;
