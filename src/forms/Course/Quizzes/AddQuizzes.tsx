import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// ===== TYPES & INTERFACES =====
type QuestionType = "TF" | "MC" | "SC" | "FB";
type QuizType = "normal" | "special";

interface Question {
  id: string;
  title: string;
  type: QuestionType;
  score: number;
  isExisting?: boolean;
}

interface Subject {
  subject_id: string;
  subject_name: string;
  subject_code: string;
}

interface Lesson {
  id: string;
  title: string;
  subject: string | Subject | Subject[];
  duration: string;
}

interface QuizData {
  title: string;
  description: string;
  questions: Question[];
  lessons: string[];
  status: string;
}

interface AddQuizzesProps {
  onSubmit?: (quizData: any) => void;
  onCancel?: () => void;
}

// ===== QUIZ INFO SECTION COMPONENT =====
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

// ===== QUESTIONS SECTION COMPONENT =====
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
  quizType: QuizType;
}

const QuestionsSection: React.FC<QuestionsSectionProps> = ({
  quizData,
  errors,
  handleDeleteQuestion,
  existingQuestions,
  setShowAddQuestionForm,
  setShowExistingQuestions,
  quizType,
}) => {
  
  const getQuestionTypeText = (type: QuestionType) => {
    switch (type) {
      case "TF": return "ถูก/ผิด";
      case "MC": return "หลายตัวเลือก";
      case "SC": return "ตัวเลือกเดียว";
      case "FB": return "เติมคำ";
      default: return "";
    }
  };

  // Filter questions based on quiz type
  const getAvailableQuestionsCount = () => {
    return existingQuestions.filter(question => {
      return quizType === "normal" 
        ? question.type !== "FB" 
        : question.type === "FB";
    }).length;
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-light d-flex justify-content-between align-items-center">
        <h5 className="mb-0">3. คำถามประจำแบบทดสอบ</h5>
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
                        {getQuestionTypeText(question.type)}
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
            disabled={quizData.questions.length >= 100 || getAvailableQuestionsCount() === 0}
          >
            <i className="fas fa-list me-2"></i>เลือกจากคำถามที่มีอยู่ ({getAvailableQuestionsCount()})
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== LESSONS SECTION COMPONENT =====
interface LessonsSectionProps {
  quizData: {
    lessons: string[];
  };
  availableLessons: Lesson[];
  showLessonModal: boolean;
  setShowLessonModal: React.Dispatch<React.SetStateAction<boolean>>;
  lessonSearchTerm: string;
  setLessonSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  handleToggleLesson: (lessonId: string) => void;
}

const LessonsSection: React.FC<LessonsSectionProps> = ({
  quizData,
  availableLessons,
  showLessonModal,
  setShowLessonModal,
  lessonSearchTerm,
  setLessonSearchTerm,
  handleToggleLesson,
}) => {
  const renderSubject = (subject: string | Subject | Subject[]): string => {
    if (Array.isArray(subject)) {
      return subject.map((s) => s.subject_name).join(", ") || "ไม่มีวิชา";
    }
    if (typeof subject === "object" && subject?.subject_name) {
      return subject.subject_name;
    }
    return (typeof subject === "string" ? subject : "") || "ไม่มีวิชา";
  };

  // Filter lessons based on search term
  const filteredLessons = availableLessons.filter(lesson =>
    lesson.title.toLowerCase().includes(lessonSearchTerm.toLowerCase())
  );

  // Limit to 6 results
  const displayedLessons = filteredLessons.slice(0, 6);

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-light">
        <h5 className="mb-0">4. เลือกบทเรียนที่จะใช้แบบทดสอบนี้</h5>
      </div>
      <div className="card-body">
        <p className="text-muted mb-3">
          คุณสามารถเลือกบทเรียนที่ต้องการใช้แบบทดสอบนี้ได้ (ไม่บังคับ) และสามารถเลือกได้มากกว่า 1 บทเรียน
        </p>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            {quizData.lessons.length > 0 ? (
              <span className="badge bg-success rounded-pill">
                เลือกแล้ว {quizData.lessons.length} บทเรียน
              </span>
            ) : (
              <span className="badge bg-secondary rounded-pill">
                ยังไม่ได้เลือกบทเรียน
              </span>
            )}
          </div>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => setShowLessonModal(true)}
            disabled={availableLessons.length === 0}
          >
            <i className="fas fa-book me-2"></i>เลือกบทเรียน
          </button>
        </div>

        {quizData.lessons.length > 0 && (
          <div className="selected-lessons">
            <h6 className="mb-2">บทเรียนที่เลือก:</h6>
            <div className="row g-2">
              {quizData.lessons.map((lessonId) => {
                const lesson = availableLessons.find((l) => l.id === lessonId);
                return lesson ? (
                  <div key={lesson.id} className="col-md-6">
                    <div className="card border h-100">
                      <div className="card-body py-2 px-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">{lesson.title}</h6>
                            <p className="mb-0 small text-muted">
                              วิชา: {renderSubject(lesson.subject)} | ระยะเวลา: {lesson.duration || "ไม่ระบุ"}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm text-danger"
                            onClick={() => handleToggleLesson(lesson.id)}
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

        {showLessonModal && (
          <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
            tabIndex={-1}
          >
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">เลือกบทเรียน</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowLessonModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="ค้นหาบทเรียน..."
                        value={lessonSearchTerm}
                        onChange={(e) => setLessonSearchTerm(e.target.value)}
                      />
                      <button className="btn btn-outline-secondary" type="button">
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                    <small className="text-muted">
                      แสดงผลสูงสุด 6 รายการ - พิมพ์ต่อเพื่อผลลัพธ์ที่แม่นยำ
                    </small>
                  </div>

                  {lessonSearchTerm.trim() === "" ? (
                    <div className="text-center py-4">
                      <i className="fas fa-search fa-3x text-muted mb-3"></i>
                      <p className="text-muted">กรุณากรอกชื่อบทเรียนเพื่อค้นหา</p>
                    </div>
                  ) : displayedLessons.length > 0 ? (
                    <>
                      <div className="row g-3">
                        {displayedLessons.map((lesson) => (
                                                    <div key={lesson.id} className="col-md-6 col-lg-4">
                            <div className="card h-100 border">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <h6 className="card-title mb-1">{lesson.title}</h6>
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={`lesson-${lesson.id}`}
                                      checked={quizData.lessons.includes(lesson.id)}
                                      onChange={() => handleToggleLesson(lesson.id)}
                                    />
                                  </div>
                                </div>
                                <p className="card-text small text-muted mb-0">
                                  วิชา: {renderSubject(lesson.subject)}
                                </p>
                                <p className="card-text small text-muted">
                                  ระยะเวลา: {lesson.duration || "ไม่ระบุ"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {filteredLessons.length > 6 && (
                        <div className="alert alert-info mt-3">
                          <i className="fas fa-info-circle me-2"></i>
                          พบ {filteredLessons.length} รายการ แสดงเฉพาะ 6 รายการแรก - พิมพ์ต่อเพื่อผลลัพธ์ที่แม่นยำ
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <i className="fas fa-exclamation-circle fa-2x text-muted mb-3"></i>
                      <p className="text-muted">ไม่พบบทเรียนที่ตรงกับคำค้นหา "{lessonSearchTerm}"</p>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowLessonModal(false)}
                  >
                    ปิด
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

// ===== SPECIAL QUIZ SECTIONS COMPONENT =====
interface SpecialQuizSectionsProps {
  quizType: QuizType;
  setQuizType: React.Dispatch<React.SetStateAction<QuizType>>;
}

const SpecialQuizSections: React.FC<SpecialQuizSectionsProps> = ({
  quizType,
  setQuizType,
}) => (
  <div className="card shadow-sm border-0 mb-4">
    <div className="card-header bg-warning text-dark">
      <h5 className="mb-0">
        <i className="fas fa-star me-2"></i>2. ประเภทแบบทดสอบ
      </h5>
    </div>
    <div className="card-body">
      <div className="mb-4">
        <h6 className="mb-3">เลือกประเภทแบบทดสอบ</h6>
        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="radio"
            name="quizType"
            id="normalQuiz"
            checked={quizType === "normal"}
            onChange={() => setQuizType("normal")}
          />
          <label className="form-check-label" htmlFor="normalQuiz">
            <strong>แบบทดสอบปกติ</strong>
            <br />
            <small className="text-muted">แบบทดสอบที่ตรวจให้คะแนนอัตโนมัติ (ตัวเลือกเดียว, หลายตัวเลือก, ถูก/ผิด)</small>
          </label>
        </div>
        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            name="quizType"
            id="specialQuiz"
            checked={quizType === "special"}
            onChange={() => setQuizType("special")}
          />
          <label className="form-check-label" htmlFor="specialQuiz">
            <strong>แบบทดสอบพิเศษ</strong>
            <br />
            <small className="text-muted">แบบทดสอบที่ต้องให้อาจารย์ตรวจให้คะแนนเอง (เติมคำ)</small>
          </label>
        </div>
      </div>

      {quizType === "special" && (
        <div className="alert alert-info">
          <h6 className="alert-heading">
            <i className="fas fa-info-circle me-2"></i>คุณสมบัติแบบทดสอบพิเศษ
          </h6>
          <ul className="mb-0">
            <li>สามารถมีคำถามประเภท "เติมคำ" ได้</li>
            <li>อาจารย์ต้องตรวจให้คะแนนด้วยตนเอง</li>
            <li>นักเรียนสามารถแนบไฟล์ได้</li>
            <li>ผลคะแนนจะแสดงหลังจากอาจารย์ตรวจเสร็จ</li>
          </ul>
        </div>
      )}
    </div>
  </div>
);

// ===== MAIN COMPONENT =====
const AddQuizzes: React.FC<AddQuizzesProps> = ({ onSubmit, onCancel }) => {
  // ===== STATE MANAGEMENT =====
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [quizType, setQuizType] = useState<QuizType>("normal");
  
  // Quiz data
  const [quizData, setQuizData] = useState<QuizData>({
    title: "",
    description: "",
    questions: [],
    lessons: [],
    status: "draft"
  });
  
  // Form validation
  const [errors, setErrors] = useState({
    title: "",
    questions: ""
  });
  
  // Questions management
  const [existingQuestions, setExistingQuestions] = useState<Question[]>([]);
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  const [showExistingQuestions, setShowExistingQuestions] = useState(false);
  const [selectedExistingQuestions, setSelectedExistingQuestions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Lessons management
  const [availableLessons, setAvailableLessons] = useState<Lesson[]>([]);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonSearchTerm, setLessonSearchTerm] = useState("");

  // ===== EFFECTS =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");
        
        if (!token) {
          setApiError("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
          return;
        }

        // Fetch existing questions
        const questionsResponse = await axios.get(`${apiUrl}/api/courses/questions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (questionsResponse.data.success) {
          const questions = questionsResponse.data.questions.map((q: any) => ({
            id: q.question_id.toString(),
            title: q.title,
            type: q.type,
            score: q.score || 1,
            isExisting: true
          }));
          setExistingQuestions(questions);
        }

        // Fetch available lessons
        const lessonsResponse = await axios.get(`${apiUrl}/api/courses/lessons`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (lessonsResponse.data.success) {
          const lessons = lessonsResponse.data.lessons.map((l: any) => ({
            id: l.lesson_id.toString(),
            title: l.title,
            subject: l.subject || "ไม่มีวิชา",
            duration: l.duration || "ไม่ระบุ"
          }));
          setAvailableLessons(lessons);
        }
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setApiError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    };

    fetchData();
  }, []);

  // ===== EVENT HANDLERS =====
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setQuizData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear related errors
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleDeleteQuestion = (id: string) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
    setErrors(prev => ({ ...prev, questions: "" }));
  };

  const handleAddNewQuestion = (questionData: any) => {
    const newQuestion: Question = {
      id: `new_${Date.now()}`,
      title: questionData.title,
      type: questionData.type,
      score: questionData.score || 1,
      isExisting: false
    };
    
    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    
    setShowAddQuestionForm(false);
    setErrors(prev => ({ ...prev, questions: "" }));
  };

  const handleSelectExistingQuestion = (id: string) => {
    setSelectedExistingQuestions(prev => {
      if (prev.includes(id)) {
        return prev.filter(qId => qId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleAddSelectedQuestions = () => {
    const questionsToAdd = existingQuestions.filter(q => 
      selectedExistingQuestions.includes(q.id) &&
      !quizData.questions.some(existing => existing.id === q.id)
    );
    
    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, ...questionsToAdd]
    }));
    
    setSelectedExistingQuestions([]);
    setShowExistingQuestions(false);
    setErrors(prev => ({ ...prev, questions: "" }));
  };

  const handleToggleLesson = (lessonId: string) => {
    setQuizData(prev => ({
      ...prev,
      lessons: prev.lessons.includes(lessonId)
        ? prev.lessons.filter(id => id !== lessonId)
        : [...prev.lessons, lessonId]
    }));
  };

  // ===== VALIDATION =====
  const validateForm = (): boolean => {
    const newErrors = {
      title: "",
      questions: ""
    };
    let isValid = true;

    if (!quizData.title.trim()) {
      newErrors.title = "กรุณาระบุชื่อแบบทดสอบ";
      isValid = false;
    }

    if (quizData.questions.length === 0) {
      newErrors.questions = "กรุณาเพิ่มคำถามอย่างน้อย 1 ข้อ";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // ===== FORM SUBMISSION =====
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
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("ไม่พบข้อมูลการเข้าสู่ระบบ");
      }

      // Prepare API data
      const apiData = {
        title: quizData.title,
        description: quizData.description,
        questions: quizData.questions.map(q => ({
          question_id: q.isExisting ? parseInt(q.id) : null,
          title: q.title,
          type: q.type,
          score: q.score,
          isNew: !q.isExisting
        })),
        lessons: quizData.lessons.map(id => parseInt(id)),
        status: quizData.status,
        type: quizType
      };

      const response = await axios.post(`${apiUrl}/api/courses/quizzes`, apiData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setApiSuccess("สร้างแบบทดสอบสำเร็จ");
        toast.success("สร้างแบบทดสอบสำเร็จ");
        
        if (onSubmit) {
          onSubmit(response.data.quiz);
        }
        
        // Reset form
        setQuizData({
          title: "",
          description: "",
          questions: [],
          lessons: [],
          status: "draft"
        });
        setQuizType("normal");
        setErrors({ title: "", questions: "" });
      }
      
    } catch (error) {
      console.error("Error creating quiz:", error);
      if (axios.isAxiosError(error) && error.response) {
        setApiError(error.response.data.message || "เกิดข้อผิดพลาดในการสร้างแบบทดสอบ");
                toast.error(error.response.data.message || "เกิดข้อผิดพลาดในการสร้างแบบทดสอบ");
      } else {
        setApiError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
        toast.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Filter questions based on quiz type and search term
  const getFilteredExistingQuestions = () => {
    return existingQuestions.filter(question => {
      const typeFilter = quizType === "normal" 
        ? question.type !== "FB" 
        : question.type === "FB";
      const searchFilter = question.title.toLowerCase().includes(searchTerm.toLowerCase());
      return typeFilter && searchFilter;
    });
  };

  // ===== RENDER =====
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

      <form onSubmit={handleSubmit}>
        {/* Quiz Info Section */}
        <QuizInfoSection
          quizData={quizData}
          handleInputChange={handleInputChange}
          errors={errors}
        />

        {/* Special Quiz Type Selection */}
        <SpecialQuizSections
          quizType={quizType}
          setQuizType={setQuizType}
        />

        {/* Questions Section */}
        <QuestionsSection
          quizData={quizData}
          errors={errors}
          handleDeleteQuestion={handleDeleteQuestion}
          handleAddNewQuestion={handleAddNewQuestion}
          existingQuestions={existingQuestions}
          showAddQuestionForm={showAddQuestionForm}
          setShowAddQuestionForm={setShowAddQuestionForm}
          showExistingQuestions={showExistingQuestions}
          setShowExistingQuestions={setShowExistingQuestions}
          quizType={quizType}
        />

        {/* Lessons Section */}
        <LessonsSection
          quizData={quizData}
          availableLessons={availableLessons}
          showLessonModal={showLessonModal}
          setShowLessonModal={setShowLessonModal}
          lessonSearchTerm={lessonSearchTerm}
          setLessonSearchTerm={setLessonSearchTerm}
          handleToggleLesson={handleToggleLesson}
        />

        {/* Action Buttons */}
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button 
            type="button" 
            className="btn btn-outline-secondary"
            onClick={handleCancel}
          >
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
                <i className="fas fa-save me-2"></i>
                บันทึกแบบทดสอบ
              </>
            )}
          </button>
        </div>
      </form>

      {/* Add Question Form Modal */}
      {showAddQuestionForm && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">สร้างคำถามใหม่</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddQuestionForm(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Simple Question Form */}
                <SimpleQuestionForm
                  onSubmit={handleAddNewQuestion}
                  onCancel={() => setShowAddQuestionForm(false)}
                  quizType={quizType}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Existing Questions Modal */}
      {showExistingQuestions && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  เลือกคำถามที่มีอยู่ - {quizType === "normal" ? "แบบทดสอบปกติ" : "แบบทดสอบพิเศษ"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowExistingQuestions(false)}
                ></button>
              </div>
              <div className="modal-body">
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
                  <small className="text-muted">
                    แสดงผลสูงสุด 6 รายการ - พิมพ์ต่อเพื่อผลลัพธ์ที่แม่นยำ
                  </small>
                </div>

                <div className="mb-3">
                  <small className="text-muted">
                    เลือกแล้ว: {selectedExistingQuestions.length} คำถาม
                    {quizType === "normal" && " (แสดงเฉพาะคำถามประเภท: ตัวเลือกเดียว, หลายตัวเลือก, ถูก/ผิด)"}
                    {quizType === "special" && " (แสดงเฉพาะคำถามประเภท: เติมคำ)"}
                  </small>
                </div>

                {searchTerm.trim() === "" ? (
                  <div className="text-center py-4">
                    <i className="fas fa-search fa-3x text-muted mb-3"></i>
                    <p className="text-muted">กรุณากรอกชื่อคำถามเพื่อค้นหา</p>
                  </div>
                ) : (() => {
                  const filteredQuestions = getFilteredExistingQuestions();
                  const displayedQuestions = filteredQuestions.slice(0, 6);

                  return displayedQuestions.length > 0 ? (
                    <>
                      <div className="list-group" style={{ maxHeight: "400px", overflowY: "auto" }}>
                        {displayedQuestions.map((question) => (
                          <div
                            key={question.id}
                            className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                              quizData.questions.some(q => q.id === question.id) ? 'list-group-item-secondary' : ''
                            }`}
                          >
                            <div className="flex-grow-1">
                              <h6 className="mb-1">{question.title}</h6>
                              <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-info rounded-pill">
                                  {question.type === "TF" && "ถูก/ผิด"}
                                  {question.type === "MC" && "หลายตัวเลือก"}
                                  {question.type === "SC" && "ตัวเลือกเดียว"}
                                  {question.type === "FB" && "เติมคำ"}
                                </span>
                                <small className="text-muted">{question.score} คะแนน</small>
                              </div>
                              {quizData.questions.some(q => q.id === question.id) && (
                                <small className="text-success">
                                  <i className="fas fa-check me-1"></i>เพิ่มแล้ว
                                </small>
                              )}
                            </div>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`question-${question.id}`}
                                checked={selectedExistingQuestions.includes(question.id)}
                                onChange={() => handleSelectExistingQuestion(question.id)}
                                disabled={quizData.questions.some(q => q.id === question.id)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      {filteredQuestions.length > 6 && (
                        <div className="alert alert-info mt-3">
                          <i className="fas fa-info-circle me-2"></i>
                          พบ {filteredQuestions.length} รายการ แสดงเฉพาะ 6 รายการแรก - พิมพ์ต่อเพื่อผลลัพธ์ที่แม่นยำ
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <i className="fas fa-exclamation-circle fa-2x text-muted mb-3"></i>
                      <p className="text-muted">ไม่พบคำถามที่ตรงกับคำค้นหา "{searchTerm}"</p>
                    </div>
                  );
                })()}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowExistingQuestions(false)}
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
};

// ===== SIMPLE QUESTION FORM COMPONENT =====
interface SimpleQuestionFormProps {
  onSubmit: (questionData: any) => void;
  onCancel: () => void;
  quizType: QuizType;
}

const SimpleQuestionForm: React.FC<SimpleQuestionFormProps> = ({ onSubmit, onCancel, quizType }) => {
  const [questionData, setQuestionData] = useState({
    title: "",
    type: (quizType === "normal" ? "SC" : "FB") as QuestionType,
    score: 1,
    choices: quizType === "normal" ? [
      { id: "1", text: "ตัวเลือกที่ 1", isCorrect: false },
      { id: "2", text: "ตัวเลือกที่ 2", isCorrect: false },
      { id: "3", text: "ตัวเลือกที่ 3", isCorrect: false }
    ] : []
  });

  const [errors, setErrors] = useState({
    title: "",
    choices: "",
    correctAnswers: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQuestionData(prev => ({
      ...prev,
      [name]: name === "score" ? parseInt(value) || 1 : value
    }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as QuestionType;
    let newChoices = questionData.choices;

    if (newType === "TF") {
      newChoices = [
        { id: "1", text: "True", isCorrect: false },
        { id: "2", text: "False", isCorrect: false }
      ];
    } else if (newType === "FB") {
      newChoices = [];
    } else if (newChoices.length < 3) {
      newChoices = [
        { id: "1", text: "ตัวเลือกที่ 1", isCorrect: false },
        { id: "2", text: "ตัวเลือกที่ 2", isCorrect: false },
        { id: "3", text: "ตัวเลือกที่ 3", isCorrect: false }
      ];
    }

    setQuestionData(prev => ({
      ...prev,
      type: newType,
      choices: newChoices
    }));
  };

  const handleChoiceChange = (id: string, text: string) => {
    setQuestionData(prev => ({
      ...prev,
      choices: prev.choices.map(choice =>
        choice.id === id ? { ...choice, text } : choice
      )
    }));
  };

  const handleCorrectAnswerChange = (id: string) => {
    setQuestionData(prev => ({
      ...prev,
      choices: prev.choices.map(choice => {
        if (questionData.type === "SC" || questionData.type === "TF") {
          return { ...choice, isCorrect: choice.id === id };
        } else {
          return choice.id === id ? { ...choice, isCorrect: !choice.isCorrect } : choice;
        }
      })
    }));
  };

  const validateForm = (): boolean => {
    const newErrors = {
      title: "",
      choices: "",
      correctAnswers: ""
    };
    let isValid = true;

    if (!questionData.title.trim()) {
      newErrors.title = "กรุณาระบุชื่อคำถาม";
      isValid = false;
    }

    if (questionData.type !== "FB") {
      const correctAnswers = questionData.choices.filter(c => c.isCorrect);
      
      if (questionData.type === "MC" && correctAnswers.length < 2) {
        newErrors.correctAnswers = "ข้อสอบหลายตัวเลือกต้องมีคำตอบที่ถูกต้องอย่างน้อย 2 ข้อ";
        isValid = false;
      } else if ((questionData.type === "SC" || questionData.type === "TF") && correctAnswers.length !== 1) {
        newErrors.correctAnswers = "ต้องเลือกคำตอบที่ถูกต้องเพียง 1 ข้อ";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(questionData);
    }
  };

  // Get available question types based on quiz type
  const getAvailableTypes = () => {
    if (quizType === "normal") {
      return [
        { value: "SC", label: "ตัวเลือกเดียว (Single Choice)" },
        { value: "MC", label: "หลายตัวเลือก (Multiple Choice)" },
        { value: "TF", label: "ถูก/ผิด (True/False)" }
      ];
    } else {
      return [
        { value: "FB", label: "เติมคำ (Fill in Blank)" }
      ];
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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

      <div className="row">
        <div className="col-md-8">
          <div className="mb-3">
            <label htmlFor="type" className="form-label">
              ประเภทคำถาม <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              id="type"
              name="type"
              value={questionData.type}
              onChange={handleTypeChange}
              disabled={quizType === "special"} // Disable for special quiz (only FB allowed)
            >
              {getAvailableTypes().map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="col-md-4">
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
        </div>
      </div>

      {questionData.type !== "FB" && (
        <div className="mb-3">
          <label className="form-label">
            ตัวเลือก <span className="text-danger">*</span>
          </label>
          {errors.correctAnswers && <div className="text-danger small mb-2">{errors.correctAnswers}</div>}
          
          <div className="choices-container">
            {questionData.choices.map((choice, index) => (
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
                  className="form-control"
                  value={choice.text}
                  onChange={(e) => handleChoiceChange(choice.id, e.target.value)}
                  placeholder={`ตัวเลือกที่ ${index + 1}`}
                  readOnly={questionData.type === "TF"}
                />
              </div>
            ))}
          </div>
          
          <small className="text-muted">
            {questionData.type === "MC" ? "เลือกได้หลายข้อ" : "เลือกได้เพียงข้อเดียว"}
          </small>
        </div>
      )}

      {questionData.type === "FB" && (
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          คำถามประเภทเติมคำจะต้องให้อาจารย์ตรวจให้คะแนนเอง และนักเรียนสามารถแนบไฟล์ได้
        </div>
      )}

      <div className="d-flex justify-content-end gap-2">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          ยกเลิก
        </button>
        <button type="submit" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>เพิ่มคำถาม
        </button>
      </div>
    </form>
  );
};

export default AddQuizzes;


