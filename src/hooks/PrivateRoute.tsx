import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const PrivateRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ✅ ตรวจสอบว่า Token หมดอายุหรือยัง
  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp * 1000 < Date.now(); // ❌ หมดอายุแล้ว
    } catch (error) {
      return true; // ❌ ถอดรหัสไม่ได้
    }
  };

  // ❌ ถ้าไม่มี Token หรือหมดอายุ → Redirect ไปหน้า Login
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  // ❌ ถ้า Role ไม่อยู่ใน allowedRoles → Redirect ไป Home
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default PrivateRoute;
