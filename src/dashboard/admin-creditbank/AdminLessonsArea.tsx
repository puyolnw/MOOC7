import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import "./lessons.css";
import "./mega.css";

interface Subject {
  subject_id: number;
  subject_code: string;
  subject_name: string;
  description: string;
  credits: number;
  cover_image: string | null;
  cover_image_file_id: string | null;
  video_url: string | null;
  status: string;
  lesson_count: number;
  quiz_count: number;
  instructors: Instructor[];
  prerequisites: Subject[];
  pre_test: Quiz | null;
  post_test: Quiz | null;
  order_number: number;
  lessons?: Lesson[];
  preTest?: Quiz;
  postTest?: Quiz;
}

interface Lesson {
  lesson_id: number;
  title: string;
  description: string;
  content: string;
  video_url: string | null;
  order_number: number;
  status: string;
  created_at: string;
  can_preview?: boolean;
  has_quiz?: boolean;
  quiz_id?: number | null;
  file_count?: string;
  files?: LessonFile[];
  quiz?: LessonQuiz;
}

interface LessonFile {
  file_id: string;
  original_name: string;
  file_size: number;
  file_type: string;
  file_path: string;
}

interface LessonQuiz {
  quiz_id: number;
  title: string;
  description: string;
  questions?: QuizQuestion[];
}

interface QuizQuestion {
  question_id: number;
  question_text: string;
  question_type: string;
}

interface Instructor {
  instructor_id: number;
  name: string;
  position: string;
  avatar_path: string | null;
  avatar_file_id: string | null;
  status: string;
  description: string | null;
  department: number;
  ranking_id: number | null;
  ranking_name?: string;
  avatar?: string;
  bio?: string;
}

interface Quiz {
  quiz_id: number;
  title: string;
  description: string;
  status: string;
  passing_score_enabled: boolean;
  passing_score_value: number;
  question_count?: string;
}

interface Course {
  course_id: number;
  title: string;
  course_code: string;
}

interface AvailableInstructor {
  instructor_id: number;
  name: string;
  position: string;
  department_name: string;
  avatar_file_id: string | null;
  status: string;
}

interface AdminLessonsAreaProps {
  subject: Subject;
  courseData: Course;
  onSubjectUpdate: (updatedSubject: Subject) => void;
}

// Add Lesson Card Component - Styled like lesson items
const AddLessonCard: React.FC<{
  subjectId: number;
  onClick: () => void;
}> = ({ onClick }) => {
  return (
    <div className="add-lesson-card" onClick={onClick}>
      <div className="add-lesson-content">
        <div className="add-lesson-icon">
          <i className="fas fa-plus"></i>
        </div>
        <div className="add-lesson-text">
          <h4>เพิ่มบทเรียนใหม่</h4>
          <p>สร้างบทเรียนใหม่สำหรับรายวิชานี้</p>
       
        </div>
      </div>
    </div>
  );
};

// Enhanced Add Instructor Card Component
const AddInstructorCard: React.FC<{
  subjectId: number;
  onClick: () => void;
}> = ({ onClick }) => {
  return (
    <div className="add-content-card add-instructor-card" onClick={onClick}>
      <div className="add-content-inner">
        <div className="add-content-icon-wrapper">
          <div className="add-content-icon instructor-icon">
            <i className="fas fa-plus"></i>
          </div>
          <div className="add-content-ripple"></div>
        </div>
        <div className="add-content-text">
          <h3 className="add-content-title">เพิ่มอาจารย์ผู้สอน</h3>
          <p className="add-content-description">
            เลือกอาจารย์ผู้สอนสำหรับรายวิชานี้
          </p>
        </div>
        <div className="add-content-arrow">
          <i className="fas fa-arrow-right"></i>
        </div>
      </div>
      <div className="add-content-hover-effect"></div>
    </div>
  );
};

// Enhanced Add Test Card Component
const AddTestCard: React.FC<{
  testType: 'pre' | 'post';
  subjectId: number;
  onClick: () => void;
}> = ({ testType, onClick }) => {
  return (
    <div className={`add-content-card add-test-card ${testType}-test-card`} onClick={onClick}>
      <div className="add-content-inner">
        <div className="add-content-icon-wrapper">
          <div className={`add-content-icon test-icon ${testType}-test-icon`}>
            <i className="fas fa-plus"></i>
          </div>
          <div className="add-content-ripple"></div>
        </div>
        <div className="add-content-text">
          <h3 className="add-content-title">
            เพิ่มแบบทดสอบ{testType === 'pre' ? 'ก่อนเรียน' : 'หลังเรียน'}
          </h3>
          <p className="add-content-description">
            สร้างแบบทดสอบ{testType === 'pre' ? 'ก่อนเรียน' : 'หลังเรียน'}สำหรับรายวิชานี้
          </p>
        </div>
        <div className="add-content-arrow">
          <i className="fas fa-arrow-right"></i>
        </div>
      </div>
      <div className="add-content-hover-effect"></div>
    </div>
  );
};

// Lesson Item Component with Accordion Bars
const LessonItem: React.FC<{
  lesson: Lesson;
  index: number;
  onDelete: (lessonId: number) => void;
}> = ({ lesson, index, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [videoExpanded, setVideoExpanded] = useState(false);
  const [filesExpanded, setFilesExpanded] = useState(false);
  const [quizExpanded, setQuizExpanded] = useState(false);
  const [quizQuestionsExpanded, setQuizQuestionsExpanded] = useState(false);

  const apiURL = import.meta.env.VITE_API_URL;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string): string => {
    if (fileType.includes('pdf')) return 'fas fa-file-pdf';
    if (fileType.includes('doc') || fileType.includes('docx')) return 'fas fa-file-word';
    if (fileType.includes('image')) return 'fas fa-file-image';
    if (fileType.includes('video')) return 'fas fa-file-video';
    if (fileType.includes('audio')) return 'fas fa-file-audio';
    return 'fas fa-file';
  };

  const getFileIconClass = (fileType: string): string => {
    if (fileType.includes('pdf')) return 'pdf';
    if (fileType.includes('doc') || fileType.includes('docx')) return 'doc';
    if (fileType.includes('image')) return 'image';
    return 'default';
  };

  const getQuestionTypeText = (type: string): string => {
    switch (type) {
      case 'multiple_choice': return 'ปรนัย';
      case 'true_false': return 'ถูก/ผิด';
      case 'short_answer': return 'คำตอบสั้น';
      case 'essay': return 'อัตนัย';
      default: return type;
    }
  };

  const getVideoEmbedUrl = (videoUrl: string): string => {
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const videoIdMatch = videoUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
      if (videoIdMatch) {
        return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
      }
    }
    return videoUrl;
  };

  const handleAddVideo = () => {
    window.location.href = `/admin-lessons/edit/${lesson.lesson_id}?tab=video`;
  };

  const handleAddFiles = () => {
    window.location.href = `/admin-lessons/edit/${lesson.lesson_id}?tab=files`;
  };

  const handleAddQuiz = () => {
    window.location.href = `/admin-quizzes/create-new?lesson_id=${lesson.lesson_id}`;
  };

  return (
    <div className="lesson-item">
      <div 
        className={`lesson-header ${isExpanded ? 'expanded' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="lesson-number">
          <span>{lesson.order_number || index + 1}</span>
        </div>
        
        <div className="lesson-info">
          <h4 className="lesson-title">{lesson.title}</h4>
          {lesson.description && (
            <p className="lesson-description">
              {lesson.description.length > 100 
                ? `${lesson.description.substring(0, 100)}...`
                : lesson.description
              }
            </p>
          )}
          
          <div className="lesson-meta">
            {lesson.video_url && (
              <div className="meta-badge">
                <i className="fas fa-play-circle"></i>
                <span>วิดีโอ</span>
              </div>
            )}
            {lesson.files && lesson.files.length > 0 && (
              <div className="meta-badge">
                <i className="fas fa-file"></i>
                <span>{lesson.files.length} ไฟล์</span>
              </div>
            )}
            {lesson.has_quiz && (
              <div className="meta-badge">
                <i className="fas fa-question-circle"></i>
                <span>แบบทดสอบ</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="lesson-actions">
          <Link
            to={`/admin-lessons/edit/${lesson.lesson_id}`}
            className="action-btn edit-btn"
            title="แก้ไข"
            onClick={(e) => e.stopPropagation()}
          >
            <i className="fas fa-edit"></i>
          </Link>
          <button 
            className="action-btn view-btn"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`/lessons/view/${lesson.lesson_id}`, '_blank');
            }}
            title="ดูตัวอย่าง"
          >
            <i className="fas fa-eye"></i>
          </button>
          <button 
            className="action-btn delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(lesson.lesson_id);
            }}
            title="ลบ"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
        
        <div className="lesson-expand-icon">
          <i className="fas fa-chevron-down"></i>
        </div>
      </div>

      <div className={`lesson-content ${isExpanded ? 'expanded' : ''}`}>
        <div className="lesson-content-sections">
          
          {/* Video Section Bar */}
          <div className="content-section-bar">
            <div 
              className={`section-bar-header ${videoExpanded ? 'expanded' : ''}`}
              onClick={() => setVideoExpanded(!videoExpanded)}
            >
              <div className="section-bar-icon video-icon">
                <i className="fas fa-play-circle"></i>
              </div>
              <div className="section-bar-info">
                <h5 className="section-bar-title">วิดีโอบทเรียน</h5>
                <p className="section-bar-subtitle">
                  {lesson.video_url ? 'มีวิดีโอบทเรียน' : 'ยังไม่มีวิดีโอ'}
                </p>
              </div>
              <div className="section-bar-count">
                {lesson.video_url ? '1' : '0'}
              </div>
              <div className="section-bar-expand">
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>
            
            <div className={`section-bar-content ${videoExpanded ? 'expanded' : ''}`}>
              <div className="section-content-inner">
                <div className="video-section">
                  {lesson.video_url ? (
                    <div className="video-player">
                      <iframe
                        src={getVideoEmbedUrl(lesson.video_url)}
                        title={`วิดีโอบทเรียน ${lesson.title}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="video-placeholder">
                      <i className="fas fa-video"></i>
                      <p>ยังไม่มีวิดีโอสำหรับบทเรียนนี้</p>
                    </div>
                  )}
                  <button className="add-video-btn modern-btn" onClick={handleAddVideo}>
                    <i className="fas fa-plus"></i>
                    <span>{lesson.video_url ? 'เปลี่ยนวิดีโอ' : 'เพิ่มวิดีโอ'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Files Section Bar */}
          <div className="content-section-bar">
            <div 
              className={`section-bar-header ${filesExpanded ? 'expanded' : ''}`}
              onClick={() => setFilesExpanded(!filesExpanded)}
            >
              <div className="section-bar-icon files-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <div className="section-bar-info">
                <h5 className="section-bar-title">ไฟล์แนบ</h5>
                <p className="section-bar-subtitle">
                  {lesson.files && lesson.files.length > 0 
                    ? `มีไฟล์แนบ ${lesson.files.length} ไฟล์` 
                    : 'ยังไม่มีไฟล์แนบ'
                  }
                </p>
              </div>
              <div className="section-bar-count">
                {lesson.files?.length || 0}
              </div>
              <div className="section-bar-expand">
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>
            
            <div className={`section-bar-content ${filesExpanded ? 'expanded' : ''}`}>
              <div className="section-content-inner">
                <div className="files-section">
                  {lesson.files && lesson.files.length > 0 ? (
                    <div className="files-list">
                      {lesson.files.map((file) => (
                        <div key={file.file_id} className="file-item">
                          <div className={`file-icon ${getFileIconClass(file.file_type)}`}>
                            <i className={getFileIcon(file.file_type)}></i>
                          </div>
                          <div className="file-details">
                            <h5 className="file-name">{file.original_name}</h5>
                            <p className="file-size">{formatFileSize(file.file_size)}</p>
                          </div>
                          <div className="file-actions">
                            <button 
                              className="action-btn view-btn"
                              onClick={() => window.open(`${apiURL}/api/courses/lessons/files/${file.file_id}`, '_blank')}
                              title="ดาวน์โหลด"
                            >
                              <i className="fas fa-download"></i>
                            </button>
                            <button 
                              className="action-btn delete-btn"
                              title="ลบไฟล์"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="files-empty">
                      <i className="fas fa-file-alt"></i>
                      <p>ยังไม่มีไฟล์แนบสำหรับบทเรียนนี้</p>
                    </div>
                  )}
                  <button className="add-files-btn modern-btn" onClick={handleAddFiles}>
                    <i className="fas fa-plus"></i>
                    <span>เพิ่มไฟล์แนบ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quiz Section Bar */}
          <div className="content-section-bar">
            <div 
              className={`section-bar-header ${quizExpanded ? 'expanded' : ''}`}
              onClick={() => setQuizExpanded(!quizExpanded)}
            >
                           <div className="section-bar-icon quiz-icon">
                <i className="fas fa-question-circle"></i>
              </div>
              <div className="section-bar-info">
                <h5 className="section-bar-title">แบบทดสอบ</h5>
                <p className="section-bar-subtitle">
                  {lesson.quiz 
                    ? `แบบทดสอบ: ${lesson.quiz.title}` 
                    : 'ยังไม่มีแบบทดสอบ'
                  }
                </p>
              </div>
              <div className="section-bar-count">
                {lesson.quiz?.questions?.length || 0}
              </div>
              <div className="section-bar-expand">
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>
            
            <div className={`section-bar-content ${quizExpanded ? 'expanded' : ''}`}>
              <div className="section-content-inner">
                <div className="quiz-section">
                  {lesson.quiz ? (
                    <div className="quiz-info-card">
                      <div className="quiz-header">
                        <h5 className="quiz-title">{lesson.quiz.title}</h5>
                        <button 
                          className="expand-quiz-btn"
                          onClick={() => setQuizQuestionsExpanded(!quizQuestionsExpanded)}
                        >
                          <span>{quizQuestionsExpanded ? 'ซ่อน' : 'ดู'}คำถาม</span>
                          <i className={`fas fa-chevron-${quizQuestionsExpanded ? 'up' : 'down'}`}></i>
                        </button>
                      </div>
                      
                      <div className="quiz-stats">
                        <div className="quiz-stat">
                          <span className="quiz-stat-number">{lesson.quiz.questions?.length || 0}</span>
                          <p className="quiz-stat-label">คำถาม</p>
                        </div>
                        <div className="quiz-stat">
                          <span className="quiz-stat-number">-</span>
                          <p className="quiz-stat-label">คะแนนเต็ม</p>
                        </div>
                      </div>
                      
                      {lesson.quiz.description && (
                        <p style={{ color: '#718096', marginBottom: '1rem' }}>
                          {lesson.quiz.description}
                        </p>
                      )}
                      
                      <div className={`quiz-questions ${quizQuestionsExpanded ? 'expanded' : ''}`}>
                        {lesson.quiz.questions && lesson.quiz.questions.length > 0 && (
                          <div className="questions-list">
                            {lesson.quiz.questions.map((question, qIndex) => (
                              <div key={question.question_id} className="question-item">
                                <div className="question-number">
                                  <span>{qIndex + 1}</span>
                                </div>
                                <div className="question-text">
                                  {question.question_text}
                                </div>
                                <div className="question-type">
                                  {getQuestionTypeText(question.question_type)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="quiz-actions">
                        <Link
                          to={`/admin-quizzes/edit/${lesson.quiz.quiz_id}`}
                          className="modern-btn secondary small"
                        >
                          <i className="fas fa-edit"></i>
                          <span>แก้ไขแบบทดสอบ</span>
                        </Link>
                        <button 
                          className="modern-btn secondary small"
                          onClick={() => window.open(`/quizzes/preview/`, '_blank')}
                        >
                          <i className="fas fa-eye"></i>
                          <span>ดูตัวอย่าง</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="quiz-empty">
                      <i className="fas fa-question-circle"></i>
                      <p>ยังไม่มีแบบทดสอบสำหรับบทเรียนนี้</p>
                    </div>
                  )}
                  <button className="add-quiz-btn modern-btn" onClick={handleAddQuiz}>
                    <i className="fas fa-plus"></i>
                    <span>{lesson.quiz ? 'เปลี่ยนแบบทดสอบ' : 'เพิ่มแบบทดสอบ'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

// Instructor Selection Modal
const InstructorSelectionModal: React.FC<{
  show: boolean;
  onClose: () => void;
  onSelect: (instructorId: number) => void;
  subjectId: number;
}> = ({ show, onClose, onSelect, subjectId }) => {
  const apiURL = import.meta.env.VITE_API_URL;
  const [availableInstructors, setAvailableInstructors] = useState<AvailableInstructor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (show) {
      fetchAvailableInstructors();
    }
  }, [show]);

  const fetchAvailableInstructors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${apiURL}/api/accounts/instructors`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setAvailableInstructors(response.data.instructors || []);
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInstructors = availableInstructors.filter(instructor =>
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectInstructor = async (instructorId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${apiURL}/api/courses/subjects/${subjectId}/instructors`,
        { instructor_id: instructorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        onSelect(instructorId);
        onClose();
        showNotification('เพิ่มอาจารย์ผู้สอนสำเร็จ', 'success');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error adding instructor:', error);
      showNotification('เกิดข้อผิดพลาดในการเพิ่มอาจารย์ผู้สอน', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  if (!show) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-primary">
            <h5 className="modal-title text-white">เลือกอาจารย์ผู้สอน</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="ค้นหาอาจารย์..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">กำลังโหลด...</span>
                </div>
                <p className="mt-2">กำลังโหลดข้อมูลอาจารย์...</p>
              </div>
            ) : filteredInstructors.length > 0 ? (
              <div className="instructor-list">
                {filteredInstructors.map((instructor) => (
                  <div
                    key={instructor.instructor_id}
                    className="instructor-item d-flex align-items-center p-3 border rounded mb-2 cursor-pointer hover-bg-light"
                    onClick={() => handleSelectInstructor(instructor.instructor_id)}
                  >
                    <div className="instructor-avatar me-3">
                      {instructor.avatar_file_id ? (
                        <img
                          src={`${apiURL}/api/accounts/instructors/avatar/${instructor.avatar_file_id}`}
                          alt={instructor.name}
                          className="rounded-circle"
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://www.pngwing.com/en/search?q=no+Image';
                          }}
                        />
                      ) : (
                        <div className="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center bg-secondary text-white" style={{ width: '50px', height: '50px' }}>
                          <i className="fas fa-user"></i>
                        </div>
                      )}
                    </div>
                    <div className="instructor-info flex-grow-1">
                      <h6 className="mb-1">{instructor.name}</h6>
                      <p className="mb-1 text-muted">{instructor.position}</p>
                      <small className="text-muted">{instructor.department_name}</small>
                    </div>
                    <div className="instructor-status">
                      <span className={`badge ${instructor.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                        {instructor.status === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <i className="fas fa-search fa-3x text-muted mb-3"></i>
                <p className="text-muted">ไม่พบอาจารย์ที่ตรงกับการค้นหา</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Lessons Panel Component
const LessonsPanel: React.FC<{
  subject: Subject;
  lessons: Lesson[];
  setLessons: (lessons: Lesson[]) => void;
}> = ({ subject, lessons, setLessons }) => {
  const handleAddLesson = () => {
    window.location.href = `/admin-lessons/create-new?subject_id=${subject.subject_id}`;
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm('คุณต้องการลบบทเรียนนี้หรือไม่?')) return;
    
    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${apiURL}/api/courses/lessons/${lessonId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setLessons(lessons.filter(lesson => lesson.lesson_id !== lessonId));
        showNotification('ลบบทเรียนสำเร็จ', 'success');
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      showNotification('เกิดข้อผิดพลาดในการลบบทเรียน', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  return (
    <div className="tab-panel lessons-panel">
      <div className="lessons-header">
        <h3>บทเรียนทั้งหมด</h3>
        <p>รายการบทเรียนในรายวิชา {subject.subject_name}</p>
      </div>
      
      {lessons.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <i className="fas fa-play-circle"></i>
          </div>
          <h4>ไม่มีบทเรียน</h4>
          <p>ยังไม่มีบทเรียนในรายวิชานี้</p>
          <button 
            className="add-first-btn modern-btn primary large"
            onClick={handleAddLesson}
          >
            <div className="btn-content">
              <i className="fas fa-plus"></i>
              <span>เพิ่มบทเรียนแรก</span>
            </div>
            <div className="btn-ripple"></div>
          </button>
        </div>
      ) : (
        <div className="lessons-container">
          <div className="lessons-list">
            {/* Add Lesson Card */}
            <AddLessonCard 
              subjectId={subject.subject_id}
              onClick={handleAddLesson}
            />
            
            {/* Lesson Items with Accordion Bars */}
            {lessons.map((lesson, index) => (
              <LessonItem
                key={`lesson-${lesson.lesson_id}`}
                lesson={lesson}
                index={index}
                onDelete={handleDeleteLesson}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Instructors Panel Component
const InstructorsPanel: React.FC<{
  subject: Subject;
}> = ({ subject }) => {
  const apiURL = import.meta.env.VITE_API_URL;
  const [showInstructorModal, setShowInstructorModal] = useState(false);

  const handleAddInstructor = () => {
    setShowInstructorModal(true);
  };

  const handleDeleteInstructor = async (instructorId: number) => {
    if (!confirm('คุณต้องการลบอาจารย์ผู้สอนนี้หรือไม่?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${apiURL}/api/courses/subjects/${subject.subject_id}/instructors/${instructorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        window.location.reload();
        showNotification('ลบอาจารย์ผู้สอนสำเร็จ', 'success');
      }
    } catch (error) {
      console.error('Error deleting instructor:', error);
      showNotification('เกิดข้อผิดพลาดในการลบอาจารย์ผู้สอน', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  return (
    <>
      <div className="tab-panel instructors-panel">
        <div className="instructors-header">
          <h3>อาจารย์ผู้สอน</h3>
          <p>รายชื่ออาจารย์ที่สอนในรายวิชา {subject.subject_name}</p>
        </div>
        
        {!subject.instructors || subject.instructors.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="fas fa-chalkboard-teacher"></i>
            </div>
            <h4>ไม่มีอาจารย์ผู้สอน</h4>
            <p>ยังไม่มีการกำหนดอาจารย์ผู้สอนสำหรับรายวิชานี้</p>
            <button 
              className="add-first-btn modern-btn primary large"
              onClick={handleAddInstructor}
            >
              <div className="btn-content">
                <i className="fas fa-plus"></i>
                <span>เพิ่มอาจารย์ผู้สอนคนแรก</span>
              </div>
              <div className="btn-ripple"></div>
            </button>
          </div>
        ) : (
          <div className="content-grid instructors-grid">
            {/* Enhanced Add Instructor Card */}
            <AddInstructorCard 
              subjectId={subject.subject_id}
              onClick={handleAddInstructor}
            />
            
            {subject.instructors.map((instructor) => (
              <div key={`instructor-${instructor.instructor_id}`} className="content-item instructor-item">
                <div className="instructor-avatar-section">
                  <div className="instructor-avatar">
                    {instructor.avatar_file_id ? (
                      <img
                        src={`${apiURL}/api/accounts/instructors/avatar/${instructor.avatar_file_id}`}
                        alt={instructor.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://www.pngwing.com/en/search?q=no+Image';
                        }}
                      />
                    ) : instructor.avatar ? (
                      <img
                        src={`data:image/jpeg;base64,${instructor.avatar}`}
                        alt={instructor.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://www.pngwing.com/en/search?q=no+Image';
                        }}
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        <i className="fas fa-user"></i>
                      </div>
                    )}
                  </div>
                  <div className="instructor-status">
                    <span className={`status-dot ${instructor.status}`}></span>
                  </div>
                </div>
                
                <div className="instructor-info">
                  <h4 className="instructor-name">{instructor.name}</h4>
                  <p className="instructor-position">{instructor.position}</p>
                  {instructor.ranking_name && (
                    <span className="instructor-rank">{instructor.ranking_name}</span>
                  )}
                  {(instructor.description || instructor.bio) && (
                    <p className="instructor-description">
                      {((instructor.description || instructor.bio) || '').length > 100 
                        ? `${((instructor.description || instructor.bio) || '').substring(0, 100)}...`
                        : (instructor.description || instructor.bio)
                      }
                    </p>
                  )}
                </div>
                
                <div className="item-actions">
                  <Link
                    to={`/admin-instructors/edit/${instructor.instructor_id}`}
                    className="action-btn edit-btn modern-btn small secondary"
                  >
                    <i className="fas fa-edit"></i>
                  </Link>
                  <button 
                    className="action-btn view-btn modern-btn small info"
                    onClick={() => window.open(`/instructors/profile/${instructor.instructor_id}`, '_blank')}
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  <button 
                    className="action-btn delete-btn modern-btn small danger"
                    onClick={() => handleDeleteInstructor(instructor.instructor_id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructor Selection Modal */}
      <InstructorSelectionModal
        show={showInstructorModal}
        onClose={() => setShowInstructorModal(false)}
        onSelect={(instructorId) => {
          console.log('Selected instructor:', instructorId);
        }}
        subjectId={subject.subject_id}
      />
    </>
  );
};

// Tests Panel Component
const TestsPanel: React.FC<{
  subject: Subject;
}> = ({ subject }) => {
  const handleAddTest = (testType: 'pre' | 'post') => {
    window.location.href = `/admin-quizzes/create-new?subject_id=${subject.subject_id}&type=${testType}`;
  };

  const handleDeleteTest = async (testType: 'pre' | 'post') => {
    const testName = testType === 'pre' ? 'ก่อนเรียน' : 'หลังเรียน';
    if (!confirm(`คุณต้องการลบแบบทดสอบ${testName}นี้หรือไม่?`)) return;
    
    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      const testId = testType === 'pre' 
        ? (subject.pre_test?.quiz_id || subject.preTest?.quiz_id) 
        : (subject.post_test?.quiz_id || subject.postTest?.quiz_id);
      
      if (!testId) return;

      const response = await axios.delete(
        `${apiURL}/api/courses/quizzes/${testId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        window.location.reload();
        showNotification(`ลบแบบทดสอบ${testName}สำเร็จ`, 'success');
      }
    } catch (error) {
      console.error('Error deleting test:', error);
      showNotification(`เกิดข้อผิดพลาดในการลบแบบทดสอบ${testName}`, 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  return (
    <div className="tab-panel tests-panel">
      <div className="tests-header">
        <h3>แบบทดสอบ</h3>
        <p>แบบทดสอบก่อนเรียนและหลังเรียนสำหรับรายวิชา {subject.subject_name}</p>
      </div>
      
      <div className="tests-grid">
        {/* Enhanced Pre-test Card */}
        <div className={`test-card pre-test-card ${!(subject.pre_test || subject.preTest) ? 'empty' : 'filled'}`}>
          <div className="test-card-header">
            <div className={`test-icon pre-test-icon ${!(subject.pre_test || subject.preTest) ? 'empty' : ''}`}>
              <i className="fas fa-play-circle"></i>
            </div>
            <div className="test-title">
              <h4>แบบทดสอบก่อนเรียน</h4>
              <p>ทดสอบความรู้พื้นฐานก่อนเริ่มเรียน</p>
            </div>
          </div>
          
          {(subject.pre_test || subject.preTest) ? (
            <div className="test-content">
              <div className="test-details">
                <div className="detail-item">
                  <span className="detail-label">ชื่อแบบทดสอบ</span>
                  <span className="detail-value">{(subject.pre_test || subject.preTest)?.title}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">คำอธิบาย</span>
                  <span className="detail-value">{(subject.pre_test || subject.preTest)?.description || '-'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">จำนวนข้อ</span>
                  <span className="detail-value">{(subject.preTest as any)?.question_count || '-'} ข้อ</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">สถานะ</span>
                  <span className={`status-badge ${(subject.pre_test || subject.preTest)?.status || 'active'}`}>
                    {((subject.pre_test || subject.preTest)?.status || 'active') === 'active' ? 'เปิดใช้งาน' : 
                     ((subject.pre_test || subject.preTest)?.status || 'active') === 'inactive' ? 'ปิดใช้งาน' : 'ร่าง'}
                  </span>
                </div>
              </div>
              
              <div className="test-actions">
                <Link
                  to={`/admin-quizzes/edit/${(subject.pre_test || subject.preTest)?.quiz_id}`}
                  className="action-btn edit-btn modern-btn small secondary"
                >
                  <div className="btn-content">
                    <i className="fas fa-edit"></i>
                    <span>แก้ไข</span>
                  </div>
                </Link>
                <button 
                  className="action-btn view-btn modern-btn small info"
                  onClick={() => window.open(`/quizzes/preview/${(subject.pre_test || subject.preTest)?.quiz_id}`, '_blank')}
                >
                  <div className="btn-content">
                    <i className="fas fa-eye"></i>
                    <span>ดูตัวอย่าง</span>
                  </div>
                </button>
                <button 
                  className="action-btn delete-btn modern-btn small danger"
                  onClick={() => handleDeleteTest('pre')}
                >
                  <div className="btn-content">
                    <i className="fas fa-trash"></i>
                    <span>ลบ</span>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="test-empty">
              <AddTestCard 
                testType="pre"
                subjectId={subject.subject_id}
                onClick={() => handleAddTest('pre')}

              />
            </div>
          )}
        </div>

        {/* Enhanced Post-test Card */}
        <div className={`test-card post-test-card ${!(subject.post_test || subject.postTest) ? 'empty' : 'filled'}`}>
          <div className="test-card-header">
            <div className={`test-icon post-test-icon ${!(subject.post_test || subject.postTest) ? 'empty' : ''}`}>
              <i className="fas fa-stop-circle"></i>
            </div>
            <div className="test-title">
              <h4>แบบทดสอบหลังเรียน</h4>
              <p>ทดสอบความรู้หลังจากเรียนจบ</p>
            </div>
          </div>
          
          {(subject.post_test || subject.postTest) ? (
            <div className="test-content">
              <div className="test-details">
                <div className="detail-item">
                  <span className="detail-label">ชื่อแบบทดสอบ</span>
                  <span className="detail-value">{(subject.post_test || subject.postTest)?.title}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">คำอธิบาย</span>
                  <span className="detail-value">{(subject.post_test || subject.postTest)?.description || '-'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">จำนวนข้อ</span>
                  <span className="detail-value">{(subject.postTest as any)?.question_count || '-'} ข้อ</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">สถานะ</span>
                  <span className={`status-badge ${(subject.post_test || subject.postTest)?.status || 'active'}`}>
                    {((subject.post_test || subject.postTest)?.status || 'active') === 'active' ? 'เปิดใช้งาน' : 
                     ((subject.post_test || subject.postTest)?.status || 'active') === 'inactive' ? 'ปิดใช้งาน' : 'ร่าง'}
                  </span>
                </div>
              </div>
              
              <div className="test-actions">
                <Link
                  to={`/admin-quizzes/edit/${(subject.post_test || subject.postTest)?.quiz_id}`}
                  className="action-btn edit-btn modern-btn small secondary"
                >
                  <div className="btn-content">
                    <i className="fas fa-edit"></i>
                    <span>แก้ไข</span>
                  </div>
                </Link>
                <button 
                  className="action-btn view-btn modern-btn small info"
                  onClick={() => window.open(`/quizzes/preview/${(subject.post_test || subject.postTest)?.quiz_id}`, '_blank')}
                >
                  <div className="btn-content">
                    <i className="fas fa-eye"></i>
                    <span>ดูตัวอย่าง</span>
                  </div>
                </button>
                <button 
                  className="action-btn delete-btn modern-btn small danger"
                  onClick={() => handleDeleteTest('post')}
                >
                  <div className="btn-content">
                    <i className="fas fa-trash"></i>
                    <span>ลบ</span>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="test-empty">
              <AddTestCard 
                testType="post"
                subjectId={subject.subject_id}
                onClick={() => handleAddTest('post')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main AdminLessonsArea component
const AdminLessonsArea: React.FC<AdminLessonsAreaProps> = ({ 
  subject
}) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeTab, setActiveTab] = useState('lessons');

  useEffect(() => {
    // ใช้ข้อมูลบทเรียนจาก subject.lessons ที่ได้จาก API หลัก
    if (subject.lessons) {
      const formattedLessons: Lesson[] = subject.lessons.map((lesson: any) => ({
        lesson_id: lesson.lesson_id,
        title: lesson.title,
        description: lesson.description || '',
        content: lesson.content || '',
        video_url: lesson.video_url,
        order_number: lesson.order_number,
        status: lesson.status || 'active',
        created_at: lesson.created_at || new Date().toISOString(),
        can_preview: lesson.can_preview || false,
        has_quiz: lesson.has_quiz || false,
        quiz_id: lesson.quiz_id,
        file_count: lesson.file_count || '0',
        files: lesson.files || [],
        quiz: lesson.quiz || null
      }));
      setLessons(formattedLessons);
    } else {
      setLessons([]);
    }
  }, [subject.lessons]);

  return (
    <div className="admin-lessons-area">
      <div className="subject-detail-tabs">
        <div className="tabs-header modern-tabs">
          <button
            className={`tab-btn modern-tab ${activeTab === 'lessons' ? 'active' : ''}`}
            onClick={() => setActiveTab('lessons')}
          >
            <div className="tab-content">
              <i className="fas fa-play-circle"></i>
              <span>บทเรียน</span>
            </div>
            <div className="tab-indicator"></div>
          </button>
          <button
            className={`tab-btn modern-tab ${activeTab === 'instructors' ? 'active' : ''}`}
            onClick={() => setActiveTab('instructors')}
          >
            <div className="tab-content">
              <i className="fas fa-chalkboard-teacher"></i>
              <span>อาจารย์ผู้สอน</span>
            </div>
            <div className="tab-indicator"></div>
          </button>
          <button
            className={`tab-btn modern-tab ${activeTab === 'tests' ? 'active' : ''}`}
            onClick={() => setActiveTab('tests')}
          >
            <div className="tab-content">
              <i className="fas fa-clipboard-check"></i>
              <span>แบบทดสอบ</span>
            </div>
            <div className="tab-indicator"></div>
          </button>
        </div>

        <div className="tabs-content">
          {activeTab === 'lessons' && (
            <LessonsPanel
              subject={subject}
              lessons={lessons}
              setLessons={setLessons}
            />
          )}

          {activeTab === 'instructors' && (
            <InstructorsPanel
              subject={subject}
            />
          )}

          {activeTab === 'tests' && (
            <TestsPanel
              subject={subject}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLessonsArea;
