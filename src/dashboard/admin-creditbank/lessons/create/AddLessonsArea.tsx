import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardSidebar from "../../../dashboard-common/AdminSidebar";
import DashboardBanner from "../../../dashboard-common/AdminBanner";
import AddQuizzesArea from "../../quizzes/create/AddQuizzesArea";

// ข้อมูลบทเรียน
interface LessonData {
  title: string;
  description: string;
  files: File[];
  videoUrl: string;
  canPreview: boolean;
  hasQuiz: boolean;
  quizId: string | null;
}

// ข้อมูลแบบทดสอบ
interface Quiz {
  id: string;
  title: string;
  questions: number;
}

const AddLessonsArea: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // สถานะสำหรับข้อมูลบทเรียน
  const [lessonData, setLessonData] = useState<LessonData>({
    title: "",
    description: "",
    files: [],
    videoUrl: "",
    canPreview: false,
    hasQuiz: false,
    quizId: null
  });
  
  // สถานะสำหรับการตรวจสอบความถูกต้อง
  const [errors, setErrors] = useState({
    title: "",
    content: "",
    videoUrl: "",
    files: "",
    quiz: ""
  });
  
  // สถานะสำหรับการแสดงไฟล์ที่อัปโหลด
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // สถานะสำหรับการแสดง Modal เลือกแบบทดสอบ
  const [showQuizModal, setShowQuizModal] = useState(false);
  
  // สถานะสำหรับการแสดง Modal สร้างแบบทดสอบ
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  
  // ตัวอย่างแบบทดสอบที่มีอยู่แล้ว
  const [existingQuizzes] = useState<Quiz[]>([
    { id: "quiz1", title: "แบบทดสอบ React พื้นฐาน", questions: 10 },
    { id: "quiz2", title: "แบบทดสอบ TypeScript", questions: 8 },
    { id: "quiz3", title: "แบบทดสอบ JavaScript", questions: 15 },
    { id: "quiz4", title: "แบบทดสอบ HTML และ CSS", questions: 12 },
    { id: "quiz5", title: "แบบทดสอบ Node.js", questions: 7 }
  ]);
  
  // สถานะสำหรับการค้นหาแบบทดสอบ
  const [searchTerm, setSearchTerm] = useState("");
  
  // สถานะสำหรับแบบทดสอบที่เลือก
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  
  // เปลี่ยนแปลงข้อมูลบทเรียน
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLessonData({
      ...lessonData,
      [name]: value
    });
    
    // ล้างข้อผิดพลาด
    if (name === "title" || name === "videoUrl") {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
    
    // ตรวจสอบ URL วิดีโอ
    if (name === "videoUrl" && value) {
      validateYoutubeUrl(value);
    }
  };
  
  // เปลี่ยนแปลงการตั้งค่า
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    if (name === "hasQuiz" && !checked) {
      // ถ้ายกเลิกการมีแบบทดสอบ ให้ล้างข้อมูลแบบทดสอบที่เลือกไว้
      setLessonData({
        ...lessonData,
        hasQuiz: checked,
        quizId: null
      });
      setSelectedQuiz(null);
    } else {
      setLessonData({
        ...lessonData,
        [name]: checked
      });
    }
  };
  
  // ตรวจสอบ URL วิดีโอ YouTube
  const validateYoutubeUrl = (url: string) => {
    if (url === "") {
      setErrors({
        ...errors,
        videoUrl: ""
      });
      return;
    }
    
    // ตรวจสอบรูปแบบ URL ของ YouTube
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?!.*&list=.*)(?!.*&index=.*)/;
    const match = url.match(youtubeRegex);
    
    if (!match) {
      setErrors({
        ...errors,
        videoUrl: "URL วิดีโอไม่ถูกต้อง ต้องเป็น URL ของ YouTube ที่มีรูปแบบถูกต้อง (ไม่มีพารามิเตอร์ list หรือ index)"
      });
    } else {
      setErrors({
        ...errors,
        videoUrl: ""
      });
    }
  };
  
  // อัปโหลดไฟล์
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // ตรวจสอบจำนวนไฟล์
    if (uploadedFiles.length + files.length > 2) {
      setErrors({
        ...errors,
        files: "สามารถอัปโหลดไฟล์ได้สูงสุด 2 ไฟล์"
      });
      return;
    }
    
    // ตรวจสอบขนาดและประเภทไฟล์
    const newFiles: File[] = [];
    let hasError = false;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // ตรวจสอบขนาดไฟล์ (2 MB = 2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
        setErrors({
          ...errors,
          files: "ขนาดไฟล์ต้องไม่เกิน 2 MB"
        });
        hasError = true;
        break;
      }
      
      // ตรวจสอบประเภทไฟล์
      const fileType = file.name.split('.').pop()?.toLowerCase();
      if (fileType !== 'pdf' && fileType !== 'txt') {
        setErrors({
          ...errors,
          files: "รองรับเฉพาะไฟล์ PDF และ TXT เท่านั้น"
        });
        hasError = true;
        break;
      }
      
      newFiles.push(file);
    }
    
    if (!hasError) {
      setUploadedFiles([...uploadedFiles, ...newFiles]);
      setLessonData({
        ...lessonData,
        files: [...uploadedFiles, ...newFiles]
      });
      setErrors({
        ...errors,
        files: "",
        content: "" // ล้างข้อผิดพลาดเกี่ยวกับเนื้อหา
      });
    }
    
    // รีเซ็ต input file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  // ลบไฟล์
  const handleRemoveFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    setLessonData({
      ...lessonData,
      files: newFiles
    });
  };
  
  // เลือกแบบทดสอบ
  const handleSelectQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setLessonData({
      ...lessonData,
      quizId: quiz.id
    });
    setShowQuizModal(false);
  };
  
  // จัดการการสร้างแบบทดสอบใหม่
  const handleQuizCreated = (quizData: any) => {
    if (quizData) {
      // สมมติว่าเราได้รับข้อมูลแบบทดสอบใหม่กลับมา
      const newQuiz: Quiz = {
        id: `quiz${Date.now()}`, // สร้าง ID ชั่วคราว
        title: quizData.title,
        questions: quizData.questions ? quizData.questions.length : 0
      };
      
      setSelectedQuiz(newQuiz);
      setLessonData({
        ...lessonData,
        quizId: newQuiz.id
      });
    }
    
    setShowCreateQuizModal(false);
  };
  
  // กรองแบบทดสอบตามคำค้นหา
  const filteredQuizzes = existingQuizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // ตรวจสอบความถูกต้องของข้อมูล
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: "",
      content: "",
      videoUrl: "",
      files: "",
      quiz: ""
    };
    
    // ตรวจสอบชื่อบทเรียน
    if (lessonData.title.trim() === "") {
      newErrors.title = "กรุณาระบุชื่อบทเรียน";
      isValid = false;
    }
    
    // ตรวจสอบเนื้อหา (ต้องมีอย่างน้อยวิดีโอหรือไฟล์)
    if (lessonData.videoUrl === "" && uploadedFiles.length === 0) {
      newErrors.content = "กรุณาเพิ่มวิดีโอหรืออัปโหลดไฟล์อย่างน้อย 1 รายการ";
      isValid = false;
    }
    
    // ตรวจสอบ URL วิดีโอ
    if (lessonData.videoUrl !== "") {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?!.*&list=.*)(?!.*&index=.*)/;
      if (!youtubeRegex.test(lessonData.videoUrl)) {
        newErrors.videoUrl = "URL วิดีโอไม่ถูกต้อง ต้องเป็น URL ของ YouTube ที่มีรูปแบบถูกต้อง";
        isValid = false;
      }
    }
    
    // ตรวจสอบแบบทดสอบ
    if (lessonData.hasQuiz && !lessonData.quizId) {
      newErrors.quiz = "กรุณาเลือกหรือสร้างแบบทดสอบ";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // บันทึกข้อมูล
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log("บันทึกข้อมูล:", lessonData);
      
      // แสดงข้อความสำเร็จ
      alert("บันทึกข้อมูลสำเร็จ");
      
      // กลับไปยังหน้ารายการบทเรียน
      navigate("/admin-subjects");
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
                  <h2 className="title text-muted">เพิ่มรายวิชาใหม่</h2>
                  <p className="desc">สร้างรายวิชาใหม่สำหรับหลักสูตร</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                  {/* ส่วนที่ 1: ข้อมูลรายวิชา */}
                  <div className="card shadow-sm border-0 mb-4">
                    <div className="card-body">
                      <h5 className="card-title mb-3">ข้อมูลรายวิชา</h5>
                      <div className="mb-3">
                        <label htmlFor="title" className="form-label">ชื่อบทเรียน <span className="text-danger">*</span></label>
                        <input
                                                    type="text"
                                                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                                    id="title"
                                                    name="title"
                                                    value={lessonData.title}
                                                    onChange={handleInputChange}
                                                    placeholder="ระบุชื่อบทเรียน"
                                                  />
                                                  {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                                                </div>
                                                <div className="mb-3">
                                                  <label htmlFor="description" className="form-label">คำอธิบาย (ไม่บังคับ)</label>
                                                  <textarea
                                                    className="form-control"
                                                    id="description"
                                                    name="description"
                                                    value={lessonData.description}
                                                    onChange={handleInputChange}
                                                    rows={3}
                                                    placeholder="ระบุคำอธิบายเพิ่มเติม (ถ้ามี)"
                                                  ></textarea>
                                                </div>
                                              </div>
                                            </div>
                                            
                                            {/* ส่วนที่ 2: จัดการเนื้อหาบทเรียน */}
                                            <div className="card shadow-sm border-0 mb-4">
                                              <div className="card-body">
                                                <h5 className="card-title mb-3">จัดการเนื้อหาบทเรียน</h5>
                                                {errors.content && <div className="alert alert-danger">{errors.content}</div>}
                                                
                                                {/* อัปโหลดไฟล์ */}
                                                <div className="mb-4">
                                                  <label className="form-label">เพิ่มไฟล์สำหรับบทเรียน</label>
                                                  <p className="text-muted small mb-2">สามารถอัปโหลดไฟล์ได้สูงสุด 2 ไฟล์ (ขนาดไฟล์ไม่เกิน 2 MB)</p>
                                                  <p className="text-muted small mb-2">รองรับเฉพาะไฟล์: pdf, txt</p>
                                                  
                                                  <div className="input-group mb-3">
                                                    <input
                                                      type="file"
                                                      className={`form-control ${errors.files ? 'is-invalid' : ''}`}
                                                      id="fileUpload"
                                                      ref={fileInputRef}
                                                      onChange={handleFileUpload}
                                                      accept=".pdf,.txt"
                                                      disabled={uploadedFiles.length >= 2}
                                                    />
                                                    <button
                                                      className="btn btn-outline-secondary"
                                                      type="button"
                                                      onClick={() => fileInputRef.current?.click()}
                                                      disabled={uploadedFiles.length >= 2}
                                                    >
                                                      <i className="fas fa-upload me-2"></i>อัปโหลด
                                                    </button>
                                                    {errors.files && <div className="invalid-feedback">{errors.files}</div>}
                                                  </div>
                                                  
                                                  {/* แสดงไฟล์ที่อัปโหลดแล้ว */}
                                                  {uploadedFiles.length > 0 && (
                                                    <div className="uploaded-files mt-3">
                                                      <h6>ไฟล์ที่อัปโหลดแล้ว:</h6>
                                                      <ul className="list-group">
                                                        {uploadedFiles.map((file, index) => (
                                                          <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                                            <div>
                                                              <i className={`fas ${file.name.endsWith('.pdf') ? 'fa-file-pdf' : 'fa-file-alt'} me-2 text-danger`}></i>
                                                              {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                                            </div>
                                                            <button
                                                              type="button"
                                                              className="btn btn-sm btn-outline-danger"
                                                              onClick={() => handleRemoveFile(index)}
                                                            >
                                                              <i className="fas fa-times"></i>
                                                            </button>
                                                          </li>
                                                        ))}
                                                      </ul>
                                                      <p className="text-muted small mt-2">
                                                        สามารถอัปโหลดได้อีก {2 - uploadedFiles.length} ไฟล์
                                                      </p>
                                                    </div>
                                                  )}
                                                </div>
                                                
                                                {/* ลิงก์วิดีโอ */}
                                                <div className="mb-3">
                                                  <label htmlFor="videoUrl" className="form-label">ลิงก์วิดีโอ YouTube</label>
                                                  <input
                                                    type="text"
                                                    className={`form-control ${errors.videoUrl ? 'is-invalid' : ''}`}
                                                    id="videoUrl"
                                                    name="videoUrl"
                                                    value={lessonData.videoUrl}
                                                    onChange={handleInputChange}
                                                    placeholder="เช่น https://www.youtube.com/watch?v=4S23LUp3WZo"
                                                  />
                                                  {errors.videoUrl && <div className="invalid-feedback">{errors.videoUrl}</div>}
                                                  <small className="form-text text-muted">
                                                    ตัวอย่างลิงก์ที่ถูกต้อง: https://www.youtube.com/watch?v=4S23LUp3WZo หรือ https://youtu.be/4S23LUp3WZo
                                                  </small>
                                                </div>
                                                
                                                {/* แสดงตัวอย่างวิดีโอ */}
                                                {lessonData.videoUrl && !errors.videoUrl && (
                                                  <div className="video-preview mt-3 mb-3">
                                                    <h6>ตัวอย่างวิดีโอ:</h6>
                                                    <div className="ratio ratio-16x9">
                                                      <iframe
                                                        src={`https://www.youtube.com/embed/${lessonData.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]}`}
                                                        title="YouTube video player"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                      ></iframe>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                            
                                            {/* ส่วนที่ 3: แบบทดสอบประจำบทเรียน */}
                                            <div className="card shadow-sm border-0 mb-4">
                                              <div className="card-body">
                                                <h5 className="card-title mb-3">แบบทดสอบประจำบทเรียน</h5>
                                                
                                                <div className="form-check form-switch mb-3">
                                                  <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="hasQuiz"
                                                    name="hasQuiz"
                                                    checked={lessonData.hasQuiz}
                                                    onChange={handleCheckboxChange}
                                                  />
                                                  <label className="form-check-label" htmlFor="hasQuiz">
                                                    มีแบบทดสอบประจำบทเรียน
                                                  </label>
                                                </div>
                                                
                                                {lessonData.hasQuiz && (
                                                  <div className="quiz-selection mt-3">
                                                    {errors.quiz && <div className="alert alert-danger">{errors.quiz}</div>}
                                                    
                                                    {selectedQuiz ? (
                                                      <div className="selected-quiz mb-3">
                                                        <div className="card border">
                                                          <div className="card-body">
                                                            <div className="d-flex justify-content-between align-items-center">
                                                              <div>
                                                                <h6 className="mb-1">{selectedQuiz.title}</h6>
                                                                <p className="mb-0 text-muted small">จำนวนคำถาม: {selectedQuiz.questions} ข้อ</p>
                                                              </div>
                                                              <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-secondary"
                                                                onClick={() => setSelectedQuiz(null)}
                                                              >
                                                                เปลี่ยนแบบทดสอบ
                                                              </button>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    ) : (
                                                      <div className="quiz-options d-flex gap-2 mb-3">
                                                        <button
                                                          type="button"
                                                          className="btn btn-outline-primary"
                                                          onClick={() => setShowQuizModal(true)}
                                                        >
                                                          <i className="fas fa-list-ul me-2"></i>เลือกแบบทดสอบที่มีอยู่
                                                        </button>
                                                        <button
                                                          type="button"
                                                          className="btn btn-outline-success"
                                                          onClick={() => setShowCreateQuizModal(true)}
                                                        >
                                                          <i className="fas fa-plus-circle me-2"></i>สร้างแบบทดสอบใหม่
                                                        </button>
                                                      </div>
                                                    )}
                                                    
                                                    <div className="alert alert-info">
                                                      <i className="fas fa-info-circle me-2"></i>
                                                      แบบทดสอบจะปรากฏให้ผู้เรียนทำหลังจากเรียนเนื้อหาบทเรียนนี้เสร็จสิ้น
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                            
                                            {/* ส่วนที่ 4: ตั้งค่าบทเรียน */}
                                            <div className="card shadow-sm border-0 mb-4">
                                              <div className="card-body">
                                                <h5 className="card-title mb-3">ตั้งค่าบทเรียน</h5>
                                                
                                                <div className="form-check form-switch mb-3">
                                                  <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="canPreview"
                                                    name="canPreview"
                                                    checked={lessonData.canPreview}
                                                    onChange={handleCheckboxChange}
                                                  />
                                                  <label className="form-check-label" htmlFor="canPreview">
                                                    นักเรียนสามารถดูเนื้อหาบทเรียนนี้ได้โดยไม่ต้องลงทะเบียนเรียน
                                                  </label>
                                                </div>
                                                
                                                <div className="alert alert-info">
                                                  <i className="fas fa-info-circle me-2"></i>
                                                  การเปิดให้ดูตัวอย่างเนื้อหาจะช่วยให้ผู้เรียนสามารถเข้าถึงเนื้อหาบางส่วนก่อนตัดสินใจลงทะเบียนเรียน
                                                </div>
                                              </div>
                                            </div>
                                            
                                            {/* ปุ่มบันทึกและยกเลิก */}
                                            <div className="d-flex justify-content-end gap-2 mt-4">
                                              <Link to="/admin-subjects" className="btn btn-outline-secondary">
                                                ยกเลิก
                                              </Link>
                                              <button type="submit" className="btn btn-primary">
                                                <i className="fas fa-save me-2"></i>บันทึกรายวิชา
                                              </button>
                                            </div>
                                          </form>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Modal เลือกแบบทดสอบ */}
                                {showQuizModal && (
                                  <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                                    <div className="modal-dialog modal-lg">
                                      <div className="modal-content">
                                        <div className="modal-header">
                                          <h5 className="modal-title">เลือกแบบทดสอบ</h5>
                                          <button type="button" className="btn-close" onClick={() => setShowQuizModal(false)}></button>
                                        </div>
                                        <div className="modal-body">
                                          <div className="mb-3">
                                            <input
                                              type="text"
                                              className="form-control"
                                              placeholder="ค้นหาแบบทดสอบ..."
                                              value={searchTerm}
                                              onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                          </div>
                                          
                                          <div className="quiz-list">
                                            {filteredQuizzes.length > 0 ? (
                                              <div className="list-group">
                                                {filteredQuizzes.map((quiz) => (
                                                  <button
                                                    key={quiz.id}
                                                    type="button"
                                                    className="list-group-item list-group-item-action"
                                                    onClick={() => handleSelectQuiz(quiz)}
                                                  >
                                                    <div className="d-flex justify-content-between align-items-center">
                                                      <h6 className="mb-1">{quiz.title}</h6>
                                                      <span className="badge bg-primary rounded-pill">{quiz.questions} คำถาม</span>
                                                    </div>
                                                  </button>
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
                                            ปิด
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Modal สร้างแบบทดสอบใหม่ */}
                                {showCreateQuizModal && (
                                  <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                                    <div className="modal-dialog modal-xl">
                                    <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">สร้างแบบทดสอบใหม่</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateQuizModal(false)}></button>
              </div>
              <div className="modal-body p-0" style={{ maxHeight: '80vh', overflow: 'auto' }}>
                {/* เรียกใช้คอมโพเนนต์ AddQuizzesArea แบบ embedded */}
                <AddQuizzesArea 
                  isEmbedded={true} 
                  onSubmit={handleQuizCreated} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AddLessonsArea;

                          