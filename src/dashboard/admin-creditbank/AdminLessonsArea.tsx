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

interface AdminLessonsAreaProps {
  subject: Subject;
  courseData: Course;
  onSubjectUpdate: (updatedSubject: Subject) => void;
}

// Simple Add Lesson Modal Component
const SimpleAddLessonModal: React.FC<{
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
        `${apiURL}/api/courses/lessons/simple`,
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
      console.error('Error creating lesson:', error);
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
                <label htmlFor="lessonTitle" className="form-label">
                  ชื่อบทเรียน <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="lessonTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="กรอกชื่อบทเรียน"
                  disabled={isSubmitting}
                />
              </div>
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                ระบบจะสร้างแบบทดสอบประจำบทเรียนให้อัตโนมัติ
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

// Edit Lesson Title Modal
const EditLessonTitleModal: React.FC<{
  show: boolean;
  onClose: () => void;
  lesson: Lesson | null;
  onUpdate: (lessonId: number, newTitle: string) => void;
}> = ({ show, onClose, lesson, onUpdate }) => {
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

    setIsSubmitting(true);
    setError('');

    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('title', title.trim());
      
      const response = await axios.put(
        `${apiURL}/api/courses/lessons/${lesson.lesson_id}`,
        formData,
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
  onUpdate: (lessonId: number, videoUrl: string) => void;
}> = ({ show, onClose, lesson, onUpdate }) => {
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

    setIsSubmitting(true);
    setError('');

    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('videoUrl', videoUrl.trim());
      
      const response = await axios.put(
        `${apiURL}/api/courses/lessons/${lesson.lesson_id}`,
        formData,
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

// Edit Files Modal
const EditFilesModal: React.FC<{
  show: boolean;
  onClose: () => void;
  lesson: Lesson | null;
  onUpdate: (lessonId: number) => void;
}> = ({ show, onClose, lesson, onUpdate }) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
    
    const validFiles = files.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(extension)) {
        setError(`ไฟล์ ${file.name} ไม่ใช่ประเภทที่รองรับ`);
        return false;
      }
      if (file.size > maxSize) {
        setError(`ไฟล์ ${file.name} มีขนาดใหญ่เกินไป (สูงสุด 50MB)`);
        return false;
      }
      return true;
    });

    setUploadedFiles(validFiles);
    setError('');
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'fas fa-file-pdf';
      case 'doc':
      case 'docx': return 'fas fa-file-word';
      case 'xls':
      case 'xlsx': return 'fas fa-file-excel';
      default: return 'fas fa-file';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadedFiles.length === 0) {
      setError('กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์');
      return;
    }

    if (!lesson) return;

    setIsSubmitting(true);
    setError('');

    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('replaceAll', 'true'); // แทนที่ไฟล์ทั้งหมด
      uploadedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await axios.put(
        `${apiURL}/api/courses/lessons/${lesson.lesson_id}/files`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );

      if (response.data.success) {
        onUpdate(lesson.lesson_id);
        onClose();
        showNotification('แก้ไขไฟล์สำเร็จ', 'success');
      }
    } catch (error) {
      console.error('Error updating lesson files:', error);
      setError('เกิดข้อผิดพลาดในการแก้ไขไฟล์');
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
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-success">
            <h5 className="modal-title text-white">แก้ไขไฟล์ประกอบบทเรียน</h5>
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
                <label htmlFor="editFiles" className="form-label">
                  เลือกไฟล์ใหม่ (จะแทนที่ไฟล์เดิมทั้งหมด)
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="editFiles"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  multiple
                  disabled={isSubmitting}
                />
                <small className="text-muted">
                  รองรับไฟล์ PDF, DOC, DOCX, XLS และ XLSX ขนาดไม่เกิน 50 MB
                </small>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mb-3">
                  <h6>ไฟล์ที่เลือก:</h6>
                  <div className="list-group">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <i className={`${getFileIcon(file.name)} me-2 text-primary`}></i>
                          <div>
                            <div className="fw-bold">{file.name}</div>
                            <small className="text-muted">{formatFileSize(file.size)}</small>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveFile(index)}
                          disabled={isSubmitting}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="alert alert-warning">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <strong>คำเตือน:</strong> การอัปโหลดไฟล์ใหม่จะแทนที่ไฟล์เดิมทั้งหมด
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
                disabled={isSubmitting || uploadedFiles.length === 0}
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

// Lesson Item Component with Accordion Bars
const LessonItem: React.FC<{
  lesson: Lesson;
  index: number;
  onDelete: (lessonId: number) => void;
  onUpdateTitle: (lessonId: number, newTitle: string) => void;
  onUpdateVideo: (lessonId: number, videoUrl: string) => void;
  onUpdateFiles: (lessonId: number) => void;
}> = ({ lesson, index, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [videoExpanded, setVideoExpanded] = useState(false);
  const [filesExpanded, setFilesExpanded] = useState(false);

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
          <button
            className="action-btn edit-btn"
            title="แก้ไขชื่อ"
            onClick={(e) => {
              e.stopPropagation();
              // เปิด modal แก้ไขชื่อ
              const event = new CustomEvent('editLessonTitle', { detail: lesson });
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
                      const event = new CustomEvent('editLessonVideo', { detail: lesson });
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
                  <button 
                    className="add-files-btn modern-btn" 
                    onClick={() => {
                      const event = new CustomEvent('editLessonFiles', { detail: lesson });
                      window.dispatchEvent(event);
                    }}
                  >
                    <i className="fas fa-plus"></i>
                    <span>{lesson.files && lesson.files.length > 0 ? 'เปลี่ยนไฟล์' : 'เพิ่มไฟล์แนบ'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quiz Section Bar */}
           <QuizSectionBar lesson={lesson} />
          
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
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [showEditTitleModal, setShowEditTitleModal] = useState(false);
  const [showEditVideoModal, setShowEditVideoModal] = useState(false);
  const [showEditFilesModal, setShowEditFilesModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    const handleEditLessonTitle = (event: any) => {
      setSelectedLesson(event.detail);
      setShowEditTitleModal(true);
    };

    const handleEditLessonVideo = (event: any) => {
      setSelectedLesson(event.detail);
      setShowEditVideoModal(true);
    };

    const handleEditLessonFiles = (event: any) => {
      setSelectedLesson(event.detail);
      setShowEditFilesModal(true);
    };

    window.addEventListener('editLessonTitle', handleEditLessonTitle);
    window.addEventListener('editLessonVideo', handleEditLessonVideo);
    window.addEventListener('editLessonFiles', handleEditLessonFiles);

    return () => {
      window.removeEventListener('editLessonTitle', handleEditLessonTitle);
      window.removeEventListener('editLessonVideo', handleEditLessonVideo);
      window.removeEventListener('editLessonFiles', handleEditLessonFiles);
    };
  }, []);

  const handleAddLesson = () => {
    setShowAddLessonModal(true);
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

  const handleUpdateLessonTitle = (lessonId: number, newTitle: string) => {
    setLessons(lessons.map(lesson => 
      lesson.lesson_id === lessonId 
        ? { ...lesson, title: newTitle }
        : lesson
    ));
  };

   const handleUpdateLessonVideo = (lessonId: number, videoUrl: string) => {
    setLessons(lessons.map(lesson => 
      lesson.lesson_id === lessonId 
        ? { ...lesson, video_url: videoUrl }
        : lesson
    ));
  };

  const handleUpdateLessonFiles = (lessonId: number) => {
    console.log(`Updating lesson files for lesson ID: ${lessonId}`);
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
                  onUpdateTitle={handleUpdateLessonTitle}
                  onUpdateVideo={handleUpdateLessonVideo}
                  onUpdateFiles={handleUpdateLessonFiles}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <SimpleAddLessonModal
        show={showAddLessonModal}
        onClose={() => setShowAddLessonModal(false)}
        onSubmit={(title) => {
          console.log('Created lesson:', title);
        }}
        subjectId={subject.subject_id}
      />

      <EditLessonTitleModal
        show={showEditTitleModal}
        onClose={() => {
          setShowEditTitleModal(false);
          setSelectedLesson(null);
        }}
        lesson={selectedLesson}
        onUpdate={handleUpdateLessonTitle}
      />

      <EditVideoModal
        show={showEditVideoModal}
        onClose={() => {
          setShowEditVideoModal(false);
          setSelectedLesson(null);
        }}
        lesson={selectedLesson}
        onUpdate={handleUpdateLessonVideo}
      />

      <EditFilesModal
        show={showEditFilesModal}
        onClose={() => {
          setShowEditFilesModal(false);
          setSelectedLesson(null);
        }}
        lesson={selectedLesson}
        onUpdate={handleUpdateLessonFiles}
      />
    </>
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
                    testType="pre"
                  />
                </div>
                
                <div className="test-section">
                  <PrePostSection
                    subject={subject}
                    testType="post"
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
