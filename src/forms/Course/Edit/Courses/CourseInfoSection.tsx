import React from 'react';

interface Department {
  department_id: string;
  department_name: string;
}

interface CourseInfoSectionProps {
  courseData: {
    courseId: string;
    title: string;
    category: string;
    department_id: string;
    description: string;
  };
  departments: Department[];
  errors: {
    title: string;
    category: string;
    department_id: string;
    description: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const CourseInfoSection: React.FC<CourseInfoSectionProps> = ({
  courseData,
  departments,
  errors,
  handleInputChange,
}) => {
  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body">
        <h5 className="card-title mb-3">1. ข้อมูลหลักสูตร</h5>

        <div className="mb-3">
          <label htmlFor="courseId" className="form-label">
            รหัสคอร์ส
          </label>
          <input
            type="text"
            className="form-control"
            id="courseId"
            value={courseData.courseId}
            readOnly
            disabled
          />
        </div>

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
          <select
            className={`form-control ${errors.department_id ? "is-invalid" : ""}`}
            id="department_id"
            name="department_id"
            value={courseData.department_id}
            onChange={handleInputChange}
          >
            <option value="">เลือกคณะ/สาขาวิชา</option>
            {departments.map((dept) => (
              <option key={dept.department_id} value={dept.department_id}>
                {dept.department_name}
              </option>
            ))}
          </select>
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