import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ===== TYPES & INTERFACES =====
interface LessonData {
  title: string;
  description: string;
  videoUrl: string;
  hasQuiz: boolean;
  quizId: string | null;
  subjects: string[];
  status: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: number;
  description?: string;
  type?: string;
}

interface Subject {
  id: string;
  title: string;
  category: string;
  credits: number;
  subject_id?: string;
  subject_name?: string;
  subject_code?: string;
  department?: string;
}

interface AddLessonsProps {
  onSubmit?: (lessonData: any) => void;
  onCancel?: () => void;
  lessonToEdit?: any;
}

// ===== LESSON INFO SECTION COMPONENT =====
interface LessonInfoSectionProps {
  lessonData: LessonData;
  errors: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const LessonInfoSection: React.FC<LessonInfoSectionProps> = ({ 
  lessonData, 
  errors, 
  handleInputChange 
}) => (
  <div className="card shadow-sm border-0 mb-4">
    <div className="card-header bg-light">
      <h5 className="mb-0">1. ข้อมูลบทเรียน</h5>
    </div>
    <div className="card-body">
      <div className="mb-3">
        <label htmlFor="title" className="form-label">
          ชื่อบทเรียน <span className="text-danger">*</span>
        </label>
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
        <label htmlFor="description" className="form-label">คำอธิบายบทเรียน</label>
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
);

// ===== LESSON CONTENT SECTION COMPONENT =====
interface LessonContentSectionProps {
  lessonData: LessonData;
  errors: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFile: (index: number) => void;
  handleRemoveExistingFile: (fileId: string) => void;
  uploadedFiles: File[];
  existingFiles: any[];
  filesToRemove: string[];
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const getYouTubeVideoId = (url: string) => {
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/;
  const match = url.match(regExp);
  return (match && match[1].length === 11) ? match[1] : null;
};

const LessonContentSection: React.FC<LessonContentSectionProps> = ({
  lessonData,
  errors,
  handleInputChange,
  handleFileUpload,
  handleRemoveFile,
  handleRemoveExistingFile,
  uploadedFiles,
  existingFiles,
  filesToRemove,
  fileInputRef
}) => {
  const videoId = lessonData.videoUrl ? getYouTubeVideoId(lessonData.videoUrl) : null;

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-light">
        <h5 className="mb-0">2. เนื้อหาบทเรียน</h5>
      </div>
      <div className="card-body">
        {errors.content && (
          <div className="alert alert-danger" role="alert">
            {errors.content}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="videoUrl" className="form-label">URL วิดีโอ YouTube</label>
          <input
            type="text"
            className={`form-control ${errors.videoUrl ? 'is-invalid' : ''}`}
            id="videoUrl"
            name="videoUrl"
            value={lessonData.videoUrl}
            onChange={handleInputChange}
            placeholder="เช่น https://www.youtube.com/watch?v=VIDEO_ID หรือ https://youtu.be/VIDEO_ID"
          />
          {errors.videoUrl && <div className="invalid-feedback">{errors.videoUrl}</div>}
          <small className="text-muted mt-1 d-block">
            ใส่ URL ของวิดีโอ YouTube ที่ต้องการใช้ในบทเรียน (ถ้ามี)
          </small>

          {videoId && (
            <div className="mt-3">
              <h6>ตัวอย่างวิดีโอ:</h6>
              <div className="ratio ratio-16x9">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">ไฟล์ประกอบบทเรียน</label>
          <div className="input-group mb-3">
            <input
              type="file"
              className={`form-control ${errors.files ? 'is-invalid' : ''}`}
              id="files"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              multiple
            />
            <label className="input-group-text" htmlFor="files">อัปโหลด</label>
            {errors.files && <div className="invalid-feedback">{errors.files}</div>}
          </div>
          <small className="text-muted d-block">
            รองรับไฟล์ PDF, DOC, DOCX, XLS และ XLSX ขนาดไม่เกิน 50 MB
          </small>

          {uploadedFiles.length > 0 && (
            <div className="mt-3">
              <h6>ไฟล์ที่อัปโหลด:</h6>
              <ul className="list-group">
                {uploadedFiles.map((file, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <i className={`fas ${file.name.endsWith('.pdf') ? 'fa-file-pdf' : 'fa-file-alt'} me-2 text-danger`}></i>
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
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
            </div>
          )}

          {existingFiles.length > 0 && (
            <div className="mt-3">
              <h6>ไฟล์ที่มีอยู่แล้ว:</h6>
              <ul className="list-group">
                {existingFiles.map((file) => {
                  if (filesToRemove.includes(file.file_id)) return null;
                  return (
                    <li key={file.file_id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <i className={`fas ${file.file_name.endsWith('.pdf') ? 'fa-file-pdf' : 'fa-file-alt'} me-2 text-danger`}></i>
                        {file.file_name} ({(file.file_size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemoveExistingFile(file.file_id)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== SUBJECT SELECTION SECTION COMPONENT =====
interface SubjectSelectionSectionProps {
  lessonData: {
    subjects: string[];
  };
  availableSubjects: Subject[];
  handleToggleSubject: (subjectId: string) => void;
}

const SubjectSelectionSection: React.FC<SubjectSelectionSectionProps> = ({
  lessonData,
  availableSubjects,
  handleToggleSubject
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  
  const filteredSubjects = availableSubjects.filter(subject => {
    const term = searchTerm.toLowerCase();
    const title = subject.title?.toLowerCase() || "";
    const code = subject.subject_code?.toLowerCase() || "";
    
    return title.includes(term) || code.includes(term);
  });

  // Limit to 6 results
  const displayedSubjects = filteredSubjects.slice(0, 6);

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-light">
        <h5 className="mb-0">3. เลือกวิชาที่เกี่ยวข้อง</h5>
      </div>
      <div className="card-body">
        <p className="text-muted mb-3">
          คุณสามารถเลือกวิชาที่เกี่ยวข้องกับบทเรียนนี้ได้ (ไม่บังคับ) และสามารถเลือกได้มากกว่า 1 วิชา
        </p>
        
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            {lessonData.subjects.length > 0 ? (
              <span className="badge bg-success rounded-pill">
                เลือกแล้ว {lessonData.subjects.length} วิชา
              </span>
            ) : (
              <span className="badge bg-secondary rounded-pill">
                ยังไม่ได้เลือกวิชา
              </span>
            )}
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setShowSubjectModal(true)}
            disabled={availableSubjects.length === 0}
          >
            <i className="fas fa-book me-2"></i>เลือกวิชา
          </button>
        </div>
        
        {lessonData.subjects.length > 0 && (
          <div className="selected-subjects">
            <h6 className="mb-2">วิชาที่เลือก:</h6>
            <div className="row g-2">
              {lessonData.subjects.map(subjectId => {
                const subject = availableSubjects.find(s => s.id === subjectId);
                return subject ? (
                  <div key={subject.id} className="col-md-6">
                    <div className="card border h-100">
                      <div className="card-body py-2 px-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">{subject.title}</h6>
                            <p className="mb-0 small text-muted">
                              {subject.subject_code && `รหัสวิชา: ${subject.subject_code}`}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm text-danger"
                            onClick={() => handleToggleSubject(subject.id)}
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
        
        {showSubjectModal && (
          <div className="modal fade show"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
            tabIndex={-1}
          >
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">เลือกวิชาที่เกี่ยวข้อง</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowSubjectModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ค้นหาด้วยรหัสวิชาหรือชื่อวิชา..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                                       <small className="text-muted">
                      แสดงผลสูงสุด 6 รายการ - พิมพ์เพื่อค้นหาวิชาที่ต้องการ
                    </small>
                  </div>
                  
                  <div className="subject-list">
                    {searchTerm.trim() === "" ? (
                      <div className="text-center py-4">
                        <i className="fas fa-search fa-3x text-muted mb-3"></i>
                        <p className="text-muted">กรุณากรอกชื่อวิชาหรือรหัสวิชาเพื่อค้นหา</p>
                      </div>
                    ) : displayedSubjects.length > 0 ? (
                      <>
                        <div className="list-group" style={{ maxHeight: "400px", overflowY: "auto" }}>
                          {displayedSubjects.map((subject) => (
                            <div
                              key={subject.id}
                              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                            >
                              <div>
                                <h6 className="mb-1">{subject.title}</h6>
                                <p className="mb-0 small text-muted">
                                  {subject.subject_code && `รหัสวิชา: ${subject.subject_code}`}
                                  {subject.department && ` | แผนก: ${subject.department}`}
                                  {subject.credits && ` | หน่วยกิต: ${subject.credits}`}
                                </p>
                              </div>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`select-subject-${subject.id}`}
                                  checked={lessonData.subjects.includes(subject.id)}
                                  onChange={() => handleToggleSubject(subject.id)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        {filteredSubjects.length > 6 && (
                          <div className="alert alert-info mt-3">
                            <i className="fas fa-info-circle me-2"></i>
                            พบ {filteredSubjects.length} รายการ แสดงเฉพาะ 6 รายการแรก - พิมพ์ต่อเพื่อผลลัพธ์ที่แม่นยำ
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted">ไม่พบวิชาที่ตรงกับคำค้นหา</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={() => setShowSubjectModal(false)}
                  >
                    เสร็จสิ้น
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

// ===== QUIZ SECTION COMPONENT =====
interface QuizSectionProps {
  lessonData: {
    hasQuiz: boolean;
    quizId: string | null;
  };
  availableQuizzes: Quiz[];
  errors: any;
  handleQuizToggle: () => void;
  handleQuizSelect: (quizId: string) => void;
}

const QuizSection: React.FC<QuizSectionProps> = ({
  lessonData,
  availableQuizzes,
  errors,
  handleQuizSelect
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showQuizModal, setShowQuizModal] = useState(false);
  
  const filteredQuizzes = availableQuizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Limit to 6 results
  const displayedQuizzes = filteredQuizzes.slice(0, 6);

  const selectedQuiz = lessonData.quizId 
    ? availableQuizzes.find(q => q.id === lessonData.quizId)
    : null;

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-light">
        <h5 className="mb-0">4. แบบทดสอบท้ายบทเรียน <span className="text-danger">*</span></h5>
      </div>
      <div className="card-body">
        <p className="text-muted mb-3">
          <strong>บังคับ:</strong> ทุกบทเรียนต้องมีแบบทดสอบท้ายบทเรียน 1 แบบทดสอบ
        </p>
        
        {errors.quiz && (
          <div className="alert alert-danger" role="alert">
            {errors.quiz}
          </div>
        )}

        {lessonData.hasQuiz && (
          <div className="quiz-selection">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                {selectedQuiz ? (
                  <span className="badge bg-success rounded-pill">
                    เลือกแล้ว: {selectedQuiz.title}
                  </span>
                ) : (
                  <span className="badge bg-warning text-dark rounded-pill">
                    ยังไม่ได้เลือกแบบทดสอบ
                  </span>
                )}
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowQuizModal(true)}
                disabled={availableQuizzes.length === 0}
              >
                <i className="fas fa-list-ul me-2"></i>เลือกแบบทดสอบ
              </button>
            </div>

            {selectedQuiz && (
              <div className="selected-quiz">
                <div className="card border-success">
                  <div className="card-body py-2 px-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1 text-success">{selectedQuiz.title}</h6>
                        <p className="mb-0 small text-muted">
                          จำนวนคำถาม: {selectedQuiz.questions} ข้อ
                          {selectedQuiz.type && ` | ประเภท: ${selectedQuiz.type}`}
                        </p>
                        {selectedQuiz.description && (
                          <p className="mb-0 small text-muted">{selectedQuiz.description}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm text-danger"
                        onClick={() => handleQuizSelect("")}
                      >
                        <i className="fas fa-times-circle"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {showQuizModal && (
          <div className="modal fade show"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
            tabIndex={-1}
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
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <small className="text-muted">
                      แสดงผลสูงสุด 6 รายการ - พิมพ์เพื่อค้นหาแบบทดสอบที่ต้องการ
                    </small>
                  </div>
                  
                  <div className="quiz-list">
                    {searchTerm.trim() === "" ? (
                      <div className="text-center py-4">
                        <i className="fas fa-search fa-3x text-muted mb-3"></i>
                        <p className="text-muted">กรุณากรอกชื่อแบบทดสอบเพื่อค้นหา</p>
                      </div>
                    ) : displayedQuizzes.length > 0 ? (
                      <>
                        <div className="list-group" style={{ maxHeight: "400px", overflowY: "auto" }}>
                          {displayedQuizzes.map((quiz) => (
                            <div
                              key={quiz.id}
                              className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                                lessonData.quizId === quiz.id ? 'active' : ''
                              }`}
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                handleQuizSelect(quiz.id);
                                setShowQuizModal(false);
                              }}
                            >
                              <div>
                                <h6 className="mb-1">{quiz.title}</h6>
                                <p className="mb-0 small text-muted">
                                  จำนวนคำถาม: {quiz.questions} ข้อ
                                  {quiz.type && ` | ประเภท: ${quiz.type}`}
                                </p>
                                {quiz.description && (
                                  <p className="mb-0 small text-muted">{quiz.description}</p>
                                )}
                              </div>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="selectedQuiz"
                                  checked={lessonData.quizId === quiz.id}
                                  onChange={() => handleQuizSelect(quiz.id)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        {filteredQuizzes.length > 6 && (
                          <div className="alert alert-info mt-3">
                            <i className="fas fa-info-circle me-2"></i>
                            พบ {filteredQuizzes.length} รายการ แสดงเฉพาะ 6 รายการแรก - พิมพ์ต่อเพื่อผลลัพธ์ที่แม่นยำ
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted">ไม่พบแบบทดสอบที่ตรงกับคำค้นหา</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowQuizModal(false)}
                  >
                    ยกเลิก
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

// ===== MAIN COMPONENT =====
const AddLessons: React.FC<AddLessonsProps> = ({ onSubmit, onCancel, lessonToEdit }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // ===== STATE MANAGEMENT =====
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  
  const [lessonData, setLessonData] = useState<LessonData>({
    title: "",
    description: "",
    videoUrl: "",
    hasQuiz: true, // บังคับให้มีแบบทดสอบ
    quizId: null,
    subjects: [],
    status: "draft"
  });
  
  const [errors, setErrors] = useState({
    title: "",
    content: "",
    videoUrl: "",
    files: "",
    quiz: ""
  });
  
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<any[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);

  // ===== EFFECTS =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");
        
        if (!token) {
          toast.error("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
          return;
        }

        const [quizzesResponse, subjectsResponse] = await Promise.all([
          axios.get(`${apiUrl}/api/courses/quizzes`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${apiUrl}/api/courses/subjects`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

              if (quizzesResponse.data.success) {
          const formattedQuizzes = quizzesResponse.data.quizzes?.map((quiz: any) => ({
            id: quiz.quiz_id || quiz.id,
            title: quiz.title,
            questions: quiz.question_count || quiz.questions || 0,
            description: quiz.description,
            type: quiz.type
          })) || [];
          setAvailableQuizzes(formattedQuizzes);
        }

        if (subjectsResponse.data.success) {
          const formattedSubjects = subjectsResponse.data.subjects?.map((subject: any) => ({
            id: subject.subject_id || subject.id,
            title: subject.subject_name || subject.title,
            subject_code: subject.subject_code,
            department: subject.department,
            credits: subject.credits,
            category: subject.category || ""
          })) || [];
          setAvailableSubjects(formattedSubjects);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    };

    fetchData();
  }, []);

  // Load lesson data for editing
  useEffect(() => {
    if (lessonToEdit) {
      setLessonData({
        title: lessonToEdit.title || "",
        description: lessonToEdit.description || "",
        videoUrl: lessonToEdit.video_url || lessonToEdit.videoUrl || "",
        hasQuiz: lessonToEdit.has_quiz || lessonToEdit.hasQuiz || true,
        quizId: lessonToEdit.quiz_id || lessonToEdit.quizId || null,
        subjects: lessonToEdit.subjects || [],
        status: lessonToEdit.status || "draft"
      });

      if (lessonToEdit.files) {
        setExistingFiles(lessonToEdit.files);
      }
    }
  }, [lessonToEdit]);

  // ===== EVENT HANDLERS =====
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLessonData(prev => ({ ...prev, [name]: value }));
    
    // Clear related errors
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
    
    const validFiles = files.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(extension)) {
        toast.error(`ไฟล์ ${file.name} ไม่ใช่ประเภทที่รองรับ`);
        return false;
      }
      if (file.size > maxSize) {
        toast.error(`ไฟล์ ${file.name} มีขนาดใหญ่เกินไป (สูงสุด 50MB)`);
        return false;
      }
      return true;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
    setErrors(prev => ({ ...prev, files: "" }));
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingFile = (fileId: string) => {
    setFilesToRemove(prev => [...prev, fileId]);
  };

  const handleQuizToggle = () => {
    if (!lessonData.hasQuiz) {
      // เมื่อเปิดใช้งานแบบทดสอบ
      setLessonData(prev => ({ ...prev, hasQuiz: true }));
    } else {
      // ไม่อนุญาตให้ปิดแบบทดสอบ เพราะเป็นสิ่งบังคับ
      toast.warning("แบบทดสอบท้ายบทเรียนเป็นสิ่งบังคับ ไม่สามารถปิดได้");
    }
    setErrors(prev => ({ ...prev, quiz: "" }));
  };

  const handleQuizSelect = (quizId: string) => {
    setLessonData(prev => ({ 
      ...prev, 
      quizId: quizId || null,
      hasQuiz: true // บังคับให้มีแบบทดสอบ
    }));
    setErrors(prev => ({ ...prev, quiz: "" }));
  };

  const handleToggleSubject = (subjectId: string) => {
    setLessonData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter(id => id !== subjectId)
        : [...prev.subjects, subjectId]
    }));
  };

  // ===== VALIDATION =====
  const validateForm = (): boolean => {
    const newErrors = {
      title: "",
      content: "",
      videoUrl: "",
      files: "",
      quiz: ""
    };
    let isValid = true;

    // Title validation
    if (!lessonData.title.trim()) {
      newErrors.title = "กรุณาระบุชื่อบทเรียน";
      isValid = false;
    }

    // Content validation - ต้องมีวิดีโอหรือไฟล์อย่างน้อย 1 อย่าง
    const hasVideo = lessonData.videoUrl.trim() !== "";
    const hasFiles = uploadedFiles.length > 0 || (existingFiles.length > 0 && existingFiles.length > filesToRemove.length);
    
    if (!hasVideo && !hasFiles) {
      newErrors.content = "กรุณาเพิ่มเนื้อหาบทเรียน (วิดีโอ YouTube หรือไฟล์ประกอบ)";
      isValid = false;
    }

    // Video URL validation
    if (lessonData.videoUrl.trim() !== "") {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
      if (!youtubeRegex.test(lessonData.videoUrl)) {
        newErrors.videoUrl = "กรุณาใส่ URL ของ YouTube ที่ถูกต้อง";
        isValid = false;
      }
    }

    // Quiz validation - บังคับให้มีแบบทดสอบ
    if (!lessonData.hasQuiz) {
      newErrors.quiz = "บทเรียนต้องมีแบบทดสอบท้ายบทเรียน";
      isValid = false;
    } else if (!lessonData.quizId) {
      newErrors.quiz = "กรุณาเลือกแบบทดสอบท้ายบทเรียน";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // ===== FORM SUBMISSION =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("กรุณาตรวจสอบข้อมูลที่กรอกให้ครบถ้วน");
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

      const formData = new FormData();
      
      // Add lesson data
      formData.append('title', lessonData.title);
      formData.append('description', lessonData.description);
      formData.append('videoUrl', lessonData.videoUrl);
      formData.append('hasQuiz', lessonData.hasQuiz.toString());
      formData.append('quizId', lessonData.quizId || '');
      formData.append('status', lessonData.status);
      
      // Add subjects
      lessonData.subjects.forEach((subjectId, index) => {
        formData.append(`subjects[${index}]`, subjectId);
      });
      
      // Add files
      uploadedFiles.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });
      
      // Add files to remove (for editing)
      if (filesToRemove.length > 0) {
        formData.append('filesToRemove', JSON.stringify(filesToRemove));
      }

      const url = lessonToEdit 
        ? `${apiUrl}/api/courses/lessons/${lessonToEdit.id}`
        : `${apiUrl}/api/courses/lessons`;
      
      const method = lessonToEdit ? 'PUT' : 'POST';
      
      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const successMessage = lessonToEdit ? "แก้ไขบทเรียนสำเร็จ" : "สร้างบทเรียนสำเร็จ";
        setApiSuccess(successMessage);
        toast.success(successMessage);
        
        if (onSubmit) {
          onSubmit(response.data.lesson);
        }

        // Reset form if creating new lesson
        if (!lessonToEdit) {
          setLessonData({
            title: "",
            description: "",
            videoUrl: "",
            hasQuiz: true,
            quizId: null,
            subjects: [],
            status: "draft"
          });
          setUploadedFiles([]);
          setExistingFiles([]);
          setFilesToRemove([]);
          setErrors({
            title: "",
            content: "",
            videoUrl: "",
            files: "",
            quiz: ""
          });
        }
      }
    } catch (error) {
      console.error("Error submitting lesson:", error);
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data.message || "เกิดข้อผิดพลาดในการบันทึกบทเรียน";
        setApiError(errorMessage);
        toast.error(errorMessage);
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
    } else {
      navigate(-1);
    }
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
        {/* Lesson Info Section */}
        <LessonInfoSection
          lessonData={lessonData}
          errors={errors}
          handleInputChange={handleInputChange}
        />

        {/* Lesson Content Section */}
        <LessonContentSection
          lessonData={lessonData}
          errors={errors}
          handleInputChange={handleInputChange}
          handleFileUpload={handleFileUpload}
          handleRemoveFile={handleRemoveFile}
          handleRemoveExistingFile={handleRemoveExistingFile}
          uploadedFiles={uploadedFiles}
          existingFiles={existingFiles}
          filesToRemove={filesToRemove}
          fileInputRef={fileInputRef}
        />

        {/* Subject Selection Section */}
        <SubjectSelectionSection
          lessonData={lessonData}
          availableSubjects={availableSubjects}
          handleToggleSubject={handleToggleSubject}
        />

        {/* Quiz Section */}
        <QuizSection
          lessonData={lessonData}
          availableQuizzes={availableQuizzes}
          errors={errors}
          handleQuizToggle={handleQuizToggle}
          handleQuizSelect={handleQuizSelect}
        />

        {/* Action Buttons */}
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button 
            type="button" 
            className="btn btn-outline-secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <i className="fas fa-times me-2"></i>
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
                {lessonToEdit ? "กำลังแก้ไข..." : "กำลังสร้าง..."}
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>
                {lessonToEdit ? "บันทึกการแก้ไข" : "สร้างบทเรียน"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLessons;


