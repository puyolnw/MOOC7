import React from "react";

interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuestionData {
  title: string;
  description: string;
  type: string;
  choices: Choice[];
  score: number;
  quizzes: string[];
}

interface AnswerSettingsProps {
  questionData: QuestionData;
  errors: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleChoiceChange: (id: string, text: string) => void;
  handleCorrectAnswerChange: (id: string) => void;
  handleAddChoice: () => void;
  handleDeleteChoice: (id: string) => void;
  newChoiceText: string;
  setNewChoiceText: React.Dispatch<React.SetStateAction<string>>;
  blankAnswer: string;
  setBlankAnswer: React.Dispatch<React.SetStateAction<string>>;
  handleAddBlankAnswer: () => void;
  handleDeleteBlankAnswer: (id: string) => void;
}

const AnswerSettings: React.FC<AnswerSettingsProps> = ({
  questionData,
  errors,
  handleInputChange,
  handleChoiceChange,
  handleCorrectAnswerChange,
  handleAddChoice,
  handleDeleteChoice,
  newChoiceText,
  setNewChoiceText,
  blankAnswer,
  setBlankAnswer,
  handleAddBlankAnswer,
  handleDeleteBlankAnswer
}) => (
  <div className="card shadow-sm border-0 mb-4">
    <div className="card-header bg-light">
      <h5 className="mb-0">2. ตั้งค่าคำตอบ</h5>
    </div>
    <div className="card-body">
      <div className="mb-3">
        <label htmlFor="type" className="form-label">ประเภทคำถาม <span className="text-danger">*</span></label>
        <select
          className={`form-select ${errors.type ? 'is-invalid' : ''}`}
          id="type"
          name="type"
          value={questionData.type}
          onChange={handleInputChange}
        >
          <option value="">เลือกประเภทคำถาม</option>
          <option value="MC">หลายตัวเลือก (Multiple Choice)</option>
          <option value="SC">ตัวเลือกเดียว (Single Choice)</option>
          <option value="TF">ถูก/ผิด (True/False)</option>
          <option value="FB">เติมคำ (Fill in Blank)</option>
        </select>
        {errors.type && <div className="invalid-feedback">{errors.type}</div>}
      </div>
      
      <div className="mb-3">
        <label htmlFor="score" className="form-label">คะแนน</label>
        <input
          type="number"
          className="form-control"
          id="score"
          name="score"
          value={questionData.score}
          onChange={handleInputChange}
          min="1"
          max="100"
        />
      </div>
      
      {(questionData.type === "MC" || questionData.type === "SC") && (
        <div className="mb-3">
          <label className="form-label">ตัวเลือก <span className="text-danger">*</span></label>
          {errors.choices && <div className="text-danger small mb-2">{errors.choices}</div>}
          {errors.correctAnswers && <div className="text-danger small mb-2">{errors.correctAnswers}</div>}
          
          <div className="choices-container">
            {questionData.choices.map((choice) => (
              <div key={choice.id} className="d-flex align-items-center mb-2">
                <div className="form-check me-2">
                  <input
                    className="form-check-input"
                    type={questionData.type === "MC" ? "checkbox" : "radio"}
                    name="correctAnswer"
                    checked={choice.isCorrect}
                    onChange={() => handleCorrectAnswerChange(choice.id)}
                  />
                </div>
                <input
                  type="text"
                  className="form-control me-2"
                  value={choice.text}
                  onChange={(e) => handleChoiceChange(choice.id, e.target.value)}
                  placeholder="ระบุตัวเลือก"
                />
                {questionData.choices.length > 3 && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDeleteChoice(choice.id)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="d-flex mt-3">
            <input
              type="text"
              className="form-control me-2"
              value={newChoiceText}
              onChange={(e) => setNewChoiceText(e.target.value)}
              placeholder="เพิ่มตัวเลือกใหม่"
            />
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={handleAddChoice}
              disabled={questionData.choices.length >= 10}
            >
              <i className="fas fa-plus"></i> เพิ่ม
            </button>
          </div>
          <small className="text-muted mt-1 d-block">
            {questionData.type === "MC" ? "เลือกได้หลายข้อ" : "เลือกได้เพียงข้อเดียว"} (สูงสุด 10 ตัวเลือก)
          </small>
        </div>
      )}
      
      {questionData.type === "TF" && (
        <div className="mb-3">
          <label className="form-label">ตัวเลือก <span className="text-danger">*</span></label>
          {errors.correctAnswers && <div className="text-danger small mb-2">{errors.correctAnswers}</div>}
          
          <div className="choices-container">
            {questionData.choices.map((choice) => (
              <div key={choice.id} className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="radio"
                  name="correctAnswer"
                  checked={choice.isCorrect}
                  onChange={() => handleCorrectAnswerChange(choice.id)}
                />
                <label className="form-check-label">{choice.text}</label>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {questionData.type === "FB" && (
        <div className="mb-3">
          <label className="form-label">คำตอบที่ถูกต้อง <span className="text-danger">*</span></label>
          <p className="text-muted small">เพิ่มคำตอบที่ถูกต้องทั้งหมด ระบบจะตรวจว่าถูกเมื่อผู้เรียนตอบตรงกับคำตอบใดคำตอบหนึ่ง</p>
          {errors.choices && <div className="text-danger small mb-2">{errors.choices}</div>}
          
          <div className="choices-container mb-3">
            {questionData.choices.map((choice) => (
              <div key={choice.id} className="d-flex align-items-center mb-2">
                <input
                  type="text"
                  className="form-control me-2"
                  value={choice.text}
                  onChange={(e) => handleChoiceChange(choice.id, e.target.value)}
                  placeholder="คำตอบที่ถูกต้อง"
                  readOnly
                />
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleDeleteBlankAnswer(choice.id)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
          
          <div className="d-flex">
            <input
              type="text"
              className="form-control me-2"
              value={blankAnswer}
              onChange={(e) => setBlankAnswer(e.target.value)}
              placeholder="เพิ่มคำตอบที่ถูกต้อง"
            />
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={handleAddBlankAnswer}
            >
              <i className="fas fa-plus"></i> เพิ่ม
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default AnswerSettings;
