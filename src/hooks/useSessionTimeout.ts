import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const useSessionTimeout = () => {
  const navigate = useNavigate();
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const sessionDuration = 10 * 60 * 1000; // 10 นาที
  const warningTime = 1 * 60 * 1000; // แจ้งเตือนก่อนหมดอายุ 1 นาที

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setSessionTimeout(sessionDuration);
    }
  }, []);

  // ✅ ตั้งค่า Timeout และแจ้งเตือนก่อนหมดอายุ
  const setSessionTimeout = (expiresIn: number) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  
    const warningTimeout = setTimeout(() => {
      toast.warn("เซสชันของคุณกำลังจะหมดอายุใน 1 นาที", {
        position: "top-center",
        autoClose: 5000,
      });
    }, expiresIn - warningTime);
  
    const logoutTimeout = setTimeout(() => {
      logoutUser();
    }, expiresIn);
  
    setTimeoutId(logoutTimeout);
  
    return () => {
      clearTimeout(warningTimeout);
      clearTimeout(logoutTimeout);
    };
  };
  

  // ✅ รีเซ็ต Timeout เมื่อมีการใช้งาน
  const resetSessionTimeout = () => {
    setSessionTimeout(sessionDuration);
  };

  // ✅ Logout เมื่อ Timeout หมดอายุ
  const logoutUser = () => {
    toast.error("เซสชันของคุณหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่", {
      position: "top-center",
      autoClose: 5000,
    });

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setTimeout(() => {
      navigate("/login");
    }, 3000); // ✅ รอ 3 วินาทีให้ผู้ใช้เห็นแจ้งเตือนก่อน Redirect
  };

  return { resetSessionTimeout };
};

export default useSessionTimeout;
