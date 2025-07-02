import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
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

interface AvailableInstructor {
  instructor_id: number;
  name: string;
  position: string;
  department_name: string;
  avatar_file_id: string | null;
  status: string;
}

// Enhanced Add Lesson Card Component
const AddLessonCard: React.FC<{
  subjectId: number;
  onClick: () => void;
}> = ({ onClick }) => {
  return (
    <div className="lesson-card add-lesson-card" onClick={onClick}>
      <div className="lesson-card-content">
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
        // Reload page to update instructor list
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
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50x50.png?text=ไม่มีรูป';
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

// Editable Subject Detail component
const EditableSubjectDetail: React.FC<{
  subject: Subject;
  course: Course;
  onSubjectUpdate: (updatedSubject: Subject) => void;
}> = ({ subject, course, onSubjectUpdate }) => {
  const apiURL = import.meta.env.VITE_API_URL;
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeTab, setActiveTab] = useState('lessons');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  
  // Editable fields
  const [editSubjectName, setEditSubjectName] = useState(subject.subject_name);
  const [editDescription, setEditDescription] = useState(subject.description || '');
  const [editVideoUrl, setEditVideoUrl] = useState(subject.video_url || '');
  const [editCredits, setEditCredits] = useState(subject.credits);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
  // ใช้ข้อมูลบทเรียนจาก subject.lessons ที่ได้จาก API หลัก
  if (subject.lessons) {
    const formattedLessons: Lesson[] = subject.lessons.map((lesson: any) => ({
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
    setLessons(formattedLessons);
  } else {
    setLessons([]);
  }
}, [subject.lessons]);


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
    return 'https://via.placeholder.com/400x250.png?text=ไม่มีรูปภาพ';
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

  const handleAddLesson = () => {
    window.location.href = `/admin-lessons/create-new?subject_id=${subject.subject_id}`;
  };

  const handleAddInstructor = () => {
    setShowInstructorModal(true);
  };

  const handleAddTest = (testType: 'pre' | 'post') => {
    window.location.href = `/admin-quizzes/create-new?subject_id=${subject.subject_id}&type=${testType}`;
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm('คุณต้องการลบบทเรียนนี้หรือไม่?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${apiURL}/api/courses/lessons/${lessonId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Remove lesson from local state
        setLessons(lessons.filter(lesson => lesson.lesson_id !== lessonId));
        showNotification('ลบบทเรียนสำเร็จ', 'success');
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      showNotification('เกิดข้อผิดพลาดในการลบบทเรียน', 'error');
    }
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

  const handleDeleteTest = async (testType: 'pre' | 'post') => {
    const testName = testType === 'pre' ? 'ก่อนเรียน' : 'หลังเรียน';
    if (!confirm(`คุณต้องการลบแบบทดสอบ${testName}นี้หรือไม่?`)) return;
    
    try {
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
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x250.png?text=ไม่มีรูปภาพ';
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
                <span>{lessons.length} บทเรียน</span>
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
                  {/* Horizontal Lessons Layout */}
                  <div className="lessons-horizontal-scroll">
                    <div className="lessons-grid-horizontal">
                      {/* Add Lesson Card */}
                      <AddLessonCard 
                        subjectId={subject.subject_id}
                        onClick={handleAddLesson}
                      />
                      
                      {/* Lesson Cards */}
                      {lessons.map((lesson, index) => (
                        <div key={`lesson-${lesson.lesson_id}`} className="lesson-card">
                          <div className="lesson-card-header">
                            <div className="lesson-number">
                              <span>{lesson.order_number || index + 1}</span>
                            </div>
                            <div className="lesson-status">
                              <span className={`status-dot ${lesson.status || 'active'}`}></span>
                            </div>
                          </div>
                          
                          <div className="lesson-card-content">
                            <div className="lesson-thumbnail">
                              {lesson.video_url ? (
                                <div className="video-thumbnail">
                                  <i className="fas fa-play-circle"></i>
                                  <span>วิดีโอ</span>
                                </div>
                              ) : (
                                <div className="no-video-thumbnail">
                                  <i className="fas fa-file-text"></i>
                                  <span>เนื้อหา</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="lesson-info">
                              <h4 className="lesson-title">{lesson.title}</h4>
                              {lesson.description && (
                                <p className="lesson-description">
                                  {lesson.description.length > 60 
                                    ? `${lesson.description.substring(0, 60)}...`
                                    : lesson.description
                                  }
                                </p>
                              )}
                              
                              <div className="lesson-meta">
                                {lesson.has_quiz && (
                                  <div className="meta-badge quiz-badge">
                                    <i className="fas fa-question-circle"></i>
                                    <span>แบบทดสอบ</span>
                                  </div>
                                )}
                                {lesson.file_count && parseInt(lesson.file_count) > 0 && (
                                  <div className="meta-badge file-badge">
                                    <i className="fas fa-file"></i>
                                    <span>{lesson.file_count} ไฟล์</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="lesson-actions">
                            <Link
                              to={`/admin-lessons/edit/${lesson.lesson_id}`}
                              className="action-btn edit-btn"
                              title="แก้ไข"
                            >
                              <i className="fas fa-edit"></i>
                            </Link>
                            <button 
                              className="action-btn view-btn"
                              onClick={() => window.open(`/lessons/view/${lesson.lesson_id}`, '_blank')}
                              title="ดูตัวอย่าง"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button 
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteLesson(lesson.lesson_id)}
                              title="ลบ"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'instructors' && (
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
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100.png?text=ไม่มีรูป';
                              }}
                            />
                          ) : instructor.avatar ? (
                            <img
                              src={`data:image/jpeg;base64,${instructor.avatar}`}
                              alt={instructor.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100.png?text=ไม่มีรูป';
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
          )}

          {activeTab === 'tests' && (
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
                          className="action-btn view-btn modern-
btn small info"
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
          )}
        </div>
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
