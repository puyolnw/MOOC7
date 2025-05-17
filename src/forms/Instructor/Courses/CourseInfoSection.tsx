import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Interface for department data
interface Department {
  department_id: string;
  department_name: string;
}

interface CourseInfoSectionProps {
  courseData: {
    title: string;
    category: string;
    department_id: string;
    description: string;
  };
  errors: {
    title: string;
    category: string; 
    department_id: string;
    description: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const apiURL = import.meta.env.VITE_API_URL;

const CourseInfoSection: React.FC<CourseInfoSectionProps> = ({ courseData, errors, handleInputChange }) => {
  // State for departments
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [departmentError, setDepartmentError] = useState<string | null>(null);

  // Fetch departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsLoadingDepartments(true);
        setDepartmentError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          setDepartmentError("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
          return;
        }

        const response = await axios.get(`${apiURL}/api/courses/subjects/departments/list`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setDepartments(response.data.departments);
          console.log("Departments fetched:", response.data.departments); // Debug
        } else {
          setDepartmentError(response.data.message || "ไม่สามารถดึงข้อมูลคณะได้");
        }
      } catch (error: any) {
        console.error("Error fetching departments:", error);
        setDepartmentError(error.response?.data?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลคณะ");
      } finally {
        setIsLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  // Debug ค่าที่เลือก
  console.log("Selected Category:", courseData.category);
  console.log("Selected Department ID:", courseData.department_id);

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body">
        <h5 className="card-title mb-3">1. ข้อมูลหลักสูตร</h5>

        {departmentError && (
          <div className="alert alert-danger mb-3">
            <i className="fas fa-exclamation-circle me-2"></i>
            {departmentError}
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            ชื่อหลักสูตร <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className={`form-control ${errors.title ? "is-invalid" : ""}`}
            id="title"
            name="title"
            value={courseData.title}
            onChange={handleInputChange}
            placeholder="ชื่อหลักสูตร"
          />
          {errors.title && <div className="invalid-feedback">{errors.title}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="category" className="form-label">
            หมวดหมู่หลักสูตร <span className="text-danger">*</span>
          </label>
          <select
            className={`form-control ${errors.category ? "is-invalid" : ""}`}
            id="category"
            name="category"
            value={courseData.category}
            onChange={handleInputChange}
          >
            <option value="">เลือกหมวดหมู่</option>
            <option value="technology">เทคโนโลยี</option>
            <option value="business">ธุรกิจ</option>
            <option value="science">วิทยาศาสตร์</option>
            <option value="arts">ศิลปะ</option>
            <option value="others">อื่นๆ</option>
          </select>
          {errors.category && <div className="invalid-feedback">{errors.category}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="department_id" className="form-label">
            คณะ/สาขาวิชา <span className="text-danger">*</span>
          </label>
          {isLoadingDepartments ? (
            <div className="text-center">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="ms-2">กำลังโหลดข้อมูลคณะ...</span>
            </div>
          ) : (
            <select
              className={`form-control ${errors.department_id ? "is-invalid" : ""}`}
              id="department_id"
              name="department_id"
              value={courseData.department_id}
              onChange={handleInputChange}
              disabled={isLoadingDepartments || !!departmentError}
            >
              <option value="">เลือกคณะ/สาขาวิชา</option>
              {departments.map((dept) => (
                <option key={dept.department_id} value={dept.department_id}>
                  {dept.department_name}
                </option>
              ))}
            </select>
          )}
          {errors.department_id && <div className="invalid-feedback">{errors.department_id}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            คำอธิบายหลักสูตร <span className="text-danger">*</span>
          </label>
          <textarea
            className={`form-control ${errors.description ? "is-invalid" : ""}`}
            id="description"
            name="description"
            value={courseData.description}
            onChange={handleInputChange}
            rows={4}
            placeholder="เช่น หลักสูตรนี้สอนพื้นฐานการเขียนโปรแกรมด้วย Python เหมาะสำหรับผู้เริ่มต้น"
          ></textarea>
          {errors.description && <div className="invalid-feedback">{errors.description}</div>}
        </div>
      </div>
    </div>
  );
};

export default CourseInfoSection;