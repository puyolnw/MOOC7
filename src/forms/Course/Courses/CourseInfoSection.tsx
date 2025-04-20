import React from 'react';
import { CourseData } from "./AddCourses"

interface CourseInfoSectionProps {
  courseData: CourseData;
  errors: { title: string; description: string; };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const CourseInfoSection: React.FC<CourseInfoSectionProps> = ({ courseData, errors, handleInputChange }) => (
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

export default CourseInfoSection;
