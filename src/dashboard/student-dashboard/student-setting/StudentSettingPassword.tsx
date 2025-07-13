import React, { useState, useEffect } from "react";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL;

// สร้าง axios instance ที่ไม่ throw error สำหรับ 404
const silentAxios = axios.create();
silentAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    // ถ้าเป็น 404 error ให้ return response แทนที่จะ throw error
    if (error.response?.status === 404) {
      return Promise.reject({ ...error, silent: true });
    }
    return Promise.reject(error);
  }
);

const StudentSettingPassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [studentType, setStudentType] = useState<"student" | "school_student" | null>(null);

  // ดึง userId จาก localStorage
  const userString = localStorage.getItem("user");
  let user = null;
  let userId = null;

  if (userString) {
    try {
      user = JSON.parse(userString);
      userId = user?.id;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
    }
  }

  const token = localStorage.getItem("token");

  // ตรวจสอบ studentType
  useEffect(() => {
    const fetchType = async () => {
      if (!userId || !token) return;
      try {
        // ลอง fetch จาก students
        await axios.get(`${apiUrl}/api/accounts/students/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudentType("student");
      } catch (error: any) {
        // ถ้าเป็น 404 error ให้เงียบๆ ไม่ต้อง log
        if (error?.response?.status !== 404) {
          console.error("Error fetching student:", error);
        }
        
        try {
          // ถ้าไม่เจอ ลอง fetch จาก school_students
          await axios.get(`${apiUrl}/api/accounts/school_students/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setStudentType("school_student");
        } catch (schoolError: any) {
          // ถ้าเป็น 404 error ให้เงียบๆ ไม่ต้อง log
          if (schoolError?.response?.status !== 404) {
            console.error("Error fetching school student:", schoolError);
          }
          setStudentType(null);
        }
      }
    };
    fetchType();
  }, [userId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !token) {
      setMessage("ไม่พบข้อมูลผู้ใช้หรือ token");
      return;
    }
    if (newPassword !== rePassword) {
      setMessage("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }
    if (!studentType) {
      setMessage("ไม่สามารถระบุประเภทผู้ใช้ได้");
      return;
    }
    try {
      const endpoint =
        studentType === "student"
          ? `${apiUrl}/api/accounts/students/password/${userId}`
          : `${apiUrl}/api/accounts/school_students/password/user/${userId}`;
      await axios.put(
        endpoint,
        { password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("เปลี่ยนรหัสผ่านสำเร็จ");
      setCurrentPassword("");
      setNewPassword("");
      setRePassword("");
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน"
      );
    }
  };

  return (
    <div className="instructor__profile-form-wrap">
      <form onSubmit={handleSubmit} className="instructor__profile-form">
        {message && (
          <div style={{ color: message === "เปลี่ยนรหัสผ่านสำเร็จ" ? "green" : "red" }}>
            {message}
          </div>
        )}
        <div className="form-grp">
          <label htmlFor="currentpassword">รหัสผ่านปัจจุบัน</label>
          <input
            id="currentpassword"
            type="password"
            placeholder="กรอกรหัสผ่านปัจจุบัน"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="form-grp">
          <label htmlFor="newpassword">รหัสผ่านใหม่</label>
          <input
            id="newpassword"
            type="password"
            placeholder="กรอกรหัสผ่านใหม่"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="form-grp">
          <label htmlFor="repassword">ยืนยันรหัสผ่านใหม่</label>
          <input
            id="repassword"
            type="password"
            placeholder="ยืนยันรหัสผ่านใหม่"
            value={rePassword}
            onChange={(e) => setRePassword(e.target.value)}
          />
        </div>
        <div className="submit-btn mt-25">
          <button type="submit" className="btn" disabled={!studentType}>
            เปลี่ยนรหัสผ่าน
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentSettingPassword;