import { toast } from "react-toastify";
import axios from "axios"; // ✅ Import Axios
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom"; // ✅ ใช้ Navigate สำหรับ Redirect
import BtnArrow from "../svg/BtnArrow";
import { Link } from "react-router-dom";

interface FormData {
  email: string;
  password: string;
}



const LoginForm = () => {
  const navigate = useNavigate(); // ✅ ใช้ Navigate
  const schema = yup
    .object({
      email: yup.string().required().email().label("Email"),
      password: yup.string().required().label("Password"),
    })
    .required();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL; // ✅ ใช้ VITE_API_URL จาก .env
      const response = await axios.post(`${apiUrl}/api/auth/login`, data, {
        headers: { "Content-Type": "application/json" },
      });
      

      const { token, user } = response.data;
      
      // ✅ เก็บ Token และ User Data ลง localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role); 

      toast.success("Login successfully!", { position: "top-center" });

      reset(); // ✅ Reset Form
      // ✅ Redirect ตาม Role
      if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else if (user.role === "instructor") {
        navigate("/instructor-dashboard");
      } else {
        navigate("/student-dashboard");
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      toast.error(error.response?.data?.message || "Login failed", { position: "top-center" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="account__form">
      <div className="form-grp">
        <label htmlFor="email">อีเมล</label>
        <input id="email" {...register("email")} type="text" placeholder="email" />
        <p className="form_error">{errors.email?.message}</p>
      </div>
      <div className="form-grp">
        <label htmlFor="password">รหัสผ่าน</label>
        <input id="password" {...register("password")} type="password" placeholder="password" />
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
