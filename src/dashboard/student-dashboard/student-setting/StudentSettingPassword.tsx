import React, { useState } from "react";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL;

const StudentSettingPassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  // ดึง userId จาก localStorage
  const userString = localStorage.getItem("user");
  let user = null;
  let userId = null;

  if (userString) {
    try {
      user = JSON.parse(userString);
      userId = user?.id; // ใช้ id แทน user_id
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
    }
  }

  console.log("User from localStorage:", user); // ดีบั๊ก
  console.log("User ID:", userId); // ดีบั๊ก
  const token = localStorage.getItem("token");

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
    try {
      await axios.put(
        `${apiUrl}/api/accounts/students/password/${userId}`,
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
          <button type="submit" className="btn">
            เปลี่ยนรหัสผ่าน
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentSettingPassword;