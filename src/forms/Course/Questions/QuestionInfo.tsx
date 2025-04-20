import React from "react";

interface QuestionInfoProps {
  questionData: any;
  errors: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const QuestionInfo: React.FC<QuestionInfoProps> = ({ questionData, errors, handleInputChange }) => (
  <div className="card shadow-sm border-0 mb-4">
    <div className="card-header bg-light">
      <h5 className="mb-0">1. ข้อมูลคำถาม</h5>
    </div>
    <div className="card-body">
      <div className="mb-3">
        <label htmlFor="title" className="form-label">ชื่อคำถาม <span className="text-danger">*</span></label>
        <input
          type="text"
          className={`form-control ${errors.title ? 'is-invalid' : ''}`}
          id="title"
          name="title"
          value={questionData.title}
          onChange={handleInputChange}
          placeholder="ระบุชื่อคำถาม"
        />
        {errors.title && <div className="invalid-feedback">{errors.title}</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="description" className="form-label">คำอธิบาย (ไม่บังคับ)</label>
        <textarea
          className="form-control"
          id="description"
          name="description"
          value={questionData.description}
          onChange={handleInputChange}
          rows={3}
          placeholder="ระบุคำอธิบายเพิ่มเติม (ถ้ามี)"
        ></textarea>
      </div>
    </div>
  </div>
);

export default QuestionInfo;
