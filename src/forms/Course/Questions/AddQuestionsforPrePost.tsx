import React, { useState, useEffect } from "react";
import axios from "axios";

// ===== TYPES & INTERFACES =====
type ObjectiveType = "MC" | "SC" | "TF";

interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuestionData {
  title: string;
  description: string;
  score: number;
  type: ObjectiveType;
  choices: Choice[];
  quizzes: string[];
}

interface Quiz {
  id: string;
  title: string;
  questions: number;
}

interface ValidationErrors {
  title?: string;
  description?: string;
  type?: string;
  score?: string;
  choices?: string;
  correctAnswers?: string;
}

interface AddQuestionsforPrePostProps {
  onSubmit?: (questionData: any) => void;
  onCancel?: () => void;
}

// ===== MAIN COMPONENT =====
const AddQuestionsforPrePost: React.FC<AddQuestionsforPrePostProps> = ({ onSubmit, onCancel }) => {
  const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // ===== STATE MANAGEMENT =====
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [currentStep, setCurrentStep] = useState<'form' | 'preview'>('form');
  
  // Quiz data
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [quizFilterTerm, setQuizFilterTerm] = useState("");
  const [showQuizModal, setShowQuizModal] = useState(false);
  
  // Question data - เริ่มต้นเป็น objective เลย
  const [questionData, setQuestionData] = useState<QuestionData>({
    title: "",
    description: "",
    type: "MC",
    choices: [
      { id: generateId(), text: "ตัวเลือกที่ 1", isCorrect: false },
      { id: generateId(), text: "ตัวเลือกที่ 2", isCorrect: false },
      { id: generateId(), text: "ตัวเลือกที่ 3", isCorrect: false }
    ],
    score: 1,
    quizzes: []
  });
  
  // Form helpers
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [newChoiceText, setNewChoiceText] = useState("");

  // ===== EFFECTS =====
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
          setFilteredQuizzes([]);
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };
    fetchQuizzes();
  }, []);

  // Filter quizzes based on filter term
  useEffect(() => {
    if (quizFilterTerm.trim() === "") {
      setFilteredQuizzes([]);
    } else {
      const filtered = availableQuizzes.filter(quiz => 
        quiz.title.toLowerCase().includes(quizFilterTerm.toLowerCase())
      );
      setFilteredQuizzes(filtered);
    }
  }, [quizFilterTerm, availableQuizzes]);

  // Update choices when objective question type changes
  useEffect(() => {
    if (questionData.type === "TF") {
      setQuestionData(prev => ({
        ...prev,
        choices: [
          { id: generateId(), text: "True", isCorrect: false },
          { id: generateId(), text: "False", isCorrect: false }
        ]
      }));
    } else if ((questionData.type === "MC" || questionData.type === "SC") && questionData.choices.length < 3) {
      setQuestionData(prev => ({
        ...prev,
        choices: [
          { id: generateId(), text: "ตัวเลือกที่ 1", isCorrect: false },
          { id: generateId(), text: "ตัวเลือกที่ 2", isCorrect: false },
          { id: generateId(), text: "ตัวเลือกที่ 3", isCorrect: false }
        ]
      }));
    }
  }, [questionData.type]);

  // ===== VALIDATION =====
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    if (!questionData.title.trim()) {
      newErrors.title = "กรุณาระบุชื่อคำถาม";
      isValid = false;
    }

    if (questionData.score < 1 || questionData.score > 100) {
      newErrors.score = "คะแนนต้องอยู่ระหว่าง 1-100";
      isValid = false;
    }

    if (questionData.choices.length < 2) {
      newErrors.choices = "ต้องมีตัวเลือกอย่างน้อย 2 ตัวเลือก";
      isValid = false;
    }

    const correctAnswers = questionData.choices.filter(c => c.isCorrect);
    
    if (questionData.type === "MC" && correctAnswers.length < 2) {
      newErrors.correctAnswers = "ข้อสอบหลายตัวเลือกต้องมีคำตอบที่ถูกต้องอย่างน้อย 2 ข้อ";
      isValid = false;
    } else if ((questionData.type === "SC" || questionData.type === "TF") && correctAnswers.length !== 1) {
      newErrors.correctAnswers = "ต้องเลือกคำตอบที่ถูกต้องเพียง 1 ข้อ";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // ===== EVENT HANDLERS =====
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setQuestionData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
    
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as ObjectiveType;
    
    setQuestionData(prev => ({
      ...prev,
      type: newType
    }));
  };

  // Objective question handlers
  const handleChoiceChange = (id: string, text: string) => {
    const updatedChoices = questionData.choices.map(choice => 
      choice.id === id ? { ...choice, text } : choice
    );
    setQuestionData(prev => ({ ...prev, choices: updatedChoices }));
    setErrors(prev => ({ ...prev, choices: "" }));
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
    
    setQuestionData(prev => ({ ...prev, choices: updatedChoices }));
    setErrors(prev => ({ ...prev, correctAnswers: "" }));
  };

  const handleAddChoice = () => {
    if (newChoiceText.trim()) {
      if (questionData.choices.length >= 10) {
        setErrors(prev => ({ ...prev, choices: "สามารถเพิ่มตัวเลือกได้สูงสุด 10 ตัวเลือก" }));
        return;
      }
      
      const newChoice: Choice = {
        id: generateId(),
        text: newChoiceText.trim(),
        isCorrect: false
      };
      
      setQuestionData(prev => ({ ...prev, choices: [...prev.choices, newChoice] }));
      setNewChoiceText("");
    }
  };

  const handleDeleteChoice = (id: string) => {
    if (questionData.choices.length <= 2) {
      setErrors(prev => ({ ...prev, choices: "ต้องมีตัวเลือกอย่างน้อย 2 ตัวเลือก" }));
      return;
    }
    
    const updatedChoices = questionData.choices.filter(choice => choice.id !== id);
    setQuestionData(prev => ({ ...prev, choices: updatedChoices }));
  };

  // Quiz selection handlers
  const handleToggleQuiz = (quizId: string) => {
    const updatedQuizzes = questionData.quizzes.includes(quizId)
      ? questionData.quizzes.filter(id => id !== quizId)
      : [...questionData.quizzes, quizId];
    
    setQuestionData(prev => ({ ...prev, quizzes: updatedQuizzes }));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setApiError("");
    setApiSuccess("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      
      const apiData = {
        title: questionData.title,
        description: questionData.description,
        category: "objective",
        type: questionData.type,
        score: questionData.score,
        quizzes: questionData.quizzes,
        choices: questionData.choices.map(choice => ({
          text: choice.text,
          isCorrect: choice.isCorrect
        }))
      };

      const response = await axios.post(`${apiUrl}/api/courses/questions`, apiData);
      
      setApiSuccess("สร้างคำถามสำเร็จ");
      
      if (onSubmit) {
        onSubmit(response.data.question);
      }

      // Reset form
      setQuestionData({
        title: "",
        description: "",
        type: "MC",
        choices: [
          { id: generateId(), text: "ตัวเลือกที่ 1", isCorrect: false },
          { id: generateId(), text: "ตัวเลือกที่ 2", isCorrect: false },
          { id: generateId(), text: "ตัวเลือกที่ 3", isCorrect: false }
        ],
        score: 1,
        quizzes: []
      });
      setErrors({});
      
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
  };

  const handleCancel = () => {
    if (currentStep === 'preview') {
      setCurrentStep('form');
    } else if (onCancel) {
      onCancel();
    }
  };

  // ===== RENDER FUNCTIONS =====
  const renderQuestionInfo = () => (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-light">
        <h5 className="mb-0">
          <i className="fas fa-info-circle me-2"></i>
          ข้อมูลคำถาม
        </h5>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            ชื่อคำถาม <span className="text-danger">*</span>
          </label>
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
          <label htmlFor="description" className="form-label">
            คำอธิบาย
          </label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            value={questionData.description}
            onChange={handleInputChange}
            placeholder="คำอธิบายเพิ่มเติม (ไม่บังคับ)"
            rows={3}
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="score" className="form-label">
            คะแนน <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            className={`form-control ${errors.score ? 'is-invalid' : ''}`}
            id="score"
            name="score"
            value={questionData.score}
            onChange={handleInputChange}
            min="1"
            max="100"
          />
          {errors.score && <div className="invalid-feedback">{errors.score}</div>}
        </div>
      </div>
    </div>
  );

  const renderObjectiveSettings = () => (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <i className="fas fa-list-ul me-2"></i>
          ตั้งค่าข้อสอบปรนัย
        </h5>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <label htmlFor="type" className="form-label">
            ประเภทข้อสอบ <span className="text-danger">*</span>
          </label>
          <select
            className="form-select"
            id="type"
            name="type"
            value={questionData.type}
            onChange={handleTypeChange}
          >
            <option value="MC">Multiple Choice (เลือกได้หลายข้อ)</option>
            <option value="SC">Single Choice (เลือกได้ข้อเดียว)</option>
            <option value="TF">True/False (ถูก/ผิด)</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">
            ตัวเลือก <span className="text-danger">*</span>
          </label>
          {errors.choices && <div className="text-danger small mb-2">{errors.choices}</div>}
          {errors.correctAnswers && <div className="text-danger small mb-2">{errors.correctAnswers}</div>}
          
          <div className="choices-container">
            {questionData.choices.map((choice, index) => (
              <div key={choice.id} className="choice-item mb-2">
                <div className="input-group">
                  <div className="input-group-text">
                    <input
                      type={questionData.type === "MC" ? "checkbox" : "radio"}
                      name="correctAnswer"
                      checked={choice.isCorrect}
                      onChange={() => handleCorrectAnswerChange(choice.id)}
                      className="form-check-input mt-0"
                    />
                  </div>
                  <span className="input-group-text choice-label">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    value={choice.text}
                    onChange={(e) => handleChoiceChange(choice.id, e.target.value)}
                    placeholder={`ตัวเลือกที่ ${index + 1}`}
                    disabled={questionData.type === "TF"}
                  />
                  {questionData.type !== "TF" && questionData.choices.length > 2 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => handleDeleteChoice(choice.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {questionData.type !== "TF" && questionData.choices.length < 10 && (
            <div className="add-choice-section mt-3">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={newChoiceText}
                  onChange={(e) => setNewChoiceText(e.target.value)}
                  placeholder="เพิ่มตัวเลือกใหม่"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddChoice()}
                />
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={handleAddChoice}
                  disabled={!newChoiceText.trim()}
                >
                  <i className="fas fa-plus me-1"></i>
                  เพิ่ม
                </button>
              </div>
            </div>
          )}

          <div className="mt-2">
            <small className="text-muted">
              {questionData.type === "MC" && "เลือกตัวเลือกที่ถูกต้อง (สามารถเลือกได้หลายข้อ)"}
              {questionData.type === "SC" && "เลือกตัวเลือกที่ถูกต้อง (เลือกได้เพียงข้อเดียว)"}
              {questionData.type === "TF" && "เลือกคำตอบที่ถูกต้อง (True หรือ False)"}
            </small>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuizSelection = () => (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-success text-white">
        <h5 className="mb-0">
          <i className="fas fa-clipboard-list me-2"></i>
          เลือกแบบทดสอบ
        </h5>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <button
            type="button"
            className="btn btn-outline-success"
            onClick={() => setShowQuizModal(true)}
          >
            <i className="fas fa-search me-2"></i>
            เลือกแบบทดสอบ ({questionData.quizzes.length} รายการ)
          </button>
        </div>

        {questionData.quizzes.length > 0 && (
          <div className="selected-quizzes">
            <h6>แบบทดสอบที่เลือก:</h6>
            <div className="quiz-tags">
              {questionData.quizzes.map(quizId => {
                const quiz = availableQuizzes.find(q => q.id === quizId);
                return quiz ? (
                  <span key={quizId} className="badge bg-success me-2 mb-2">
                    {quiz.title}
                    <button
                      type="button"
                      className="btn-close btn-close-white ms-2"
                      onClick={() => handleToggleQuiz(quizId)}
                    ></button>
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-info text-white">
        <h5 className="mb-0">
          <i className="fas fa-eye me-2"></i>
          ตัวอย่างคำถาม
        </h5>
      </div>
      <div className="card-body">
        <div className="question-preview">
          <h6 className="question-title">{questionData.title}</h6>
          {questionData.description && (
            <p className="question-description text-muted">{questionData.description}</p>
          )}
          
          <div className="question-meta mb-3">
            <span className="badge bg-primary me-2">
              {questionData.type === "MC" ? "หลายตัวเลือก" : 
               questionData.type === "SC" ? "ตัวเลือกเดียว" : "ถูก/ผิด"}
            </span>
            <span className="badge bg-secondary">{questionData.score} คะแนน</span>
          </div>

          <div className="choices-preview">
            {questionData.choices.map((choice, index) => (
              <div key={choice.id} className={`choice-preview ${choice.isCorrect ? 'correct' : ''}`}>
                <div className="choice-indicator">
                  {questionData.type === "MC" ? (
                    <i className={`fas ${choice.isCorrect ? 'fa-check-square' : 'fa-square'}`}></i>
                  ) : (
                    <i className={`fas ${choice.isCorrect ? 'fa-dot-circle' : 'fa-circle'}`}></i>
                  )}
                </div>
                <span className="choice-label">{String.fromCharCode(65 + index)}.</span>
                <span className="choice-text">{choice.text}</span>
                {choice.isCorrect && <i className="fas fa-check text-success ms-2"></i>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuizModal = () => (
    <div className={`modal fade ${showQuizModal ? 'show' : ''}`} 
         style={{ display: showQuizModal ? 'block' : 'none' }}
         tabIndex={-1}>
      <div className="modal-dialog modal-lg">
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
              <input
                type="text"
                className="form-control"
                placeholder="ค้นหาแบบทดสอบ..."
                value={quizFilterTerm}
                onChange={(e) => setQuizFilterTerm(e.target.value)}
              />
            </div>
            
            <div className="quiz-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {(quizFilterTerm ? filteredQuizzes : availableQuizzes).map(quiz => (
                <div key={quiz.id} className="quiz-item">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`quiz-${quiz.id}`}
                      checked={questionData.quizzes.includes(quiz.id)}
                      onChange={() => handleToggleQuiz(quiz.id)}
                    />
                    <label className="form-check-label" htmlFor={`quiz-${quiz.id}`}>
                      <div className="quiz-info">
                        <h6 className="quiz-title">{quiz.title}</h6>
                        <small className="text-muted">{quiz.questions} คำถาม</small>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
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
  );

  // ===== MAIN RENDER =====
  return (
    <div className="add-questions-container">
      <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-1">
                  <i className="fas fa-plus-circle me-2"></i>
                  เพิ่มคำถามใหม่
                </h4>
                <p className="text-muted mb-0">สร้างคำถามปรนัยสำหรับแบบทดสอบ</p>
              </div>
              <div className="step-indicator">
                <span className={`step ${currentStep === 'form' ? 'active' : ''}`}>
                  <i className="fas fa-edit"></i> สร้าง
                </span>
                <span className={`step ${currentStep === 'preview' ? 'active' : ''}`}>
                  <i className="fas fa-eye"></i> ตัวอย่าง
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {apiError && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="fas fa-exclamation-circle me-2"></i>
            {apiError}
            <button
              type="button"
              className="btn-close"
              onClick={() => setApiError("")}
            ></button>
          </div>
        )}

        {apiSuccess && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="fas fa-check-circle me-2"></i>
            {apiSuccess}
            <button
              type="button"
              className="btn-close"
              onClick={() => setApiSuccess("")}
            ></button>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-lg-8">
              {currentStep === 'form' ? (
                <>
                  {renderQuestionInfo()}
                  {renderObjectiveSettings()}
                  {renderQuizSelection()}
                </>
              ) : (
                renderPreview()
              )}
            </div>
            
            <div className="col-lg-4">
              <div className="sticky-top" style={{ top: '20px' }}>
                <div className="card shadow-sm border-0">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">
                      <i className="fas fa-cog me-2"></i>
                      การดำเนินการ
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="d-grid gap-2">
                      {currentStep === 'form' ? (
                        <>
                          <button
                            type="button"
                            className="btn btn-outline-info"
                            onClick={() => setCurrentStep('preview')}
                            disabled={!questionData.title.trim()}
                          >
                            <i className="fas fa-eye me-2"></i>
                            ดูตัวอย่าง
                          </button>
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                กำลังสร้าง...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-save me-2"></i>
                                สร้างคำถาม
                              </>
                            )}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setCurrentStep('form')}
                          >
                            <i className="fas fa-edit me-2"></i>
                            แก้ไข
                          </button>
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                                กำลังสร้าง...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-save me-2"></i>
                                สร้างคำถาม
                              </>
                            )}
                          </button>
                        </>
                      )}
                      
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                      >
                        <i className="fas fa-times me-2"></i>
                        {currentStep === 'preview' ? 'กลับ' : 'ยกเลิก'}
                      </button>
                    </div>

                    {/* Question Summary */}
                    <div className="mt-4 pt-3 border-top">
                      <h6 className="text-muted mb-3">สรุปคำถาม</h6>
                      <div className="summary-item">
                        <small className="text-muted">ประเภท:</small>
                        <div className="fw-bold">
                          {questionData.type === "MC" ? "หลายตัวเลือก" : 
                           questionData.type === "SC" ? "ตัวเลือกเดียว" : "ถูก/ผิด"}
                        </div>
                      </div>
                      <div className="summary-item">
                        <small className="text-muted">คะแนน:</small>
                        <div className="fw-bold">{questionData.score} คะแนน</div>
                      </div>
                      <div className="summary-item">
                        <small className="text-muted">ตัวเลือก:</small>
                        <div className="fw-bold">{questionData.choices.length} ตัวเลือก</div>
                      </div>
                      <div className="summary-item">
                        <small className="text-muted">คำตอบที่ถูก:</small>
                        <div className="fw-bold">
                          {questionData.choices.filter(c => c.isCorrect).length} ข้อ
                        </div>
                      </div>
                      <div className="summary-item">
                        <small className="text-muted">แบบทดสอบ:</small>
                        <div className="fw-bold">{questionData.quizzes.length} รายการ</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Quiz Selection Modal */}
        {showQuizModal && renderQuizModal()}
      </div>

      {/* Custom Styles */}
      <style>{`
        .add-questions-container {
          padding: 20px 0;
        }

        .step-indicator {
          display: flex;
          gap: 1rem;
        }

        .step {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          background: #f8f9fa;
          color: #6c757d;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .step.active {
          background: #007bff;
          color: white;
        }

        .choice-item {
          transition: all 0.2s ease;
        }

        .choice-item:hover {
          background: #f8f9fa;
          border-radius: 4px;
          padding: 0.25rem;
          margin: -0.25rem;
        }

        .choice-label {
          background: #e9ecef !important;
          font-weight: 600;
          min-width: 40px;
        }

        .add-choice-section {
          border-top: 1px dashed #dee2e6;
          padding-top: 1rem;
        }

        .quiz-item {
          padding: 0.75rem;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          margin-bottom: 0.5rem;
          transition: all 0.2s ease;
        }

        .quiz-item:hover {
          background: #f8f9fa;
          border-color: #007bff;
        }

        .quiz-title {
          margin-bottom: 0.25rem;
          font-size: 0.9rem;
        }

        .quiz-tags .badge {
          font-size: 0.8rem;
          padding: 0.5rem 0.75rem;
        }

        .question-preview {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }

        .question-title {
          color: #2c3e50;
          margin-bottom: 0.75rem;
          font-weight: 600;
        }

        .question-description {
          font-style: italic;
          margin-bottom: 1rem;
        }

        .choices-preview {
          margin-top: 1rem;
        }

        .choice-preview {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          margin-bottom: 0.5rem;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .choice-preview:hover {
          background: white;
        }

        .choice-preview.correct {
          background: #d4edda;
          border-left: 3px solid #28a745;
        }

        .choice-indicator {
          color: #6c757d;
          width: 20px;
        }

        .choice-preview.correct .choice-indicator {
          color: #28a745;
        }

        .choice-label {
          font-weight: 600;
          color: #495057;
          min-width: 25px;
        }

        .choice-text {
          flex: 1;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #f1f3f4;
        }

        .summary-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .modal.show {
          background: rgba(0, 0, 0, 0.5);
        }

        .card {
          transition: all 0.3s ease;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        }

        .btn {
          transition: all 0.2s ease;
        }

        .btn:hover {
          transform: translateY(-1px);
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }

        .alert {
          border: none;
          border-radius: 8px;
        }

        .spinner-border-sm {
          width: 1rem;
          height: 1rem;
        }

        @media (max-width: 768px) {
          .step-indicator {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .step {
            text-align: center;
          }
          
          .choice-item .input-group {
            flex-wrap: wrap;
          }
          
          .choice-label {
            min-width: 35px;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .card {
          animation: fadeIn 0.3s ease-out;
        }

        .choice-item {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AddQuestionsforPrePost;

