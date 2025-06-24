import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL;

interface Student {
  user_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  user_code: string;
  student_id: number;
  student_code: string;
  department_name: string;
  education_level: string;
  faculty: string;
}

const StudentSettingProfile: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [editData, setEditData] = useState<Partial<Student>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false); // State for popup

  // Get userId from route params and fallback to localStorage
  const { id: routeId } = useParams<{ id?: string }>();
  const userString = localStorage.getItem("user");
  let user = null;
  let userId = routeId ? parseInt(routeId, 10) : null;

  if (!userId && userString) {
    try {
      user = JSON.parse(userString);
      userId = user?.id;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
    }
  }

  console.log("User from localStorage:", user);
  console.log("User ID from route or localStorage:", userId);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!userId || !token) {
      setMessage("ไม่พบข้อมูลผู้ใช้หรือ token");
      setLoading(false);
      return;
    }
    setLoading(true);
    axios
      .get(`${apiUrl}/api/accounts/students/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setStudent(res.data.student);
        setEditData(res.data.student);
      })
      .catch(() => setMessage("ไม่สามารถโหลดข้อมูลได้"))
      .finally(() => setLoading(false));
  }, [userId, token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !token) {
      setMessage("ไม่พบข้อมูลผู้ใช้หรือ token");
      return;
    }
    try {
      await axios.put(
        `${apiUrl}/api/accounts/students/change-profile/${userId}`,
        {
          username: editData.username,
          email: editData.email,
          firstName: editData.first_name,
          lastName: editData.last_name,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("บันทึกข้อมูลสำเร็จ");
      setIsEditPopupOpen(false); // Close popup after success
      // Refresh student data
      const res = await axios.get(`${apiUrl}/api/accounts/students/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudent(res.data.student);
      setEditData(res.data.student);
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล"
      );
    }
  };

  const openEditPopup = () => {
    setIsEditPopupOpen(true);
  };

  const closeEditPopup = () => {
    setIsEditPopupOpen(false);
    setMessage(null); // Clear message when closing
  };

  if (loading) return <div>Loading...</div>;
  if (!student) return <div>ไม่พบข้อมูลนักศึกษา</div>;

  return (
    <div className="student__profile-form-wrap">
      <h3>ข้อมูลนักศึกษา</h3>
      {message && (
        <div style={{ color: message === "บันทึกข้อมูลสำเร็จ" ? "green" : "red" }}>
          {message}
        </div>
      )}
      <div className="student__profile-display">
        <div className="form-grp">
          <label>รหัสผู้ใช้งาน</label>
          <input
            name="user_code"
            value={student.user_code || ""}
            type="string"
            className="form-control"
            disabled
            readOnly
          />
        </div>
        <div className="form-grp">
          <label>ชื่อผู้ใช้งาน</label>
          <input
            name="username"
            value={student.username || ""}
            type="text"
            className="form-control"
            disabled
            readOnly
          />
        </div>
        <div className="form-grp">
          <label>อีเมล</label>
          <input
            name="email"
            value={student.email || ""}
            type="email"
            className="form-control"
            disabled
            readOnly
          />
        </div>
        <div className="form-grp">
          <label>ชื่อ</label>
          <input
            name="first_name"
            value={student.first_name || ""}
            type="text"
            className="form-control"
            disabled
            readOnly
          />
        </div>
        <div className="form-grp">
          <label>นามสกุล</label>
          <input
            name="last_name"
            value={student.last_name || ""}
            type="text"
            className="form-control"
            disabled
            readOnly
          />
        </div>
        <div className="form-grp">
          <label>เลขประจำตัวนักศึกษา</label>
          <input
            name="student_code"
            value={student.student_code || ""}
            type="text"
            className="form-control"
            disabled
            readOnly
          />
        </div>
        <div className="form-grp bg-gray">
          <label>สาขาวิชา</label>
          <input
            name="department_name"
            value={student.department_name || ""}
            type="text"
            className="form-control"
            disabled
            readOnly
          />
        </div>
        <div className="form-grp bg-gray">
          <label>คณะ</label>
          <input
            name="faculty"
            value={student.faculty || ""}
            type="text"
            className="form-control"
            disabled
            readOnly
          />
        </div>
        <div className="form-grp bg-gray">
          <label>ระดับการศึกษา</label>
          <input
            name="education_level"
            value={student.education_level || ""}
            type="text"
            className="form-control"
            disabled
            readOnly
          />
        </div>
        <div className="submit-btn mt-25">
          <button type="button" className="btn" onClick={openEditPopup}>
            แก้ไขข้อมูล
          </button>
        </div>
      </div>

      {/* Popup for editing */}
      {isEditPopupOpen && (
        <div className="popup-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="popup-content" style={{ backgroundColor: "white", padding: "20px", borderRadius: "5px", width: "400px", maxHeight: "80vh", overflowY: "auto" }}>
            <h3>แก้ไขข้อมูลนักศึกษา</h3>
            {message && (
              <div style={{ color: message === "บันทึกข้อมูลสำเร็จ" ? "green" : "red" }}>
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="student__profile-form">
              <div className="form-grp">
                <label>ชื่อผู้ใช้งาน</label>
                <input
                  name="username"
                  value={editData.username || ""}
                  onChange={handleChange}
                  type="text"
                  className="form-control"
                />
              </div>
              <div className="form-grp">
                <label>อีเมล</label>
                <input
                  name="email"
                  value={editData.email || ""}
                  onChange={handleChange}
                  type="email"
                  className="form-control"
                />
              </div>
              <div className="form-grp">
                <label>ชื่อ</label>
                <input
                  name="first_name"
                  value={editData.first_name || ""}
                  onChange={handleChange}
                  type="text"
                  className="form-control"
                />
              </div>
              <div className="form-grp">
                <label>นามสกุล</label>
                <input
                  name="last_name"
                  value={editData.last_name || ""}
                  onChange={handleChange}
                  type="text"
                  className="form-control"
                />
              </div>
              <div className="submit-btn mt-25" style={{ display: "flex", justifyContent: "space-between" }}>
                <button type="submit" className="btn">
                  บันทึก
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeEditPopup}>
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSettingProfile;