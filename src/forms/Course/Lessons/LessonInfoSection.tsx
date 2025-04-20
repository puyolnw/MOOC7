import React from 'react';

interface LessonInfoSectionProps {
  lessonData: any;
  errors: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const LessonInfoSection: React.FC<LessonInfoSectionProps> = ({ lessonData, errors, handleInputChange, handleCheckboxChange }) => (
  <div className="card shadow-sm border-0 mb-4">
    <div className="card-header bg-light">
      <h5 className="mb-0">1. ข้อมูลบทเรียน</h5>
    </div>
    <div className="card-body">
      <div className="mb-3">
        <label htmlFor="title" className="form-label">ชื่อบทเรียน <span className="text-danger">*</span></label>
        <input
          type="text"
          className={`form-control ${errors.title ? 'is-invalid' : ''}`}
          id="title"
          name="title"
          value={lessonData.title}
          onChange={handleInputChange}
          placeholder="ระบุชื่อบทเรียน"
        />
        {errors.title && <div className="invalid-feedback">{errors.title}</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="description" className="form-label">คำอธิบายบทเรียน</label>
        <textarea
          className="form-control"
          id="description"
          name="description"
          value={lessonData.description}
          onChange={handleInputChange}
          rows={3}
          placeholder="ระบุคำอธิบายเพิ่มเติม (ถ้ามี)"
        ></textarea>
      </div>
      <div className="form-check mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          id="canPreview"
          name="canPreview"
          checked={lessonData.canPreview}
          onChange={handleCheckboxChange}
        />
        <label className="form-check-label" htmlFor="canPreview">
          อนุญาตให้ผู้เรียนดูตัวอย่างบทเรียนนี้ได้โดยไม่ต้องลงทะเบียน
        </label>
      </div>
    </div>
  </div>
);

export default LessonInfoSection;
