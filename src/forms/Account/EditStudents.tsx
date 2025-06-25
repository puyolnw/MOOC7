import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

// Interface for department data
interface Department {
  department_id: number;
  department_name: string;
  faculty: string;
}

// Interface for student data
interface StudentData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  studentCode: string;
  department: string;
  educationLevel: string;
  academicYear: string;
}

interface EditStudentsProps {
  onSubmit?: (studentData: any) => void;
  onCancel?: () => void;
}

const EditStudents: React.FC<EditStudentsProps> = ({ onSubmit, onCancel }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL;

  // State for loading and errors
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  // State for departments
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [departmentError, setDepartmentError] = useState<string | null>(null);

  // State for student data
  const [studentData, setStudentData] = useState<StudentData>({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    studentCode: "",
    department: "",
    educationLevel: "",
    academicYear: "",
  });

  // State for errors
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    studentCode: "",
    department: "",
    educationLevel: "",
    academicYear: "",
  });

  // Fetch student data and departments
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        toast.error("ไม่พบรหัสนักศึกษา");
        navigate("/admin-account/students");
        return;
      }

      try {
        setIsLoading(true);
        setApiError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          setApiError("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
          toast.error("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
          return;
        }

        // Fetch student data
        const studentRes = await axios.get(`${apiURL}/api/accounts/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!studentRes.data.success) {
          throw new Error(studentRes.data.message || "ไม่พบข้อมูลนักศึกษา");
        }

        const student = studentRes.data.student;
        setStudentData({
          username: student.username || "",
          email: student.email || "",
          firstName: student.first_name || "",
          lastName: student.last_name || "",
          studentCode: student.student_code ? String(student.student_code) : "",
          department: student.department_id ? String(student.department_id) : "",
          educationLevel: student.education_level || "",
          academicYear: student.academic_year ? String(student.academic_year) : "",
        });

        // Fetch departments
        setIsLoadingDepartments(true);
        const deptRes = await axios.get(`${apiURL}/api/auth/departments`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (deptRes.data.success) {
          setDepartments(deptRes.data.departments);
        } else {
          setDepartmentError(deptRes.data.message || "ไม่สามารถดึงข้อมูลภาควิชาได้");
        }
        setIsLoadingDepartments(false);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "ไม่สามารถโหลดข้อมูลได้";
        setApiError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, apiURL, navigate]);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setStudentData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      studentCode: "",
      department: "",
      educationLevel: "",
      academicYear: "",
    };

    // Validate username
    if (!studentData.username.trim()) {
      newErrors.username = "กรุณากรอกชื่อผู้ใช้";
      isValid = false;
    } else if (studentData.username.length < 3) {
      newErrors.username = "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร";
      isValid = false;
    }

    // Validate email
    if (!studentData.email.trim()) {
      newErrors.email = "กรุณากรอกอีเมล";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(studentData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
      isValid = false;
    }

    // Validate first name
    if (!studentData.firstName.trim()) {
      newErrors.firstName = "กรุณากรอกชื่อจริง";
      isValid = false;
    }

    // Validate last name
    if (!studentData.lastName.trim()) {
      newErrors.lastName = "กรุณากรอกนามสกุล";
      isValid = false;
    }

    // Validate student code
    if (!studentData.studentCode.trim()) {
      newErrors.studentCode = "กรุณากรอกรหัสนักศึกษา";
      isValid = false;
    }

    // Validate academic year
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

    // Validate department
    if (!studentData.department) {
      newErrors.department = "กรุณาเลือกภาควิชา";
      isValid = false;
    }

    // Validate education level
    if (!studentData.educationLevel) {
      newErrors.educationLevel = "กรุณาเลือกระดับการศึกษา";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
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
        toast.error("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
        return;
      }

      const formData = {
        username: studentData.username,
        email: studentData.email,
        student_code: parseInt(studentData.studentCode),
        department_id: studentData.department,
        education_level: studentData.educationLevel,
        academic_year: parseInt(studentData.academicYear),
        first_name: studentData.firstName,
        last_name: studentData.lastName,
      };

      const response = await axios.put(`${apiURL}/api/accounts/students/${id}`, formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setApiSuccess("แก้ไขข้อมูลนักศึกษาสำเร็จ");
        toast.success("แก้ไขข้อมูลนักศึกษาสำเร็จ");

        if (onSubmit) {
          onSubmit(response.data);
        } else {
          setTimeout(() => {
            navigate("/admin-account/students");
          }, 1500);
        }
      } else {
        let errorMessage = response.data.message || "เกิดข้อผิดพลาดในการแก้ไขข้อมูลนักศึกษา";
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
      console.error("Error updating student:", error);
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

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate("/admin-account/students");
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">กำลังโหลดข้อมูลนักศึกษา...</p>
        </div>
      </div>
    );
  }

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

      {/* API Error/Success Messages */}
      {apiSuccess && (
        <div className="alert alert-success mb-4">
          <i className="fas fa-check-circle me-2"></i>
          {apiSuccess}
        </div>
      )}
      {apiError && (
        <div className="alert alert-danger mb-4">
          <i className="fas fa-exclamation-circle me-2"></i>
          {apiError}
        </div>
      )}

      {/* Student Information Section */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">แก้ไขข้อมูลนักศึกษา</h5>

          {departmentError && (
            <div className="alert alert-danger mb-3">
              <i className="fas fa-exclamation-circle me-2"></i>
              {departmentError}
            </div>
          )}

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
                สาขาวิชา <span className="text-danger">*</span>
              </label>
              {isLoadingDepartments ? (
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
                  disabled={isLoadingDepartments}
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

      {/* Action Buttons */}
      <div className="d-flex justify-content-end gap-2 mt-4">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handleCancel}
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
              <i className="fas fa-save me-2"></i>บันทึกการแก้ไข
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default EditStudents;
