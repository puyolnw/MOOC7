import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Interface for department data
interface Department {
  department_id: string;
  department_name: string;
  faculty: string;
}

interface CourseInfoSectionProps {
  courseData: {
    title: string;
    department_id: string;
    description: string;
    study_result: string;
  };
  errors: {
    title: string;
    department_id: string;
    description: string;
    study_result: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const apiURL = import.meta.env.VITE_API_URL;

const CourseInfoSection: React.FC<CourseInfoSectionProps> = ({ courseData, errors, handleInputChange }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [departmentError, setDepartmentError] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

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

        const response = await axios.get(`${apiURL}/api/auth/departments`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          const deptList = response.data.departments.map((d: Department) => ({
            department_id: d.department_id.toString(), // แปลงเป็น string ให้ชัดเจน
            department_name: d.department_name,
            faculty: d.faculty
          }));
          setDepartments(deptList);
          // ตั้งค่าเริ่มต้นจาก courseData.department_id
          const initialDept = deptList.find((d: Department) => d.department_id === courseData.department_id);
          setSelectedDepartment(initialDept || null);
          console.log("Departments:", deptList); // ตรวจสอบข้อมูลทั้งหมด
        } else {
          setDepartmentError(response.data.message || "ไม่สามารถดึงข้อมูลสาขาวิชาได้");
        }
      } catch (error: any) {
        console.error("Error fetching departments:", error);
        setDepartmentError(error.response?.data?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลสาขาวิชา");
      } finally {
        setIsLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  // อัปเดต selectedDepartment เมื่อ courseData.department_id เปลี่ยน
  useEffect(() => {
    const dept = departments.find(d => d.department_id === courseData.department_id);
    setSelectedDepartment(dept || null);
    console.log("Selected Department ID:", courseData.department_id, "Faculty:", dept?.faculty, "Departments:", departments); // Debug เพิ่มเติม
  }, [courseData.department_id, departments]);

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
          <label htmlFor="department_id" className="form-label">
            สาขาวิชา <span className="text-danger">*</span>
          </label>
          {isLoadingDepartments ? (
            <div className="text-center">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="ms-2">กำลังโหลดข้อมูลสาขาวิชา...</span>
            </div>
          ) : (
            <select
              className={`form-control ${errors.department_id ? "is-invalid" : ""}`}
              id="department_id"
              name="department_id"
              value={courseData.department_id || ""}
              onChange={handleInputChange}
              disabled={isLoadingDepartments || !!departmentError}
            >
              <option value="">เลือกสาขาวิชา</option>
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
          <label className="form-label">คณะ</label>
          <input
            type="text"
            className="form-control"
            value={selectedDepartment ? selectedDepartment.faculty : ""}
            readOnly
            disabled
          />
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

        <div className="mb-3">
          <label htmlFor="study_result" className="form-label">
            ผลลัพธ์การศึกษา
          </label>
          <textarea
            className="form-control"
            id="study_result"
            name="study_result"
            value={courseData.study_result}
            onChange={handleInputChange}
            rows={3}
            placeholder="ระบุผลลัพธ์การเรียนรู้ที่คาดหวัง เช่น ผู้เรียนสามารถเขียนโปรแกรมเบื้องต้นได้ ฯลฯ"
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default CourseInfoSection;