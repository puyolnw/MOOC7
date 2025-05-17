import React from "react";
import AddQuestions from "./AddQuizzes";

interface Question {
  id: string;
  title: string;
  type: string;
  score: number;
}

interface QuestionsSectionProps {
  quizData: {
    questions: Question[];
  };
  errors: {
    questions: string;
  };
  handleDeleteQuestion: (id: string) => void;
  handleAddNewQuestion: (questionData: any) => void;
  existingQuestions: Question[];
  showAddQuestionForm: boolean;
  setShowAddQuestionForm: React.Dispatch<React.SetStateAction<boolean>>;
  showExistingQuestions: boolean;
  setShowExistingQuestions: React.Dispatch<React.SetStateAction<boolean>>;
  selectedExistingQuestions: string[];
  setSelectedExistingQuestions: React.Dispatch<React.SetStateAction<string[]>>;
  handleSelectExistingQuestion: (id: string) => void;
  handleAddSelectedQuestions: () => void;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  filteredExistingQuestions: Question[];
}

const QuestionsSection: React.FC<QuestionsSectionProps> = ({
  quizData,
  errors,
  handleDeleteQuestion,
  handleAddNewQuestion,
  existingQuestions,
  showAddQuestionForm,
  setShowAddQuestionForm,
  showExistingQuestions,
  setShowExistingQuestions,
  selectedExistingQuestions,
  setSelectedExistingQuestions,
  handleSelectExistingQuestion,
  handleAddSelectedQuestions,
  searchTerm,
  setSearchTerm,
  filteredExistingQuestions
}) => (
  <div className="card shadow-sm border-0 mb-4">
    <div className="card-header bg-light d-flex justify-content-between align-items-center">
      <h5 className="mb-0">2. คำถามประจำแบบทดสอบ</h5>
      <div>
        <span className="badge bg-primary rounded-pill me-2">
          {quizData.questions.length} / 100 คำถาม
        </span>
      </div>
    </div>
    <div className="card-body">
      {errors.questions && (
        <div className="alert alert-danger" role="alert">
          {errors.questions}
        </div>
      )}
      
      {/* รายการคำถาม */}
      {quizData.questions.length > 0 ? (
        <div className="table-responsive mb-4">
          <table className="table table-hover table-sm align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: "50px" }}>ลำดับ</th>
                <th>คำถาม</th>
                <th style={{ width: "120px" }}>ประเภท</th>
                <th style={{ width: "80px" }}>คะแนน</th>
                <th style={{ width: "80px" }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {quizData.questions.map((question, index) => (
                <tr key={question.id}>
                  <td>{index + 1}</td>
                  <td>{question.title}</td>
                  <td>
                    <span className="badge bg-info rounded-pill">
                      {question.type}
                    </span>
                  </td>
                  <td>{question.score}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="alert alert-info" role="alert">
          ยังไม่มีคำถามในแบบทดสอบนี้ กรุณาเพิ่มคำถามอย่างน้อย 1 ข้อ
        </div>
      )}
      
      {/* ปุ่มเพิ่มคำถาม */}
      <div className="d-flex gap-2">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowAddQuestionForm(true)}
          disabled={quizData.questions.length >= 100}
        >
          <i className="fas fa-plus-circle me-2"></i>สร้างคำถามใหม่
        </button>
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => setShowExistingQuestions(true)}
          disabled={quizData.questions.length >= 100 || existingQuestions.length === 0}
        >
          <i className="fas fa-list me-2"></i>เลือกจากคำถามที่มีอยู่
        </button>
      </div>
    </div>

    {/* Modal สำหรับเพิ่มคำถามใหม่ */}
    {showAddQuestionForm && (
      <div className="modal fade show"
        style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
        tabIndex={-1}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">เพิ่มคำถามใหม่</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowAddQuestionForm(false)}
              ></button>
                       </div>
            <div className="modal-body">
              {/* ใช้ฟอร์มเพิ่มคำถามที่มีอยู่แล้ว */}
              <AddQuestions onSubmit={handleAddNewQuestion} onCancel={() => setShowAddQuestionForm(false)} />
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Modal สำหรับเลือกคำถามที่มีอยู่แล้ว */}
    {showExistingQuestions && (
      <div className="modal fade show"
        style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
        tabIndex={-1}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">เลือกคำถามที่มีอยู่แล้ว</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  setShowExistingQuestions(false);
                  setSelectedExistingQuestions([]);
                }}
              ></button>
            </div>
            <div className="modal-body">
              {/* ค้นหาคำถาม */}
              <div className="mb-3">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ค้นหาคำถาม..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn btn-outline-secondary" type="button">
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </div>

              {/* รายการคำถามที่มีอยู่แล้ว */}
              <div className="table-responsive">
                <table className="table table-hover table-sm align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "50px" }}></th>
                      <th>คำถาม</th>
                      <th style={{ width: "120px" }}>ประเภท</th>
                      <th style={{ width: "80px" }}>คะแนน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExistingQuestions.length > 0 ? (
                      filteredExistingQuestions.map((question) => (
                        <tr key={question.id}>
                          <td>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`select-${question.id}`}
                                checked={selectedExistingQuestions.includes(question.id)}
                                onChange={() => handleSelectExistingQuestion(question.id)}
                              />
                            </div>
                          </td>
                          <td>{question.title}</td>
                          <td>
                            <span className="badge bg-info rounded-pill">
                              {question.type}
                            </span>
                          </td>
                          <td>{question.score}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-3">
                          ไม่พบคำถามที่ตรงกับคำค้นหา
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowExistingQuestions(false);
                  setSelectedExistingQuestions([]);
                }}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddSelectedQuestions}
                disabled={selectedExistingQuestions.length === 0}
              >
                เพิ่มคำถามที่เลือก ({selectedExistingQuestions.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default QuestionsSection;

