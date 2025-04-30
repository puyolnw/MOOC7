import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

// Interface สำหรับข้อมูลแผนก
interface Department {
  department_id: number;
  department_name: string;
}

// Interface สำหรับข้อมูลผู้สอน (ใช้สำหรับฟอร์ม)
interface InstructorData {
  username: string;
  email: string;
  password?: string; // Optional for edit
  confirmPassword?: string; // Optional for edit
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  description: string;
  avatar: File | null;
  avatarPreview: string;
}

// Interface สำหรับข้อมูลผู้สอนที่ได้จาก API
interface InstructorResponse {
  user_id: number;
  instructor_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  position: string;
  department: string;
  description: string | null;
  avatar_path: string | null; // Google Drive URL (TEXT column)
  avatar_file_id: string | null; // Google Drive file ID
}

interface EditInstructorsProps {
  onSubmit?: (instructorData: InstructorResponse) => void;
  onCancel?: () => void;
}

const EditInstructors: React.FC<EditInstructorsProps> = ({ onSubmit, onCancel }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Get instructor ID from URL params
  const apiURL = import.meta.env.VITE_API_URL;

  // State สำหรับการโหลดและข้อผิดพลาด
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  // State สำหรับข้อมูลแผนก
  const [departments, setDepartments] = useState<Department[]>([]);

  // State สำหรับข้อมูลผู้สอน
  const [instructorData, setInstructorData] = useState<InstructorData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    position: "",
    department: "",
    description: "",
    avatar: null,
    avatarPreview: "",
  });

  // State สำหรับข้อผิดพลาดในการตรวจสอบข้อมูล
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    position: "",
    department: "",
    description: "",
  });

  // ดึงข้อมูลผู้สอนและข้อมูลแผนกเมื่อเริ่มต้น
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setApiError(null);

        const token = localStorage.getItem("token");

        if (!token) {
          setApiError("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
          setIsLoading(false);
          return;
        }

        // Fetch departments
        const deptResponse = await axios.get(`${apiURL}/api/courses/subjects/departments/list`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (deptResponse.data.success) {
          setDepartments(deptResponse.data.departments);
        } else {
          setApiError("ไม่สามารถดึงข้อมูลแผนกได้");
        }

        // Fetch instructor data
        const instructorResponse = await axios.get(`${apiURL}/api/accounts/instructors/${id}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (instructorResponse.data.success) {
          const instructor = instructorResponse.data.instructor as InstructorResponse;
          setInstructorData({
            username: instructor.username,
            email: instructor.email,
            password: "", // Password is not fetched for security reasons
            confirmPassword: "",
            firstName: instructor.first_name,
            lastName: instructor.last_name,
            position: instructor.position,
            department: instructor.department,
            description: instructor.description || "",
            avatar: null,
            avatarPreview: instructor.avatar_file_id
              ? `${apiURL}/api/accounts/instructors/avatar/${instructor.avatar_file_id}`
              : "",
          });
        } else {
          setApiError("ไม่สามารถดึงข้อมูลผู้สอนได้");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setApiError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [apiURL, id]);

  // จัดการการเปลี่ยนแปลงข้อมูลในฟอร์ม
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setInstructorData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // ล้างข้อผิดพลาดเมื่อมีการแก้ไขข้อมูล
    if (name in errors) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  // จัดการการอัปโหลดรูปภาพ
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // ตรวจสอบขนาดไฟล์ (ไม่เกิน 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("ขนาดไฟล์ต้องไม่เกิน 2MB");
      return;
    }

    // ตรวจสอบประเภทไฟล์
    const fileType = file.type;
    if (!fileType.match(/^image\/(jpeg|jpg|png|gif)$/)) {
      toast.error("รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, GIF)");
      return;
    }

    // สร้าง URL สำหรับแสดงตัวอย่างรูปภาพ
    const previewUrl = URL.createObjectURL(file);

    setInstructorData((prevState) => ({
      ...prevState,
      avatar: file,
      avatarPreview: previewUrl,
    }));
  };

  // ลบรูปภาพ
  const handleRemoveAvatar = () => {
    setInstructorData((prevState) => ({
      ...prevState,
      avatar: null,
      avatarPreview: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ตรวจสอบความถูกต้องของข้อมูล
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      position: "",
      department: "",
      description: "",
    };

    // ตรวจสอบชื่อผู้ใช้
    if (!instructorData.username.trim()) {
      newErrors.username = "กรุณาระบุชื่อผู้ใช้";
      isValid = false;
    } else if (instructorData.username.length < 4) {
      newErrors.username = "ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 4 ตัวอักษร";
      isValid = false;
    }

    // ตรวจสอบอีเมล
    if (!instructorData.email.trim()) {
      newErrors.email = "กรุณาระบุอีเมล";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(instructorData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
      isValid = false;
    }

    // ตรวจสอบรหัสผ่าน (ถ้ามีการกรอก)
    if (instructorData.password) {
      if (instructorData.password.length < 6) {
        newErrors.password = "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
        isValid = false;
      }

      // ตรวจสอบการยืนยันรหัสผ่าน
      if (instructorData.password !== instructorData.confirmPassword) {
        newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
        isValid = false;
      }
    }

    // ตรวจสอบชื่อ
    if (!instructorData.firstName.trim()) {
      newErrors.firstName = "กรุณาระบุชื่อ";
      isValid = false;
    }

    // ตรวจสอบนามสกุล
    if (!instructorData.lastName.trim()) {
      newErrors.lastName = "กรุณาระบุนามสกุล";
      isValid = false;
    }

    // ตรวจสอบตำแหน่ง
    if (!instructorData.position.trim()) {
      newErrors.position = "กรุณาระบุตำแหน่ง";
      isValid = false;
    }

    // ตรวจสอบแผนก
    if (!instructorData.department) {
      newErrors.department = "กรุณาเลือกแผนก";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // จัดการการส่งฟอร์ม
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setApiError(null);
      setApiSuccess(null);

      const token = localStorage.getItem("token");

      if (!token) {
        setApiError("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
        setIsSubmitting(false);
        return;
      }

      // สร้าง FormData สำหรับส่งข้อมูลและไฟล์
      const formData = new FormData();
      formData.append("username", instructorData.username);
      formData.append("email", instructorData.email);
      if (instructorData.password) {
        formData.append("password", instructorData.password);
      }
      formData.append("firstName", instructorData.firstName);
      formData.append("lastName", instructorData.lastName);
      formData.append("position", instructorData.position);
      formData.append("department", instructorData.department);
      formData.append("description", instructorData.description);

      if (instructorData.avatar !== undefined) {
        if (instructorData.avatar) {
          formData.append("avatar", instructorData.avatar);
        } else {
          formData.append("removeAvatar", "true"); // Signal to backend to remove avatar
        }
      }
      const response = await axios.put(`${apiURL}/api/accounts/instructors/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type is automatically set to multipart/form-data by axios when using FormData
        },
      });

      if (response.data.success) {
        setApiSuccess("อัปเดตข้อมูลผู้สอนสำเร็จ");
        toast.success("อัปเดตข้อมูลผู้สอนสำเร็จ");

        // ถ้าสำเร็จและมี callback onSubmit ให้เรียกใช้
        if (onSubmit) {
          onSubmit(response.data.instructor as InstructorResponse);
        } else {
          // ถ้าไม่มี callback ให้ redirect ไปหน้าจัดการผู้สอน หลังจากแสดง toast สักครู่
          setTimeout(() => {
            navigate("/admin-account/instructors");
          }, 1500);
        }
      } else {
        setApiError(response.data.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้สอน");
        toast.error(response.data.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้สอน");
      }
    } catch (error: any) {
      console.error("Error updating instructor account:", error);
      const errorMessage =
        error.response?.data?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์";
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // จัดการการยกเลิก
  const handleCancelForm = () => {
    if (onCancel) {
      onCancel();
    } else {
      // ถ้าไม่มี callback ให้ redirect ไปหน้าจัดการผู้สอน
      navigate("/admin-account/instructors");
    }
  };

  // ล้าง URL ของรูปภาพตัวอย่างเมื่อคอมโพเนนต์ถูกทำลาย
  useEffect(() => {
    return () => {
      if (instructorData.avatarPreview && instructorData.avatar) {
        URL.revokeObjectURL(instructorData.avatarPreview);
      }
    };
  }, [instructorData.avatarPreview, instructorData.avatar]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* แสดงข้อผิดพลาดจาก API ถ้ามี */}
      {apiError && (
        <div className="alert alert-danger mb-4">
          <i className="fas fa-exclamation-circle me-2"></i>
          {apiError}
        </div>
      )}

      {/* แสดงข้อความสำเร็จถ้ามี */}
      {apiSuccess && (
        <div className="alert alert-success mb-4">
          <i className="fas fa-check-circle me-2"></i>
          {apiSuccess}
        </div>
      )}

      {/* ส่วนที่ 1: ข้อมูลบัญชี */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">1. ข้อมูลบัญชี</h5>

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="username" className="form-label">
                ชื่อผู้ใช้ <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.username ? "is-invalid" : ""}`}
                id="username"
                name="username"
                value={instructorData.username}
                onChange={handleInputChange}
                placeholder="ระบุชื่อผู้ใช้สำหรับเข้าสู่ระบบ"
              />
              {errors.username && <div className="invalid-feedback">{errors.username}</div>}
              <small className="form-text text-muted">ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 4 ตัวอักษร</small>
            </div>

            <div className="col-md-6">
              <label htmlFor="email" className="form-label">
                อีเมล <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                id="email"
                name="email"
                value={instructorData.email}
                onChange={handleInputChange}
                placeholder="ระบุอีเมล"
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="password" className="form-label">
                รหัสผ่าน (เว้นว่างหากไม่ต้องการเปลี่ยน)
              </label>
              <input
                type="password"
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                id="password"
                name="password"
                value={instructorData.password || ""}
                onChange={handleInputChange}
                placeholder="ระบุรหัสผ่านใหม่ (ถ้าต้องการเปลี่ยน)"
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              <small className="form-text text-muted">รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร</small>
            </div>

            <div className="col-md-6">
              <label htmlFor="confirmPassword" className="form-label">
                ยืนยันรหัสผ่าน
              </label>
              <input
                type="password"
                className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                id="confirmPassword"
                name="confirmPassword"
                value={instructorData.confirmPassword || ""}
                onChange={handleInputChange}
                placeholder="ยืนยันรหัสผ่านใหม่ (ถ้าต้องการเปลี่ยน)"
              />
              {errors.confirmPassword && (
                <div className="invalid-feedback">{errors.confirmPassword}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ส่วนที่ 2: ข้อมูลส่วนตัว */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">2. ข้อมูลส่วนตัว</h5>

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="firstName" className="form-label">
                ชื่อ <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
                id="firstName"
                name="firstName"
                value={instructorData.firstName}
                onChange={handleInputChange}
                placeholder="ระบุชื่อ"
              />
              {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
            </div>

            <div className="col-md-6">
              <label htmlFor="lastName" className="form-label">
                นามสกุล <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.lastName ? "is-invalid" : ""}`}
                id="lastName"
                name="lastName"
                value={instructorData.lastName}
                onChange={handleInputChange}
                placeholder="ระบุนามสกุล"
              />
              {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="position" className="form-label">
                ตำแหน่ง <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.position ? "is-invalid" : ""}`}
                id="position"
                name="position"
                value={instructorData.position}
                onChange={handleInputChange}
                placeholder="ระบุตำแหน่ง เช่น อาจารย์, ผศ., รศ., ศ."
              />
              {errors.position && <div className="invalid-feedback">{errors.position}</div>}
            </div>

            <div className="col-md-6">
              <label htmlFor="department" className="form-label">
                แผนก/สาขาวิชา <span className="text-danger">*</span>
              </label>
              {isLoading ? (
                <div className="d-flex align-items-center mb-2">
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  <span>กำลังโหลดข้อมูลแผนก...</span>
                </div>
              ) : (
                <select
                  className={`form-select ${errors.department ? "is-invalid" : ""}`}
                  id="department"
                  name="department"
                  value={instructorData.department}
                  onChange={handleInputChange}
                  disabled={isLoading}
                >
                  <option value="">-- เลือกแผนก/สาขาวิชา --</option>
                  {departments.map((dept) => (
                    <option key={dept.department_id} value={dept.department_id}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
              )}
              {errors.department && <div className="invalid-feedback">{errors.department}</div>}
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">ประวัติโดยย่อ</label>
            <textarea
              className={`form-control ${errors.description ? "is-invalid" : ""}`}
              id="description"
              name="description"
              rows={4}
              value={instructorData.description}
              onChange={handleInputChange}
              placeholder="ระบุประวัติการศึกษา ความเชี่ยวชาญ หรือข้อมูลอื่นๆ ที่เกี่ยวข้อง"
            ></textarea>
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
          </div>

          {/* รูปโปรไฟล์ */}
          <div className="mb-4">
            <label className="form-label">รูปโปรไฟล์</label>
            <p className="text-muted small mb-2">แนะนำขนาด 400 x 400 พิกเซล (ไม่เกิน 2MB)</p>

            <div className="d-flex align-items-center gap-3">
              <div
                className="avatar-preview rounded-circle border"
                style={{
                  width: "100px",
                  height: "100px",
                  backgroundImage: instructorData.avatarPreview
                    ? `url(${instructorData.avatarPreview})`
                    : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f8f9fa",
                }}
              >
                {!instructorData.avatarPreview && (
                  <i className="fas fa-user fa-2x text-muted"></i>
                )}
              </div>

              <div className="d-flex flex-column gap-2">
                <input
                  type="file"
                  className="form-control"
                  id="avatar"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/jpeg,image/png,image/gif"
                  style={{ display: "none" }}
                />

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <i className="fas fa-upload me-2"></i>
                    {instructorData.avatarPreview ? "เปลี่ยนรูป" : "อัปโหลดรูป"}
                  </button>

                  {instructorData.avatarPreview && (
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={handleRemoveAvatar}
                    >
                      <i className="fas fa-trash-alt me-2"></i>ลบรูป
                    </button>
                  )}
                </div>

                <small className="text-muted">รองรับไฟล์ JPEG, PNG, GIF</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ปุ่มบันทึกและยกเลิก */}
      <div className="d-flex justify-content-end gap-2 mt-4">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handleCancelForm}
          disabled={isSubmitting}
        >
          ยกเลิก
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              กำลังบันทึก...
            </>
          ) : (
            <>
              <i className="fas fa-save me-2"></i>บันทึกข้อมูล
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default EditInstructors;
