import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AddQuestions from "./AddQuestions";

// ประเภทของคำถาม
type QuestionType = "TF" | "MC" | "SC" | "FB";

// ข้อมูลคำถาม
interface Question {
  id: string;
  title: string;
  type: QuestionType;
  score: number;
  isExisting?: boolean; // คำถามที่มีอยู่แล้วในระบบ
}

// ข้อมูลบทเรียน
interface Lesson {
  id: string;
  title: string;
  subject: string;
  duration: string;
}

// ข้อมูลแบบทดสอบ
interface QuizData {
  title: string;
  description: string;
  questions: Question[];
  timeLimit: {
    enabled: boolean;
    value: number;
    unit: "minutes" | "hours" | "days" | "weeks";
  };
  passingScore: {
    enabled: boolean;
    value: number;
  };
  attempts: {
    limited: boolean;
    unlimited: boolean;
    value: number;
  };
  lessons: string[]; // เพิ่มฟิลด์สำหรับเก็บ ID ของบทเรียนที่เลือก
  status?: "active" | "inactive" | "draft";
}

interface AddQuizzesProps {
  onSubmit?: (quizData: any) => void;
  onCancel?: () => void;
}

const AddQuizzes: React.FC<AddQuizzesProps> = ({ onSubmit, onCancel }) => {
  // สร้าง ID สำหรับคำถาม
  const generateId = () => `question_${Math.random().toString(36).substr(2, 9)}`;
  
  // สถานะสำหรับการโหลดข้อมูล
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  
  // ตัวอย่างบทเรียนที่มีอยู่แล้ว (จะโหลดจาก API)
  const [availableLessons, setAvailableLessons] = useState<Lesson[]>([]);
  
  // สถานะสำหรับข้อมูลแบบทดสอบ
  const [quizData, setQuizData] = useState<QuizData>({
    title: "",
    description: "",
    questions: [],
    timeLimit: {
      enabled: false,
      value: 60,
      unit: "minutes"
    },
    passingScore: {
      enabled: false,
      value: 0
    },
    attempts: {
      limited: true,
      unlimited: false,
      value: 1
    },
    lessons: [], // เริ่มต้นด้วยอาร์เรย์ว่าง
    status: "draft"
  });
  
  // สถานะสำหรับการตรวจสอบความถูกต้อง
  const [errors, setErrors] = useState({
    title: "",
    questions: ""
  });
  
  // สถานะสำหรับการแสดงฟอร์มเพิ่มคำถามใหม่
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  
  // สถานะสำหรับการแสดงหน้าต่างเลือกคำถามที่มีอยู่แล้ว
  const [showExistingQuestions, setShowExistingQuestions] = useState(false);
  
  // สถานะสำหรับการแสดงหน้าต่างเลือกบทเรียน
  const [showLessonModal, setShowLessonModal] = useState(false);
  
  // สถานะสำหรับการค้นหาบทเรียน
  const [lessonSearchTerm, setLessonSearchTerm] = useState("");
  
  // คำถามที่มีอยู่แล้วในระบบ (จะโหลดจาก API)
  const [existingQuestions, setExistingQuestions] = useState<Question[]>([]);
  
  // สถานะสำหรับการค้นหาคำถามที่มีอยู่แล้ว
  const [searchTerm, setSearchTerm] = useState("");
  
  // สถานะสำหรับการเลือกคำถามที่มีอยู่แล้ว
  const [selectedExistingQuestions, setSelectedExistingQuestions] = useState<string[]>([]);
  
  // โหลดข้อมูลบทเรียนและคำถามที่มีอยู่แล้วเมื่อ component ถูกโหลด
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");
        
        if (!token) {
          setApiError("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
          setIsLoading(false);
          return;
        }
        
        // โหลดข้อมูลบทเรียน
        const lessonsResponse = await axios.get(`${apiUrl}/api/courses/lessons`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (lessonsResponse.data && lessonsResponse.data.lessons) {
          const formattedLessons = lessonsResponse.data.lessons.map((lesson: any) => ({
            id: lesson.lesson_id,
            title: lesson.title,
            subject: lesson.subjects || "ไม่ระบุวิชา",
            duration: lesson.duration ? `${lesson.duration} นาที` : "ไม่ระบุระยะเวลา"
          }));
          setAvailableLessons(formattedLessons);
        }
        
        // โหลดข้อมูลคำถามที่มีอยู่แล้ว
        const questionsResponse = await axios.get(`${apiUrl}/api/courses/questions`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (questionsResponse.data && questionsResponse.data.questions) {
          const formattedQuestions = questionsResponse.data.questions.map((question: any) => ({
            id: question.question_id,
            title: question.title,
            type: question.type as QuestionType,
            score: question.score || 1,
            isExisting: true
          }));
          setExistingQuestions(formattedQuestions);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setApiError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // กรองคำถามที่มีอยู่แล้วตามคำค้นหา
  const filteredExistingQuestions = existingQuestions.filter(question => 
    question.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // กรองบทเรียนตามคำค้นหา
  const filteredLessons = availableLessons.filter(lesson => 
    lesson.title.toLowerCase().includes(lessonSearchTerm.toLowerCase()) ||
    lesson.subject.toLowerCase().includes(lessonSearchTerm.toLowerCase())
  );
  
  // เปลี่ยนแปลงข้อมูลแบบทดสอบ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQuizData({
      ...quizData,
      [name]: value
    });
    
    // ล้างข้อผิดพลาด
    if (name === "title") {
      setErrors({
        ...errors,
        title: ""
      });
    }
  };
  
  // เปลี่ยนแปลงการตั้งค่าเวลา
  const handleTimeLimitChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === "checkbox") {
      setQuizData({
        ...quizData,
        timeLimit: {
          ...quizData.timeLimit,
          enabled: (e.target as HTMLInputElement).checked
        }
      });
    } else if (name === "timeLimitValue") {
      setQuizData({
        ...quizData,
        timeLimit: {
          ...quizData.timeLimit,
          value: parseInt(value) || 0
        }
      });
    } else if (name === "timeLimitUnit") {
      setQuizData({
        ...quizData,
        timeLimit: {
          ...quizData.timeLimit,
          unit: value as "minutes" | "hours" | "days" | "weeks"
        }
      });
    }
  };
  
  // เปลี่ยนแปลงการตั้งค่าเกณฑ์ผ่าน
  const handlePassingScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      setQuizData({
        ...quizData,
        passingScore: {
          ...quizData.passingScore,
          enabled: e.target.checked
        }
      });
    } else if (name === "passingScoreValue") {
      setQuizData({
        ...quizData,
        passingScore: {
          ...quizData.passingScore,
          value: parseInt(value) || 0
        }
      });
    }
  };
  
  // เปลี่ยนแปลงการตั้งค่าจำนวนครั้งที่ทำได้
  const handleAttemptsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (name === "attemptsLimited" && type === "checkbox") {
      setQuizData({
        ...quizData,
        attempts: {
          ...quizData.attempts,
          limited: e.target.checked,
          unlimited: !e.target.checked
        }
      });
    } else if (name === "attemptsUnlimited" && type === "checkbox") {
      setQuizData({
        ...quizData,
        attempts: {
          ...quizData.attempts,
          unlimited: e.target.checked,
          limited: !e.target.checked
        }
      });
    } else if (name === "attemptsValue") {
      setQuizData({
        ...quizData,
        attempts: {
          ...quizData.attempts,
          value: parseInt(value) || 1
        }
      });
    }
  };
  
  // เพิ่มคำถามใหม่
  const handleAddNewQuestion = (questionData: any) => {
    if (!questionData) {
      setShowAddQuestionForm(false);
      return;
    }
    
    // ตรวจสอบว่าจำนวนคำถามไม่เกิน 100 ข้อ
    if (quizData.questions.length >= 100) {
      toast.warning("ไม่สามารถเพิ่มคำถามได้อีก เนื่องจากมีคำถามครบ 100 ข้อแล้ว");
      return;
    }
    
    // ตรวจสอบว่ามีชื่อคำถาม
    if (!questionData.title || questionData.title.trim() === "") {
      toast.error("กรุณาระบุชื่อคำถาม");
      return;
    }
    
    const newQuestion: Question = {
      id: generateId(),
      title: questionData.title,
      type: questionData.type,
      score: questionData.score,
      isExisting: false
    };
    
    setQuizData({
      ...quizData,
      questions: [...quizData.questions, newQuestion]
    });
    
    setShowAddQuestionForm(false);
    
    // ล้างข้อผิดพลาด
    setErrors({
      ...errors,
      questions: ""
    });
  };
  
  // ลบคำถาม
  const handleDeleteQuestion = (id: string) => {
    const updatedQuestions = quizData.questions.filter(question => question.id !== id);
    
    setQuizData({
      ...quizData,
      questions: updatedQuestions
    });
  };
  
  // เลือกคำถามที่มีอยู่แล้ว
  const handleSelectExistingQuestion = (id: string) => {
    if (selectedExistingQuestions.includes(id)) {
      setSelectedExistingQuestions(selectedExistingQuestions.filter(qId => qId !== id));
    } else {
      setSelectedExistingQuestions([...selectedExistingQuestions, id]);
    }
  };
  
  // เพิ่มคำถามที่เลือกไว้
  const handleAddSelectedQuestions = () => {
    // ตรวจสอบว่าจำนวนคำถามไม่เกิน 100 ข้อ
    if (quizData.questions.length + selectedExistingQuestions.length > 100) {
        toast.warning(`ไม่สามารถเพิ่มคำถามได้ทั้งหมด เนื่องจากจะทำให้มีคำถามเกิน 100 ข้อ\nสามารถเพิ่มได้อีก ${100 - quizData.questions.length} ข้อ`);
        return;
      }
      
      const questionsToAdd = existingQuestions.filter(q => selectedExistingQuestions.includes(q.id));
      
      setQuizData({
        ...quizData,
        questions: [...quizData.questions, ...questionsToAdd]
      });
      
      setShowExistingQuestions(false);
      setSelectedExistingQuestions([]);
      
      // ล้างข้อผิดพลาด
      setErrors({
        ...errors,
        questions: ""
      });
    };
    
    // เลือกหรือยกเลิกการเลือกบทเรียน
    const handleToggleLesson = (lessonId: string) => {
      if (quizData.lessons.includes(lessonId)) {
        // ถ้ามีอยู่แล้ว ให้ลบออก
        setQuizData({
          ...quizData,
          lessons: quizData.lessons.filter(id => id !== lessonId)
        });
      } else {
        // ถ้ายังไม่มี ให้เพิ่มเข้าไป
        setQuizData({
          ...quizData,
          lessons: [...quizData.lessons, lessonId]
        });
      }
    };
    
    // ตรวจสอบความถูกต้องของข้อมูล
    const validateForm = () => {
      let isValid = true;
      const newErrors = {
        title: "",
        questions: ""
      };
      
      // ตรวจสอบชื่อแบบทดสอบ
      if (quizData.title.trim() === "") {
        newErrors.title = "กรุณาระบุชื่อแบบทดสอบ";
        isValid = false;
      }
      
      // ตรวจสอบว่ามีคำถามอย่างน้อย 1 ข้อ
      if (quizData.questions.length === 0) {
        newErrors.questions = "กรุณาเพิ่มคำถามอย่างน้อย 1 ข้อ";
        isValid = false;
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
          const token = localStorage.getItem("token");
          
          if (!token) {
            setApiError("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
            setIsSubmitting(false);
            return;
          }
          
          // เตรียมข้อมูลสำหรับส่งไปยัง API
          const apiData = {
            title: quizData.title,
            description: quizData.description,
            questions: quizData.questions.map(q => ({
              id: q.id,
              title: q.title,
              type: q.type,
              score: q.score,
              isExisting: q.isExisting || false
            })),
            timeLimit: {
              enabled: quizData.timeLimit.enabled,
              value: quizData.timeLimit.value,
              unit: quizData.timeLimit.unit
            },
            passingScore: {
              enabled: quizData.passingScore.enabled,
              value: quizData.passingScore.value
            },
            attempts: {
              limited: quizData.attempts.limited,
              unlimited: quizData.attempts.unlimited,
              value: quizData.attempts.value
            },
            lessons: quizData.lessons,
            status: quizData.status || "draft"
          };
          
          // ส่งข้อมูลไปยัง API
          const response = await axios.post(`${apiUrl}/api/courses/quizzes`, apiData, {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });
          
          // จัดการกับการตอบกลับที่สำเร็จ
          setApiSuccess("สร้างแบบทดสอบสำเร็จ");
          toast.success("สร้างแบบทดสอบสำเร็จ");
          
          // ถ้ามีการส่ง onSubmit props มา ให้เรียกใช้ฟังก์ชันนั้น
          if (onSubmit) {
            onSubmit(response.data.quiz);
          } else {
            // รีเซ็ตฟอร์มหลังจากบันทึกสำเร็จ
            setQuizData({
              title: "",
              description: "",
              questions: [],
              timeLimit: {
                enabled: false,
                value: 60,
                unit: "minutes"
              },
              passingScore: {
                enabled: false,
                value: 0
              },
              attempts: {
                limited: true,
                unlimited: false,
                value: 1
              },
              lessons: [],
              status: "draft"
            });
          }
        } catch (error) {
          console.error("Error submitting quiz:", error);
          
          // จัดการกับข้อผิดพลาดจาก API
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
      }
    };
    
    // แสดงประเภทคำถามเป็นภาษาไทย
    const getQuestionTypeText = (type: QuestionType) => {
      switch (type) {
        case "TF": return "ถูก/ผิด";
        case "MC": return "หลายตัวเลือก";
        case "SC": return "ตัวเลือกเดียว";
        case "FB": return "เติมคำ";
        default: return "";
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
        
        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">กำลังโหลด...</span>
            </div>
            <p className="mt-3">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            {/* ส่วนที่ 1: ข้อมูลแบบทดสอบ */}
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
            
            {/* ส่วนที่ 2: คำถามประจำแบบทดสอบ */}
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
            </div>
            
            {/* ส่วนที่ 3: เลือกบทเรียนที่จะใช้แบบทดสอบนี้ */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">3. เลือกบทเรียนที่จะใช้แบบทดสอบนี้</h5>
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
                    {quizData.lessons.map(lessonId => {
                      const lesson = availableLessons.find(l => l.id === lessonId);
                      return lesson ? (
                        <div key={lesson.id} className="col-md-6">
                          <div className="card border h-100">
                            <div className="card-body py-2 px-3">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <h6 className="mb-1">{lesson.title}</h6>
                                  <p className="mb-0 small text-muted">
                                    วิชา: {lesson.subject} | ระยะเวลา: {lesson.duration}
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
            </div>
          </div>
          
          {/* ส่วนที่ 4: ตั้งค่าแบบทดสอบ */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">4. ตั้งค่าแบบทดสอบ</h5>
            </div>
            <div className="card-body">
              {/* ระยะเวลาการทำแบบทดสอบ */}
              <div className="mb-4">
                <label className="form-label fw-medium">ระยะเวลาการทำแบบทดสอบ</label>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="timeLimit"
                    name="timeLimit"
                    checked={quizData.timeLimit.enabled}
                    onChange={handleTimeLimitChange}
                  />
                  <label className="form-check-label" htmlFor="timeLimit">
                    จำกัดเวลาในการทำแบบทดสอบ
                  </label>
                </div>
                
                {quizData.timeLimit.enabled && (
                  <div className="row align-items-center mt-2">
                    <div className="col-md-6">
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          id="timeLimitValue"
                          name="timeLimitValue"
                          value={quizData.timeLimit.value}
                          onChange={handleTimeLimitChange}
                          min="1"
                        />
                        <select
                          className="form-select"
                          id="timeLimitUnit"
                          name="timeLimitUnit"
                          value={quizData.timeLimit.unit}
                          onChange={handleTimeLimitChange}
                        >
                          <option value="minutes">นาที</option>
                          <option value="hours">ชั่วโมง</option>
                          <option value="days">วัน</option>
                          <option value="weeks">สัปดาห์</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* เกณฑ์ผ่าน */}
              <div className="mb-4">
                <label className="form-label fw-medium">เกณฑ์ผ่าน</label>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="passingScore"
                    name="passingScore"
                    checked={quizData.passingScore.enabled}
                    onChange={handlePassingScoreChange}
                  />
                  <label className="form-check-label" htmlFor="passingScore">
                    กำหนดเกณฑ์ผ่านแบบทดสอบ
                  </label>
                </div>
                
                {quizData.passingScore.enabled && (
                  <div className="row align-items-center mt-2">
                    <div className="col-md-6">
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          id="passingScoreValue"
                          name="passingScoreValue"
                          value={quizData.passingScore.value}
                          onChange={handlePassingScoreChange}
                          min="0"
                        />
                        <span className="input-group-text">คะแนน</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* จำกัดจำนวนการทำข้อสอบซ้ำ */}
              <div className="mb-4">
                <label className="form-label fw-medium">จำกัดจำนวนการทำข้อสอบซ้ำ</label>
                <p className="text-muted small mb-2">กำหนดจำนวนครั้งที่ผู้เรียนสามารถทำแบบทดสอบนี้ได้</p>
                
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="attemptsLimited"
                    name="attemptsLimited"
                    checked={quizData.attempts.limited}
                    onChange={handleAttemptsChange}
                  />
                  <label className="form-check-label" htmlFor="attemptsLimited">
                    จำกัดจำนวนครั้ง
                  </label>
                </div>
                
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="attemptsUnlimited"
                    name="attemptsUnlimited"
                    checked={quizData.attempts.unlimited}
                    onChange={handleAttemptsChange}
                  />
                  <label className="form-check-label" htmlFor="attemptsUnlimited">
                    ไม่จำกัดจำนวนครั้ง
                  </label>
                </div>
                
                {quizData.attempts.limited && (
                  <div className="row align-items-center mt-2">
                    <div className="col-md-6">
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          id="attemptsValue"
                          name="attemptsValue"
                          value={quizData.attempts.value}
                          onChange={handleAttemptsChange}
                          min="1"
                        />
                        <span className="input-group-text">ครั้ง</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* สถานะแบบทดสอบ */}
              <div className="mb-4">
                <label className="form-label fw-medium">สถานะแบบทดสอบ</label>
                <select
                  className="form-select"
                  id="status"
                  name="status"
                  value={quizData.status}
                  onChange={handleInputChange}
                >
                  <option value="draft">ฉบับร่าง (Draft)</option>
                  <option value="active">เปิดใช้งาน (Active)</option>
                  <option value="inactive">ปิดใช้งาน (Inactive)</option>
                </select>
                <small className="text-muted mt-1 d-block">
                  แบบทดสอบที่มีสถานะเป็น "ฉบับร่าง" จะไม่แสดงให้ผู้เรียนเห็น
                </small>
              </div>
            </div>
          </div>
          
          {/* ปุ่มบันทึกและยกเลิก */}
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button 
              type="button" 
              className="btn btn-outline-secondary" 
              onClick={onCancel}
              disabled={isSubmitting}
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
                  <i className="fas fa-save me-2"></i>บันทึกแบบทดสอบ
                </>
              )}
            </button>
          </div>
        </>
      )}
      
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
                                  {getQuestionTypeText(question.type)}
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
        
        {/* Modal สำหรับเลือกบทเรียน */}
        {showLessonModal && (
          <div className="modal fade show"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
            tabIndex={-1}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
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
                  {/* ค้นหาบทเรียน */}
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
                  </div>
                  
                  {/* รายการบทเรียน */}
                  <div className="list-group">
                    {filteredLessons.length > 0 ? (
                      filteredLessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <h6 className="mb-1">{lesson.title}</h6>
                            <p className="mb-0 small text-muted">
                              วิชา: {lesson.subject} | ระยะเวลา: {lesson.duration}
                            </p>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`select-lesson-${lesson.id}`}
                              checked={quizData.lessons.includes(lesson.id)}
                              onChange={() => handleToggleLesson(lesson.id)}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted">ไม่พบบทเรียนที่ตรงกับคำค้นหา</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-primary" onClick={() => setShowLessonModal(false)}>
                    เสร็จสิ้น
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    );
  };
  
  export default AddQuizzes;
  