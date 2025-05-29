import React from "react";

interface QuizInfoSectionProps {
  quizData: {
    title: string;
    description: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  errors: {
    title: string;
  };
}

const QuizInfoSection: React.FC<QuizInfoSectionProps> = ({ quizData, handleInputChange, errors }) => (
  <div className="card shadow-sm border-0 mb-4">
    <div className="card-header bg-light">
      <h5 className="mb-0">1. ข้อมูลแบบทดสอบ</h5>
    </div>
    <div className="card-body">
      <div className="mb-3">
        <label htmlFor="title" className="form-label">ชื่อแบบทดสอบ <span className="text-danger">*</span></label>
        <input
          type="text"
          className={`form-control ${errors.title ? 'is-invalid' : ''}`}
          id="title"
          name="title"
          value={quizData.title}
          onChange={handleInputChange}
          placeholder="ระบุชื่อแบบทดสอบ"
        />
        {errors.title && <div className="invalid-feedback">{errors.title}</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="description" className="form-label">คำอธิบายแบบทดสอบ</label>
        <textarea
          className="form-control"
          id="description"
          name="description"
          value={quizData.description}
          onChange={handleInputChange}
          rows={3}
          placeholder="ระบุคำอธิบายเพิ่มเติม (ถ้ามี)"
        ></textarea>
      </div>
    </div>
  </div>
);

export default QuizInfoSection;
