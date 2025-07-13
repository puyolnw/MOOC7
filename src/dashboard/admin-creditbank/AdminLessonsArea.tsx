import React, { useState, useEffect,useCallback} from 'react';
import axios from 'axios';
import QuizSectionBar from './QuizSectionBar';
import PrePostSection from './PrePostSection';
import InsSection from './Inssection';
import "./lessons.css";
import "./mega.css";

// ✅ เพิ่ม CollapseStates interface
interface CollapseStates {
  [key: string]: {
    [stateType: string]: boolean;
  };
}

// ✅ แก้ไข interface ให้ตรงกับ AdminSubjectArea
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
  video_file_id: string | null;
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

// ✅ เพิ่ม collapse state properties
interface AdminLessonsAreaProps {
  subject: Subject;
  courseData: Course;
  onSubjectUpdate: (updatedSubject: Subject) => void;
  collapseStates?: CollapseStates;
  updateCollapseState?: (key: string, stateType: string, value: boolean) => void;
  getCollapseState?: (key: string, stateType: string) => boolean;
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
  // ✅ เพิ่ม collapse state props
  collapseStates?: CollapseStates;
  updateCollapseState?: (key: string, stateType: string, value: boolean) => void;
  getCollapseState?: (key: string, stateType: string) => boolean;
}> = ({ lesson, index, bigLessonId, onDelete, collapseStates, updateCollapseState, getCollapseState }) => {
  // ✅ ใช้ collapse state functions หรือ fallback เป็น local state
  const collapseKey = `sub-lesson-${lesson.lesson_id}`;
  const [localIsExpanded, setLocalIsExpanded] = useState(false);
  const [localVideoExpanded, setLocalVideoExpanded] = useState(false);

  const isExpanded = getCollapseState ? getCollapseState(collapseKey, 'expanded') : localIsExpanded;
  const videoExpanded = getCollapseState ? getCollapseState(collapseKey, 'video') : localVideoExpanded;

  const setIsExpanded = (value: boolean) => {
    if (updateCollapseState) {
      updateCollapseState(collapseKey, 'expanded', value);
    } else {
      setLocalIsExpanded(value);
    }
  };

  const setVideoExpanded = (value: boolean) => {
    if (updateCollapseState) {
      updateCollapseState(collapseKey, 'video', value);
    } else {
      setLocalVideoExpanded(value);
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
                      const event = new CustomEvent('editSubLessonVideo', { 
                        detail: { ...lesson, big_lesson_id: bigLessonId } 
                      });
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

          {/* ✅ Sub Lesson Quiz Section */}
          <QuizSectionBar
            lesson={lesson}
            bigLessonId={bigLessonId}
            onQuizUpdate={(_updatedLesson) => {
              // Refresh data after quiz update
              const event = new CustomEvent('refreshBigLessons');
              window.dispatchEvent(event);
            }}
            // ✅ เพิ่ม collapse state props
            collapseStates={collapseStates}
            updateCollapseState={updateCollapseState}
            getCollapseState={getCollapseState}
          />
          
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
  // ✅ เพิ่ม collapse state props
  collapseStates?: CollapseStates;
  updateCollapseState?: (key: string, stateType: string, value: boolean) => void;
  getCollapseState?: (key: string, stateType: string) => boolean;
}> = ({ bigLesson, index, onDelete, onRefresh, collapseStates, updateCollapseState, getCollapseState }) => {
  // ✅ ใช้ collapse state functions หรือ fallback เป็น local state
  const collapseKey = `big-lesson-${bigLesson.big_lesson_id}`;
  const [localIsExpanded, setLocalIsExpanded] = useState(false);
  const [localSubLessonsExpanded, setLocalSubLessonsExpanded] = useState(false);
  const [showAddSubLessonModal, setShowAddSubLessonModal] = useState(false);

  const isExpanded = getCollapseState ? getCollapseState(collapseKey, 'expanded') : localIsExpanded;
  const subLessonsExpanded = getCollapseState ? getCollapseState(collapseKey, 'subLessons') : localSubLessonsExpanded;

  const setIsExpanded = (value: boolean) => {
    if (updateCollapseState) {
      updateCollapseState(collapseKey, 'expanded', value);
    } else {
      setLocalIsExpanded(value);
    }
  };

  const setSubLessonsExpanded = (value: boolean) => {
    if (updateCollapseState) {
      updateCollapseState(collapseKey, 'subLessons', value);
    } else {
      setLocalSubLessonsExpanded(value);
    }
  };

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
    bigLessonId={bigLesson.big_lesson_id}  // ✅ เพิ่มบรรทัดนี้
    onDelete={handleDeleteSubLesson}
    onUpdateTitle={handleUpdateSubLessonTitle}
    onUpdateVideo={handleUpdateSubLessonVideo}
    collapseStates={collapseStates}
    updateCollapseState={updateCollapseState}
    getCollapseState={getCollapseState}
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
            <BigLessonFilesSection
                            bigLessonId={bigLesson.big_lesson_id}
              onRefresh={onRefresh}
              collapseStates={collapseStates}
              updateCollapseState={updateCollapseState}
              getCollapseState={getCollapseState}
            />

            {/* ✅ Big Lesson Quiz Section - ใช้ QuizSectionBar */}
            <QuizSectionBar
  bigLessonId={bigLesson.big_lesson_id}
  currentQuizId={bigLesson.quiz_id}
  onQuizUpdate={handleBigLessonQuizUpdate}
  // ✅ เพิ่ม collapse state props
  collapseStates={collapseStates}
  updateCollapseState={updateCollapseState}
  getCollapseState={getCollapseState}
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
  // ✅ เพิ่ม collapse state props
  collapseStates?: CollapseStates;
  updateCollapseState?: (key: string, stateType: string, value: boolean) => void;
  getCollapseState?: (key: string, stateType: string) => boolean;
}> = ({ subject, bigLessons, setBigLessons, onRefresh, collapseStates, updateCollapseState, getCollapseState }) => {
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

    const handleRefreshBigLessons = () => {
      onRefresh();
    };

    window.addEventListener('editBigLessonTitle', handleEditBigLessonTitle);
    window.addEventListener('editSubLessonTitle', handleEditSubLessonTitle);
    window.addEventListener('editSubLessonVideo', handleEditSubLessonVideo);
    window.addEventListener('refreshBigLessons', handleRefreshBigLessons);

    return () => {
      window.removeEventListener('editBigLessonTitle', handleEditBigLessonTitle);
      window.removeEventListener('editSubLessonTitle', handleEditSubLessonTitle);
      window.removeEventListener('editSubLessonVideo', handleEditSubLessonVideo);
      window.removeEventListener('refreshBigLessons', handleRefreshBigLessons);
    };
  }, [onRefresh]);

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
                  collapseStates={collapseStates}
                  updateCollapseState={updateCollapseState}
                  getCollapseState={getCollapseState}
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
        bigLessonId={selectedSubLesson?.big_lesson_id}
        onUpdate={handleUpdateSubLessonTitle}
      />

      <EditVideoModal
        show={showEditSubLessonVideoModal}
        onClose={() => {
          setShowEditSubLessonVideoModal(false);
          setSelectedSubLesson(null);
        }}
        lesson={selectedSubLesson}
        bigLessonId={selectedSubLesson?.big_lesson_id}
        onUpdate={handleUpdateSubLessonVideo}
      />
    </>
  );
};

// Big Lesson Files Section Component
const BigLessonFilesSection: React.FC<{
  bigLessonId: number;
  onRefresh: () => void;
  // ✅ เพิ่ม collapse state props
  collapseStates?: CollapseStates;
  updateCollapseState?: (key: string, stateType: string, value: boolean) => void;
  getCollapseState?: (key: string, stateType: string) => boolean;
}> = ({ bigLessonId, onRefresh, updateCollapseState, getCollapseState }) => {
  const [attachments, setAttachments] = useState<any[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // ✅ ใช้ collapse state functions หรือ fallback เป็น local state
  const collapseKey = `files-${bigLessonId}`;
  const [localIsExpanded, setLocalIsExpanded] = useState(false);

  const isExpanded = getCollapseState ? getCollapseState(collapseKey, 'expanded') : localIsExpanded;

  const setIsExpanded = (value: boolean) => {
    if (updateCollapseState) {
      updateCollapseState(collapseKey, 'expanded', value);
    } else {
      setLocalIsExpanded(value);
    }
  };

  const fetchAttachments = async () => {
    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${apiURL}/api/big-lessons/${bigLessonId}/attachments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setAttachments(response.data.attachments || []);
      }
    } catch (error) {
      console.error('Error fetching attachments:', error);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [bigLessonId]);

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (!confirm('คุณต้องการลบไฟล์นี้หรือไม่?')) return;
    
    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(
        `${apiURL}/api/big-lessons/${bigLessonId}/attachments/${attachmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        fetchAttachments();
        showNotification('ลบไฟล์สำเร็จ', 'success');
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
      showNotification('เกิดข้อผิดพลาดในการลบไฟล์', 'error');
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return 'fa-file-pdf text-danger';
    if (fileType.includes('word') || fileType.includes('document')) return 'fa-file-word text-primary';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'fa-file-excel text-success';
    if (fileType.includes('text')) return 'fa-file-alt text-secondary';
    return 'fa-file text-muted';
  };

  return (
    <>
      <div className="content-section-bar">
        <div 
          className={`section-bar-header ${isExpanded ? 'expanded' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="section-bar-icon files-icon">
            <i className="fas fa-folder"></i>
          </div>
          <div className="section-bar-info">
            <h5 className="section-bar-title">ไฟล์ประกอบบทเรียน</h5>
            <p className="section-bar-subtitle">
              {attachments.length > 0 
                ? `มีไฟล์ ${attachments.length} ไฟล์` 
                : 'ยังไม่มีไฟล์ประกอบ'
              }
            </p>
          </div>
          <div className="section-bar-count">
            {attachments.length}
          </div>
          <div className="section-bar-actions">
            <button 
              className="add-files-btn modern-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowUploadModal(true);
              }}
            >
              <i className="fas fa-plus"></i>
              <span>เพิ่มไฟล์</span>
            </button>
          </div>
          <div className="section-bar-expand">
            <i className="fas fa-chevron-down"></i>
          </div>
        </div>
        
        <div className={`section-bar-content ${isExpanded ? 'expanded' : ''}`}>
          <div className="section-content-inner">
            <div className="files-section">
              {attachments.length > 0 ? (
                <div className="files-list">
                  {attachments.map((attachment) => (
                    <div key={attachment.attachment_id} className="file-item">
                      <div className="file-info">
                        <div className="file-icon">
                          <i className={`fas ${getFileIcon(attachment.file_type)}`}></i>
                        </div>
                        <div className="file-details">
                          <h6 className="file-name">{attachment.title || attachment.file_name}</h6>
                          <p className="file-meta">
                            {formatFileSize(attachment.file_size)} • 
                            {new Date(attachment.created_at).toLocaleDateString('th-TH')}
                          </p>
                        </div>
                      </div>
                      <div className="file-actions">
                        <a 
                          href={attachment.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="action-btn view-btn"
                          title="ดูไฟล์"
                        >
                          <i className="fas fa-external-link-alt"></i>
                        </a>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteAttachment(attachment.attachment_id)}
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
                  <i className="fas fa-folder-open"></i>
                  <p>ยังไม่มีไฟล์ประกอบในบทเรียนนี้</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload File Modal */}
      <UploadFileModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        bigLessonId={bigLessonId}
        onUploadSuccess={() => {
          fetchAttachments();
          onRefresh();
        }}
      />
    </>
  );
};

// Upload File Modal Component
const UploadFileModal: React.FC<{
  show: boolean;
  onClose: () => void;
  bigLessonId: number;
  onUploadSuccess: () => void;
}> = ({ show, onClose, bigLessonId, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // ตรวจสอบขนาดไฟล์ (50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('ขนาดไฟล์ต้องไม่เกิน 50 MB');
        return;
      }

      // ตรวจสอบประเภทไฟล์
      const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'];
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(fileExtension)) {
        setError('รองรับเฉพาะไฟล์ PDF, DOC, DOCX, XLS, XLSX และ TXT เท่านั้น');
        return;
      }

      setFile(selectedFile);
      setTitle(selectedFile.name);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('กรุณาเลือกไฟล์');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title || file.name);
      
      const response = await axios.post(
        `${apiURL}/api/big-lessons/${bigLessonId}/attachments`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );

      if (response.data.success) {
        onUploadSuccess();
        onClose();
        setFile(null);
        setTitle('');
        showNotification('อัปโหลดไฟล์สำเร็จ', 'success');
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setError(error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
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
            <h5 className="modal-title text-white">อัปโหลดไฟล์ประกอบ</h5>
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
                <label htmlFor="uploadFile" className="form-label">
                  เลือกไฟล์ <span className="text-danger">*</span>
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="uploadFile"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                  disabled={isSubmitting}
                />
                <small className="text-muted">
                  รองรับไฟล์ PDF, DOC, DOCX, XLS, XLSX และ TXT ขนาดไม่เกิน 50 MB
                </small>
              </div>
              <div className="mb-3">
                <label htmlFor="fileTitle" className="form-label">
                  ชื่อไฟล์
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="fileTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ชื่อไฟล์ (ถ้าไม่ระบุจะใช้ชื่อไฟล์เดิม)"
                  disabled={isSubmitting}
                />
              </div>
              {file && (
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                                   ไฟล์ที่เลือก: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
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
                className="btn btn-primary"
                disabled={isSubmitting || !file}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    กำลังอัปโหลด...
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload me-2"></i>
                    อัปโหลดไฟล์
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


// Main AdminLessonsArea component
const AdminLessonsArea: React.FC<AdminLessonsAreaProps> = ({ 
  subject,

  // ✅ เพิ่ม collapse state props
  collapseStates,
  updateCollapseState,
  getCollapseState
}) => {
  const [bigLessons, setBigLessons] = useState<BigLesson[]>([]);
  const [activeTab, setActiveTab] = useState('lessons');
  const [loading, setLoading] = useState(false);
  const [localCollapseStates, setLocalCollapseStates] = useState<CollapseStates>({});
  const handleUpdateCollapseState = useCallback((key: string, stateType: string, value: boolean) => {
    if (updateCollapseState) {
      updateCollapseState(key, stateType, value);
    } else {
      setLocalCollapseStates(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          [stateType]: value
        }
      }));
      
      // ✅ เก็บใน localStorage
      try {
        const storageKey = `collapse_states_subject_${subject.subject_id}`;
        const currentStates = JSON.parse(localStorage.getItem(storageKey) || '{}');
        const updatedStates = {
          ...currentStates,
          [key]: {
            ...currentStates[key],
            [stateType]: value
          }
        };
        localStorage.setItem(storageKey, JSON.stringify(updatedStates));
      } catch (error) {
        console.error('Error saving collapse state to localStorage:', error);
      }
    }
  }, [updateCollapseState, subject.subject_id]);

  const handleGetCollapseState = useCallback((key: string, stateType: string): boolean => {
    if (getCollapseState) {
      return getCollapseState(key, stateType);
    } else {
      // ✅ ลองดึงจาก localStorage ก่อน
      try {
        const storageKey = `collapse_states_subject_${subject.subject_id}`;
        const savedStates = JSON.parse(localStorage.getItem(storageKey) || '{}');
        if (savedStates[key] && typeof savedStates[key][stateType] === 'boolean') {
          return savedStates[key][stateType];
        }
      } catch (error) {
        console.error('Error loading collapse state from localStorage:', error);
      }
      
      // ✅ ถ้าไม่มีใน localStorage ให้ดูจาก local state
      return localCollapseStates[key]?.[stateType] || false;
    }
  }, [getCollapseState, localCollapseStates, subject.subject_id]);

   const fetchBigLessons = useCallback(async () => {
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
  }, [subject.subject_id]);

   useEffect(() => {
    if (!collapseStates) {
      try {
        const storageKey = `collapse_states_subject_${subject.subject_id}`;
        const savedStates = JSON.parse(localStorage.getItem(storageKey) || '{}');
        setLocalCollapseStates(savedStates);
      } catch (error) {
        console.error('Error loading collapse states from localStorage:', error);
      }
    }
  }, [subject.subject_id, collapseStates]);

    
  

  const handleRefresh = useCallback(() => {
    fetchBigLessons();
  }, [fetchBigLessons]);

  useEffect(() => {
    fetchBigLessons();
  }, [fetchBigLessons]);
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
                  // ✅ ส่ง collapse state functions
                  collapseStates={collapseStates || localCollapseStates}
                  updateCollapseState={handleUpdateCollapseState}
                  getCollapseState={handleGetCollapseState}
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

