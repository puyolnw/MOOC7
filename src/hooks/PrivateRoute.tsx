import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ❌ ถ้าไม่มี Token ให้ไปหน้า Login
  if (!token) return <Navigate to="/login" />;

  // ❌ ถ้า Role ไม่ตรงกับ allowedRoles ให้ Redirect ไป Home
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return <Outlet />;
};

export default PrivateRoute;
