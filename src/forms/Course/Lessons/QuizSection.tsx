import React from 'react';

interface QuizSectionProps {
  lessonData: any;
  errors: any;
  selectedQuiz: any;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectQuiz: (quiz: any) => void;
  setShowQuizModal: (show: boolean) => void;
  showQuizModal: boolean;
  setShowCreateQuizModal: (show: boolean) => void;
  filteredQuizzes: any[];
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
  setShowCreateQuizModal,
  filteredQuizzes,
  searchTerm,
  setSearchTerm
}) => (
  <div className="card shadow-sm border-0 mb-4">
    <div className="card-header bg-light">
      <h5 className="mb-0">4. แบบทดสอบประจำบทเรียน</h5>
    </div>
    <div className="card-body">
      <div className="form-check mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          id="hasQuiz"
          name="hasQuiz"
          checked={lessonData.hasQuiz}
          onChange={handleCheckboxChange}
        />
        <label className="form-check-label" htmlFor="hasQuiz">
          บทเรียนนี้มีแบบทดสอบ
        </label>
      </div>
      
      {lessonData.hasQuiz && (
        <div className="quiz-selection mt-3">
          {errors.quiz && (
            <div className="alert alert-danger" role="alert">
              {errors.quiz}
            </div>
          )}
          
          {selectedQuiz ? (
            <div className="selected-quiz">
              <div className="card border">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">{selectedQuiz.title}</h6>
                      <p className="mb-0 small text-muted">
                        จำนวนคำถาม: {selectedQuiz.questions} ข้อ
                        {selectedQuiz.description && ` | ${selectedQuiz.description}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm text-danger"
                      onClick={() => {
                        handleSelectQuiz(null);
                      }}
                    >
                      <i className="fas fa-times-circle"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowQuizModal(true)}
              >
                <i className="fas fa-list-ul me-2"></i>เลือกแบบทดสอบที่มีอยู่
              </button>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => setShowCreateQuizModal(true)}
              >
                <i className="fas fa-plus-circle me-2"></i>สร้างแบบทดสอบใหม่
              </button>
            </div>
          )}
        </div>
      )}
    </div>
    
    {showQuizModal && (
      <div className="modal fade show"
        style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
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
              
              <div className="quiz-list">
                {filteredQuizzes.length > 0 ? (
                  <div className="list-group">
                    {filteredQuizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        onClick={() => handleSelectQuiz(quiz)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div>
                          <h6 className="mb-1">{quiz.title}</h6>
                          <p className="mb-0 small text-muted">
                            จำนวนคำถาม: {quiz.questions} ข้อ
                            {quiz.description && ` | ${quiz.description}`}
                          </p>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="selectedQuiz"
                            checked={selectedQuiz?.id === quiz.id}
                            onChange={() => handleSelectQuiz(quiz)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted">ไม่พบแบบทดสอบที่ตรงกับคำค้นหา</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowQuizModal(false)}>
                ยกเลิก
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowQuizModal(false)}
                disabled={!selectedQuiz}
              >
                เลือกแบบทดสอบนี้
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default QuizSection;
