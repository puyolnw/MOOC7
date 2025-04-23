import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

interface QuizSectionProps {
  lessonData: {
    hasQuiz: boolean;
    quizId: string | null;
  };
  errors: {
    quiz: string;
  };
  selectedQuiz: {
    id: string;
    title: string;
    questions: number;
  } | null;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectQuiz: (quizId: string) => void;
  setShowQuizModal: (show: boolean) => void;
  showQuizModal: boolean;
  setShowCreateQuizModal: (show: boolean) => void;
  filteredQuizzes: {
    id: string;
    title: string;
    questions: number;
  }[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const QuizSection: React.FC<QuizSectionProps> = ({
  lessonData,
  errors,
  selectedQuiz,
  handleCheckboxChange,
  handleSelectQuiz,
  setShowQuizModal,
  showQuizModal,
  filteredQuizzes,
  searchTerm,
  setSearchTerm,
}) => {
  const navigate = useNavigate(); // Initialize useNavigate hook
  
  // Function to handle redirection to quiz creation page
  const handleCreateNewQuiz = () => {
    navigate("/admin-quizzes/create-new");
  };
  
  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-light">
        <h5 className="mb-0">4. แบบทดสอบท้ายบทเรียน</h5>
      </div>
      <div className="card-body">
        <div className="form-check form-switch mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="hasQuiz"
            name="hasQuiz"
            checked={lessonData.hasQuiz}
            onChange={handleCheckboxChange}
          />
          <label className="form-check-label" htmlFor="hasQuiz">
            เพิ่มแบบทดสอบท้ายบทเรียน
          </label>
        </div>

        {lessonData.hasQuiz && (
          <div className="quiz-selection mt-3">
            {selectedQuiz ? (
              <div className="selected-quiz">
                <div className="card border">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{selectedQuiz.title}</h6>
                        <p className="mb-0 small text-muted">
                          จำนวนคำถาม: {selectedQuiz.questions} ข้อ
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setShowQuizModal(true)}
                      >
                        เปลี่ยนแบบทดสอบ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="quiz-buttons">
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => setShowQuizModal(true)}
                  >
                    <i className="fas fa-list-check me-2"></i>เลือกแบบทดสอบที่มีอยู่
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-success"
                    onClick={handleCreateNewQuiz} // Changed to use our new function
                  >
                    <i className="fas fa-plus-circle me-2"></i>สร้างแบบทดสอบใหม่
                  </button>
                </div>
                {errors.quiz && (
                  <div className="text-danger mt-2 small">{errors.quiz}</div>
                )}
              </div>
            )}
          </div>
        )}

        {showQuizModal && (
          <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
            tabIndex={-1}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">เลือกแบบทดสอบ</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowQuizModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="ค้นหาแบบทดสอบ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <button className="btn btn-outline-secondary" type="button">
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                  </div>

                  <div className="list-group">
                    {filteredQuizzes.length > 0 ? (
                      filteredQuizzes.map((quiz) => (
                        <div
                          key={quiz.id}
                          className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <h6 className="mb-1">{quiz.title}</h6>
                            <p className="mb-0 small text-muted">
                              จำนวนคำถาม: {quiz.questions} ข้อ
                            </p>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => {
                              handleSelectQuiz(quiz.id);
                              setShowQuizModal(false);
                            }}
                          >
                            เลือก
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted">ไม่พบแบบทดสอบที่ตรงกับคำค้นหา</p>
                        <button
                          type="button"
                          className="btn btn-outline-success mt-2"
                          onClick={handleCreateNewQuiz} // Also add redirection here
                        >
                          <i className="fas fa-plus-circle me-2"></i>สร้างแบบทดสอบใหม่
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowQuizModal(false)}
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizSection;
