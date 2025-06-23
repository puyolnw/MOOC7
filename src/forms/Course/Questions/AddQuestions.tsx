import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import QuestionInfo from "./QuestionInfo";
import AnswerSettings from "./AnswerSettings";
import QuizSelection from "./QuizSelection";

// ประเภทของคำถาม
type QuestionType = "TF" | "MC" | "SC" | "FB" | "";

// ตัวเลือกคำตอบ
interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
}

// ข้อมูลแบบทดสอบ
interface Quiz {
  id: string;
  title: string;
  questions: number;
}

// ข้อมูลคำถาม
interface QuestionData {
  title: string;
  description: string;
  type: QuestionType;
  choices: Choice[];
  score: number;
  quizzes: string[];
}

// กำหนด interface สำหรับ props
interface AddQuestionsProps {
  onSubmit?: (questionData: any) => void;
  onCancel?: () => void;
}

const AddQuestions: React.FC<AddQuestionsProps> = ({ onSubmit, onCancel }) => {
  const generateId = () => `choice_${Math.random().toString(36).substr(2, 9)}`;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([
    { id: "quiz1", title: "แบบทดสอบ React พื้นฐาน", questions: 10 },
    { id: "quiz2", title: "แบบทดสอบ TypeScript", questions: 8 },
    { id: "quiz3", title: "แบบทดสอบ JavaScript", questions: 15 },
    { id: "quiz4", title: "แบบทดสอบ HTML และ CSS", questions: 12 },
    { id: "quiz5", title: "แบบทดสอบ Node.js", questions: 7 }
  ]);
  const [questionData, setQuestionData] = useState<QuestionData>({
    title: "",
    description: "",
    type: "",
    choices: [],
    score: 1,
    quizzes: []
  });
  const [errors, setErrors] = useState({
    title: "",
    type: "",
    choices: "",
    correctAnswers: ""
  });
  const [newChoiceText, setNewChoiceText] = useState("");
  const [blankAnswer, setBlankAnswer] = useState("");
  const [quizSearchTerm, setQuizSearchTerm] = useState("");
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [currentQuizPage, setCurrentQuizPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${apiUrl}/api/courses/quizzes`);
        if (response.data && response.data.quizzes) {
          const quizzes = response.data.quizzes.map((quiz: any) => ({
            id: quiz.quiz_id,
            title: quiz.title,
            questions: quiz.question_count || 0
          }));
          setAvailableQuizzes(quizzes);
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };
    fetchQuizzes();
  }, []);

  const filteredQuizzes = useMemo(() => {
    return availableQuizzes.filter(quiz => 
      quiz.title.toLowerCase().includes(quizSearchTerm.toLowerCase())
    );
  }, [availableQuizzes, quizSearchTerm]);

  const totalQuizPages = Math.ceil(filteredQuizzes.length / itemsPerPage);
  const paginatedQuizzes = useMemo(() => {
    const start = (currentQuizPage - 1) * itemsPerPage;
    return filteredQuizzes.slice(start, start + itemsPerPage);
  }, [filteredQuizzes, currentQuizPage]);

  useEffect(() => {
    if (questionData.type === "TF") {
      setQuestionData({
        ...questionData,
        choices: [
          { id: generateId(), text: "True", isCorrect: false },
          { id: generateId(), text: "False", isCorrect: false }
        ]
      });
    } else if (questionData.type === "MC" || questionData.type === "SC") {
      setQuestionData({
        ...questionData,
        choices: [
          { id: generateId(), text: "ตัวเลือกที่ 1", isCorrect: false },
          { id: generateId(), text: "ตัวเลือกที่ 2", isCorrect: false },
          { id: generateId(), text: "ตัวเลือกที่ 3", isCorrect: false }
        ]
      });
    } else if (questionData.type === "FB") {
      setQuestionData({
        ...questionData,
        choices: []
      });
      setBlankAnswer("");
    }
  }, [questionData.type]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQuestionData({
      ...questionData,
      [name]: value
    });
    if (name === "title" || name === "type") {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const handleChoiceChange = (id: string, text: string) => {
    const updatedChoices = questionData.choices.map(choice => 
      choice.id === id ? { ...choice, text } : choice
    );
    setQuestionData({
      ...questionData,
      choices: updatedChoices
    });
    setErrors({
      ...errors,
      choices: ""
    });
  };

  const handleCorrectAnswerChange = (id: string) => {
    let updatedChoices;
    if (questionData.type === "SC" || questionData.type === "TF") {
      updatedChoices = questionData.choices.map(choice => 
        ({ ...choice, isCorrect: choice.id === id })
      );
    } else {
      updatedChoices = questionData.choices.map(choice => 
        choice.id === id ? { ...choice, isCorrect: !choice.isCorrect } : choice
      );
    }
    setQuestionData({
      ...questionData,
      choices: updatedChoices
    });
    setErrors({
      ...errors,
      correctAnswers: ""
    });
  };

  const handleAddChoice = () => {
    if (newChoiceText.trim() === "") return;
    if (questionData.choices.length >= 10) {
      setErrors({
        ...errors,
        choices: "สามารถเพิ่มตัวเลือกได้สูงสุด 10 ตัวเลือก"
      });
      return;
    }
    const newChoice: Choice = {
      id: generateId(),
      text: newChoiceText,
      isCorrect: false
    };
    setQuestionData({
      ...questionData,
      choices: [...questionData.choices, newChoice]
    });
    setNewChoiceText("");
  };

  const handleDeleteChoice = (id: string) => {
    if (questionData.choices.length <= 3 && (questionData.type === "MC" || questionData.type === "SC")) {
      setErrors({
        ...errors,
        choices: "ต้องมีตัวเลือกอย่างน้อย 3 ตัวเลือก"
      });
      return;
    }
    const updatedChoices = questionData.choices.filter(choice => choice.id !== id);
    setQuestionData({
      ...questionData,
      choices: updatedChoices
    });
  };

  const handleAddBlankAnswer = () => {
    if (blankAnswer.trim() === "") return;
    const newChoice: Choice = {
      id: generateId(),
      text: blankAnswer,
      isCorrect: true
    };
    setQuestionData({
      ...questionData,
      choices: [...questionData.choices, newChoice]
    });
    setBlankAnswer("");
  };

  const handleDeleteBlankAnswer = (id: string) => {
    const updatedChoices = questionData.choices.filter(choice => choice.id !== id);
    setQuestionData({
      ...questionData,
      choices: updatedChoices
    });
  };

  const handleToggleQuiz = (quizId: string) => {
    if (questionData.quizzes.includes(quizId)) {
      setQuestionData({
        ...questionData,
        quizzes: questionData.quizzes.filter(id => id !== quizId)
      });
    } else {
      setQuestionData({
        ...questionData,
        quizzes: [...questionData.quizzes, quizId]
      });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: "",
      type: "",
      choices: "",
      correctAnswers: ""
    };
    if (questionData.title.trim() === "") {
      newErrors.title = "กรุณาระบุชื่อคำถาม";
      isValid = false;
    }
    if (questionData.type === "") {
      newErrors.type = "กรุณาเลือกประเภทคำถาม";
      isValid = false;
    }
    if (questionData.type === "MC" || questionData.type === "SC") {
      if (questionData.choices.length < 3) {
        newErrors.choices = "ต้องมีตัวเลือกอย่างน้อย 3 ตัวเลือก";
        isValid = false;
      }
      const correctAnswers = questionData.choices.filter(choice => choice.isCorrect);
      if (questionData.type === "MC" && correctAnswers.length < 2) {
        newErrors.correctAnswers = "ต้องเลือกคำตอบที่ถูกต้องอย่างน้อย 2 ข้อ";
        isValid = false;
      } else if (questionData.type === "SC" && correctAnswers.length !== 1) {
        newErrors.correctAnswers = "ต้องเลือกคำตอบที่ถูกต้องเพียง 1 ข้อ";
        isValid = false;
      }
    } else if (questionData.type === "TF") {
      const correctAnswers = questionData.choices.filter(choice => choice.isCorrect);
      if (correctAnswers.length !== 1) {
        newErrors.correctAnswers = "ต้องเลือกคำตอบที่ถูกต้องเพียง 1 ข้อ";
        isValid = false;
      }
    } else if (questionData.type === "FB") {
      if (questionData.choices.length === 0) {
        newErrors.choices = "กรุณาเพิ่มคำตอบที่ถูกต้องอย่างน้อย 1 คำตอบ";
        isValid = false;
      }
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      setApiError("");
      setApiSuccess("");
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const apiData = {
          title: questionData.title,
          description: questionData.description,
          type: questionData.type,
          score: questionData.score,
          choices: questionData.choices.map(choice => ({
            text: choice.text,
            isCorrect: choice.isCorrect
          })),
          quizzes: questionData.quizzes
        };
        const response = await axios.post(`${apiUrl}/api/courses/questions`, apiData);
        setApiSuccess("สร้างคำถามสำเร็จ");
        if (onSubmit) {
          onSubmit(response.data.question);
        }
        setQuestionData({
          title: "",
          description: "",
          type: "",
          choices: [],
          score: 1,
          quizzes: []
        });
      } catch (error) {
        console.error("Error submitting question:", error);
        if (axios.isAxiosError(error) && error.response) {
          setApiError(error.response.data.message || "เกิดข้อผิดพลาดในการสร้างคำถาม");
        } else {
          setApiError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {apiSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="fas fa-check-circle me-2"></i>
          {apiSuccess}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setApiSuccess("")}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      {apiError && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {apiError}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setApiError("")}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      <QuestionInfo
        questionData={questionData}
        errors={errors}
        handleInputChange={handleInputChange}
      />
      
      <AnswerSettings
        questionData={questionData}
        errors={errors}
        handleInputChange={handleInputChange}
        handleChoiceChange={handleChoiceChange}
        handleCorrectAnswerChange={handleCorrectAnswerChange}
        handleAddChoice={handleAddChoice}
        handleDeleteChoice={handleDeleteChoice}
        newChoiceText={newChoiceText}
        setNewChoiceText={setNewChoiceText}
        blankAnswer={blankAnswer}
        setBlankAnswer={setBlankAnswer}
        handleAddBlankAnswer={handleAddBlankAnswer}
        handleDeleteBlankAnswer={handleDeleteBlankAnswer}
      />
      
      <QuizSelection
        questionData={questionData}
        availableQuizzes={availableQuizzes}
        handleToggleQuiz={handleToggleQuiz}
        showQuizModal={showQuizModal}
        setShowQuizModal={setShowQuizModal}
        quizSearchTerm={quizSearchTerm}
        setQuizSearchTerm={setQuizSearchTerm}
        filteredQuizzes={filteredQuizzes}
      />

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="button" className="btn btn-outline-secondary" onClick={handleCancel}>
          ยกเลิก
        </button>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              กำลังบันทึก...
            </>
          ) : (
            <>
              <i className="fas fa-save me-2"></i>บันทึกคำถาม
            </>
          )}
        </button>
      </div>
      
      {showQuizModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary">
                <h5 className="modal-title text-white">เลือกแบบทดสอบ</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowQuizModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ค้นหาแบบทดสอบ..."
                    value={quizSearchTerm}
                    onChange={(e) => {
                      setQuizSearchTerm(e.target.value);
                      setCurrentQuizPage(1); // reset page when searching
                    }}
                  />
                </div>
                {paginatedQuizzes.length > 0 ? (
                  <>
                    <div className="list-group list-group-flush mb-3">
                      {paginatedQuizzes.map((quiz) => {
                        const isSelected = questionData.quizzes.includes(quiz.id);
                        return (
                          <div
                            key={quiz.id}
                            className={`list-group-item d-flex justify-content-between align-items-center ${
                              isSelected ? "bg-light" : ""
                            }`}
                          >
                            <div>
                              <h6 className="mb-1">{quiz.title}</h6>
                              <p className="mb-0 small text-muted">จำนวนคำถาม: {quiz.questions} ข้อ</p>
                            </div>
                            <button
                              type="button"
                              className={`btn btn-sm ${isSelected ? "btn-success disabled" : "btn-outline-primary"}`}
                              onClick={() => handleToggleQuiz(quiz.id)}
                              disabled={isSelected}
                            >
                              {isSelected ? (
                                <>
                                  <i className="fas fa-check me-1"></i> เลือกแล้ว
                                </>
                              ) : (
                                <>เลือก</>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {totalQuizPages > 1 && (
                      <nav aria-label="Page navigation" className="mt-4">
                        <ul className="pagination justify-content-center">
                          {Array.from({ length: totalQuizPages }, (_, i) => (
                            <li key={i + 1} className={`page-item ${currentQuizPage === i + 1 ? "active" : ""}`}>
                              <button 
                                className="page-link" 
                                onClick={() => setCurrentQuizPage(i + 1)}
                              >
                                {i + 1}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </nav>
                    )}
                    <div className="text-center text-muted small mt-2">
                      แสดง {paginatedQuizzes.length} จากทั้งหมด {filteredQuizzes.length} แบบทดสอบ
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted">ไม่พบแบบทดสอบที่ตรงกับคำค้นหา</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowQuizModal(false)}
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default AddQuestions;