import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

interface User {
  first_name?: string;
  last_name?: string;
  name?: string;
  username?: string;
  email?: string;
  role?: string;
}

// 🔧 Custom Hook สำหรับ Authentication ใน Header
export const useAuthHeader = () => {
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // ✅ ฟังก์ชันตรวจสอบ Token หมดอายุ
  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      console.error('JWT decode error:', error);
      return true;
    }
  };

  // ✅ ฟังก์ชันตรวจสอบ Authentication Status
  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    
    // ❌ ถ้าไม่มี token หรือ user data
    if (!token || !userJson) {
      setRole(null);
      setUserName("");
      setIsAuthenticated(false);
      return;
    }
    
    // ❌ ถ้า token หมดอายุ
    if (isTokenExpired(token)) {
      console.warn('Token expired in header, clearing auth data');
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setRole(null);
      setUserName("");
      setIsAuthenticated(false);
      
      // แสดงข้อความเตือน (แต่ไม่ทุกครั้ง เพื่อไม่ให้รำคาญ)
      const lastWarning = localStorage.getItem('lastTokenExpiredWarning');
      const now = Date.now();
      if (!lastWarning || now - parseInt(lastWarning) > 300000) { // 5 นาที
        toast.warn('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่', {
          position: 'top-center',
          autoClose: 5000,
        });
        localStorage.setItem('lastTokenExpiredWarning', now.toString());
      }
      return;
    }
    
    // ✅ Token ยังใช้ได้ - แสดงข้อมูล user
    try {
      const user: User = JSON.parse(userJson);
      setRole(user.role || null);
      setIsAuthenticated(true);
      
      // Set user name based on available fields
      if (user.first_name && user.last_name) {
        setUserName(`${user.first_name} ${user.last_name}`);
      } else if (user.name) {
        setUserName(user.name);
      } else if (user.username) {
        setUserName(user.username);
      } else if (user.email) {
        // Use email before @ symbol as name
        const emailName = user.email.split("@")[0];
        setUserName(emailName);
      } else {
        setUserName("ผู้ใช้");
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setRole(null);
      setUserName("");
      setIsAuthenticated(false);
    }
  };

  // ✅ ตรวจสอบ Auth Status เมื่อ component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // ✅ ตรวจสอบ Auth Status ทุกครั้งที่ user โต้ตอบกับหน้าเว็บ
  useEffect(() => {
    const handleFocus = () => {
      checkAuthStatus();
    };
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAuthStatus();
      }
    };
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        checkAuthStatus();
      }
    };
    
    // เพิ่ม Event Listeners
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);
    
    // ตรวจสอบทุก 5 นาที (ลดความถี่เพื่อประสิทธิภาพ)
    const intervalId = setInterval(checkAuthStatus, 300000);
    
    // Cleanup
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  // ✅ Manual refresh function
  const refreshAuthStatus = () => {
    checkAuthStatus();
  };

  return {
    role,
    userName,
    isAuthenticated,
    refreshAuthStatus,
  };
};

export default useAuthHeader;
