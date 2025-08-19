import React, { useState, useEffect } from "react";
import axios from "axios";

// ===== TYPES & INTERFACES =====
type QuestionCategory = "objective" | "subjective";
type ObjectiveType = "MC" | "SC" | "TF";
type SubjectiveType = "FB";

interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface BaseQuestionData {
  title: string;
  description: string;
  score: number;
  quizzes: string[];
}

interface ObjectiveQuestionData extends BaseQuestionData {
  category: "objective";
  type: ObjectiveType;
  choices: Choice[];
}

interface SubjectiveQuestionData extends BaseQuestionData {
  category: "subjective";
  type: SubjectiveType;
}

type QuestionData = ObjectiveQuestionData | SubjectiveQuestionData;

interface Quiz {
  id: string;
  title: string;
  questions: number;
}

interface ValidationErrors {
  title?: string;
  description?: string;
  category?: string;
  type?: string;
  score?: string;
  choices?: string;
  correctAnswers?: string;
}

interface AddQuestionsProps {
  onSubmit?: (questionData: any) => void;
  onCancel?: () => void;
}

// ===== MAIN COMPONENT =====
const AddQuestions: React.FC<AddQuestionsProps> = ({ onSubmit, onCancel }) => {
  const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // ===== STATE MANAGEMENT =====
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [currentStep, setCurrentStep] = useState<'category' | 'form' | 'preview'>('category');
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | null>(null);
  
  // Quiz data
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [quizFilterTerm, setQuizFilterTerm] = useState("");
  const [showQuizModal, setShowQuizModal] = useState(false);
  
  // Question data
  const [questionData, setQuestionData] = useState<QuestionData>({
    category: "objective",
    title: "",
    description: "",
    type: "MC",
    choices: [],
    score: 1,
    quizzes: []
  } as ObjectiveQuestionData);
  
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

  // Initialize question data when category changes
  useEffect(() => {
    if (selectedCategory) {
      if (selectedCategory === "objective") {
        setQuestionData({
          category: "objective",
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
        } as ObjectiveQuestionData);
      } else {
        setQuestionData({
          category: "subjective",
          title: "",
          description: "",
          type: "FB",
          score: 1,
          quizzes: []
        } as SubjectiveQuestionData);
      }
      setCurrentStep('form');
    }
  }, [selectedCategory]);

  // Update choices when objective question type changes
  useEffect(() => {
    if (questionData.category === "objective") {
      const objData = questionData as ObjectiveQuestionData;
      if (objData.type === "TF") {
        setQuestionData({
          ...objData,
          choices: [
            { id: generateId(), text: "True", isCorrect: false },
            { id: generateId(), text: "False", isCorrect: false }
          ]
        });
      } else if ((objData.type === "MC" || objData.type === "SC") && objData.choices.length < 3) {
        setQuestionData({
          ...objData,
          choices: [
            { id: generateId(), text: "ตัวเลือกที่ 1", isCorrect: false },
            { id: generateId(), text: "ตัวเลือกที่ 2", isCorrect: false },
            { id: generateId(), text: "ตัวเลือกที่ 3", isCorrect: false }
          ]
        });
      }
    }
  }, [questionData.category === "objective" ? (questionData as ObjectiveQuestionData).type : null]);

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

    if (questionData.category === "objective") {
      const objData = questionData as ObjectiveQuestionData;
      
      if (objData.choices.length < 2) {
        newErrors.choices = "ต้องมีตัวเลือกอย่างน้อย 2 ตัวเลือก";
        isValid = false;
      }
      
      // ตรวจสอบว่าตัวเลือกทุกตัวมีข้อความ
      const emptyChoices = objData.choices.filter(choice => !choice.text || choice.text.trim() === "");
      if (emptyChoices.length > 0) {
        newErrors.choices = "กรุณากรอกข้อความให้ครบทุกตัวเลือก";
        isValid = false;
      }

      const correctAnswers = objData.choices.filter(c => c.isCorrect);
      
      if (objData.type === "MC" && correctAnswers.length < 2) {
        newErrors.correctAnswers = "ข้อสอบหลายตัวเลือกต้องมีคำตอบที่ถูกต้องอย่างน้อย 2 ข้อ";
        isValid = false;
      } else if ((objData.type === "SC" || objData.type === "TF") && correctAnswers.length !== 1) {
        newErrors.correctAnswers = "ต้องเลือกคำตอบที่ถูกต้องเพียง 1 ข้อ";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // ===== EVENT HANDLERS =====
  const handleCategorySelect = (category: QuestionCategory) => {
    setSelectedCategory(category);
    setErrors({});
  };

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
    const newType = e.target.value as ObjectiveType | SubjectiveType;
    
    if (questionData.category === "objective") {
      setQuestionData(prev => ({
        ...prev,
        type: newType as ObjectiveType
      } as ObjectiveQuestionData));
    } else {
      setQuestionData(prev => ({
        ...prev,
        type: newType as SubjectiveType
      } as SubjectiveQuestionData));
    }
  };

  // Objective question handlers
  const handleChoiceChange = (id: string, text: string) => {
    if (questionData.category === "objective") {
      const objData = questionData as ObjectiveQuestionData;
      const updatedChoices = objData.choices.map(choice => 
        choice.id === id ? { ...choice, text } : choice
      );
      setQuestionData({ ...objData, choices: updatedChoices });
      setErrors(prev => ({ ...prev, choices: "" }));
    }
  };

  const handleCorrectAnswerChange = (id: string) => {
    if (questionData.category === "objective") {
      const objData = questionData as ObjectiveQuestionData;
      let updatedChoices;
      
      if (objData.type === "SC" || objData.type === "TF") {
        updatedChoices = objData.choices.map(choice => 
          ({ ...choice, isCorrect: choice.id === id })
        );
      } else {
        updatedChoices = objData.choices.map(choice => 
          choice.id === id ? { ...choice, isCorrect: !choice.isCorrect } : choice
        );
      }
      
      setQuestionData({ ...objData, choices: updatedChoices });
      setErrors(prev => ({ ...prev, correctAnswers: "" }));
    }
  };

  const handleAddChoice = () => {
    if (questionData.category === "objective" && newChoiceText.trim()) {
      const objData = questionData as ObjectiveQuestionData;
      if (objData.choices.length >= 10) {
        setErrors(prev => ({ ...prev, choices: "สามารถเพิ่มตัวเลือกได้สูงสุด 10 ตัวเลือก" }));
        return;
      }
      
      const newChoice: Choice = {
        id: generateId(),
        text: newChoiceText.trim(),
        isCorrect: false
      };
      
      setQuestionData({ ...objData, choices: [...objData.choices, newChoice] });
      setNewChoiceText("");
    }
  };

  const handleDeleteChoice = (id: string) => {
    if (questionData.category === "objective") {
      const objData = questionData as ObjectiveQuestionData;
      if (objData.choices.length <= 2) {
        setErrors(prev => ({ ...prev, choices: "ต้องมีตัวเลือกอย่างน้อย 2 ตัวเลือก" }));
        return;
      }
      
      const updatedChoices = objData.choices.filter(choice => choice.id !== id);
      setQuestionData({ ...objData, choices: updatedChoices });
    }
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
      
      let apiData: any = {
        title: questionData.title,
        description: questionData.description,
        category: questionData.category,
        type: questionData.type,
        score: questionData.score,
        quizzes: questionData.quizzes
      };

      if (questionData.category === "objective") {
        const objData = questionData as ObjectiveQuestionData;
        apiData = {
          ...apiData,
          choices: objData.choices.map(choice => ({
            text: choice.text,
            isCorrect: choice.isCorrect
          }))
        };
      }

      const response = await axios.post(`${apiUrl}/api/courses/questions`, apiData);
      
      setApiSuccess("สร้างคำถามสำเร็จ");
      
      if (onSubmit) {
        onSubmit(response.data.question);
      }

      // Reset form
      setCurrentStep('category');
      setSelectedCategory(null);
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
    } else if (currentStep === 'form') {
      setCurrentStep('category');
      setSelectedCategory(null);
    } else if (onCancel) {
      onCancel();
    }
  };

  const handlePreview = () => {
    if (validateForm()) {
      setCurrentStep('preview');
    }
  };

  // ===== RENDER FUNCTIONS =====
  const renderCategorySelection = () => (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <i className="fas fa-question-circle me-2"></i>
          เลือกประเภทข้อสอบ
        </h5>
      </div>
      <div className="card-body">
        <div className="row g-4">
          <div className="col-md-6">
            <div 
              className={`card h-100 cursor-pointer border-2 ${selectedCategory === 'objective' ? 'border-primary bg-light' : 'border-light'}`}
              onClick={() => handleCategorySelect('objective')}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="fas fa-list-ul fa-3x text-primary"></i>
                </div>
                <h5 className="card-title">ข้อสอบปรนัย</h5>
                <p className="card-text text-muted">
                  ข้อสอบที่มีตัวเลือกให้เลือก เช่น หลายตัวเลือก, ตัวเลือกเดียว, ถูก/ผิด
                </p>
                <div className="mt-3">
                  <span className="badge bg-primary me-2">หลายตัวเลือก</span>
                  <span className="badge bg-primary me-2">ตัวเลือกเดียว</span>
                  <span className="badge bg-primary">ถูก/ผิด</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div 
              className={`card h-100 cursor-pointer border-2 ${selectedCategory === 'subjective' ? 'border-success bg-light' : 'border-light'}`}
              onClick={() => handleCategorySelect('subjective')}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="fas fa-edit fa-3x text-success"></i>
                </div>
                <h5 className="card-title">ข้อสอบอัตนัย</h5>
                <p className="card-text text-muted">
                  ข้อสอบที่ต้องพิมพ์คำตอบ เช่น เติมคำ
                </p>
                <div className="mt-3">
                  <span className="badge bg-success">เติมคำ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
            คำอธิบาย (ไม่บังคับ)
          </label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            value={questionData.description}
            onChange={handleInputChange}
            rows={3}
            placeholder="ระบุคำอธิบายเพิ่มเติม (ถ้ามี)"
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

  const renderObjectiveSettings = () => {
    if (questionData.category !== "objective") return null;
    const objData = questionData as ObjectiveQuestionData;

    return (
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
              className={`form-select ${errors.type ? 'is-invalid' : ''}`}
              id="type"
              name="type"
              value={objData.type}
              onChange={handleTypeChange}
            >
              <option value="MC">หลายตัวเลือก (Multiple Choice)</option>
              <option value="SC">ตัวเลือกเดียว (Single Choice)</option>
              <option value="TF">ถูก/ผิด (True/False)</option>
            </select>
            {errors.type && <div className="invalid-feedback">{errors.type}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">
              ตัวเลือก <span className="text-danger">*</span>
            </label>
            {errors.choices && <div className="text-danger small mb-2">{errors.choices}</div>}
            {errors.correctAnswers && <div className="text-danger small mb-2">{errors.correctAnswers}</div>}
            
            <div className="choices-container">
              {objData.choices.map((choice, choiceIndex) => (
                <div key={choice.id} className="d-flex align-items-center mb-2">
                  <div className="form-check me-2">
                    <input
                      className="form-check-input"
                      type={objData.type === "MC" ? "checkbox" : "radio"}
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
                    placeholder={`ตัวเลือกที่ ${choiceIndex + 1}`}
                    readOnly={objData.type === "TF"}
                  />
                  {objData.type !== "TF" && objData.choices.length > 2 && (
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
            
            {objData.type !== "TF" && (
              <div className="d-flex mt-3">
                <input
                  type="text"
                  className="form-control me-2"
                  value={newChoiceText}
                  onChange={(e) => setNewChoiceText(e.target.value)}
                  placeholder="เพิ่มตัวเลือกใหม่"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddChoice()}
                />
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={handleAddChoice}
                  disabled={objData.choices.length >= 10}
                >
                  <i className="fas fa-plus"></i> เพิ่ม
                </button>
              </div>
            )}
            
            <small className="text-muted mt-1 d-block">
              {objData.type === "MC" ? "เลือกได้หลายข้อ" : "เลือกได้เพียงข้อเดียว"} 
              {objData.type !== "TF" && " (สูงสุด 10 ตัวเลือก)"}
            </small>
          </div>
        </div>
      </div>
    );
  };

  const renderSubjectiveSettings = () => {
    if (questionData.category !== "subjective") return null;

    return (
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">
            <i className="fas fa-edit me-2"></i>
            ตั้งค่าข้อสอบอัตนัย
          </h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="type" className="form-label">
              ประเภทข้อสอบ <span className="text-danger">*</span>
            </label>
            <select
              className={`form-select ${errors.type ? 'is-invalid' : ''}`}
              id="type"
              name="type"
              value={questionData.type}
              onChange={handleTypeChange}
            >
              <option value="FB">เติมคำ (Fill in Blank)</option>
            </select>
            {errors.type && <div className="invalid-feedback">{errors.type}</div>}
          </div>

          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            ข้อสอบประเภทเติมคำจะต้องให้อาจารย์ตรวจให้คะแนนเอง
          </div>
        </div>
      </div>
    );
  };

  const renderQuizSelection = () => (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-light">
        <h5 className="mb-0">
          <i className="fas fa-list-ul me-2"></i>
          เลือกแบบทดสอบที่จะใช้คำถามนี้
        </h5>
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

  const renderPreview = () => (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-info text-white">
        <h5 className="mb-0">
          <i className="fas fa-eye me-2"></i>
          ตัวอย่างคำถาม
        </h5>
      </div>
      <div className="card-body">
        <div className="question-preview border rounded p-4 bg-light">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h5 className="mb-1">{questionData.title}</h5>
                            {questionData.description && (
                <p className="text-muted mb-2">{questionData.description}</p>
              )}
            </div>
            <div className="text-end">
              <span className="badge bg-primary">{questionData.score} คะแนน</span>
              <br />
              <small className="text-muted">
                {questionData.category === "objective" ? "ข้อสอบปรนัย" : "ข้อสอบอัตนัย"}
              </small>
            </div>
          </div>

          {questionData.category === "objective" ? (
            <div>
              {(questionData as ObjectiveQuestionData).choices.map((choice) => (
                <div key={choice.id} className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type={(questionData as ObjectiveQuestionData).type === "MC" ? "checkbox" : "radio"}
                    disabled
                    checked={choice.isCorrect}
                  />
                  <label className="form-check-label">
                    {choice.text}
                    {choice.isCorrect && <i className="fas fa-check text-success ms-2"></i>}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div className="form-group">
                <textarea 
                  className="form-control" 
                  rows={3} 
                  placeholder="พื้นที่สำหรับตอบคำถาม..." 
                  disabled
                />
              </div>
              <small className="text-muted">
                ข้อสอบประเภทเติมคำ - ต้องให้อาจารย์ตรวจให้คะแนน
              </small>
            </div>
          )}

          {questionData.quizzes.length > 0 && (
            <div className="mt-3 pt-3 border-top">
              <h6>แบบทดสอบที่เลือก:</h6>
              <div className="d-flex flex-wrap gap-2">
                {questionData.quizzes.map(quizId => {
                  const quiz = availableQuizzes.find(q => q.id === quizId);
                  return quiz ? (
                    <span key={quiz.id} className="badge bg-secondary">
                      {quiz.title}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderQuizModal = () => (
    showQuizModal && (
      <div
        className="modal fade show"
        style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
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
              
              <div className="quiz-list">
                {(quizFilterTerm.trim() === "" ? availableQuizzes : filteredQuizzes).length > 0 ? (
                  <div className="list-group">
                    {(quizFilterTerm.trim() === "" ? availableQuizzes : filteredQuizzes).map((quiz) => (
                      <div
                        key={quiz.id}
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <h6 className="mb-1">{quiz.title}</h6>
                          <p className="mb-0 small text-muted">จำนวนคำถาม: {quiz.questions} ข้อ</p>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`select-quiz-${quiz.id}`}
                            checked={questionData.quizzes.includes(quiz.id)}
                            onChange={() => handleToggleQuiz(quiz.id)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted">
                      {quizFilterTerm.trim() === "" ? "ไม่มีแบบทดสอบ" : "ไม่พบแบบทดสอบที่ตรงกับคำค้นหา"}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => setShowQuizModal(false)}
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  // ===== MAIN RENDER =====
  return (
    <div className="container-fluid">
      {/* Success/Error Messages */}
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

      {/* Progress Steps */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body py-2">
          <div className="d-flex justify-content-center">
            <div className="d-flex align-items-center">
              <div className={`step-item ${currentStep === 'category' ? 'active' : 'completed'}`}>
                <div className="step-number">1</div>
                <div className="step-label">เลือกประเภท</div>
              </div>
              <div className="step-line"></div>
              <div className={`step-item ${currentStep === 'form' ? 'active' : currentStep === 'preview' ? 'completed' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-label">กรอกข้อมูล</div>
              </div>
              <div className="step-line"></div>
              <div className={`step-item ${currentStep === 'preview' ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-label">ตัวอย่างและบันทึก</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Category Selection */}
        {currentStep === 'category' && renderCategorySelection()}
        
        {/* Step 2: Form */}
        {currentStep === 'form' && (
          <>
            {renderQuestionInfo()}
            {renderObjectiveSettings()}
            {renderSubjectiveSettings()}
            {renderQuizSelection()}
          </>
        )}
        
        {/* Step 3: Preview */}
        {currentStep === 'preview' && renderPreview()}

        {/* Action Buttons */}
        {currentStep !== 'category' && (
          <div className="d-flex justify-content-between mt-4">
            <button 
              type="button" 
              className="btn btn-outline-secondary"
              onClick={handleCancel}
            >
              <i className="fas fa-arrow-left me-2"></i>
              {currentStep === 'form' ? 'กลับไปเลือกประเภท' : 'แก้ไข'}
            </button>
            
            <div className="d-flex gap-2">
              {currentStep === 'form' && (
                <button 
                  type="button" 
                  className="btn btn-outline-info"
                  onClick={handlePreview}
                >
                  <i className="fas fa-eye me-2"></i>
                  ดูตัวอย่าง
                </button>
              )}
              
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
                    <i className="fas fa-save me-2"></i>
                    บันทึกคำถาม
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Quiz Selection Modal */}
      {renderQuizModal()}

      {/* Custom CSS */}
      <style>
        {`
          .step-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
          }
          
          .step-number {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #e9ecef;
            color: #6c757d;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-bottom: 8px;
          }
          
          .step-item.active .step-number {
            background-color: #0d6efd;
            color: white;
          }
          
          .step-item.completed .step-number {
            background-color: #198754;
            color: white;
          }
          
          .step-label {
            font-size: 0.875rem;
            color: #6c757d;
            text-align: center;
          }
          
          .step-item.active .step-label {
            color: #0d6efd;
            font-weight: 600;
          }
          
          .step-item.completed .step-label {
            color: #198754;
          }
          
          .step-line {
            width: 80px;
            height: 2px;
            background-color: #e9ecef;
            margin: 0 20px;
            margin-top: -20px;
          }
          
          .choices-container .form-check-input:checked {
            background-color: #198754;
            border-color: #198754;
          }
          
          .question-preview {
            font-family: inherit;
          }
          
          .cursor-pointer:hover {
            transform: translateY(-2px);
            transition: transform 0.2s ease;
          }
        `}
      </style>
    </div>
  );
};

export default AddQuestions;