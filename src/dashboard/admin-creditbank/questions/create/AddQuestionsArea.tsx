import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardSidebar from "../../../dashboard-common/AdminSidebar";
import DashboardBanner from "../../../dashboard-common/AdminBanner";

// ประเภทของคำถาม
type QuestionType = "TF" | "MC" | "SC" | "FB" | "";

// ตัวเลือกคำตอบ
interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
}

// ข้อมูลคำถาม
interface QuestionData {
  title: string;
  description: string;
  type: QuestionType;
  choices: Choice[];
  score: number;
}

// กำหนด interface สำหรับ props
interface AddQuestionsAreaProps {
  onSubmit?: (questionData: any) => void;
  isEmbedded?: boolean;
}

const AddQuestionsArea: React.FC<AddQuestionsAreaProps> = ({ onSubmit, isEmbedded = false }) => {
  const navigate = useNavigate();
  
  // สร้าง ID สำหรับตัวเลือก
  const generateId = () => `choice_${Math.random().toString(36).substr(2, 9)}`;
  
  // สถานะสำหรับข้อมูลคำถาม
  const [questionData, setQuestionData] = useState<QuestionData>({
    title: "",
    description: "",
    type: "",
    choices: [],
    score: 1
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const questionDataToSubmit = {
        title: questionData.title,
        description: questionData.description,
        type: questionData.type,
        score: questionData.score,
        choices: questionData.choices
      };
      
      // ถ้ามีการส่ง onSubmit props มา ให้เรียกใช้ฟังก์ชันนั้น
      if (onSubmit && isEmbedded) {
        onSubmit(questionDataToSubmit);
        return;
      }
      
      // โค้ดเดิมสำหรับการบันทึกข้อมูลเมื่อใช้งานแบบ standalone
      console.log("บันทึกข้อมูล:", questionData);
      
      // แสดงข้อความสำเร็จ
      alert("บันทึกข้อมูลสำเร็จ");
      
      // กลับไปยังหน้ารายการคำถาม
      navigate("/admin-questions");
    }
  };
  
  // ถ้าเป็นแบบ embedded ให้แสดงเฉพาะฟอร์ม
  if (isEmbedded) {
    return (
      <div className="embedded-question-form">
        <form onSubmit={handleSubmit}>
          {/* ส่วนที่ 1: ข้อมูลคำถาม */}
          <div className="mb-4">
            <h5 className="card-title mb-3">ข้อมูลคำถาม</h5>
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
          
          {/* ส่วนที่ 2: ตั้งค่าคำตอบ */}
          <div className="mb-4">
            <h5 className="card-title mb-3">ตั้งค่าคำตอบ</h5>
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
          
          {/* ปุ่มบันทึกและยกเลิก */}
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button type="button" className="btn btn-outline-secondary" onClick={() => onSubmit && onSubmit(null)}>
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-save me-2"></i>บันทึกคำถาม
            </button>
          </div>
        </form>
      </div>
    );
  }
  
  // แสดงแบบปกติเมื่อใช้งานเป็นหน้าเต็ม
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
                  <h2 className="title text-muted">เพิ่มคำถามใหม่</h2>
                  <p className="desc">สร้างคำถามใหม่สำหรับแบบทดสอบ</p>
                </div>
                
                <div className="card shadow-sm border-0 mb-4">
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      {/* ส่วนที่ 1: ข้อมูลคำถาม */}
                      <div className="mb-4">
                        <h5 className="card-title mb-3">ข้อมูลคำถาม</h5>
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
                      
                      {/* ส่วนที่ 2: ตั้งค่าคำตอบ */}
                      <div className="mb-4">
                        <h5 className="card-title mb-3">ตั้งค่าคำตอบ</h5>
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
                        
                        {/* ปุ่มบันทึกและยกเลิก */}
                        <div className="d-flex justify-content-end gap-2 mt-4">
                          <Link to="/admin-questions" className="btn btn-outline-secondary">
                            ยกเลิก
                          </Link>
                          <button type="submit" className="btn btn-primary">
                            <i className="fas fa-save me-2"></i>บันทึกคำถาม
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };
  
  // กำหนดค่า default props
  AddQuestionsArea.defaultProps = {
    isEmbedded: false,
    onSubmit: undefined
  };
  
  export default AddQuestionsArea;
  