import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const apiUrl = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL;

interface Instructor {
  user_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  instructor_id: number;
  position: string;
  avatar_path: string | null;
  avatar_file_id: string | null;
  description: string | null;
  department: number | null;
  phone: string | null;
  department_name: string | null;
  subjects?: Subject[];
}

interface Subject {
  subject_id: number;
  subject_code: string;
  subject_name: string;
  credits: number;
  cover_image: string | null;
  cover_image_file_id: string | null;
}

const InstructorSettingProfile: React.FC = () => {
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [editData, setEditData] = useState<Partial<Instructor>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Get instructorId from route params and fallback to localStorage
  const { id: routeId } = useParams<{ id?: string }>();
  const userString = localStorage.getItem("user");
  let user = null;
  let userId = routeId ? parseInt(routeId, 10) : null;

  if (!userId && userString) {
    try {
      user = JSON.parse(userString);
      userId = user?.user_id || user?.id;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
    }
  }

  console.log("User from localStorage:", user);
  console.log("User ID from route or localStorage:", userId);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!userId || !token) {
      setMessage("ไม่พบข้อมูลผู้สอนหรือ token");
      setLoading(false);
      return;
    }
    setLoading(true);
    
    // First, get instructor data by user_id to find instructor_id
    axios
      .get(`${apiUrl}/api/accounts/instructors`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // Find instructor by user_id
        const instructorData = res.data.instructors.find((inst: any) => inst.user_id === userId);
        if (instructorData) {
          setInstructor(instructorData);
          setEditData(instructorData);
        } else {
          setMessage("ไม่พบข้อมูลผู้สอน");
        }
      })
      .catch(() => setMessage("ไม่สามารถโหลดข้อมูลได้"))
      .finally(() => setLoading(false));
  }, [userId, token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !userId || !token) {
      setMessage("กรุณาเลือกไฟล์ภาพ");
      return;
    }

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    try {
      await axios.put(
        `${apiUrl}/api/accounts/instructors/${userId}/avatar`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );
      toast.success("อัปโหลดภาพสำเร็จ");
      setMessage("อัปโหลดภาพสำเร็จ");
      setAvatarFile(null);
      setAvatarPreview(null);
      
      // Refresh instructor data to get new avatar
      const res = await axios.get(`${apiUrl}/api/accounts/instructors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const instructorData = res.data.instructors.find((inst: any) => inst.user_id === userId);
      if (instructorData) {
        setInstructor(instructorData);
        setEditData(instructorData);
      }
    } catch (error: any) {
      setMessage(
        error?.response?.data?.message || "เกิดข้อผิดพลาดในการอัปโหลดภาพ"
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const getAvatarUrl = (fileId: string | null) => {
    if (!fileId) return null;
    return `${apiUrl}/api/accounts/instructors/avatar/${fileId}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !token) {
      setMessage("ไม่พบข้อมูลผู้สอนหรือ token");
      return;
    }
    try {
      await axios.put(
        `${apiUrl}/api/accounts/instructors/user/${userId}`,
        {
          username: editData.username,
          email: editData.email,
          firstName: editData.first_name,
          lastName: editData.last_name,
          position: editData.position,
          department: editData.department,
          description: editData.description,
          phone: editData.phone,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("บันทึกข้อมูลสำเร็จ");
      setMessage("บันทึกข้อมูลสำเร็จ");
      setIsEditPopupOpen(false);
      // Refresh instructor data
      const res = await axios.get(`${apiUrl}/api/accounts/instructors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const instructorData = res.data.instructors.find((inst: any) => inst.user_id === userId);
      if (instructorData) {
        setInstructor(instructorData);
        setEditData(instructorData);
      }
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
    setMessage(null);
  };

  if (loading) return <div>Loading...</div>;
  if (!instructor) return <div>ไม่พบข้อมูลผู้สอน</div>;

  return (
    <div className="instructor__profile-form-wrap">
      <h3>ข้อมูลผู้สอน</h3>
      {message && (
        <div style={{ color: message === "บันทึกข้อมูลสำเร็จ" || message === "อัปโหลดภาพสำเร็จ" ? "green" : "red" }}>
          {message}
        </div>
      )}
      
      {/* Avatar Section */}
      <div className="avatar-section" style={{ marginBottom: "30px", textAlign: "center" }}>
        <div className="avatar-display" style={{ marginBottom: "20px" }}>
          <img
            src={avatarPreview || getAvatarUrl(instructor.avatar_file_id) || "/public/assets/img/instructor/instructor_01.jpg"}
            alt="Avatar"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "3px solid #ddd",
              background: "#fff",
              aspectRatio: "1 / 1"
            }}
          />
        </div>
        <div className="avatar-upload">
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: "none" }}
            id="avatar-input"
          />
          <label htmlFor="avatar-input" className="btn" style={{ marginRight: "10px", cursor: "pointer" }}>
            เปลี่ยนรูปภาพ
          </label>
          {avatarFile && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAvatarUpload}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? "กำลังอัปโหลด..." : "อัปโหลดภาพ"}
            </button>
          )}
        </div>
      </div>

      <div className="instructor__profile-display">
        <div className="form-grp">
          <label>รหัสผู้สอน</label>
          <input
            name="instructor_id"
            value={instructor.instructor_id || ""}
            type="text"
            className="form-control"
            disabled
            readOnly
          />
        </div>
        <div className="form-grp">
          <label>ชื่อผู้ใช้งาน</label>
          <input
            name="username"
            value={instructor.username || ""}
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
            value={instructor.email || ""}
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
            value={instructor.first_name || ""}
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
            value={instructor.last_name || ""}
            type="text"
            className="form-control"
            disabled
            readOnly
          />
        </div>
        <div className="form-grp">
          <label>ตำแหน่ง</label>
          <input
            name="position"
            value={instructor.position || ""}
            type="text"
            className="form-control"
            disabled
            readOnly
          />
        </div>
        <div className="form-grp">
          <label>เบอร์โทรศัพท์</label>
          <input
            name="phone"
            value={instructor.phone || ""}
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
            value={instructor.department_name || ""}
            type="text"
            className="form-control"
            disabled
            readOnly
          />
        </div>
        <div className="form-grp bg-gray">
          <label>สถานะ</label>
          <input
            name="status"
            value={instructor.status || ""}
            type="text"
            className="form-control"
            disabled
            readOnly
          />
        </div>
        <div className="form-grp">
          <label>คำอธิบาย</label>
          <textarea
            name="description"
            value={instructor.description || ""}
            className="form-control"
            rows={4}
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
          <div className="popup-content" style={{ backgroundColor: "white", padding: "40px 40px 24px 40px", borderRadius: "10px", width: "900px", maxWidth: "98vw", maxHeight: "90vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 1, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", marginTop: 48, alignSelf: "center" }}>
            <h3 style={{ textAlign: "center", marginBottom: 20 }}>แก้ไขข้อมูลผู้สอน</h3>
            {message && (
              <div style={{ color: message === "บันทึกข้อมูลสำเร็จ" ? "green" : "red", textAlign: "center" }}>
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="instructor__profile-form" style={{ display: "flex", flexDirection: "column", gap: 1 }}>
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
              <div className="form-grp">
                <label>ตำแหน่ง</label>
                <input
                  name="position"
                  value={editData.position || ""}
                  onChange={handleChange}
                  type="text"
                  className="form-control"
                />
              </div>
              <div className="form-grp">
                <label>เบอร์โทรศัพท์</label>
                <input
                  name="phone"
                  value={editData.phone || ""}
                  onChange={handleChange}
                  type="text"
                  className="form-control"
                />
              </div>
              <div className="form-grp">
                <label>คำอธิบาย</label>
                <textarea
                  name="description"
                  value={editData.description || ""}
                  onChange={handleChange}
                  className="form-control"
                  rows={4}
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

export default InstructorSettingProfile; 