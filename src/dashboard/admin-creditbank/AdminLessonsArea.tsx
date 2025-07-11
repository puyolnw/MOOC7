import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QuizSectionBar from './QuizSectionBar';
import PrePostSection from './PrePostSection';
import InsSection from './Inssection';
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

interface BigLesson {
  big_lesson_id: number;
  title: string;
  description: string;
  subject_id: number;
  order_number: number;
  quiz_id: number | null;
  created_at: string;
  updated_at: string;
  lessons?: Lesson[];
  lesson_count?: number;
}

interface Lesson {
  lesson_id: number;
  title: string;
  description: string;
  content: string;
  video_url: string | null;
  video_file_id: string | null; // ✅ เพิ่ม field นี้เพื่อให้ตรงกับ QuizSectionBar
  order_number: number;
  status: string;
  created_at: string;
  can_preview?: boolean;
  has_quiz?: boolean;
  quiz_id?: number | null;
  file_count?: string;
  files?: LessonFile[];
  quiz?: LessonQuiz;
  big_lesson_id?: number;
  duration?: number;
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

interface AdminLessonsAreaProps {
  subject: Subject;
  courseData: Course;
  onSubjectUpdate: (updatedSubject: Subject) => void;
}

// Simple Add Big Lesson Modal Component
const SimpleAddBigLessonModal: React.FC<{
  show: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
  subjectId: number;
}> = ({ show, onClose, onSubmit, subjectId }) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('กรุณากรอกชื่อบทเรียน');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${apiURL}/api/big-lessons`,
        {
          title: title.trim(),
          subject_id: subjectId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        onSubmit(title);
        setTitle('');
        onClose();
        showNotification('สร้างบทเรียนสำเร็จ', 'success');
      }
    } catch (error) {
      console.error('Error creating big lesson:', error);
      setError('เกิดข้อผิดพลาดในการสร้างบทเรียน');
    } finally {
      setIsSubmitting(false);
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
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-primary">
            <h5 className="modal-title text-white">เพิ่มบทเรียนใหม่</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <div className="mb-3">
                <label htmlFor="bigLessonTitle" className="form-label">
                  ชื่อบทเรียน <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="bigLessonTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="กรอกชื่อบทเรียน"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
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
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    กำลังสร้าง...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus me-2"></i>
                    สร้างบทเรียน
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Simple Add Sub Lesson Modal Component
const SimpleAddSubLessonModal: React.FC<{
  show: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
  bigLessonId: number;
}> = ({ show, onClose, onSubmit, bigLessonId }) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('กรุณากรอกชื่อบทเรียนย่อย');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${apiURL}/api/big-lessons/${bigLessonId}/lessons`,
        {
          title: title.trim(),
          description: '',
          video_url: '',
          status: 'active'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        onSubmit(title);
        setTitle('');
        onClose();
        showNotification('สร้างบทเรียนย่อยสำเร็จ', 'success');
      }
    } catch (error) {
      console.error('Error creating sub lesson:', error);
      setError('เกิดข้อผิดพลาดในการสร้างบทเรียนย่อย');
    } finally {
      setIsSubmitting(false);
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
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-success">
            <h5 className="modal-title text-white">เพิ่มบทเรียนย่อย</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <div className="mb-3">
                <label htmlFor="subLessonTitle" className="form-label">
                  ชื่อบทเรียนย่อย <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="subLessonTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="กรอกชื่อบทเรียนย่อย"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="btn btn-success"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    กำลังสร้าง...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus me-2"></i>
                    สร้างบทเรียนย่อย
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Edit Lesson Title Modal
const EditLessonTitleModal: React.FC<{
  show: boolean;
  onClose: () => void;
  lesson: Lesson | null;
  bigLessonId?: number;
  onUpdate: (lessonId: number, newTitle: string) => void;
}> = ({ show, onClose, lesson, bigLessonId, onUpdate }) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title);
    }
  }, [lesson]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('กรุณากรอกชื่อบทเรียน');
      return;
    }

    if (!lesson) return;

    const currentBigLessonId = bigLessonId || lesson.big_lesson_id;
    
    if (!currentBigLessonId) {
      setError('ไม่พบข้อมูล Big Lesson ID');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      console.log('Updating lesson:', {
        bigLessonId: currentBigLessonId,
        lessonId: lesson.lesson_id,
        title: title.trim()
      });
      
      const response = await axios.put(
               `${apiURL}/api/big-lessons/${currentBigLessonId}/lessons/${lesson.lesson_id}`,
        {
          title: title.trim()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        onUpdate(lesson.lesson_id, title.trim());
        onClose();
        showNotification('แก้ไขชื่อบทเรียนสำเร็จ', 'success');
      }
    } catch (error) {
      console.error('Error updating lesson title:', error);
      setError('เกิดข้อผิดพลาดในการแก้ไขชื่อบทเรียน');
    } finally {
      setIsSubmitting(false);
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

  if (!show || !lesson) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-warning">
            <h5 className="modal-title text-dark">แก้ไขชื่อบทเรียน</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <div className="mb-3">
                <label htmlFor="editLessonTitle" className="form-label">
                  ชื่อบทเรียน <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="editLessonTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="กรอกชื่อบทเรียน"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="btn btn-warning"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    บันทึก
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Edit Video Modal
const EditVideoModal: React.FC<{
  show: boolean;
  onClose: () => void;
  lesson: Lesson | null;
  bigLessonId?: number;
  onUpdate: (lessonId: number, videoUrl: string) => void;
}> = ({ show, onClose, lesson, bigLessonId, onUpdate }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (lesson) {
      setVideoUrl(lesson.video_url || '');
    }
  }, [lesson]);

  const getYouTubeVideoId = (url: string) => {
    const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
  };

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (videoUrl.trim() && !getYouTubeVideoId(videoUrl)) {
      setError('กรุณาใส่ URL ของ YouTube ที่ถูกต้อง');
      return;
    }

    if (!lesson) return;

    const currentBigLessonId = bigLessonId || lesson.big_lesson_id;
    
    if (!currentBigLessonId) {
      setError('ไม่พบข้อมูล Big Lesson ID');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${apiURL}/api/big-lessons/${currentBigLessonId}/lessons/${lesson.lesson_id}`,
        {
          video_url: videoUrl.trim()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        onUpdate(lesson.lesson_id, videoUrl.trim());
        onClose();
        showNotification('แก้ไขวิดีโอสำเร็จ', 'success');
      }
    } catch (error) {
      console.error('Error updating lesson video:', error);
      setError('เกิดข้อผิดพลาดในการแก้ไขวิดีโอ');
    } finally {
      setIsSubmitting(false);
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

  if (!show || !lesson) return null;

  const videoId = videoUrl ? getYouTubeVideoId(videoUrl) : null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-info">
            <h5 className="modal-title text-white">แก้ไขวิดีโอบทเรียน</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <div className="mb-3">
                <label htmlFor="editVideoUrl" className="form-label">
                  URL วิดีโอ YouTube
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="editVideoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="เช่น https://www.youtube.com/watch?v=VIDEO_ID"
                  disabled={isSubmitting}
                />
                <small className="text-muted">
                  ใส่ URL ของวิดีโอ YouTube หรือเว้นว่างเพื่อลบวิดีโอ
                </small>
              </div>

              {videoId && (
                <div className="mb-3">
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
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="btn btn-info"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    บันทึก
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Add Big Lesson Card Component
const AddBigLessonCard: React.FC<{
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

// Sub Lesson Item Component
const SubLessonItem: React.FC<{
  lesson: Lesson;
  index: number;
  bigLessonId: number;
  onDelete: (lessonId: number) => void;
  onUpdateTitle: (lessonId: number, newTitle: string) => void;
  onUpdateVideo: (lessonId: number, videoUrl: string) => void;
}> = ({ lesson, index, bigLessonId, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [videoExpanded, setVideoExpanded] = useState(false);

  const getVideoEmbedUrl = (videoUrl: string): string => {
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const videoIdMatch = videoUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
      if (videoIdMatch) {
        return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
      }
    }
    return videoUrl;
  };

  return (
    <div className="lesson-item sub-lesson-item">
      <div 
        className={`lesson-header ${isExpanded ? 'expanded' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="lesson-number">
          <span>{lesson.order_number || index + 1}</span>
        </div>
        
        <div className="lesson-info">
          <h5 className="lesson-title">{lesson.title}</h5>
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
                <i className="fas fa-play"></i>
                <span>วิดีโอ</span>
              </div>
            )}
            {lesson.video_file_id && (
              <div className="meta-badge">
                <i className="fas fa-file"></i>
                <span>เอกสาร</span>
              </div>
            )}
          </div>
        </div>
        
       <div className="lesson-actions">
          <button
            className="action-btn edit-btn"
            title="แก้ไขชื่อ"
            onClick={(e) => {
              e.stopPropagation();
              const event = new CustomEvent('editSubLessonTitle', { 
                detail: { ...lesson, big_lesson_id: bigLessonId } 
              });
              window.dispatchEvent(event);
            }}
          >
            <i className="fas fa-edit"></i>
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
                  <button 
                    className="add-video-btn modern-btn" 
                    onClick={() => {
                      const event = new CustomEvent('editSubLessonVideo', { detail: lesson });
                      window.dispatchEvent(event);
                    }}
                  >
                    <i className="fas fa-plus"></i>
                    <span>{lesson.video_url ? 'เปลี่ยนวิดีโอ' : 'เพิ่มวิดีโอ'}</span>
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

// Big Lesson Item Component with Sub Lessons
const BigLessonItem: React.FC<{
  bigLesson: BigLesson;
  index: number;
  onDelete: (bigLessonId: number) => void;
  onUpdateTitle: (bigLessonId: number, newTitle: string) => void;
  onRefresh: () => void;
}> = ({ bigLesson, index, onDelete, onRefresh }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [subLessonsExpanded, setSubLessonsExpanded] = useState(false);
  const [showAddSubLessonModal, setShowAddSubLessonModal] = useState(false);

  // ✅ Stable callback for big lesson quiz update
  const handleBigLessonQuizUpdate = React.useCallback(() => {
    onRefresh();
  }, [onRefresh]);

  const handleDeleteSubLesson = async (lessonId: number) => {
    if (!confirm('คุณต้องการลบบทเรียนย่อยนี้หรือไม่?')) return;
    
    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${apiURL}/api/big-lessons/${bigLesson.big_lesson_id}/lessons/${lessonId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        onRefresh();
        showNotification('ลบบทเรียนย่อยสำเร็จ', 'success');
      }
    } catch (error) {
      console.error('Error deleting sub lesson:', error);
      showNotification('เกิดข้อผิดพลาดในการลบบทเรียนย่อย', 'error');
    }
  };

  const handleUpdateSubLessonTitle = () => {
    onRefresh();
  };

  const handleUpdateSubLessonVideo = () => {
    onRefresh();
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
      <div className="lesson-item big-lesson-item">
        <div 
          className={`lesson-header ${isExpanded ? 'expanded' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="lesson-number">
            <span>{bigLesson.order_number || index + 1}</span>
          </div>
          
          <div className="lesson-info">
            <h4 className="lesson-title">{bigLesson.title}</h4>
            {bigLesson.description && (
              <p className="lesson-description">
                {bigLesson.description.length > 100 
                  ? `${bigLesson.description.substring(0, 100)}...`
                  : bigLesson.description
                }
              </p>
            )}
            
            <div className="lesson-meta">
              {bigLesson.lessons && bigLesson.lessons.length > 0 && (
                <div className="meta-badge">
                  <i className="fas fa-list"></i>
                  <span>{bigLesson.lessons.length} บทเรียนย่อย</span>
                </div>
              )}
              {bigLesson.quiz_id && (
                <div className="meta-badge">
                  <i className="fas fa-question-circle"></i>
                  <span>แบบทดสอบ</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="lesson-actions">
            <button
              className="action-btn edit-btn"
              title="แก้ไขชื่อ"
              onClick={(e) => {
                e.stopPropagation();
                const event = new CustomEvent('editBigLessonTitle', { detail: bigLesson });
                window.dispatchEvent(event);
              }}
            >
              <i className="fas fa-edit"></i>
            </button>
            <button 
              className="action-btn delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(bigLesson.big_lesson_id);
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
            
            {/* Add Sub Lesson Section */}
            <div className="content-section-bar">
              <div className="section-bar-header add-section">
                <div className="section-bar-icon add-icon">
                  <i className="fas fa-plus-circle"></i>
                </div>
                <div className="section-bar-info">
                  <h5 className="section-bar-title">เพิ่มบทเรียนย่อย</h5>
                  <p className="section-bar-subtitle">สร้างบทเรียนย่อยใหม่</p>
                </div>
                <button 
                  className="add-sub-lesson-btn modern-btn primary"
                  onClick={() => setShowAddSubLessonModal(true)}
                >
                  <i className="fas fa-plus"></i>
                  <span>เพิ่มบทเรียนย่อย</span>
                </button>
              </div>
            </div>

            {/* Sub Lessons Section Bar */}
            <div className="content-section-bar">
              <div 
                className={`section-bar-header ${subLessonsExpanded ? 'expanded' : ''}`}
                onClick={() => setSubLessonsExpanded(!subLessonsExpanded)}
              >
                <div className="section-bar-icon lessons-icon">
                  <i className="fas fa-list-ul"></i>
                </div>
                <div className="section-bar-info">
                  <h5 className="section-bar-title">บทเรียนย่อย</h5>
                  <p className="section-bar-subtitle">
                    {bigLesson.lessons && bigLesson.lessons.length > 0 
                      ? `มีบทเรียนย่อย ${bigLesson.lessons.length} บทเรียน` 
                      : 'ยังไม่มีบทเรียนย่อย'
                    }
                  </p>
                </div>
                <div className="section-bar-count">
                  {bigLesson.lessons?.length || 0}
                </div>
                <div className="section-bar-expand">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
              
              <div className={`section-bar-content ${subLessonsExpanded ? 'expanded' : ''}`}>
                <div className="section-content-inner">
                  <div className="sub-lessons-section">
                    {bigLesson.lessons && bigLesson.lessons.length > 0 ? (
                      <div className="sub-lessons-list">
                        {bigLesson.lessons.map((lesson, subIndex) => (
                          <SubLessonItem
                            key={`sub-lesson-${lesson.lesson_id}`}
                            lesson={lesson}
                            index={subIndex}
                            bigLessonId={bigLesson.big_lesson_id}
                            onDelete={handleDeleteSubLesson}
                            onUpdateTitle={handleUpdateSubLessonTitle}
                            onUpdateVideo={handleUpdateSubLessonVideo}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="sub-lessons-empty">
                        <i className="fas fa-list-ul"></i>
                        <p>ยังไม่มีบทเรียนย่อยในบทเรียนนี้</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Big Lesson Files Section */}
            <div className="content-section-bar">
              <div className="section-bar-header">
                <div className="section-bar-icon files-icon">
                  <i className="fas fa-folder"></i>
                </div>
                <div className="section-bar-info">
                  <h5 className="section-bar-title">ไฟล์ประกอบบทเรียน</h5>
                  <p className="section-bar-subtitle">ไฟล์เอกสารประกอบบทเรียนหลัก</p>
                </div>
                <div className="section-bar-count">0</div>
                <button className="add-files-btn modern-btn">
                  <i className="fas fa-plus"></i>
                  <span>เพิ่มไฟล์</span>
                </button>
              </div>
            </div>

            {/* ✅ Big Lesson Quiz Section - ใช้ QuizSectionBar */}
            <QuizSectionBar
              bigLessonId={bigLesson.big_lesson_id}
              currentQuizId={bigLesson.quiz_id}
              onQuizUpdate={handleBigLessonQuizUpdate}
            />
            
          </div>
        </div>
      </div>

      {/* Add Sub Lesson Modal */}
      <SimpleAddSubLessonModal
        show={showAddSubLessonModal}
        onClose={() => setShowAddSubLessonModal(false)}
        onSubmit={() => {
          onRefresh();
        }}
        bigLessonId={bigLesson.big_lesson_id}
      />
    </>
  );
};

// Edit Big Lesson Title Modal
const EditBigLessonTitleModal: React.FC<{
  show: boolean;
  onClose: () => void;
  bigLesson: BigLesson | null;
  onUpdate: (bigLessonId: number, newTitle: string) => void;
}> = ({ show, onClose, bigLesson, onUpdate }) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (bigLesson) {
      setTitle(bigLesson.title);
    }
  }, [bigLesson]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('กรุณากรอกชื่อบทเรียน');
      return;
    }

    if (!bigLesson) return;

    setIsSubmitting(true);
    setError('');

    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${apiURL}/api/big-lessons/${bigLesson.big_lesson_id}`,
        {
          title: title.trim()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
                onUpdate(bigLesson.big_lesson_id, title.trim());
        onClose();
        showNotification('แก้ไขชื่อบทเรียนสำเร็จ', 'success');
      }
    } catch (error) {
      console.error('Error updating big lesson title:', error);
      setError('เกิดข้อผิดพลาดในการแก้ไขชื่อบทเรียน');
    } finally {
      setIsSubmitting(false);
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

  if (!show || !bigLesson) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-warning">
            <h5 className="modal-title text-dark">แก้ไขชื่อบทเรียน</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <div className="mb-3">
                <label htmlFor="editBigLessonTitle" className="form-label">
                  ชื่อบทเรียน <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="editBigLessonTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="กรอกชื่อบทเรียน"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="btn btn-warning"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    บันทึก
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Big Lessons Panel Component
const BigLessonsPanel: React.FC<{
  subject: Subject;
  bigLessons: BigLesson[];
  setBigLessons: (bigLessons: BigLesson[]) => void;
  onRefresh: () => void;
}> = ({ subject, bigLessons, setBigLessons, onRefresh }) => {
  const [showAddBigLessonModal, setShowAddBigLessonModal] = useState(false);
  const [showEditBigLessonTitleModal, setShowEditBigLessonTitleModal] = useState(false);
  const [showEditSubLessonTitleModal, setShowEditSubLessonTitleModal] = useState(false);
  const [showEditSubLessonVideoModal, setShowEditSubLessonVideoModal] = useState(false);
  const [selectedBigLesson, setSelectedBigLesson] = useState<BigLesson | null>(null);
  const [selectedSubLesson, setSelectedSubLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    const handleEditBigLessonTitle = (event: any) => {
      setSelectedBigLesson(event.detail);
      setShowEditBigLessonTitleModal(true);
    };

    const handleEditSubLessonTitle = (event: any) => {
      setSelectedSubLesson(event.detail);
      setShowEditSubLessonTitleModal(true);
    };

    const handleEditSubLessonVideo = (event: any) => {
      setSelectedSubLesson(event.detail);
      setShowEditSubLessonVideoModal(true);
    };

    window.addEventListener('editBigLessonTitle', handleEditBigLessonTitle);
    window.addEventListener('editSubLessonTitle', handleEditSubLessonTitle);
    window.addEventListener('editSubLessonVideo', handleEditSubLessonVideo);

    return () => {
      window.removeEventListener('editBigLessonTitle', handleEditBigLessonTitle);
      window.removeEventListener('editSubLessonTitle', handleEditSubLessonTitle);
      window.removeEventListener('editSubLessonVideo', handleEditSubLessonVideo);
    };
  }, []);

  const handleAddBigLesson = () => {
    setShowAddBigLessonModal(true);
  };

  const handleDeleteBigLesson = async (bigLessonId: number) => {
    if (!confirm('คุณต้องการลบบทเรียนนี้หรือไม่?')) return;
    
    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${apiURL}/api/big-lessons/${bigLessonId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setBigLessons(bigLessons.filter(bigLesson => bigLesson.big_lesson_id !== bigLessonId));
        showNotification('ลบบทเรียนสำเร็จ', 'success');
      }
    } catch (error) {
      console.error('Error deleting big lesson:', error);
      showNotification('เกิดข้อผิดพลาดในการลบบทเรียน', 'error');
    }
  };

  const handleUpdateBigLessonTitle = (bigLessonId: number, newTitle: string) => {
    setBigLessons(bigLessons.map(bigLesson => 
      bigLesson.big_lesson_id === bigLessonId 
        ? { ...bigLesson, title: newTitle }
        : bigLesson
    ));
  };

  const handleUpdateSubLessonTitle = () => {
    onRefresh();
  };

  const handleUpdateSubLessonVideo = () => {
    onRefresh();
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
      <div className="tab-panel lessons-panel">
        <div className="lessons-header">
          <h3>บทเรียนทั้งหมด</h3>
          <p>รายการบทเรียนในรายวิชา {subject.subject_name}</p>
        </div>
        
        {bigLessons.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <i className="fas fa-play-circle"></i>
            </div>
            <h4>ไม่มีบทเรียน</h4>
            <p>ยังไม่มีบทเรียนในรายวิชานี้</p>
            <button 
              className="add-first-btn modern-btn primary large"
              onClick={handleAddBigLesson}
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
              {/* Add Big Lesson Card */}
              <AddBigLessonCard 
                subjectId={subject.subject_id}
                onClick={handleAddBigLesson}
              />
              
              {/* Big Lesson Items */}
              {bigLessons.map((bigLesson, index) => (
                <BigLessonItem
                  key={`big-lesson-${bigLesson.big_lesson_id}`}
                  bigLesson={bigLesson}
                  index={index}
                  onDelete={handleDeleteBigLesson}
                  onUpdateTitle={handleUpdateBigLessonTitle}
                  onRefresh={onRefresh}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <SimpleAddBigLessonModal
        show={showAddBigLessonModal}
        onClose={() => setShowAddBigLessonModal(false)}
        onSubmit={() => {
          onRefresh();
        }}
        subjectId={subject.subject_id}
      />

      <EditBigLessonTitleModal
        show={showEditBigLessonTitleModal}
        onClose={() => {
          setShowEditBigLessonTitleModal(false);
          setSelectedBigLesson(null);
        }}
        bigLesson={selectedBigLesson}
        onUpdate={handleUpdateBigLessonTitle}
      />

      <EditLessonTitleModal
        show={showEditSubLessonTitleModal}
        onClose={() => {
          setShowEditSubLessonTitleModal(false);
          setSelectedSubLesson(null);
        }}
        lesson={selectedSubLesson}
        onUpdate={handleUpdateSubLessonTitle}
      />

      <EditVideoModal
        show={showEditSubLessonVideoModal}
        onClose={() => {
          setShowEditSubLessonVideoModal(false);
          setSelectedSubLesson(null);
        }}
        lesson={selectedSubLesson}
        onUpdate={handleUpdateSubLessonVideo}
      />
    </>
  );
};

// Main AdminLessonsArea component
const AdminLessonsArea: React.FC<AdminLessonsAreaProps> = ({ 
  subject
}) => {
  const [bigLessons, setBigLessons] = useState<BigLesson[]>([]);
  const [activeTab, setActiveTab] = useState('lessons');
  const [loading, setLoading] = useState(false);

  const fetchBigLessons = async () => {
    setLoading(true);
    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${apiURL}/api/big-lessons/subject/${subject.subject_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setBigLessons(response.data.bigLessons || []);
      }
    } catch (error) {
      console.error('Error fetching big lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBigLessons();
  }, [subject.subject_id]);

  const handleRefresh = () => {
    fetchBigLessons();
  };

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
            <>
              {loading ? (
                <div className="loading-state">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p>กำลังโหลดบทเรียน...</p>
                </div>
              ) : (
                <BigLessonsPanel
                  subject={subject}
                  bigLessons={bigLessons}
                  setBigLessons={setBigLessons}
                  onRefresh={handleRefresh}
                />
              )}
            </>
          )}

          {activeTab === 'instructors' && (
            <InsSection
              subject={subject}
            />
          )}
          {activeTab === 'tests' && (
            <div className="tests-panel">
              <div className="tests-header">
                <h3>แบบทดสอบ</h3>
                <p>จัดการแบบทดสอบก่อนเรียนและหลังเรียนสำหรับรายวิชา {subject.subject_name}</p>
              </div>
              
              <div className="tests-container">
                <div className="test-section">
                  <PrePostSection
                    subject={subject}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLessonsArea;

