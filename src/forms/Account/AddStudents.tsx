import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify"; // ยังคง import toast ไว้สำหรับ toast.error

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
  // เพิ่มฟิลด์สำหรับนักเรียน
  schoolName?: string;
  studyProgram?: string;
  gradeLevel?: string;
  address?: string;
}

interface AddStudentsProps {
  onSubmit?: (studentData: any) => void;
  onCancel?: () => void;
}

const AddStudents: React.FC<AddStudentsProps> = ({ onSubmit, onCancel }) => {
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL;

  // ตัวเลือกประเภทผู้ใช้
  const tab_title: string[] = ["นักศึกษา", "นักเรียน"];
  
  // ตัวเลือกโรงเรียน
  const schoolNames = [
    'โรงเรียน1',
    'โรงเรียน2',
  ];

  const studyPrograms = [
    'วิทย์-คณิต',
    'ศิลป์-ภาษา',
    'ศิลป์-คำนวณ',
    'ศิลป์-สังคม',
  ];

  // State สำหรับการโหลดและข้อผิดพลาด
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  // const [apiSuccess, setApiSuccess] = useState<string | null>(null); // ลบ apiSuccess state ออก

  // State สำหรับประเภทผู้ใช้
  const [userType, setUserType] = useState<number>(0); // 0 = นักศึกษา, 1 = นักเรียน

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
    // ฟิลด์สำหรับนักเรียน
    schoolName: "",
    studyProgram: "",
    gradeLevel: "",
    address: "",
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
    // ฟิลด์สำหรับนักเรียน
    schoolName: "",
    studyProgram: "",
    gradeLevel: "",
    address: "",
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

    // ตรวจสอบรหัสนักศึกษา/นักเรียน
    if (!studentData.studentCode.trim()) {
      newErrors.studentCode = userType === 0 ? "กรุณากรอกรหัสนักศึกษา" : "กรุณากรอกรหัสนักเรียน";
      isValid = false;
    }

    if (userType === 0) {
      // ตรวจสอบเฉพาะนักศึกษา
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
    } else {
      // ตรวจสอบเฉพาะนักเรียน
      // ตรวจสอบระดับชั้น
      if (!studentData.gradeLevel) {
        newErrors.gradeLevel = "กรุณาเลือกระดับชั้น";
        isValid = false;
      }

      // ตรวจสอบชื่อโรงเรียน
      if (!studentData.schoolName) {
        newErrors.schoolName = "กรุณาเลือกโรงเรียน";
        isValid = false;
      }

      // ตรวจสอบแผนการเรียน
      if (!studentData.studyProgram) {
        newErrors.studyProgram = "กรุณาเลือกแผนการเรียน";
        isValid = false;
      }

      // ตรวจสอบที่อยู่
      if (!studentData.address?.trim()) {
        newErrors.address = "กรุณากรอกที่อยู่";
        isValid = false;
      }
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
      // setApiSuccess(null); // ลบการ set apiSuccess ออก

      const token = localStorage.getItem("token");

      if (!token) {
        setApiError("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
        setIsSubmitting(false);
        return;
      }

      // สร้างข้อมูลสำหรับส่งไปยัง API
      const baseFormData = {
        username: studentData.username,
        email: studentData.email,
        password: studentData.password,
        role_id: 1, // ตั้งค่า role_id เป็น 1 สำหรับทั้งนักศึกษาและนักเรียน
        student_code: parseInt(studentData.studentCode),
        first_name: studentData.firstName,
        last_name: studentData.lastName,
      };

      const formData = userType === 0 
        ? {
            // ข้อมูลสำหรับนักศึกษา
            ...baseFormData,
            department_id: studentData.department,
            education_level: studentData.educationLevel,
            academic_year: parseInt(studentData.academicYear),
          }
        : {
            // ข้อมูลสำหรับนักเรียน
            ...baseFormData,
            school_name: studentData.schoolName,
            study_program: studentData.studyProgram,
            education_level: studentData.gradeLevel, // ใช้ gradeLevel เป็น education_level สำหรับนักเรียน
            grade_level: studentData.gradeLevel,
            address: studentData.address,
          };

      // ส่งข้อมูลไปยัง API
      const response = await axios.post(`${apiURL}/api/auth/register`, formData, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // ลบ setApiSuccess("เพิ่มนักศึกษาสำเร็จ"); และ toast.success("เพิ่มนักศึกษาสำเร็จsss"); ออก
        // การแจ้งเตือน "บันทึกข้อมูลนักศึกษาสำเร็จ!" จะถูกจัดการโดยคอมโพเนนต์แม่ที่เรียก AddStudents (CreateAccountStudentsArea)

        // ถ้าสำเร็จและมี callback onSubmit ให้เรียกใช้
        if (onSubmit) {
          onSubmit(response.data); // ส่งข้อมูลที่สำเร็จกลับไปให้คอมโพเนนต์แม่
        } else {
          // หากไม่มี onSubmit (ซึ่งไม่ควรเกิดขึ้นถ้าใช้เป็นฟอร์มย่อย) ให้จัดการ Redirect เอง
          // แต่เพื่อให้สอดคล้องกับโครงสร้าง parent component ควรใช้ onSubmit
          // หากถึงตรงนี้โดยไม่มี onSubmit ก็หมายถึงว่า CreateAccountStudentsArea ไม่ได้ส่ง onSubmit มา
          // ซึ่งในกรณีนั้น ควรให้ Toast แสดงใน CreateAccountStudentsArea แทน
          // ในกรณีนี้จะไม่มีการ redirect ตรงนี้ เพื่อให้ CreateAccountStudentsArea เป็นผู้ควบคุม
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
        toast.error(errorMessage); // ยังคงแสดง toast error
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
      toast.error(errorMessage); // ยังคงแสดง toast error
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

      {/* Tab Selector สำหรับเลือกประเภทผู้ใช้ */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">เลือกประเภทผู้ใช้</h5>
          <div className="row g-3">
            {tab_title.map((title, index) => (
              <div key={index} className="col-6">
                <div 
                  className={`card h-100 cursor-pointer ${userType === index ? 'border-primary bg-primary-subtle' : 'border-light'}`}
                  onClick={() => setUserType(index)}
                  style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                >
                  <div className="card-body text-center">
                    <div className="mb-2">
                      <i className={`fas ${index === 0 ? 'fa-graduation-cap' : 'fa-school'} ${userType === index ? 'text-primary' : 'text-muted'} fs-3`}></i>
                    </div>
                    <h6 className={`card-title mb-1 ${userType === index ? 'text-primary' : ''}`}>{title}</h6>
                    <small className={`text-muted ${userType === index ? 'text-primary' : ''}`}>
                      {index === 0 ? 'มหาวิทยาลัย' : 'โรงเรียนมัธยม'}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ลบส่วนแสดงข้อความสำเร็จ (apiSuccess) ออก */}
      {/* {apiSuccess && (
        <div className="alert alert-success mb-4">
          <i className="fas fa-check-circle me-2"></i>
          {apiSuccess}
        </div>
      )} */}

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
                {userType === 0 ? 'รหัสนักศึกษา' : 'รหัสนักเรียน'} <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.studentCode ? "is-invalid" : ""}`}
                id="studentCode"
                name="studentCode"
                value={studentData.studentCode}
                onChange={handleInputChange}
                placeholder={userType === 0 ? 'รหัสนักศึกษา' : 'รหัสนักเรียน'}
              />
              {errors.studentCode && <div className="invalid-feedback">{errors.studentCode}</div>}
            </div>

            <div className="col-md-6">
              {userType === 0 ? (
                // ฟิลด์สำหรับนักศึกษา: ชั้นปีการศึกษา
                <>
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
                </>
              ) : (
                // ฟิลด์สำหรับนักเรียน: ระดับชั้น
                <>
                  <label htmlFor="gradeLevel" className="form-label">
                    ระดับชั้น <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${errors.gradeLevel ? "is-invalid" : ""}`}
                    id="gradeLevel"
                    name="gradeLevel"
                    value={studentData.gradeLevel}
                    onChange={handleInputChange}
                  >
                    <option value="">เลือกระดับชั้น</option>
                    <option value="มัธยมต้น">มัธยมต้น</option>
                    <option value="มัธยมปลาย">มัธยมปลาย</option>
                  </select>
                  {errors.gradeLevel && <div className="invalid-feedback">{errors.gradeLevel}</div>}
                </>
              )}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              {userType === 0 ? (
                // ฟิลด์สำหรับนักศึกษา: ภาควิชา
                <>
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
                </>
              ) : (
                // ฟิลด์สำหรับนักเรียน: ชื่อโรงเรียน
                <>
                  <label htmlFor="schoolName" className="form-label">
                    ชื่อโรงเรียน <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${errors.schoolName ? "is-invalid" : ""}`}
                    id="schoolName"
                    name="schoolName"
                    value={studentData.schoolName}
                    onChange={handleInputChange}
                  >
                    <option value="">เลือกโรงเรียน</option>
                    {schoolNames.map((school) => (
                      <option key={school} value={school}>
                        {school}
                      </option>
                    ))}
                  </select>
                  {errors.schoolName && <div className="invalid-feedback">{errors.schoolName}</div>}
                </>
              )}
            </div>

            <div className="col-md-6">
              {userType === 0 ? (
                // ฟิลด์สำหรับนักศึกษา: ระดับการศึกษา
                <>
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
                </>
              ) : (
                // ฟิลด์สำหรับนักเรียน: แผนการเรียน
                <>
                  <label htmlFor="studyProgram" className="form-label">
                    แผนการเรียน <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${errors.studyProgram ? "is-invalid" : ""}`}
                    id="studyProgram"
                    name="studyProgram"
                    value={studentData.studyProgram}
                    onChange={handleInputChange}
                  >
                    <option value="">เลือกแผนการเรียน</option>
                    {studyPrograms.map((program) => (
                      <option key={program} value={program}>
                        {program}
                      </option>
                    ))}
                  </select>
                  {errors.studyProgram && <div className="invalid-feedback">{errors.studyProgram}</div>}
                </>
              )}
            </div>
          </div>

          {/* เพิ่มฟิลด์ที่อยู่สำหรับนักเรียนเท่านั้น */}
          {userType === 1 && (
            <div className="row mb-3">
              <div className="col-12">
                <label htmlFor="address" className="form-label">
                  ที่อยู่ <span className="text-danger">*</span>
                </label>
                <textarea
                  className={`form-control ${errors.address ? "is-invalid" : ""}`}
                  id="address"
                  name="address"
                  value={studentData.address}
                  onChange={handleInputChange}
                  placeholder="ที่อยู่ของนักเรียน"
                  rows={3}
                />
                {errors.address && <div className="invalid-feedback">{errors.address}</div>}
              </div>
            </div>
          )}
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