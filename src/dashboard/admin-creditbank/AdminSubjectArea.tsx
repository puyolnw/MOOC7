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
  order_number: number;
  status: string;
  created_at: string;
  can_preview?: boolean;
  has_quiz?: boolean;
  quiz_id?: number | null;
  file_count?: string;
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

// Editable Subject Detail component
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
                  placeholder="URL วิดีโอ (YouTube)"
                />
              ) : (
                <>
                  {subject.video_url ? (
                    <div className="video-container">
                      <iframe
                        src={getVideoEmbedUrl(subject.video_url)}
                        title={`วิดีโอแนะนำ ${subject.subject_name}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="subject-video-iframe"
                      ></iframe>
                    </div>
                  ) : (
                    <div className="no-video">
                      <i className="fas fa-video"></i>
                      <p>ไม่มีวิดีโอแนะนำ</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ใช้ AdminLessonsArea component แทนส่วน tabs เดิม */}
      <AdminLessonsArea
        subject={subject}
        courseData={course}
        onSubjectUpdate={onSubjectUpdate}
      />
    </div>
  );
};

// Main AdminSubjectArea component
const AdminSubjectArea: React.FC<AdminSubjectAreaProps> = ({ 
  subjectId, 
  courseData, 
  onSubjectUpdate, 
  onBack 
}) => {
  const apiURL = import.meta.env.VITE_API_URL;
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subjectId) {
      fetchSubjectData();
    }
  }, [subjectId]);

  const fetchSubjectData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่');
        return;
      }

      const subjectResponse = await axios.get(
        `${apiURL}/api/courses/subjects/${subjectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (subjectResponse.data.success) {
        const subjectData = subjectResponse.data.subject;
        
        // Map lessons data properly
        if (subjectData.lessons) {
          subjectData.lessons = subjectData.lessons.map((lesson: any) => ({
            lesson_id: lesson.lesson_id,
            title: lesson.title,
            description: lesson.description || '', // ให้เป็น string เสมอ
            content: lesson.content || '', // ให้เป็น string เสมอ
            video_url: lesson.video_url,
            order_number: lesson.order_number,
            status: lesson.status || 'active', // ให้เป็น string เสมอ
            created_at: lesson.created_at || new Date().toISOString(), // ให้เป็น string เสมอ
            can_preview: lesson.can_preview || false,
            has_quiz: lesson.has_quiz || false,
            quiz_id: lesson.quiz_id,
            file_count: lesson.file_count || '0'
          }));
        }

        // Map test data properly
        if (subjectData.preTest) {
          subjectData.pre_test = {
            quiz_id: subjectData.preTest.quiz_id,
            title: subjectData.preTest.title,
            description: subjectData.preTest.description || '',
            status: 'active',
            passing_score_enabled: false,
            passing_score_value: 0,
            question_count: subjectData.preTest.question_count
          };
        }

        if (subjectData.postTest) {
          subjectData.post_test = {
            quiz_id: subjectData.postTest.quiz_id,
            title: subjectData.postTest.title,
            description: subjectData.postTest.description || '',
            status: 'active',
            passing_score_enabled: false,
            passing_score_value: 0,
            question_count: subjectData.postTest.question_count
          };
        }

        setSubject(subjectData);
      } else {
        setError('ไม่พบข้อมูลรายวิชา');
      }
    } catch (error) {
      console.error('Error fetching subject data:', error);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูลรายวิชา');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubjectUpdate = (updatedSubject: Subject) => {
    setSubject(updatedSubject);
    onSubjectUpdate(updatedSubject);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="loading-text">กำลังโหลดข้อมูลรายวิชา...</p>
        </div>
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="alert alert-danger rounded-3 mb-4" role="alert">
        <div className="d-flex align-items-center">
          <i className="fas fa-exclamation-circle me-2"></i>
          <div className="flex-grow-1">
            {error || 'ไม่พบข้อมูลรายวิชา'}
          </div>
          <button 
            className="btn btn-outline-danger btn-sm"
            onClick={onBack}
          >
            <i className="fas fa-arrow-left me-1"></i>
            กลับ
          </button>
        </div>
      </div>
    );
  }

  return (
    <EditableSubjectDetail
      subject={subject}
      course={courseData}
      onSubjectUpdate={handleSubjectUpdate}
    />
  );
};

export default AdminSubjectArea;
