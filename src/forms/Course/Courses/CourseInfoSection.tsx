import React, { useState, useEffect } from 'react';
import { CourseData } from "./AddCourses";
import axios from 'axios';

interface Department {
  department_id: string;
  department_name: string;
  description: string;
}

interface CourseInfoSectionProps {
  courseData: CourseData;
  errors: { title: string; description: string; department_id: string; };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const CourseInfoSection: React.FC<CourseInfoSectionProps> = ({ courseData, errors, handleInputChange }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const apiURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${apiURL}/api/courses/subjects/departments/list`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setDepartments(response.data.departments);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepartments();
  }, [apiURL]);


  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body">
        <h5 className="card-title mb-3">1. ข้อมูลหลักสูตร</h5>
        
        <div className="mb-3">
          <label htmlFor="title" className="form-label">ชื่อหลักสูตร <span className="text-danger">*</span></label>
          <input
            type="text"
            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
            id="title"
            name="title"
            value={courseData.title}
            onChange={handleInputChange}
            placeholder="ระบุชื่อหลักสูตร"
          />
          {errors.title && <div className="invalid-feedback">{errors.title}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="department_id" className="form-label">สาขาวิชา <span className="text-danger">*</span></label>
          <select
    className={`form-select ${errors.department_id ? 'is-invalid' : ''}`}
    id="department_id"
    name="department_id"
    value={courseData.department_id}
    onChange={handleInputChange}
  >
    <option value="">เลือกสาขาวิชา</option>
    {departments.map(dept => (
      <option key={dept.department_id} value={dept.department_id}>
        {dept.department_name}
      </option>
    ))}
  </select>
          {errors.department_id && <div className="invalid-feedback">{errors.department_id}</div>}
        </div>
        
        <div className="mb-3">
          <label htmlFor="description" className="form-label">คำอธิบายหลักสูตร <span className="text-danger">*</span></label>
          <textarea
            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
            id="description"
            name="description"
            value={courseData.description}
            onChange={handleInputChange}
            rows={4}
            placeholder="ระบุคำอธิบายเกี่ยวกับหลักสูตร"
          ></textarea>
          {errors.description && <div className="invalid-feedback">{errors.description}</div>}
        </div>
      </div>
    </div>
  );
};

export default CourseInfoSection;
