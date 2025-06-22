import { toast } from "react-toastify";
import axios from "axios"; // ✅ Import Axios
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom"; // ✅ ใช้ Navigate สำหรับ Redirect
import BtnArrow from "../svg/BtnArrow";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // ✅ ใช้ jwt-decode สำหรับตรวจสอบ Token
interface FormData {
  emailOrUsername: string;
  password: string;
}

const LoginForm = () => {
  const navigate = useNavigate(); // ✅ ใช้ Navigate
  const schema = yup
    .object({
      emailOrUsername: yup.string().required('กรุณากรอกอีเมลหรือชื่อผู้ใช้').label("Email or Username"),
      password: yup.string().required('กรุณากรอกรหัสผ่าน').label("Password"),
    })
    .required();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000; // เวลาปัจจุบัน (วินาที)
      return decoded.exp < currentTime;
    } catch (error) {
      return true; // ถ้าถอดรหัสไม่ได้ ถือว่าหมดอายุ
    }
  };
  const onSubmit = async (data: FormData) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      
      // ตรวจสอบว่าเป็น email หรือ username ด้วย regex pattern
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmail = emailRegex.test(data.emailOrUsername);
      const requestData = {
        password: data.password,
        ...(isEmail ? { email: data.emailOrUsername } : { username: data.emailOrUsername })
      };

      const response = await axios.post(`${apiUrl}/api/auth/login`, requestData, {
        headers: { "Content-Type": "application/json" },
      });

      const { token, user } = response.data;

      if (isTokenExpired(token)) {
        toast.error("โทเคนหมดอายุ โปรดเข้าสู่ระบบใหม่", { position: "top-center" });
        logoutUser(); // ✅ เรียกใช้ logoutUser
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("เข้าสู่ระบบ สำเร็จ!", { position: "top-center" });

      reset();

      // ✅ ดึงค่าเวลาหมดอายุจาก Token
      const decoded: any = jwtDecode(token);
      const expiresIn = (decoded.exp * 1000) - Date.now();

      // ✅ ตั้งเวลา logout อัตโนมัติ
      setTimeout(() => {
        logoutUser();
      }, expiresIn);

      switch (user.role) {
        case "admin":
          navigate("/admin-dashboard");
          break;
        case "instructor":
          navigate("/instructor-dashboard");
          break;
        case "student":
          navigate("/student-dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      toast.error(error.response?.data?.message || "Login failed", { position: "top-center" });
    }
  };

  // ✅ ฟังก์ชัน Logout อัตโนมัติ
  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    toast.info("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่", { 
      position: "top-center",
      autoClose: 3000, // ✅ แสดงแจ้งเตือน 3 วินาทีก่อน redirect
      onClose: () => navigate("/login"), // ✅ Redirect หลังจาก toast ปิด
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="account__form">
      <div className="form-grp">
        <label htmlFor="emailOrUsername">อีเมลหรือชื่อผู้ใช้</label>
        <input id="emailOrUsername" {...register("emailOrUsername")} type="text" placeholder="อีเมลหรือชื่อผู้ใช้" />
        <p className="form_error">{errors.emailOrUsername?.message}</p>
      </div>
      <div className="form-grp">
        <label htmlFor="password">รหัสผ่าน</label>
        <input id="password" {...register("password")} type="password" placeholder="รหัสผ่าน" />
        <p className="form_error">{errors.password?.message}</p>
      </div>
      <div className="account__check">
        <div className="account__check-remember">
          <input type="checkbox" className="form-check-input" value="" id="terms-check" />
          <label htmlFor="terms-check" className="form-check-label">จดจำฉัน</label>
        </div>
        <div className="account__check-forgot">
          <Link to="/registration">ลืมรหัสผ่าน</Link>
        </div>
      </div>
      <button type="submit" className="btn btn-two arrow-btn">
        เข้าสู่ระบบ <BtnArrow />
      </button>
    </form>
  );
};

export default LoginForm;
