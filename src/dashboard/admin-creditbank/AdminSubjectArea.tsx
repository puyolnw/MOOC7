import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AdminLessonsArea from './AdminLessonsArea';
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
  video_file_id: string | null; // ✅ เพิ่ม field นี้
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

// ✅ เพิ่ม interface ที่ขาดหายไป
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

interface AdminSubjectAreaProps {
  subjectId: number;
  courseData: Course;
  onSubjectUpdate: (updatedSubject: Subject) => void;
  onBack: () => void;
}

// เหลือโค้ดเดิมทั้งหมด...
const EditableSubjectDetail: React.FC<{
  subject: Subject;
  course: Course;
  onSubjectUpdate: (updatedSubject: Subject) => void;
}> = ({ subject, course, onSubjectUpdate }) => {
  const apiURL = import.meta.env.VITE_API_URL;
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Editable fields
  const [editSubjectName, setEditSubjectName] = useState(subject.subject_name);
  const [editDescription, setEditDescription] = useState(subject.description || '');
  const [editVideoUrl, setEditVideoUrl] = useState(subject.video_url || '');
  const [editCredits, setEditCredits] = useState(subject.credits);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('title', editSubjectName);
      formData.append('description', editDescription);
      formData.append('video_url', editVideoUrl);
      formData.append('credits', editCredits.toString());
      
      if (selectedImage) {
        formData.append('cover_image', selectedImage);
      }

      const response = await axios.put(
        `${apiURL}/api/courses/subjects/${subject.subject_id}`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );

      if (response.data.success) {
        const updatedSubject = {
          ...subject,
          subject_name: editSubjectName,
          description: editDescription,
          video_url: editVideoUrl,
          credits: editCredits,
          cover_image_file_id: response.data.subject?.cover_image_file_id || subject.cover_image_file_id
        };
        
        onSubjectUpdate(updatedSubject);
        setIsEditing(false);
        setSelectedImage(null);
        setImagePreview(null);
        
        showNotification('บันทึกข้อมูลสำเร็จ', 'success');
      }
    } catch (error) {
      console.error('Error updating subject:', error);
      showNotification('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditSubjectName(subject.subject_name);
    setEditDescription(subject.description || '');
    setEditVideoUrl(subject.video_url || '');
    setEditCredits(subject.credits);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const getSubjectImageUrl = (subject: Subject): string => {
    if (imagePreview) return imagePreview;
    if (subject.cover_image_file_id) {
      return `${apiURL}/api/courses/subjects/image/${subject.cover_image_file_id}`;
    }
    return 'https://www.pngwing.com/en/search?q=no+Image';
  };

  const getVideoEmbedUrl = (videoUrl: string | null): string => {
    if (!videoUrl) return '';
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const videoIdMatch = videoUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
      if (videoIdMatch) {
        return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
      }
    }
    return videoUrl;
  };

  // Notification function
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
    <div className="subject-detail-container">
      <div className="subject-detail-header">
        <div className="subject-header-content">
          <div className="subject-image-section">
            <div className="subject-image-container" onClick={() => isEditing && fileInputRef.current?.click()}>
              <img
                src={getSubjectImageUrl(subject)}
                alt={editSubjectName}
                className="subject-detail-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://www.pngwing.com/en/search?q=no+Image';
                }}
              />
              {isEditing && (
                <div className="image-edit-overlay">
                  <i className="fas fa-camera"></i>
                  <span>คลิกเพื่อเปลี่ยนรูป</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
          </div>
          <div className="subject-info-section">
            <div className="subject-header-top">
              {isEditing ? (
                <input
                  type="text"
                  value={editSubjectName}
                  onChange={(e) => setEditSubjectName(e.target.value)}
                  className="edit-title-input"
                  placeholder="ชื่อรายวิชา"
                />
              ) : (
                <h1 className="subject-detail-title">{subject.subject_name}</h1>
              )}
              <div className="subject-badges">
                <span className="subject-code-badge">{subject.subject_code}</span>
                <span className={`status-badge ${subject.status}`}>
                  {subject.status === 'active' ? 'เปิดใช้งาน' : 
                   subject.status === 'inactive' ? 'ปิดใช้งาน' : 'ร่าง'}
                </span>
              </div>
            </div>
            
            <div className="subject-meta">
              <div className="meta-item">
                <i className="fas fa-book me-2"></i>
                <span>หลักสูตร: {course.title}</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-graduation-cap me-2"></i>
                {isEditing ? (
                  <input
                    type="number"
                    value={editCredits}
                    onChange={(e) => setEditCredits(parseInt(e.target.value) || 0)}
                    className="edit-credits-input"
                    min="1"
                    max="10"
                  />
                ) : (
                  <span>{subject.credits} หน่วยกิต</span>
                )}
              </div>
              <div className="meta-item">
                <i className="fas fa-play-circle me-2"></i>
                <span>{subject.lessons?.length || 0} บทเรียน</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-question-circle me-2"></i>
                <span>{subject.quiz_count} แบบทดสอบ</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-chalkboard-teacher me-2"></i>
                <span>{subject.instructors?.length || 0} อาจารย์</span>
              </div>
            </div>

            {/* Enhanced Edit Controls */}
            <div className="edit-controls">
              {!isEditing ? (
                <button 
                  className="edit-mode-btn modern-btn primary"
                  onClick={() => setIsEditing(true)}
                >
                  <div className="btn-content">
                    <i className="fas fa-edit"></i>
                    <span>แก้ไขข้อมูล</span>
                  </div>
                  <div className="btn-ripple"></div>
                </button>
              ) : (
                <div className="edit-actions">
                  <button 
                    className="save-btn modern-btn success"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <div className="btn-content">
                      <i className={`fas ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>
                      <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึก'}</span>
                    </div>
                    <div className="btn-ripple"></div>
                  </button>
                  <button 
                    className="cancel-btn modern-btn secondary"
                    onClick={handleCancel}
                  >
                    <div className="btn-content">
                      <i className="fas fa-times"></i>
                      <span>ยกเลิก</span>
                    </div>
                    <div className="btn-ripple"></div>
                  </button>
                </div>
              )}
            </div>

            {/* Subject Description */}
            <div className="subject-description-section">
              <h3>รายละเอียดรายวิชา</h3>
              {isEditing ? (
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="edit-description-textarea modern-textarea"
                  placeholder="รายละเอียดรายวิชา"
                  rows={4}
                />
              ) : (
                <div className="subject-description">
                  {subject.description || 'ไม่มีรายละเอียด'}
                </div>
              )}
            </div>

            {/* Video URL */}
            <div className="subject-video-section">
              <h3>วิดีโอแนะนำรายวิชา</h3>
              {isEditing ? (
                <input
                  type="url"
                  value={editVideoUrl}
                  onChange={(e) => setEditVideoUrl(e.target.value)}
                  className="edit-video-input modern-input"
                  placeholder="URL วิดีโอ YouTube"
                />
              ) : (
                <div className="video-display">
                  {subject.video_url ? (
                    <div className="video-container">
                      <iframe
                        src={getVideoEmbedUrl(subject.video_url)}
                        title="วิดีโอแนะนำรายวิชา"
                        frameBorder="0"
                                               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="no-video">
                      <i className="fas fa-video"></i>
                      <span>ไม่มีวิดีโอแนะนำ</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminSubjectArea: React.FC<AdminSubjectAreaProps> = ({ 
  subjectId, 
  courseData, 
  onSubjectUpdate, 
  onBack 
}) => {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjectDetail = async () => {
    try {
      setLoading(true);
      const apiURL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${apiURL}/api/courses/subjects/${subjectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSubject(response.data.subject);
      } else {
        setError('ไม่สามารถโหลดข้อมูลรายวิชาได้');
      }
    } catch (error) {
      console.error('Error fetching subject detail:', error);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjectDetail();
  }, [subjectId]);

  const handleSubjectUpdate = (updatedSubject: Subject) => {
    setSubject(updatedSubject);
    onSubjectUpdate(updatedSubject);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>กำลังโหลดข้อมูลรายวิชา...</p>
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="error-container">
        <div className="error-content">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>เกิดข้อผิดพลาด</h3>
          <p>{error || 'ไม่พบข้อมูลรายวิชา'}</p>
          <button className="btn btn-primary" onClick={onBack}>
            <i className="fas fa-arrow-left me-2"></i>
            กลับไปหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-subject-area">
      {/* Back Button */}
      <div className="back-navigation">
        <button 
          className="back-btn modern-btn secondary"
          onClick={onBack}
        >
          <div className="btn-content">
            <i className="fas fa-arrow-left"></i>
            <span>กลับไปหน้าหลัก</span>
          </div>
          <div className="btn-ripple"></div>
        </button>
      </div>

      {/* Subject Detail Header */}
      <EditableSubjectDetail 
        subject={subject}
        course={courseData}
        onSubjectUpdate={handleSubjectUpdate}
      />

      {/* Lessons Management Area */}
      <AdminLessonsArea 
        subject={subject}
        courseData={courseData}
        onSubjectUpdate={handleSubjectUpdate}
      />
    </div>
  );
};

export default AdminSubjectArea;
