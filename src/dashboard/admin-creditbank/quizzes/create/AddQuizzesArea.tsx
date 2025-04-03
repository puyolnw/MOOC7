import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardSidebar from "../../../dashboard-common/AdminSidebar";
import DashboardBanner from "../../../dashboard-common/AdminBanner";
import AddQuestionsForm from "../../questions/create/AddQuestionsArea";

// ประเภทของคำถาม
type QuestionType = "TF" | "MC" | "SC" | "FB";

interface AddQuizzesAreaProps {
  isEmbedded?: boolean;
  onSubmit?: (quizData: any) => void;
}

// ข้อมูลคำถาม
interface Question {
  id: string;
  title: string;
  type: QuestionType;
  score: number;
  isExisting?: boolean; // คำถามที่มีอยู่แล้วในระบบ
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
}



const AddQuizzesArea: React.FC<AddQuizzesAreaProps> = ({ isEmbedded = false, onSubmit }) => {
  const navigate = useNavigate();
  
  // สร้าง ID สำหรับคำถาม
  const generateId = () => `question_${Math.random().toString(36).substr(2, 9)}`;
  
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
    }
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
  
  // ตัวอย่างคำถามที่มีอยู่แล้วในระบบ (จำลองข้อมูล)
  const [existingQuestions] = useState<Question[]>([
    { id: "existing_1", title: "React คืออะไร?", type: "MC", score: 1, isExisting: true },
    { id: "existing_2", title: "TypeScript มีข้อดีอย่างไรเมื่อเทียบกับ JavaScript?", type: "SC", score: 1, isExisting: true },
    { id: "existing_3", title: "HTML ย่อมาจากอะไร?", type: "FB", score: 1, isExisting: true },
    { id: "existing_4", title: "CSS ใช้สำหรับอะไร?", type: "MC", score: 1, isExisting: true },
    { id: "existing_5", title: "JavaScript เป็นภาษาแบบ Compiled หรือ Interpreted?", type: "TF", score: 1, isExisting: true },
  ]);
  
  // สถานะสำหรับการค้นหาคำถามที่มีอยู่แล้ว
  const [searchTerm, setSearchTerm] = useState("");
  
  // สถานะสำหรับการเลือกคำถามที่มีอยู่แล้ว
  const [selectedExistingQuestions, setSelectedExistingQuestions] = useState<string[]>([]);
  
  // กรองคำถามที่มีอยู่แล้วตามคำค้นหา
  const filteredExistingQuestions = existingQuestions.filter(question => 
    question.title.toLowerCase().includes(searchTerm.toLowerCase())
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
    // ตรวจสอบว่าจำนวนคำถามไม่เกิน 100 ข้อ
    if (quizData.questions.length >= 100) {
      alert("ไม่สามารถเพิ่มคำถามได้อีก เนื่องจากมีคำถามครบ 100 ข้อแล้ว");
      return;
    }
    
    const newQuestion: Question = {
      id: generateId(),
      title: questionData.title,
      type: questionData.type,
      score: questionData.score
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
      alert(`ไม่สามารถเพิ่มคำถามได้ทั้งหมด เนื่องจากจะทำให้มีคำถามเกิน 100 ข้อ\nสามารถเพิ่มได้อีก ${100 - quizData.questions.length} ข้อ`);
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log("บันทึกข้อมูล:", quizData);
      if (isEmbedded && onSubmit) {
        onSubmit(quizData);
        return;
      }
      // แสดงข้อความสำเร็จ
      alert("บันทึกข้อมูลสำเร็จ");
      
      // กลับไปยังหน้ารายการแบบทดสอบ
      navigate("/admin-quizzes");
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
    <section className="dashboard__area section-pb-120">
      <div className="container">
        <DashboardBanner />
        <div className="dashboard__inner-wrap">
          <div className="row">
            <DashboardSidebar />
            <div className="dashboard__content-area col-lg-9">
              <div className="dashboard__content-main">
                <div className="dashboard__content-header mb-4">
                  <h2 className="title text-muted">เพิ่มแบบทดสอบใหม่</h2>
                  <p className="desc">สร้างแบบทดสอบใหม่สำหรับวัดผลการเรียนรู้</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                  {/* ส่วนที่ 1: ข้อมูลแบบทดสอบ */}
                  <div className="card shadow-sm border-0 mb-4">
                  <div className="card-header bg-light">
                      <h5 className="mb-0">ข้อมูลแบบทดสอบ</h5>
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
                      <h5 className="mb-0">คำถามประจำแบบทดสอบ</h5>
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
                          disabled={quizData.questions.length >= 100}
                        >
                          <i className="fas fa-list me-2"></i>เลือกจากคำถามที่มีอยู่
                        </button>
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
                                <AddQuestionsForm onSubmit={handleAddNewQuestion} isEmbedded={true} />
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
                    </div>
                  </div>
                  
                  {/* ส่วนที่ 3: ตั้งค่าแบบทดสอบ */}
                  <div className="card shadow-sm border-0 mb-4">
                    <div className="card-header bg-light">
                      <h5 className="mb-0">ตั้งค่าแบบทดสอบ</h5>
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
                        <p className="text-muted small mb-2">How many times can the user re-take this quiz?</p>
                        
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
                    </div>
                  </div>
                  
                  {/* ปุ่มบันทึกและยกเลิก */}
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <Link to="/admin-quizzes" className="btn btn-outline-secondary">
                      ยกเลิก
                    </Link>
                    <button type="submit" className="btn btn-primary">
                      <i className="fas fa-save me-2"></i>บันทึกแบบทดสอบ
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddQuizzesArea;


