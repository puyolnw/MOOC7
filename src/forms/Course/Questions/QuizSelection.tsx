import React from "react";

interface Quiz {
  id: string;
  title: string;
  questions: number;
}

interface QuestionData {
  quizzes: string[];
}

interface QuizSelectionProps {
  questionData: QuestionData;
  availableQuizzes: Quiz[];
  handleToggleQuiz: (quizId: string) => void;
  showQuizModal: boolean;
  setShowQuizModal: React.Dispatch<React.SetStateAction<boolean>>;
  quizSearchTerm: string;
  setQuizSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  filteredQuizzes: Quiz[];
}

const QuizSelection: React.FC<QuizSelectionProps> = ({
  questionData,
  availableQuizzes,
  handleToggleQuiz,
  showQuizModal,
  setShowQuizModal,
  quizSearchTerm,
  setQuizSearchTerm,
  filteredQuizzes
}) => (
  <div className="card shadow-sm border-0 mb-4">
    <div className="card-header bg-light">
      <h5 className="mb-0">3. เลือกแบบทดสอบที่จะใช้คำถามนี้</h5>
    </div>
    <div className="card-body">
      <p className="text-muted mb-3">
        คุณสามารถเลือกแบบทดสอบที่ต้องการใช้คำถามนี้ได้ (ไม่บังคับ) และสามารถเลือกได้มากกว่า 1 แบบทดสอบ
      </p>
      
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          {questionData.quizzes.length > 0 ? (
            <span className="badge bg-success rounded-pill">
              เลือกแล้ว {questionData.quizzes.length} แบบทดสอบ
            </span>
          ) : (
            <span className="badge bg-secondary rounded-pill">
              ยังไม่ได้เลือกแบบทดสอบ
            </span>
          )}
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => setShowQuizModal(true)}
        >
          <i className="fas fa-list-ul me-2"></i>เลือกแบบทดสอบ
        </button>
      </div>
      
      {questionData.quizzes.length > 0 && (
        <div className="selected-quizzes">
          <h6 className="mb-2">แบบทดสอบที่เลือก:</h6>
          <div className="row g-2">
            {questionData.quizzes.map(quizId => {
              const quiz = availableQuizzes.find(q => q.id === quizId);
              return quiz ? (
                <div key={quiz.id} className="col-md-6">
                  <div className="card border h-100">
                    <div className="card-body py-2 px-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{quiz.title}</h6>
                          <p className="mb-0 small text-muted">จำนวนคำถาม: {quiz.questions} ข้อ</p>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm text-danger"
                          onClick={() => handleToggleQuiz(quiz.id)}
                        >
                          <i className="fas fa-times-circle"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  </div>
);

export default QuizSelection;
