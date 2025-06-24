import React, { useState, useEffect, useMemo } from "react";
import axios from "axios"; // Make sure axios is installed

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
  quizzes: string[]; // IDs ของแบบทดสอบที่คำถามนี้จะถูกใช้
}

// กำหนด interface สำหรับ props
interface AddQuestionsProps {
  onSubmit?: (questionData: any) => void;
  onCancel?: () => void;
}

const AddQuestions: React.FC<AddQuestionsProps> = ({ onSubmit, onCancel }) => {
  // สร้าง ID สำหรับตัวเลือก
  const generateId = () => `choice_${Math.random().toString(36).substr(2, 9)}`;
  
  // State for API status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  
  // ตัวอย่างแบบทดสอบที่มีอยู่แล้ว (จะถูกโหลดจาก API)
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([
    { id: "quiz1", title: "แบบทดสอบ React พื้นฐาน", questions: 10 },
    { id: "quiz2", title: "แบบทดสอบ TypeScript", questions: 8 },
    { id: "quiz3", title: "แบบทดสอบ JavaScript", questions: 15 },
    { id: "quiz4", title: "แบบทดสอบ HTML และ CSS", questions: 12 },
    { id: "quiz5", title: "แบบทดสอบ Node.js", questions: 7 }
  ]);
  
  // สถานะสำหรับข้อมูลคำถาม
  const [questionData, setQuestionData] = useState<QuestionData>({
    title: "",
    description: "",
    type: "",
    choices: [],
    score: 1,
    quizzes: []
  });
  
  // สถานะสำหรับการตรวจสอบความถูกต้อง
  const [errors, setErrors] = useState({
    title: "",
    type: "",
    choices: "",
    correctAnswers: ""
  });
  
  // สถานะสำหรับการแสดงผลตัวเลือกใหม่
  const [newChoiceText, setNewChoiceText] = useState("");
  
  // สถานะสำหรับการแสดงผลคำตอบสำหรับ Fill in Blank
  const [blankAnswer, setBlankAnswer] = useState("");
  
  // สถานะสำหรับการค้นหาแบบทดสอบ
  const [quizSearchTerm, setQuizSearchTerm] = useState("");
  
  // สถานะสำหรับการแสดง Modal เลือกแบบทดสอบ
  const [showQuizModal, setShowQuizModal] = useState(false);
  
  // สถานะสำหรับการจัดการหน้าใน Modal
  const [currentQuizPage, setCurrentQuizPage] = useState<number>(1);
  const itemsPerPage = 10;

  // กรองแบบทดสอบตามคำค้นหาและทำ Pagination
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
  
  // Load quizzes from API
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${apiUrl}/api/courses/quizzes`);
        if (response.data && response.data.quizzes) {
          // Transform the data to match our Quiz interface
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
  
  // เมื่อเลือกประเภทคำถาม ให้สร้างตัวเลือกเริ่มต้น
  useEffect(() => {
    if (questionData.type === "TF") {
      // สำหรับ True/False
      setQuestionData({
        ...questionData,
        choices: [
          { id: generateId(), text: "True", isCorrect: false },
          { id: generateId(), text: "False", isCorrect: false }
        ]
      });
    } else if (questionData.type === "MC" || questionData.type === "SC") {
      // สำหรับ Multiple Choice และ Single Choice
      setQuestionData({
        ...questionData,
        choices: [
          { id: generateId(), text: "ตัวเลือกที่ 1", isCorrect: false },
          { id: generateId(), text: "ตัวเลือกที่ 2", isCorrect: false },
          { id: generateId(), text: "ตัวเลือกที่ 3", isCorrect: false }
        ]
      });
    } else if (questionData.type === "FB") {
      // สำหรับ Fill in Blank
      setQuestionData({
        ...questionData,
        choices: []
      });
      setBlankAnswer("");
    }
  }, [questionData.type]);
  
  // เปลี่ยนแปลงข้อมูลคำถาม
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQuestionData({
      ...questionData,
      [name]: value
    });
    
    // ล้างข้อผิดพลาด
    if (name === "title" || name === "type") {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };
  
  // เปลี่ยนแปลงข้อมูลตัวเลือก
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
  
  // เปลี่ยนแปลงคำตอบที่ถูกต้อง
  const handleCorrectAnswerChange = (id: string) => {
    let updatedChoices;
    
    if (questionData.type === "SC" || questionData.type === "TF") {
      // สำหรับ Single Choice และ True/False ให้เลือกได้เพียงข้อเดียว
      updatedChoices = questionData.choices.map(choice => 
        ({ ...choice, isCorrect: choice.id === id })
      );
    } else {
      // สำหรับ Multiple Choice ให้เลือกได้หลายข้อ
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
  
  // เพิ่มตัวเลือกใหม่
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
  
  // ลบตัวเลือก
  const handleDeleteChoice = (id: string) => {
    // ตรวจสอบว่ามีตัวเลือกขั้นต่ำ 3 ตัว
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
  
  // เพิ่มคำตอบสำหรับ Fill in Blank
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
  
  // ลบคำตอบสำหรับ Fill in Blank
  const handleDeleteBlankAnswer = (id: string) => {
    const updatedChoices = questionData.choices.filter(choice => choice.id !== id);
    
    setQuestionData({
      ...questionData,
      choices: updatedChoices
    });
  };
  
  // เลือกหรือยกเลิกการเลือกแบบทดสอบ
  const handleToggleQuiz = (quizId: string) => {
    if (questionData.quizzes.includes(quizId)) {
      // ถ้ามีอยู่แล้ว ให้ลบออก
      setQuestionData({
        ...questionData,
        quizzes: questionData.quizzes.filter(id => id !== quizId)
      });
    } else {
      // ถ้ายังไม่มี ให้เพิ่มเข้าไป
      setQuestionData({
        ...questionData,
        quizzes: [...questionData.quizzes, quizId]
      });
    }
  };
  
  // ตรวจสอบความถูกต้องของข้อมูล
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: "",
      type: "",
      choices: "",
      correctAnswers: ""
    };
    
    // ตรวจสอบชื่อคำถาม
    if (questionData.title.trim() === "") {
      newErrors.title = "กรุณาระบุชื่อคำถาม";
      isValid = false;
    }
    
    // ตรวจสอบประเภทคำถาม
    if (questionData.type === "") {
      newErrors.type = "กรุณาเลือกประเภทคำถาม";
      isValid = false;
    }
    
    // ตรวจสอบตัวเลือก
    if (questionData.type === "MC" || questionData.type === "SC") {
      if (questionData.choices.length < 3) {
        newErrors.choices = "ต้องมีตัวเลือกอย่างน้อย 3 ตัวเลือก";
        isValid = false;
      }
      
      // ตรวจสอบคำตอบที่ถูกต้อง
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
  
  // บันทึกข้อมูล
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setApiError("");
      setApiSuccess("");
      
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        // Format the data for the API
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
        // Send data to the API
        const response = await axios.post(`${apiUrl}/api/courses/questions`, apiData);
        
        // Handle successful response
        setApiSuccess("สร้างคำถามสำเร็จ");
        
        // If onSubmit prop is provided, call it with the response data
        if (onSubmit) {
          onSubmit(response.data.question);
        }
        
        // Reset form after successful submission
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
        
        // Handle API error
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
  
  // ยกเลิก
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* API Status Messages */}
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
      
      {/* ส่วนที่ 1: ข้อมูลคำถาม */}
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
      
      {/* ส่วนที่ 2: ตั้งค่าคำตอบ */}
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
          
          {/* คะแนน */}
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
          
          {/* ตัวเลือกสำหรับ Multiple Choice และ Single Choice */}
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
          
          {/* ตัวเลือกสำหรับ True/False */}
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
          
          {/* ตัวเลือกสำหรับ Fill in Blank */}
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
      
      {/* ส่วนที่ 3: เลือกแบบทดสอบที่จะใช้คำถามนี้ */}
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
      
      {/* ปุ่มบันทึกและยกเลิก */}
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
      
      {/* Modal เลือกแบบทดสอบ */}
      {showQuizModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary">
                <h5 className="modal-title text-white">เลือกแบบทดสอบ</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowQuizModal(false);
                    setCurrentQuizPage(1);
                  }}
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
                      setCurrentQuizPage(1);
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
                            <div className="d-flex flex-column">
                              <span className="h6 mb-1">{quiz.title}</span>
                              <p className="mb-0 small text-muted">
                                จำนวนคำถาม: {quiz.questions} ข้อ
                              </p>
                            </div>
                            <button
                              type="button"
                              className={`btn btn-sm ${
                                isSelected ? "btn-success disabled" : "btn-outline-primary"
                              }`}
                              onClick={() => handleToggleQuiz(quiz.id)}
                              disabled={isSelected}
                            >
                              {isSelected ? (
                                <>
                                  <i className="fas fa-check me-1"></i>เลือกแล้ว
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
                            <li
                              key={i + 1}
                              className={`page-item ${currentQuizPage === i + 1 ? "active" : ""}`}
                            >
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
                  onClick={() => {
                    setShowQuizModal(false);
                    setCurrentQuizPage(1);
                  }}
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