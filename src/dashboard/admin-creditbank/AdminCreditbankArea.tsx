import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import DashboardSidebar from "../dashboard-common/AdminSidebar";
import DashboardBanner from "../dashboard-common/AdminBanner";
import AdminSubjectArea from "./AdminSubjectArea";
import "./mega.css";


interface Course {
  course_id: number;
  course_code: string;
  title: string;
  description: string;
  cover_image_path: string | null;
  cover_image_file_id: string | null;
  video_url: string | null;
  study_result: string | null;
  department_name: string | null;
  faculty: string | null;
  subject_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

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
}

interface Quiz {
  quiz_id: number;
  title: string;
  description: string;
  status: string;
  passing_score_enabled: boolean;
  passing_score_value: number;
}

interface Department {
  department_id: number;
  department_name: string;
  faculty: string;
  description?: string;
  created_at: string;
  course_count?: number;
}

interface Faculty {
  name: string;
  department_count: number;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Enhanced Navigation breadcrumb component
const NavigationBreadcrumb: React.FC<{
  selectedFaculty: string | null;
  selectedDepartment: Department | null;
  selectedCourse: Course | null;
  selectedSubject: Subject | null;
  onFacultyClick: () => void;
  onDepartmentClick: () => void;
  onCourseClick: () => void;
  onSubjectClick?: () => void;
}> = ({ 
  selectedFaculty, 
  selectedDepartment, 
  selectedCourse, 
  selectedSubject,
  onFacultyClick, 
  onDepartmentClick, 
  onCourseClick,
  onSubjectClick 
}) => {
  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <div className="breadcrumb-container">
        <ol className="breadcrumb-modern">
          <li className="breadcrumb-item-modern">
            <button 
              className="breadcrumb-btn home-btn"
              onClick={onFacultyClick}
            >
              <i className="fas fa-home me-2"></i>
              <span>เลือกคณะ</span>
            </button>
          </li>
          {selectedFaculty && (
            <>
              <li className="breadcrumb-separator">
                <i className="fas fa-chevron-right"></i>
              </li>
              <li className="breadcrumb-item-modern">
                <button 
                  className="breadcrumb-btn faculty-btn"
                  onClick={onDepartmentClick}
                >
                  <i className="fas fa-university me-2"></i>
                  <span>{selectedFaculty}</span>
                </button>
              </li>
            </>
          )}
          {selectedDepartment && (
            <>
              <li className="breadcrumb-separator">
                <i className="fas fa-chevron-right"></i>
              </li>
              <li className="breadcrumb-item-modern">
                <button 
                  className="breadcrumb-btn department-btn"
                  onClick={onCourseClick}
                >
                  <i className="fas fa-building me-2"></i>
                  <span>{selectedDepartment.department_name}</span>
                </button>
              </li>
            </>
          )}
          {selectedCourse && (
            <>
              <li className="breadcrumb-separator">
                <i className="fas fa-chevron-right"></i>
              </li>
              <li className="breadcrumb-item-modern">
                {selectedSubject ? (
                  <button 
                    className="breadcrumb-btn course-btn"
                    onClick={onSubjectClick || (() => {})}
                  >
                    <i className="fas fa-book me-2"></i>
                    <span>{selectedCourse.title}</span>
                  </button>
                ) : (
                  <span className="breadcrumb-current">
                    <i className="fas fa-book me-2"></i>
                    <span>{selectedCourse.title}</span>
                  </span>
                )}
              </li>
            </>
          )}
          {selectedSubject && (
            <>
              <li className="breadcrumb-separator">
                <i className="fas fa-chevron-right"></i>
              </li>
              <li className="breadcrumb-item-modern active">
                <span className="breadcrumb-current">
                  <i className="fas fa-graduation-cap me-2"></i>
                  <span>{selectedSubject.subject_name}</span>
                </span>
              </li>
            </>
          )}
        </ol>
      </div>
    </nav>
  );
};

// Enhanced Faculty selection component
const FacultySelection: React.FC<{
  faculties: Faculty[];
  isLoading: boolean;
  onSelectFaculty: (faculty: string) => void;
}> = ({ faculties, isLoading, onSelectFaculty }) => {
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="loading-text">กำลังโหลดข้อมูลคณะ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="selection-container">
      <div className="section-header">
        <div className="section-icon">
          <i className="fas fa-university"></i>
        </div>
        <div className="section-title">
          <h2>เลือกคณะ</h2>
          <p>เลือกคณะที่ต้องการจัดการหลักสูตร</p>
        </div>
      </div>
      
      <div className="cards-grid">
        {faculties.map((faculty, index) => (
          <div key={`faculty-${index}`} className="selection-card faculty-card">
            <div 
              className="card-content"
              onClick={() => onSelectFaculty(faculty.name)}
            >
              <div className="card-icon faculty-icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <div className="card-body">
                <h3 className="card-title">{faculty.name}</h3>
                <div className="card-stats">
                  <span className="stat-item">
                    <i className="fas fa-building me-1"></i>
                    {faculty.department_count} สาขา
                  </span>
                </div>
              </div>
              <div className="card-arrow">
                <i className="fas fa-arrow-right"></i>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Department selection component
const DepartmentSelection: React.FC<{
  departments: Department[];
  isLoading: boolean;
  selectedFaculty: string;
  onSelectDepartment: (department: Department) => void;
}> = ({ departments, isLoading, selectedFaculty, onSelectDepartment }) => {
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="loading-text">กำลังโหลดข้อมูลสาขา...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="selection-container">
      <div className="section-header">
        <div className="section-icon">
          <i className="fas fa-building"></i>
        </div>
        <div className="section-title">
          <h2>เลือกสาขาวิชา</h2>
          <p>คณะ {selectedFaculty} - เลือกสาขาที่ต้องการจัดการหลักสูตร</p>
        </div>
      </div>
      
      <div className="cards-grid">
        {departments.map((department) => (
          <div key={`department-${department.department_id}`} className="selection-card department-card">
            <div 
              className="card-content"
              onClick={() => onSelectDepartment(department)}
            >
              <div className="card-icon department-icon">
                <i className="fas fa-book-open"></i>
              </div>
              <div className="card-body">
                <h3 className="card-title">{department.department_name}</h3>
                {department.description && (
                  <p className="card-description">
                    {department.description.length > 80 
                      ? `${department.description.substring(0, 80)}...`
                      : department.description
                    }
                  </p>
                )}
                <div className="card-stats">
                  <span className="stat-item">
                    <i className="fas fa-graduation-cap me-1"></i>
                    {department.course_count || 0} หลักสูตร
                  </span>
                </div>
              </div>
              <div className="card-arrow">
                <i className="fas fa-arrow-right"></i>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Add Course Card Component
const AddCourseCard: React.FC<{
  selectedDepartment: Department;
  onClick: () => void;
}> = ({ selectedDepartment, onClick }) => {
  return (
    <div className="add-course-card" onClick={onClick}>
      <div className="add-course-content">
        <div className="add-course-icon">
          <i className="fas fa-plus"></i>
        </div>
    
        <p className="add-course-description">
          สร้างหลักสูตรใหม่สำหรับสาขา {selectedDepartment.department_name}
        </p>
      </div>
    </div>
  );
};

// Course List component
const CourseList: React.FC<{
  courses: Course[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCourseSelect: (course: Course) => void;
  onAddCourse: () => void;
  selectedDepartment: Department;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  indexOfFirstItem: number;
}> = ({ 
  courses, 
  isLoading, 
  searchTerm, 
  onSearchChange, 
  onCourseSelect, 
  onAddCourse,
  selectedDepartment,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">กำลังโหลด...</span>
          </div>
          <p className="loading-text">กำลังโหลดข้อมูลหลักสูตร...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-list-container">
      <div className="section-header">
        <div className="section-icon">
          <i className="fas fa-graduation-cap"></i>
        </div>
        <div className="section-title">
          <h2>หลักสูตร</h2>
          <p>สาขา {selectedDepartment.department_name} - จำนวน {courses.length} หลักสูตร</p>
        </div>
      </div>

      <div className="course-controls">
        <div className="search-container">
          <div className="search-input-group">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="ค้นหาหลักสูตร..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="clear-search-btn"
                onClick={() => onSearchChange('')}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="courses-grid">
        {/* Add Course Card เป็นอันแรก */}
        <AddCourseCard 
          selectedDepartment={selectedDepartment}
          onClick={onAddCourse}
        />
        
                {courses.map((course, index) => (
          <div 
            key={`course-${course.course_id}-${index}`} 
            className="course-card"
            onClick={() => onCourseSelect(course)}
          >
            <div className="course-card-image">
              <img
                src={course.cover_image_file_id 
                  ? `${import.meta.env.VITE_API_URL}/api/courses/image/${course.cover_image_file_id}`
                  : 'https://via.placeholder.com/300x200.png?text=ไม่มีรูปภาพ'
                }
                alt={course.title}
                className="course-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200.png?text=ไม่มีรูปภาพ';
                }}
              />
              <div className="course-card-overlay">
                <div className="course-status">
                  <span className={`status-badge ${course.status}`}>
                    {course.status === 'active' ? 'เปิดใช้งาน' : 
                     course.status === 'inactive' ? 'ปิดใช้งาน' : 'ร่าง'}
                  </span>
                </div>
              </div>
            </div>
            <div className="course-card-content">
              <div className="course-card-header">
                <h3 className="course-title">{course.title}</h3>
                {course.course_code && (
                  <span className="course-code">{course.course_code}</span>
                )}
              </div>
              {course.description && (
                <p className="course-description">
                  {course.description.length > 100 
                    ? `${course.description.substring(0, 100)}...`
                    : course.description
                  }
                </p>
              )}
              <div className="course-stats">
                <div className="stat-group">
                  <i className="fas fa-list-alt me-1"></i>
                  <span>{course.subject_count} รายวิชา</span>
                </div>
                <div className="stat-group">
                  <i className="fas fa-calendar me-1"></i>
                  <span>{new Date(course.created_at).toLocaleDateString('th-TH')}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="pagination-nav">
          <SimplePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

// Add Subject Card Component
const AddSubjectCard: React.FC<{
  courseId: number;
  onClick: () => void;
}> = ({ onClick }) => {
  return (
    <div className="add-subject-card" onClick={onClick}>
      <div className="add-subject-content">
        <div className="add-subject-icon">
          <i className="fas fa-plus"></i>
        </div>
        <h3 className="add-subject-title">เพิ่มรายวิชาใหม่</h3>
        <p className="add-subject-description">
          สร้างรายวิชาใหม่สำหรับหลักสูตรนี้
        </p>
      </div>
    </div>
  );
};

// Editable Course Detail component
const EditableCourseDetail: React.FC<{
  course: Course;
  onBack: () => void;
  onSubjectSelect: (subject: Subject) => void;
  onCourseUpdate: (updatedCourse: Course) => void;
}> = ({ course, onSubjectSelect, onCourseUpdate }) => {
  const apiURL = import.meta.env.VITE_API_URL;
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Editable fields
  const [editTitle, setEditTitle] = useState(course.title);
  const [editDescription, setEditDescription] = useState(course.description || '');
  const [editVideoUrl, setEditVideoUrl] = useState(course.video_url || '');
  const [editStudyResult, setEditStudyResult] = useState(course.study_result || '');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSubjects();
  }, [course.course_id]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = subjects.filter(subject =>
        subject.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.subject_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSubjects(filtered);
    } else {
      setFilteredSubjects(subjects);
    }
  }, [searchTerm, subjects]);

  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${apiURL}/api/courses/${course.course_id}/subjects`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSubjects(response.data.subjects || []);
        setFilteredSubjects(response.data.subjects || []);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
      setFilteredSubjects([]);
    } finally {
      setIsLoading(false);
    }
  };

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
      
      formData.append('title', editTitle);
      formData.append('description', editDescription);
      formData.append('video_url', editVideoUrl);
      formData.append('study_result', editStudyResult);
      
      if (selectedImage) {
        formData.append('cover_image', selectedImage);
      }

      const response = await axios.put(
        `${apiURL}/api/courses/${course.course_id}`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );

      if (response.data.success) {
        const updatedCourse = {
          ...course,
          title: editTitle,
          description: editDescription,
          video_url: editVideoUrl,
          study_result: editStudyResult,
          cover_image_file_id: response.data.course?.cover_image_file_id || course.cover_image_file_id
        };
        
        onCourseUpdate(updatedCourse);
        setIsEditing(false);
        setSelectedImage(null);
        setImagePreview(null);
        
        alert('บันทึกข้อมูลสำเร็จ');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(course.title);
    setEditDescription(course.description || '');
    setEditVideoUrl(course.video_url || '');
    setEditStudyResult(course.study_result || '');
    setSelectedImage(null);
    setImagePreview(null);
  };



  const getCourseImageUrl = (course: Course): string => {
    if (imagePreview) return imagePreview;
    if (course.cover_image_file_id) {
      return `${apiURL}/api/courses/image/${course.cover_image_file_id}`;
    }
    if (course.cover_image_path && typeof course.cover_image_path === 'string' && course.cover_image_path.trim() !== '') {
      const fileIdMatch = course.cover_image_path.match(/\/d\/(.+?)\//);
      if (fileIdMatch && fileIdMatch[1]) {
        return `${apiURL}/api/courses/image/${fileIdMatch[1]}`;
      }
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

  const handleAddSubject = () => {
    window.location.href = `/admin-subjects/create-new?course_id=${course.course_id}`;
  };

  return (
    <div className="course-detail-container">
      <div className="course-detail-header">
        <div className="course-header-content">
          <div className="course-image-section">
            <div className="course-image-container" onClick={() => isEditing && fileInputRef.current?.click()}>
              <img
                src={getCourseImageUrl(course)}
                alt={editTitle}
                className="course-detail-image"
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
          <div className="course-info-section">
            <div className="course-header-top">
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="edit-title-input"
                  placeholder="ชื่อหลักสูตร"
                />
              ) : (
                <h1 className="course-detail-title">{course.title}</h1>
              )}
              <div className="course-badges">
                {course.course_code && (
                  <span className="course-code-badge">{course.course_code}</span>
                )}
                <span className={`status-badge ${course.status}`}>
                  {course.status === 'active' ? 'เปิดใช้งาน' : 
                   course.status === 'inactive' ? 'ปิดใช้งาน' : 'ร่าง'}
                </span>
              </div>
            </div>
            
            <div className="course-meta">
              <div className="meta-item">
                <i className="fas fa-building me-2"></i>
                <span>{course.department_name}</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-university me-2"></i>
                <span>{course.faculty}</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-list-alt me-2"></i>
                <span>{subjects.length} รายวิชา</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-calendar me-2"></i>
                <span>สร้างเมื่อ {new Date(course.created_at).toLocaleDateString('th-TH')}</span>
              </div>
            </div>

            {/* Edit Controls */}
            <div className="edit-controls">
              {!isEditing ? (
                <button 
                  className="edit-mode-btn"
                  onClick={() => setIsEditing(true)}
                >
                  <i className="fas fa-edit me-2"></i>
                  แก้ไขข้อมูล
                </button>
              ) : (
                <div className="edit-actions">
                  <button 
                    className="save-btn"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <i className="fas fa-save me-2"></i>
                    {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={handleCancel}
                  >
                    <i className="fas fa-times me-2"></i>
                    ยกเลิก
                  </button>
                </div>
              )}
            </div>

                     {/* Course Description */}
            <div className="course-description-section">
              <h3>รายละเอียดหลักสูตร</h3>
              {isEditing ? (
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="edit-description-textarea"
                  placeholder="รายละเอียดหลักสูตร"
                  rows={4}
                />
              ) : (
                <div className="course-description">
                  {course.description || 'ไม่มีรายละเอียด'}
                </div>
              )}
            </div>

            {/* Study Result */}
            <div className="study-result-section">
              <h3>ผลลัพธ์การเรียนรู้</h3>
              {isEditing ? (
                <textarea
                  value={editStudyResult}
                  onChange={(e) => setEditStudyResult(e.target.value)}
                  className="edit-study-result-textarea"
                  placeholder="ผลลัพธ์การเรียนรู้"
                  rows={3}
                />
              ) : (
                <div className="study-result">
                  {course.study_result || 'ไม่มีข้อมูลผลลัพธ์การเรียนรู้'}
                </div>
              )}
            </div>

            {/* Video URL */}
            <div className="course-video-section">
              <h3>วิดีโอแนะนำหลักสูตร</h3>
              {isEditing ? (
                <input
                  type="url"
                  value={editVideoUrl}
                  onChange={(e) => setEditVideoUrl(e.target.value)}
                  className="edit-video-input"
                  placeholder="URL วิดีโอ (YouTube)"
                />
              ) : (
                <>
                  {course.video_url ? (
                    <div className="video-container">
                      <iframe
                        src={getVideoEmbedUrl(course.video_url)}
                        title={`วิดีโอแนะนำ ${course.title}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="course-video-iframe"
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

      {/* Subjects Section */}
      <div className="subjects-section">
        <div className="subjects-header">
          <div className="section-title">
            <h2>รายวิชาในหลักสูตร</h2>
            <p>จำนวน {subjects.length} รายวิชา</p>
          </div>
          <div className="subjects-controls">
            <div className="search-container">
              <div className="search-input-group">
                <i className="fas fa-search search-icon"></i>
                <input
                  type="text"
                  className="search-input"
                  placeholder="ค้นหารายวิชา..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="clear-search-btn"
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">กำลังโหลด...</span>
              </div>
              <p className="loading-text">กำลังโหลดรายวิชา...</p>
            </div>
          </div>
        ) : (
          <div className="subjects-grid">
            {/* Add Subject Card เป็นอันแรก */}
            <AddSubjectCard 
              courseId={course.course_id}
              onClick={handleAddSubject}
            />
            
            {filteredSubjects.map((subject, index) => (
              <div 
                key={`subject-${subject.subject_id}-${index}`} 
                className="subject-card"
              >
                <div className="subject-card-header">
                  <div className="subject-order">
                    <span>#{subject.order_number || index + 1}</span>
                  </div>
                  <div className="subject-status">
                    <span className={`status-dot ${subject.status}`}></span>
                  </div>
                </div>
                
                <div className="subject-card-image">
                  <img
                    src={subject.cover_image_file_id 
                      ? `${apiURL}/api/courses/subjects/image/${subject.cover_image_file_id}`
                      : 'https://via.placeholder.com/300x200.png?text=ไม่มีรูปภาพ'
                    }
                    alt={subject.subject_name}
                    className="subject-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200.png?text=ไม่มีรูปภาพ';
                    }}
                  />
                </div>
                
                <div className="subject-card-content">
                  <div className="subject-card-header">
                    <h3 className="subject-title">{subject.subject_name}</h3>
                    <span className="subject-code">{subject.subject_code}</span>
                  </div>
                  {subject.description && (
                    <p className="subject-description">
                      {subject.description.length > 100 
                        ? `${subject.description.substring(0, 100)}...`
                        : subject.description
                      }
                    </p>
                  )}
                  <div className="subject-stats">
                    <div className="stat-group">
                      <div className="stat-item">
                        <i className="fas fa-graduation-cap me-1"></i>
                        <span>{subject.credits} หน่วยกิต</span>
                      </div>
                      <div className="stat-item">
                        <i className="fas fa-play-circle me-1"></i>
                        <span>{subject.lesson_count || 0} บทเรียน</span>
                      </div>
                      <div className="stat-item">
                        <i className="fas fa-question-circle me-1"></i>
                        <span>{subject.quiz_count || 0} แบบทดสอบ</span>
                      </div>
                    </div>
                  </div>
                  {subject.instructors && subject.instructors.length > 0 && (
                    <div className="subject-instructors">
                      <div className="instructors-label">
                        <i className="fas fa-chalkboard-teacher me-1"></i>
                        <span>อาจารย์ผู้สอน:</span>
                      </div>
                      <div className="instructors-list">
                        {subject.instructors.slice(0, 2).map((instructor, idx) => (
                          <span key={instructor.instructor_id} className="instructor-name">
                            {instructor.name}
                            {idx < Math.min(subject.instructors.length, 2) - 1 && ', '}
                          </span>
                        ))}
                        {subject.instructors.length > 2 && (
                          <span className="more-instructors">
                            และอีก {subject.instructors.length - 2} คน
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
<div className="subject-card-footer d-flex justify-content-end align-items-center pt-3">
  <div className="subject-actions">
    <button
      className="btn btn-primary btn-sm d-flex align-items-center"
      onClick={() => onSubjectSelect(subject)}
    >
      <i className="fas fa-eye me-2"></i>
      ดูรายละเอียด
    </button>
  </div>
</div>
              </div>
            ))}
          </div>
        )}

        {filteredSubjects.length === 0 && !isLoading && (
          <div className="no-subjects">
            <div className="no-subjects-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h3>ไม่พบรายวิชา</h3>
            <p>
              {searchTerm 
                ? 'ไม่พบรายวิชาที่ตรงกับเงื่อนไขการค้นหา' 
                : 'ยังไม่มีรายวิชาในหลักสูตรนี้'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple Pagination component
const SimplePagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers: number[] = [];

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pageNumbers.push(i);
    } else if (
      (i === currentPage - 2 && currentPage > 3) ||
      (i === currentPage + 2 && currentPage < totalPages - 2)
    ) {
      pageNumbers.push(-1);
    }
  }

  const filteredPageNumbers = pageNumbers.filter(
    (number, index, array) => number !== -1 || (array[index - 1] !== -1)
  );

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination mb-0">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
        </li>
        {filteredPageNumbers.map((number, index) => (
          number === -1 ? (
            <li key={`ellipsis-${index}`} className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          ) : (
            <li key={`page-${number}-${index}`} className={`page-item ${currentPage === number ? 'active' : ''}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(number)}
                aria-current={currentPage === number ? 'page' : undefined}
              >
                {number}
              </button>
            </li>
          )
        ))}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>
  );
};

// Main AdminCreditbankArea component
const AdminCreditbankArea: React.FC = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [currentView, setCurrentView] = useState<'faculties' | 'departments' | 'courses' | 'subjects' | 'subject-detail'>('faculties');
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  
  // Data states
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  // Add state for initialization
  const [isInitialized, setIsInitialized] = useState(false);

  const handleAddCourse = () => {
    if (selectedDepartment) {
      navigate(`/admin-creditbank/create-new?department_id=${selectedDepartment.department_id}`);
    } else {
      alert('เกิดข้อผิดพลาด: ไม่พบข้อมูลสาขาวิชา');
    }
  };

  // Initialize from URL parameters on component mount
  useEffect(() => {
    const initializeFromURL = async () => {
      const urlParams = new URLSearchParams(location.search);
      const view = urlParams.get('view');
      const faculty = urlParams.get('faculty');
      const departmentId = urlParams.get('department');
      const courseId = urlParams.get('course');
      const subjectId = urlParams.get('subject');

      if (view && faculty) {
        try {
          setIsLoading(true);
          
          // Set faculty
          setSelectedFaculty(decodeURIComponent(faculty));
          
          if (view === 'departments') {
            setCurrentView('departments');
            await fetchDepartmentsByFaculty(decodeURIComponent(faculty));
          } else if (view === 'courses' && departmentId) {
            // Need to fetch department data first
            const token = localStorage.getItem('token');
            const deptResponse = await axios.get(
              `${apiURL}/api/departments/${departmentId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (deptResponse.data.success) {
              const department = deptResponse.data.department;
              setSelectedDepartment(department);
              setCurrentView('courses');
              await fetchCoursesByDepartment(parseInt(departmentId));
            }
          } else if (view === 'subjects' && departmentId && courseId) {
            // Fetch department and course data
            const token = localStorage.getItem('token');
            
            const [deptResponse, courseResponse] = await Promise.all([
              axios.get(`${apiURL}/api/departments/${departmentId}`, {
                headers: { Authorization: `Bearer ${token}` }
              }),
              axios.get(`${apiURL}/api/courses/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
              })
            ]);
            
            if (deptResponse.data.success && courseResponse.data.success) {
              setSelectedDepartment(deptResponse.data.department);
              setSelectedCourse(courseResponse.data.course);
              setCurrentView('subjects');
            }
          } else if (view === 'subject-detail' && departmentId && courseId && subjectId) {
            // Fetch department, course, and subject data
            const token = localStorage.getItem('token');
            
            const [deptResponse, courseResponse, subjectResponse] = await Promise.all([
              axios.get(`${apiURL}/api/departments/${departmentId}`, {
                headers: { Authorization: `Bearer ${token}` }
              }),
              axios.get(`${apiURL}/api/courses/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
              }),
              axios.get(`${apiURL}/api/subjects/${subjectId}`, {
                headers: { Authorization: `Bearer ${token}` }
              })
            ]);
            
            if (deptResponse.data.success && courseResponse.data.success && subjectResponse.data.success) {
              setSelectedDepartment(deptResponse.data.department);
              setSelectedCourse(courseResponse.data.course);
              setSelectedSubject(subjectResponse.data.subject);
              setCurrentView('subject-detail');
            }
          }
        } catch (error) {
          console.error('Error initializing from URL:', error);
          // If there's an error, fall back to faculties view
          setCurrentView('faculties');
          setSelectedFaculty(null);
          setSelectedDepartment(null);
          setSelectedCourse(null);
          setSelectedSubject(null);
        } finally {
          setIsLoading(false);
        }
      }
      
      setIsInitialized(true);
    };

    if (!isInitialized) {
      initializeFromURL();
    }
  }, [location.search, isInitialized, apiURL]);

  // Load faculties on component mount
  useEffect(() => {
    if (isInitialized) {
      fetchFaculties();
    }
  }, [isInitialized]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        const { view, faculty, department, course, subject } = event.state;
        setCurrentView(view);
        setSelectedFaculty(faculty);
        setSelectedDepartment(department);
        setSelectedCourse(course);
        setSelectedSubject(subject);
        
        // Load appropriate data based on state
        if (view === 'departments' && faculty) {
          fetchDepartmentsByFaculty(faculty);
        } else if (view === 'courses' && department) {
          fetchCoursesByDepartment(department.department_id);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update browser history when navigation changes
  const updateBrowserHistory = (view: string, faculty: string | null, department: Department | null, course: Course | null, subject: Subject | null) => {
    const state = { view, faculty, department, course, subject };
    const url = `${location.pathname}?view=${view}${faculty ? `&faculty=${encodeURIComponent(faculty)}` : ''}${department ? `&department=${department.department_id}` : ''}${course ? `&course=${course.course_id}` : ''}${subject ? `&subject=${subject.subject_id}` : ''}`;
    
    window.history.pushState(state, '', url);
  };

  // Handle search and pagination for courses
  useEffect(() => {
    let results = courses;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter(
        course =>
          (course.title?.toLowerCase().includes(searchLower) || false) ||
          (course.course_code?.toLowerCase().includes(searchLower) || false) ||
          (course.description?.toLowerCase().includes(searchLower) || false)
      );
    }

    setFilteredCourses(results);
    setTotalPages(Math.ceil(results.length / itemsPerPage));
    setCurrentPage(1);
  }, [searchTerm, courses, itemsPerPage]);

  // API calls
  const fetchFaculties = async () => {
    // Only show loading if we're in faculties view
    if (currentView === 'faculties') {
      setIsLoading(true);
    }
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่');
        return;
      }

      const response = await axios.get(`${apiURL}/api/departments/faculties`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // Count departments for each faculty
        const facultiesWithCount = await Promise.all(
          response.data.faculties.map(async (faculty: string) => {
            try {
              const deptResponse = await axios.get(
                `${apiURL}/api/departments/by-faculty/${encodeURIComponent(faculty)}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              return {
                name: faculty,
                department_count: deptResponse.data.departments?.length || 0
              };
            } catch (error) {
              console.error(`Error fetching departments for faculty ${faculty}:`, error);
              return {
                name: faculty,
                department_count: 0
              };
            }
          })
        );
        setFaculties(facultiesWithCount);
      } else {
        setError('ไม่สามารถดึงข้อมูลคณะได้');
      }
    } catch (error) {
      console.error('Error fetching faculties:', error);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูลคณะ');
    } finally {
      if (currentView === 'faculties') {
        setIsLoading(false);
      }
    }
  };

  const fetchDepartmentsByFaculty = async (faculty: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่');
        return;
      }

      const response = await axios.get(
        `${apiURL}/api/departments/by-faculty/${encodeURIComponent(faculty)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Count courses for each department
        const departmentsWithCount = await Promise.all(
          response.data.departments.map(async (department: Department) => {
            try {
              const coursesResponse = await axios.get(
                `${apiURL}/api/courses?department_id=${department.department_id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              return {
                ...department,
                course_count: coursesResponse.data.courses?.length || 0
              };
            } catch (error) {
              console.error(`Error fetching courses for department ${department.department_id}:`, error);
              return {
                ...department,
                course_count: 0
              };
            }
          })
        );
        setDepartments(departmentsWithCount);
      } else {
        setError('ไม่สามารถดึงข้อมูลสาขาได้');
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูลสาขา');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCoursesByDepartment = async (departmentId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่');
        return;
      }

      const response = await axios.get(
        `${apiURL}/api/courses?department_id=${departmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const formattedCourses: Course[] = response.data.courses.map((course: any) => ({
          course_id: course.course_id,
          course_code: course.course_code || '',
          title: course.title || '',
          description: course.description || '',
          cover_image_path: course.cover_image_path || null,
          cover_image_file_id: course.cover_image_file_id || null,
          video_url: course.video_url || null,
          study_result: course.study_result || null,
          department_name: course.department_name || null,
          faculty: course.faculty || null,
          subject_count: course.subject_count || 0,
          status: course.status || 'draft',
          created_at: course.created_at || new Date().toISOString(),
          updated_at: course.updated_at || new Date().toISOString(),
        }));
        setCourses(formattedCourses);
        setFilteredCourses(formattedCourses);
      } else {
        setError('ไม่สามารถดึงข้อมูลหลักสูตรได้');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูลหลักสูตร');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation handlers
  const handleFacultySelect = (faculty: string) => {
    setSelectedFaculty(faculty);
    setSelectedDepartment(null);
    setSelectedCourse(null);
    setSelectedSubject(null);
    setCurrentView('departments');
    setSearchTerm('');
    updateBrowserHistory('departments', faculty, null, null, null);
    fetchDepartmentsByFaculty(faculty);
  };

  const handleDepartmentSelect = (department: Department) => {
    setSelectedDepartment(department);
    setSelectedCourse(null);
    setSelectedSubject(null);
    setCurrentView('courses');
    setSearchTerm('');
    updateBrowserHistory('courses', selectedFaculty, department, null, null);
    fetchCoursesByDepartment(department.department_id);
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setSelectedSubject(null);
    setCurrentView('subjects');
    setSearchTerm('');
    updateBrowserHistory('subjects', selectedFaculty, selectedDepartment, course, null);
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setCurrentView('subject-detail');
    updateBrowserHistory('subject-detail', selectedFaculty, selectedDepartment, selectedCourse, subject);
  };

  const handleBackToFaculties = () => {
    setCurrentView('faculties');
    setSelectedFaculty(null);
    setSelectedDepartment(null);
    setSelectedCourse(null);
    setSelectedSubject(null);
    setSearchTerm('');
    updateBrowserHistory('faculties', null, null, null, null);
  };

  const handleBackToDepartments = () => {
    setCurrentView('departments');
    setSelectedDepartment(null);
    setSelectedCourse(null);
    setSelectedSubject(null);
    setSearchTerm('');
    updateBrowserHistory('departments', selectedFaculty, null, null, null);
  };

  const handleBackToCourses = () => {
    setCurrentView('courses');
    setSelectedCourse(null);
    setSelectedSubject(null);
    setSearchTerm('');
    updateBrowserHistory('courses', selectedFaculty, selectedDepartment, null, null);
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setCurrentView('subjects');
    updateBrowserHistory('subjects', selectedFaculty, selectedDepartment, selectedCourse, null);
  };

  const handleCourseUpdate = (updatedCourse: Course) => {
    setSelectedCourse(updatedCourse);
    // Update courses list if the updated course is in the current list
    setCourses(prevCourses => 
      prevCourses.map(course => 
        course.course_id === updatedCourse.course_id ? updatedCourse : course
      )
    );
    setFilteredCourses(prevCourses => 
      prevCourses.map(course => 
        course.course_id === updatedCourse.course_id ? updatedCourse : course
      )
    );
  };

  const handleSubjectUpdate = (updatedSubject: Subject) => {
    setSelectedSubject(updatedSubject);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC key to go back
      if (event.key === 'Escape') {
        if (selectedSubject) {
          handleBackToSubjects();
        } else if (currentView === 'subjects') {
          handleBackToCourses();
        } else if (currentView === 'courses') {
          handleBackToDepartments();
        } else if (currentView === 'departments') {
          handleBackToFaculties();
        }
      }
      
      // Ctrl/Cmd + F to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'f' && (currentView === 'courses' || currentView === 'subjects')) {
        event.preventDefault();
        const searchInput = document.querySelector('.search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, selectedSubject]);

  // Auto-save search term to localStorage
  useEffect(() => {
    if (searchTerm) {
      localStorage.setItem(`search_${currentView}`, searchTerm);
    } else {
      localStorage.removeItem(`search_${currentView}`);
    }
  }, [searchTerm, currentView]);

   // Load saved search term
  useEffect(() => {
    const savedSearch = localStorage.getItem(`search_${currentView}`);
    if (savedSearch && currentView === 'courses') {
      setSearchTerm(savedSearch);
    }
  }, [currentView]);

  // Don't render anything until initialized
  if (!isInitialized) {
    return (
      <section className="dashboard__area section-pb-120">
        <div className="container">
          <DashboardBanner />
          <div className="dashboard__inner-wrap">
            <div className="row">
              <DashboardSidebar />
              <div className="dashboard__content-area col-lg-9">
                <div className="dashboard__content-main">
                  <div className="loading-container">
                    <div className="loading-spinner">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">กำลังโหลด...</span>
                      </div>
                      <p className="loading-text">กำลังเตรียมข้อมูล...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard__area section-pb-120">
      <div className="container">
        <DashboardBanner />
        <div className="dashboard__inner-wrap">
          <div className="row">
            <DashboardSidebar />
            <div className="dashboard__content-area col-lg-9">
              <div className="dashboard__content-main">
                
                {/* Navigation Breadcrumb */}
                <NavigationBreadcrumb
                  selectedFaculty={selectedFaculty}
                  selectedDepartment={selectedDepartment}
                  selectedCourse={selectedCourse}
                  selectedSubject={selectedSubject}
                  onFacultyClick={handleBackToFaculties}
                  onDepartmentClick={handleBackToDepartments}
                  onCourseClick={handleBackToCourses}
                  onSubjectClick={handleBackToSubjects}
                />

                {/* Error Display */}
                {error && (
                  <div className="alert alert-danger rounded-3 mb-4" role="alert">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      <div className="flex-grow-1">
                        {error}
                      </div>
                      <button 
                        type="button" 
                        className="btn-close" 
                        aria-label="Close"
                        onClick={() => setError(null)}
                      ></button>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {location.state?.message && (
                  <div className="alert alert-success rounded-3 mb-4" role="alert">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-check-circle me-2"></i>
                      <div className="flex-grow-1">
                        {location.state.message}
                      </div>
                      <button 
                        type="button" 
                        className="btn-close" 
                        aria-label="Close"
                        onClick={() => navigate(location.pathname, { replace: true })}
                      ></button>
                    </div>
                  </div>
                )}

                {/* Content based on current view */}
                {currentView === 'subject-detail' && selectedSubject && selectedCourse ? (
                  <AdminSubjectArea 
                    subjectId={selectedSubject.subject_id}
                    courseData={selectedCourse}
                    onSubjectUpdate={handleSubjectUpdate}
                    onBack={handleBackToSubjects}
                  />
                ) : currentView === 'subjects' && selectedCourse ? (
                  <EditableCourseDetail
                    course={selectedCourse}
                    onBack={handleBackToCourses}
                    onSubjectSelect={handleSubjectSelect}
                    onCourseUpdate={handleCourseUpdate}
                  />
                ) : currentView === 'courses' && selectedDepartment ? (
                  <CourseList
                    courses={currentItems}
                    isLoading={isLoading}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onCourseSelect={handleCourseSelect}
                    onAddCourse={handleAddCourse}
                    selectedDepartment={selectedDepartment}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    indexOfFirstItem={indexOfFirstItem}
                  />
                ) : currentView === 'departments' && selectedFaculty ? (
                  <DepartmentSelection
                    departments={departments}
                    isLoading={isLoading}
                    selectedFaculty={selectedFaculty}
                    onSelectDepartment={handleDepartmentSelect}
                  />
                ) : (
                  <FacultySelection
                    faculties={faculties}
                    isLoading={isLoading}
                    onSelectFaculty={handleFacultySelect}
                  />
                )}

                {/* Loading Overlay */}
                {isLoading && (
                  <div className="loading-overlay">
                    <div className="loading-spinner-overlay">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">กำลังโหลด...</span>
                      </div>
                      <p className="loading-text-overlay">กำลังโหลดข้อมูล...</p>
                    </div>
                  </div>
                )}

                {/* Keyboard Shortcuts Help */}
                <div className="keyboard-shortcuts-help">
                  <div className="collapse" id="keyboardShortcuts">
                    <div className="shortcuts-content">
                      <h6>คีย์บอร์ดลัด</h6>
                      <ul>
                        <li><kbd>Esc</kbd> - ย้อนกลับ</li>
                        <li><kbd>Ctrl</kbd> + <kbd>F</kbd> - ค้นหา</li>
                        <li><kbd>←</kbd> <kbd>→</kbd> - เปลี่ยนหน้า</li>
                      </ul>
                    </div>
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

export default AdminCreditbankArea;


