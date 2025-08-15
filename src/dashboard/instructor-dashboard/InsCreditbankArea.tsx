import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import DashboardBanner from "../dashboard-common/DashboardBanner";
import DashboardSidebar from "../dashboard-common/DashboardSidebar";
import AdminSubjectArea from "../admin-creditbank/AdminSubjectArea";
import "../admin-creditbank/mega.css";

// เพิ่ม interface สำหรับ Faculty ใหม่
interface FacultyWithStats {
  faculty_id?: number;
  name: string;
  department_count: number;
  total_courses: number;
  description?: string;
  created_at?: string;
  is_home_faculty?: boolean;
}

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

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// ลบ Add Faculty Card Component - อาจารย์ไม่มีสิทธิ์สร้างคณะใหม่

// ลบ Add Department Card Component - อาจารย์ไม่มีสิทธิ์สร้างสาขาใหม่

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

// Enhanced Faculty selection component - แสดงเฉพาะการเลือก ไม่มีการเพิ่ม/แก้ไข/ลบ
const FacultySelection: React.FC<{
  faculties: FacultyWithStats[];
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

  // ลบ handleDeleteFaculty - อาจารย์ไม่มีสิทธิ์ลบคณะ

  return (
    <div className="selection-container">
      <div className="section-header">
        <div className="section-icon">
          <i className="fas fa-university"></i>
        </div>
        <div className="section-title">
          <h2>เลือกคณะ</h2>
          <p>คณะที่ท่านสังกัดและมีการสอนรายวิชา</p>
        </div>
      </div>
      
      <div className="cards-grid">
        {/* ลบ Add Faculty Card - อาจารย์ไม่มีสิทธิ์เพิ่มคณะ */}
        
        {faculties.map((faculty, index) => (
          <div key={`faculty-${index}`} className={`selection-card faculty-card ${faculty.is_home_faculty ? 'home-faculty' : ''}`}>
            <div 
              className="card-content"
              onClick={() => onSelectFaculty(faculty.name)}
            >
              <div className="card-icon faculty-icon">
                <i className={`fas ${faculty.is_home_faculty ? 'fa-home' : 'fa-university'}`}></i>
              </div>
              <div className="card-body">
                <h3 className="card-title">
                  {faculty.name}
                  {faculty.is_home_faculty && (
                    <span className="home-badge ms-2">
                      <i className="fas fa-star me-1"></i>
                    </span>
                  )}
                </h3>
                <div className="card-stats">
                  <span className="stat-item">
                    <i className="fas fa-building me-1"></i>
                    {faculty.department_count} สาขา
                  </span>
                  <span className="stat-item">
                    <i className="fas fa-graduation-cap me-1"></i>
                    {faculty.total_courses} หลักสูตร
                  </span>
                </div>
              </div>
              <div className="card-arrow">
                <i className="fas fa-arrow-right"></i>
              </div>
            </div>
            
            {/* ลบ Action buttons - อาจารย์ไม่มีสิทธิ์แก้ไข/ลบคณะ */}
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Department selection component - แสดงเฉพาะการเลือก ไม่มีการเพิ่ม/แก้ไข/ลบ
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

  // ลบ handleDeleteDepartment - อาจารย์ไม่มีสิทธิ์ลบสาขา

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
        {/* ลบ Add Department Card - อาจารย์ไม่มีสิทธิ์เพิ่มสาขา */}
        
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
            
            {/* ลบ Action buttons - อาจารย์ไม่มีสิทธิ์แก้ไข/ลบสาขา */}
          </div>
        ))}
      </div>
    </div>
  );
};



// Course List component - ลบการสร้างหลักสูตรใหม่สำหรับอาจารย์
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
        {/* ลบ Add Course Card - อาจารย์ไม่มีสิทธิ์สร้างหลักสูตรใหม่ */}
        
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

// Add Subject Card Component - ลบสำหรับอาจารย์
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

// Editable Course Detail component - ลบการแก้ไขสำหรับอาจารย์
const EditableCourseDetail: React.FC<{
  course: Course;
  onBack: () => void;
  onSubjectSelect: (subject: Subject) => void;
  onCourseUpdate: (updatedCourse: Course) => void;
}> = ({ course, onSubjectSelect }) => {
  const apiURL = import.meta.env.VITE_API_URL;
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  const getCourseImageUrl = (course: Course): string => {
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
    window.location.href = `/instructor-subjects/create-new?course_id=${course.course_id}`;
  };

  const handleDeleteSubject = async (subject: Subject) => {
    if (!window.confirm(`คุณต้องการลบรายวิชา "${subject.subject_name}" ใช่หรือไม่?\n\nการดำเนินการนี้ไม่สามารถยกเลิกได้`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${apiURL}/api/courses/subjects/${subject.subject_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Remove deleted subject from state
        const updatedSubjects = subjects.filter(s => s.subject_id !== subject.subject_id);
        setSubjects(updatedSubjects);
        setFilteredSubjects(updatedSubjects);
        
        alert('ลบรายวิชาสำเร็จ');
      } else {
        alert('ไม่สามารถลบรายวิชาได้: ' + (response.data.message || 'เกิดข้อผิดพลาด'));
      }
    } catch (error: any) {
      console.error('Error deleting subject:', error);
      
      if (error.response?.status === 400) {
        alert('ไม่สามารถลบรายวิชาได้: มีข้อมูลที่เกี่ยวข้องอยู่ กรุณาลบข้อมูลที่เกี่ยวข้องก่อน');
      } else if (error.response?.status === 403) {
        alert('คุณไม่มีสิทธิ์ลบรายวิชานี้');
      } else if (error.response?.status === 404) {
        alert('ไม่พบรายวิชาที่ต้องการลบ');
      } else {
        alert('เกิดข้อผิดพลาดในการลบรายวิชา: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div className="course-detail-container">
      <div className="course-detail-header">
        <div className="course-header-content">
          <div className="course-image-section">
            <div className="course-image-container">
              <img
                src={getCourseImageUrl(course)}
                alt={course.title}
                className="course-detail-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x250.png?text=ไม่มีรูปภาพ';
                }}
              />
            </div>
          </div>
          <div className="course-info-section">
            <div className="course-header-top">
              <h1 className="course-detail-title">{course.title}</h1>
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

            {/* ลบ Edit Controls - อาจารย์ไม่มีสิทธิ์แก้ไขหลักสูตร */}

            {/* Course Description */}
            <div className="course-description-section">
              <h3>รายละเอียดหลักสูตร</h3>
              <div className="course-description">
                {course.description || 'ไม่มีรายละเอียด'}
              </div>
            </div>

            {/* Study Result */}
            <div className="study-result-section">
              <h3>ผลลัพธ์การเรียนรู้</h3>
              <div className="study-result">
                {course.study_result || 'ไม่มีข้อมูลผลลัพธ์การเรียนรู้'}
              </div>
            </div>

            {/* Video URL */}
            <div className="course-video-section">
              <h3>วิดีโอแนะนำหลักสูตร</h3>
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
            {/* เพิ่มปุ่มสร้างรายวิชาใหม่สำหรับอาจารย์ */}
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
                  <div className="subject-card-actions">
                    <button
                      className="btn btn-sm btn-outline-danger subject-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSubject(subject);
                      }}
                      title="ลบรายวิชา"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                    <div className="subject-status">
                      <span className={`status-dot ${subject.status}`}></span>
                    </div>
                  </div>
                </div>
                
                <div 
                  className="subject-card-image clickable"
                  onClick={() => onSubjectSelect(subject)}
                >
                  <img
                    src={subject.cover_image_file_id 
                      ? `${apiURL}/api/courses/image/${subject.cover_image_file_id}`
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
                    <h3 
                      className="subject-title clickable"
                      onClick={() => onSubjectSelect(subject)}
                      title="คลิกเพื่อเข้าสู่รายวิชา"
                    >
                      {subject.subject_name}
                    </h3>
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
                
                <div className="subject-card-footer d-flex justify-content-center align-items-center pt-3">
                  <button
                    className="btn btn-primary btn-sm d-flex align-items-center w-100"
                    onClick={() => onSubjectSelect(subject)}
                  >
                    <i className="fas fa-arrow-right me-2"></i>
                    เข้าสู่รายวิชา
                  </button>
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

// Main InsCreditbankArea component
const InsCreditbankArea: React.FC = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [currentView, setCurrentView] = useState<'faculties' | 'departments' | 'courses' | 'subjects' | 'subject-detail'>('faculties');
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  
  // Data states - เปลี่ยนเป็น FacultyWithStats
  const [faculties, setFaculties] = useState<FacultyWithStats[]>([]);
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

  // ลบ Modal states - อาจารย์ไม่มีสิทธิ์ CRUD คณะและสาขา

  const handleAddCourse = () => {
    if (selectedDepartment) {
      navigate(`/ins-creditbank/create-new?department_id=${selectedDepartment.department_id}`);
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

      console.log('Initializing from URL:', { view, faculty, departmentId, courseId, subjectId });

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
            
            console.log('Fetching data for subject-detail view...');
            
            try {
              const [deptResponse, courseResponse, subjectResponse] = await Promise.all([
                axios.get(`${apiURL}/api/departments/${departmentId}`, {
                  headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${apiURL}/api/courses/${courseId}`, {
                  headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${apiURL}/api/courses/subjects/${subjectId}`, {
                  headers: { Authorization: `Bearer ${token}` }
                })
              ]);
              
              console.log('API Responses:', {
                dept: deptResponse.data,
                course: courseResponse.data,
                subject: subjectResponse.data
              });
              
              if (deptResponse.data.success && courseResponse.data.success && subjectResponse.data.success) {
                const department = deptResponse.data.department;
                const course = courseResponse.data.course;
                const subject = subjectResponse.data.subject;
                
                // Map subject data properly
                const mappedSubject: Subject = {
                  subject_id: subject.subject_id,
                  subject_code: subject.subject_code || '',
                  subject_name: subject.subject_name || subject.title || '',
                  description: subject.description || '',
                  credits: subject.credits || 0,
                  cover_image: subject.cover_image,
                  cover_image_file_id: subject.cover_image_file_id,
                  video_url: subject.video_url,
                  status: subject.status || 'active',
                  lesson_count: subject.lesson_count || 0,
                  quiz_count: subject.quiz_count || 0,
                  instructors: subject.instructors || [],
                  prerequisites: subject.prerequisites || [],
                  pre_test: subject.pre_test || subject.preTest || null,
                  post_test: subject.post_test || subject.postTest || null,
                  order_number: subject.order_number || 0,
                  lessons: subject.lessons || []
                };
                
                setSelectedDepartment(department);
                setSelectedCourse(course);
                setSelectedSubject(mappedSubject);
                setCurrentView('subject-detail');
                
                console.log('Successfully set subject-detail view');
              } else {
                console.error('API responses not successful');
                throw new Error('Failed to fetch required data');
              }
            } catch (error) {
              console.error('Error fetching data for subject-detail:', error);
              // ถ้าเกิดข้อผิดพลาด ให้กลับไปหน้า faculties
              setCurrentView('faculties');
              setSelectedFaculty(null);
              setSelectedDepartment(null);
              setSelectedCourse(null);
              setSelectedSubject(null);
              setError('ไม่สามารถโหลดข้อมูลรายวิชาได้');
            }
          } else {
            console.log('Conditions not met, going to faculties');
            setCurrentView('faculties');
          }
        } catch (error) {
          console.error('Error initializing from URL:', error);
          // If there's an error, fall back to faculties view
          setCurrentView('faculties');
          setSelectedFaculty(null);
          setSelectedDepartment(null);
          setSelectedCourse(null);
          setSelectedSubject(null);
          setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log('No view or faculty in URL, going to faculties');
        // ถ้าไม่มี parameters ให้ไปหน้า faculties
        setCurrentView('faculties');
        setIsLoading(false);
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

  // API calls - แก้ไข fetchFaculties ให้แสดงเฉพาะคณะที่อาจารย์สังกัด พร้อมข้อมูลสถิติ
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

      // ดึงข้อมูลอาจารย์และคณะที่สังกัด
      const userDataStr = localStorage.getItem('user');
      let instructorFaculty = null;
      let allInstructorSubjectFaculties = new Set<string>();

      console.log('=== DEBUG: Fetching instructor faculty info ===');
      console.log('userDataStr:', userDataStr);

      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        console.log('userData:', userData);
        
        if (userData.id) {
          try {
            console.log('Fetching instructor data for user_id:', userData.id);
            
            // ดึงข้อมูลอาจารย์
            const instructorResponse = await axios.get(
              `${apiURL}/api/accounts/instructors/user/${userData.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            console.log('Instructor response:', instructorResponse.data);
            
            if (instructorResponse.data.success) {
              const instructor = instructorResponse.data.instructor;
              console.log('Instructor data:', instructor);
              
              // ดึงคณะหลักของอาจารย์
              if (instructor.department) {
                console.log('Instructor department ID:', instructor.department);
                
                const departmentResponse = await axios.get(
                  `${apiURL}/api/auth/departments`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                
                console.log('Departments response:', departmentResponse.data);
                console.log('Looking for department_id:', instructor.department, 'type:', typeof instructor.department);
                
                if (departmentResponse.data.success) {
                  console.log('Available departments:', departmentResponse.data.departments.map((d: any) => ({
                    id: d.department_id,
                    name: d.department_name,
                    faculty: d.faculty,
                    type: typeof d.department_id
                  })));
                  
                  const department = departmentResponse.data.departments.find(
                    (dept: any) => dept.department_id === instructor.department
                  );
                  
                  console.log('Found instructor department:', department);
                  
                  if (department) {
                    instructorFaculty = department.faculty;
                    allInstructorSubjectFaculties.add(department.faculty);
                    console.log('Added instructor home faculty:', department.faculty);
                  }
                }
              }

              // ใช้ API ที่ดึงรายวิชาที่อาจารย์สอนโดยตรง
              try {
                const subjectsResponse = await axios.get(
                  `${apiURL}/api/courses/subjects/instructors/cou`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                
                console.log('Instructor subjects response:', subjectsResponse.data);
                
                if (subjectsResponse.data.success && subjectsResponse.data.courses) {
                  const departmentResponse = await axios.get(
                    `${apiURL}/api/auth/departments`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  
                  if (departmentResponse.data.success) {
                    const departments = departmentResponse.data.departments;
                    
                    // ดึงคณะจากรายวิชาที่อาจารย์สอน
                    for (const subject of subjectsResponse.data.courses) {
                      if (subject.department_id) {
                        const subjectDept = departments.find(
                          (dept: any) => dept.department_id === subject.department_id
                        );
                        if (subjectDept && subjectDept.faculty) {
                          allInstructorSubjectFaculties.add(subjectDept.faculty);
                          console.log('Added subject faculty:', subjectDept.faculty, 'from subject:', subject.subject_name);
                        }
                      }
                    }
                  }
                }
              } catch (error) {
                console.log("Could not fetch instructor subjects:", error);
              }
            }
          } catch (error) {
            console.log("Could not fetch instructor info:", error);
          }
        }
      }

      console.log('=== DEBUG FINAL RESULTS ===');
      console.log('Final instructor faculty:', instructorFaculty);
      console.log('All instructor subject faculties SET:', allInstructorSubjectFaculties);
      console.log('All instructor subject faculties ARRAY:', Array.from(allInstructorSubjectFaculties));
      console.log('SET SIZE:', allInstructorSubjectFaculties.size);

      // ดึงข้อมูลคณะทั้งหมด
      const response = await axios.get(`${apiURL}/api/departments/faculties`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // กรองเฉพาะคณะที่อาจารย์เกี่ยวข้อง
        const relevantFaculties = Array.from(allInstructorSubjectFaculties);
        
        console.log('Relevant faculties:', relevantFaculties);
        console.log('All faculties from API:', response.data.faculties);
        
        // ถ้าไม่มีคณะที่เกี่ยวข้อง ให้แสดงทั้งหมด (fallback)
        const facultiesToProcess = relevantFaculties.length > 0 ? relevantFaculties : response.data.faculties;
        
        console.log('Faculties to process:', facultiesToProcess);

        // Count departments and courses for each relevant faculty
        const facultiesWithStats = await Promise.all(
          facultiesToProcess.map(async (faculty: string) => {
            try {
              const deptResponse = await axios.get(
                `${apiURL}/api/departments/by-faculty/${encodeURIComponent(faculty)}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              let totalCourses = 0;
              if (deptResponse.data.success && deptResponse.data.departments) {
                // Count courses for each department
                const coursePromises = deptResponse.data.departments.map(async (dept: Department) => {
                  try {
                    const coursesResponse = await axios.get(
                      `${apiURL}/api/courses?department_id=${dept.department_id}`,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    return coursesResponse.data.courses?.length || 0;
                  } catch (error) {
                    console.error(`Error fetching courses for department ${dept.department_id}:`, error);
                    return 0;
                  }
                });
                
                const courseCounts = await Promise.all(coursePromises);
                totalCourses = courseCounts.reduce((sum, count) => sum + count, 0);
              }
              
              return {
                name: faculty,
                department_count: deptResponse.data.departments?.length || 0,
                total_courses: totalCourses,
                is_home_faculty: faculty === instructorFaculty // เพิ่ม flag สำหรับคณะหลัก
              };
            } catch (error) {
              console.error(`Error fetching departments for faculty ${faculty}:`, error);
              return {
                name: faculty,
                department_count: 0,
                total_courses: 0,
                is_home_faculty: faculty === instructorFaculty
              };
            }
          })
        );

        // เรียงลำดับ: คณะหลักก่อน แล้วเรียงตามชื่อ
        facultiesWithStats.sort((a, b) => {
          if (a.is_home_faculty && !b.is_home_faculty) return -1;
          if (!a.is_home_faculty && b.is_home_faculty) return 1;
          return a.name.localeCompare(b.name, 'th');
        });

        setFaculties(facultiesWithStats);
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

  // ลบ Faculty CRUD operations - อาจารย์ไม่มีสิทธิ์ CRUD คณะ

  // ลบ Department CRUD operations - อาจารย์ไม่มีสิทธิ์ CRUD สาขา

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

      {/* ลบ Modals - อาจารย์ไม่มีสิทธิ์ CRUD คณะและสาขา */}
    </section>
  );
};

export default InsCreditbankArea;
