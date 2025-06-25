import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

// Interface สำหรับข้อมูลแผนก
interface Department {
  department_id: number;
  department_name: string;
  faculty: string;
}

// Interface สำหรับข้อมูลนักศึกษา
interface StudentData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  studentCode: string;
  department: string;
  educationLevel: string;
  academicYear: string;
}

interface AddStudentsProps {
  onSubmit?: (studentData: any) => void;
  onCancel?: () => void;
}

const AddStudents: React.FC<AddStudentsProps> = ({ onSubmit, onCancel }) => {
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL;

  // State สำหรับการโหลดและข้อผิดพลาด
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  // State สำหรับข้อมูลแผนก
  const [departments, setDepartments] = useState<Department[]>([]);

  // State สำหรับข้อมูลนักศึกษา
  const [studentData, setStudentData] = useState<StudentData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    studentCode: "",
    department: "",
    educationLevel: "",
    academicYear: "",
  });

  // State สำหรับข้อผิดพลาดในการตรวจสอบข้อมูล
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    studentCode: "",
    department: "",
    educationLevel: "",
    academicYear: "",
  });

  // ดึงข้อมูลแผนกจาก API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsLoading(true);
        setApiError(null);

        const token = localStorage.getItem("token");

        if (!token) {
          setApiError("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
          setIsLoading(false);
          return;
        }

        const response = await axios.get(`${apiURL}/api/auth/departments`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setDepartments(response.data.departments || []);
        } else {
          setApiError("ไม่สามารถดึงข้อมูลแผนกได้");
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        setApiError("เกิดข้อผิดพลาดในการดึงข้อมูลแผนก");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, [apiURL]);

  // จัดการการเปลี่ยนแปลงข้อมูลในฟอร์ม
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStudentData((prevState) => ({
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
      studentCode: "",
      department: "",
      educationLevel: "",
      academicYear: "",
    };

    // ตรวจสอบชื่อผู้ใช้
    if (!studentData.username.trim()) {
      newErrors.username = "กรุณากรอกชื่อผู้ใช้";
      isValid = false;
    } else if (studentData.username.length < 3) {
      newErrors.username = "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร";
      isValid = false;
    }

    // ตรวจสอบอีเมล
    if (!studentData.email.trim()) {
      newErrors.email = "กรุณากรอกอีเมล";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(studentData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
      isValid = false;
    }

    // ตรวจสอบรหัสผ่าน
    if (!studentData.password) {
      newErrors.password = "กรุณากรอกรหัสผ่าน";
      isValid = false;
    } else if (studentData.password.length < 6) {
      newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
      isValid = false;
    }

    // ตรวจสอบการยืนยันรหัสผ่าน
    if (studentData.password !== studentData.confirmPassword) {
      newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
      isValid = false;
    }

    // ตรวจสอบชื่อ
    if (!studentData.firstName.trim()) {
      newErrors.firstName = "กรุณากรอกชื่อจริง";
      isValid = false;
    }

    // ตรวจสอบนามสกุล
    if (!studentData.lastName.trim()) {
      newErrors.lastName = "กรุณากรอกนามสกุล";
      isValid = false;
    }

    // ตรวจสอบรหัสนักศึกษา
    if (!studentData.studentCode.trim()) {
      newErrors.studentCode = "กรุณากรอกรหัสนักศึกษา";
      isValid = false;
    }

    // ตรวจสอบชั้นปีการศึกษา
    if (!studentData.academicYear) {
      newErrors.academicYear = "กรุณาเลือกชั้นปีการศึกษา";
      isValid = false;
    } else {
      const year = parseInt(studentData.academicYear);
      if (year < 1 || year > 4) {
        newErrors.academicYear = "ชั้นปีต้องอยู่ระหว่าง 1-4";
        isValid = false;
      }
    }

    // ตรวจสอบภาควิชา
    if (!studentData.department) {
      newErrors.department = "กรุณาเลือกภาควิชา";
      isValid = false;
    }

    // ตรวจสอบระดับการศึกษา
    if (!studentData.educationLevel) {
      newErrors.educationLevel = "กรุณาเลือกระดับการศึกษา";
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

      // สร้างข้อมูลสำหรับส่งไปยัง API
      const formData = {
        username: studentData.username,
        email: studentData.email,
        password: studentData.password,
        role_id: 1, // ตั้งค่า role_id เป็น 1 สำหรับนักศึกษา
        student_code: parseInt(studentData.studentCode),
        department_id: studentData.department,
        education_level: studentData.educationLevel,
        academic_year: parseInt(studentData.academicYear),
        first_name: studentData.firstName,
        last_name: studentData.lastName,
      };

      // ส่งข้อมูลไปยัง API
      const response = await axios.post(`${apiURL}/api/auth/register`, formData, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setApiSuccess("เพิ่มนักศึกษาสำเร็จ");
        toast.success("เพิ่มนักศึกษาสำเร็จ");

        // ถ้าสำเร็จและมี callback onSubmit ให้เรียกใช้
        if (onSubmit) {
          onSubmit(response.data);
        } else {
          // ถ้าไม่มี callback ให้ redirect ไปหน้าจัดการนักศึกษา หลังจากแสดง toast สักครู่
          setTimeout(() => {
            navigate("/admin-account/students");
          }, 1500);
        }
      } else {
        // ตรวจสอบข้อความ error เพื่อแสดงคำเตือนที่เฉพาะเจาะจง
        let errorMessage = response.data.message || "เกิดข้อผิดพลาดในการเพิ่มนักศึกษา";
        if (response.data.message === 'อีเมลนี้มีในระบบแล้ว') {
          errorMessage = 'อีเมลนี้ได้มีการลงทะเบียนในระบบแล้ว กรุณาใช้อีเมลอื่น';
        } else if (response.data.message === 'รหัสนักศึกษานี้มีในระบบแล้ว') {
          errorMessage = 'รหัสนักศึกษานี้ได้มีการลงทะเบียนในระบบแล้ว';
        } else if (response.data.message === 'ชื่อผู้ใช้นี้มีในระบบแล้ว') {
          errorMessage = 'ชื่อผู้ใช้นี้ได้มีการลงทะเบียนในระบบแล้ว กรุณาใช้ชื่อผู้ใช้อื่น';
        }
        
        setApiError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error("Error creating student account:", error);
      let errorMessage = "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์";
      
      if (axios.isAxiosError(error) && error.response) {
        const responseMessage = error.response.data.message;
        if (responseMessage === 'อีเมลนี้มีในระบบแล้ว') {
          errorMessage = 'อีเมลนี้มีในระบบแล้ว กรุณาใช้อีเมลอื่น';
        } else if (responseMessage === 'รหัสนักศึกษานี้มีในระบบแล้ว') {
          errorMessage = 'รหัสนักศึกษานี้มีในระบบแล้ว กรุณาใช้รหัสอื่น';
        } else if (responseMessage === 'ชื่อผู้ใช้นี้มีในระบบแล้ว') {
          errorMessage = 'ชื่อผู้ใช้นี้ได้มีการลงทะเบียนในระบบแล้ว กรุณาใช้ชื่อผู้ใช้อื่น';
        } else {
          errorMessage = responseMessage || errorMessage;
        }
      }
      
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
      // ถ้าไม่มี callback ให้ redirect ไปหน้าจัดการนักศึกษา
      navigate("/admin-account/students");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <style>
        {`
          /* Responsive adjustments */
          @media (max-width: 576px) {
            .form-label {
              font-size: 0.9rem;
            }

            .form-control, .form-select {
              font-size: 0.9rem;
            }

            .form-text {
              font-size: 0.8rem;
            }

            .card-title {
              font-size: 1.1rem;
            }

            .btn {
              font-size: 0.9rem;
              padding: 0.5rem 1rem;
            }
          }
        `}
      </style>

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
                value={studentData.username}
                onChange={handleInputChange}
                placeholder="ชื่อผู้ใช้"
              />
              {errors.username && <div className="invalid-feedback">{errors.username}</div>}
              <small className="form-text text-muted">ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร</small>
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
                value={studentData.email}
                onChange={handleInputChange}
                placeholder="อีเมล"
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="password" className="form-label">
                รหัสผ่าน <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                id="password"
                name="password"
                value={studentData.password}
                onChange={handleInputChange}
                placeholder="รหัสผ่าน"
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              <small className="form-text text-muted">รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร</small>
            </div>

            <div className="col-md-6">
              <label htmlFor="confirmPassword" className="form-label">
                ยืนยันรหัสผ่าน <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                id="confirmPassword"
                name="confirmPassword"
                value={studentData.confirmPassword}
                onChange={handleInputChange}
                placeholder="ยืนยันรหัสผ่าน"
              />
              {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
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
                ชื่อจริง <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
                id="firstName"
                name="firstName"
                value={studentData.firstName}
                onChange={handleInputChange}
                placeholder="ชื่อจริง"
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
                value={studentData.lastName}
                onChange={handleInputChange}
                placeholder="นามสกุล"
              />
              {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="studentCode" className="form-label">
                รหัสนักศึกษา <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.studentCode ? "is-invalid" : ""}`}
                id="studentCode"
                name="studentCode"
                value={studentData.studentCode}
                onChange={handleInputChange}
                placeholder="รหัสนักศึกษา"
              />
              {errors.studentCode && <div className="invalid-feedback">{errors.studentCode}</div>}
            </div>

            <div className="col-md-6">
              <label htmlFor="academicYear" className="form-label">
                ชั้นปีการศึกษา <span className="text-danger">*</span>
              </label>
              <select
                className={`form-select ${errors.academicYear ? "is-invalid" : ""}`}
                id="academicYear"
                name="academicYear"
                value={studentData.academicYear}
                onChange={handleInputChange}
              >
                <option value="">เลือกชั้นปี</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
              {errors.academicYear && <div className="invalid-feedback">{errors.academicYear}</div>}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="department" className="form-label">
                ภาควิชา <span className="text-danger">*</span>
              </label>
              {isLoading ? (
                <div className="d-flex align-items-center mb-2">
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  <span>กำลังโหลดข้อมูลภาควิชา...</span>
                </div>
              ) : (
                <select
                  className={`form-select ${errors.department ? "is-invalid" : ""}`}
                  id="department"
                  name="department"
                  value={studentData.department}
                  onChange={handleInputChange}
                  disabled={isLoading}
                >
                  <option value="">เลือกภาควิชา</option>
                  {departments.map((dept) => (
                    <option key={dept.department_id} value={dept.department_id}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
              )}
              {errors.department && <div className="invalid-feedback">{errors.department}</div>}
            </div>

            <div className="col-md-6">
              <label htmlFor="educationLevel" className="form-label">
                ระดับการศึกษา <span className="text-danger">*</span>
              </label>
              <select
                className={`form-select ${errors.educationLevel ? "is-invalid" : ""}`}
                id="educationLevel"
                name="educationLevel"
                value={studentData.educationLevel}
                onChange={handleInputChange}
              >
                <option value="">เลือกระดับการศึกษา</option>
                <option value="ปริญญาตรี">ปริญญาตรี</option>
                <option value="ปริญญาโท">ปริญญาโท</option>
                <option value="ปริญญาเอก">ปริญญาเอก</option>
              </select>
              {errors.educationLevel && <div className="invalid-feedback">{errors.educationLevel}</div>}
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

export default AddStudents;