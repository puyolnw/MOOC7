import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import DashboardSidebar from "../dashboard-common/AdminSidebar";
import DashboardBanner from "../dashboard-common/AdminBanner";
import "./main.css";

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
  lessons?: Lesson[]; // เพิ่ม lessons
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

// Course List component
const CourseList: React.FC<{
  courses: Course[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCourseSelect: (course: Course) => void;
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
        <Link 
          to="/admin-creditbank/create-new" 
          className="add-course-btn"
        >
          <i className="fas fa-plus me-2"></i>
          เพิ่มหลักสูตรใหม่
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="no-courses">
          <div className="no-courses-icon">
            <i className="fas fa-book-open"></i>
          </div>
          <h3>ไม่พบหลักสูตร</h3>
          <p>
            {searchTerm 
              ? 'ไม่พบหลักสูตรที่ตรงกับเงื่อนไขการค้นหา' 
              : 'ยังไม่มีหลักสูตรในสาขานี้'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="courses-grid">
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
                <div className="course-card-footer">
                  <div className="course-actions">
                    <Link
                      to={`/admin-creditbank/edit-course/${course.course_id}`}
                      className="action-btn edit-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <i className="fas fa-edit me-1"></i>
                      แก้ไข
                    </Link>
                    <button 
                      className="action-btn view-btn"
                      onClick={() => onCourseSelect(course)}
                    >
                      <i className="fas fa-eye me-1"></i>
                      ดูรายละเอียด
                    </button>
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
        </>
      )}
    </div>
  );
};

// Subject Detail component with lessons
const SubjectDetail: React.FC<{
  subject: Subject;
  course: Course;
  onBack: () => void;
}> = ({ subject}) => {
  const apiURL = import.meta.env.VITE_API_URL;
  const [activeTab, setActiveTab] = useState('overview');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  // ดึงข้อมูล lessons เมื่อเปิด tab lessons
  useEffect(() => {
    if (activeTab === 'lessons') {
      fetchLessons();
    }
  }, [activeTab, subject.subject_id]);

  const fetchLessons = async () => {
    setLessonsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${apiURL}/api/courses/subjects/${subject.subject_id}/lessons`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setLessons(response.data.lessons || []);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setLessons([]);
    } finally {
      setLessonsLoading(false);
    }
  };

  // ฟังก์ชันสำหรับแสดงรูปภาพ subject (ตามตัวอย่างใน SubjectDetailsArea.tsx)
  const getSubjectImageUrl = (subject: Subject): string => {
    if (subject.cover_image_file_id) {
      return `${apiURL}/api/courses/subjects/image/${subject.cover_image_file_id}`;
    }
    if (subject.cover_image && typeof subject.cover_image === 'string' && subject.cover_image.trim() !== '') {
      // ตรวจสอบว่าเป็น Google Drive URL หรือไม่
      const fileIdMatch = subject.cover_image.match(/\/d\/(.+?)\//);
      if (fileIdMatch && fileIdMatch[1]) {
        return `${apiURL}/api/courses/subjects/image/${fileIdMatch[1]}`;
      }
      // ถ้าเป็น URL ปกติ
      if (subject.cover_image.startsWith('http')) {
        return subject.cover_image;
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

  return (
    <div className="subject-detail-container">
      <div className="subject-detail-header">
        <div className="subject-header-content">
          <div className="subject-image-section">
            <div className="subject-image-container">
              <img
                src={getSubjectImageUrl(subject)}
                alt={subject.subject_name}
                className="subject-detail-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x250.png?text=ไม่มีรูปภาพ';
                }}
              />
            </div>
          </div>
          <div className="subject-info-section">
            <div className="subject-header-top">
              <h1 className="subject-detail-title">{subject.subject_name}</h1>
              <div className="subject-badges">
                <span className="subject-code-badge">{subject.subject_code}</span>
              </div>
            </div>
            <div className="subject-meta">
              <div className="meta-item">
                <i className="fas fa-graduation-cap me-2"></i>
                <span>{subject.credits} หน่วยกิต</span>
              </div>
              <div className="meta-item">
                <i className="fas fa-book me-2"></i>
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
            {subject.description && (
              <div className="subject-description-section">
                <h3>รายละเอียดรายวิชา</h3>
                <div className="subject-description">
                  {subject.description}
                </div>
              </div>
            )}
            {subject.video_url && (
              <div className="subject-video-section">
                <h3>วิดีโอแนะนำรายวิชา</h3>
                <div className="ratio ratio-16x9">
                  <iframe
                    src={getVideoEmbedUrl(subject.video_url)}
                    title={`วิดีโอแนะนำ ${subject.subject_name}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-2"
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="subject-detail-tabs">
        <div className="tabs-header">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-info-circle"></i>
            <span>ภาพรวม</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'lessons' ? 'active' : ''}`}
            onClick={() => setActiveTab('lessons')}
          >
            <i className="fas fa-play-circle"></i>
            <span>บทเรียน</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'instructors' ? 'active' : ''}`}
            onClick={() => setActiveTab('instructors')}
          >
            <i className="fas fa-chalkboard-teacher"></i>
            <span>อาจารย์ผู้สอน</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'tests' ? 'active' : ''}`}
            onClick={() => setActiveTab('tests')}
          >
            <i className="fas fa-clipboard-check"></i>
            <span>แบบทดสอบ</span>
          </button>
        </div>

        <div className="tabs-content">
          {activeTab === 'overview' && (
            <div className="tab-panel overview-panel">
              <div className="overview-grid">
                <div className="overview-card">
                  <div className="card-icon">
                    <i className="fas fa-chart-bar"></i>
                  </div>
                  <h3>สถิติรายวิชา</h3>
                  <div className="stats-list">
                    <div className="stat-row">
                      <span>จำนวนบทเรียน</span>
                      <strong>{lessons.length} บทเรียน</strong>
                    </div>
                    <div className="stat-row">
                      <span>จำนวนแบบทดสอบ</span>
                      <strong>{subject.quiz_count} แบบทดสอบ</strong>
                    </div>
                    <div className="stat-row">
                      <span>หน่วยกิต</span>
                      <strong>{subject.credits} หน่วยกิต</strong>
                    </div>
                    <div className="stat-row">
                      <span>สถานะ</span>
                      <strong>
                        <span className={`status ${subject.status}`}>
                          {subject.status === 'active' ? 'เปิดใช้งาน' : 
                           subject.status === 'inactive' ? 'ปิดใช้งาน' : 'ร่าง'}
                        </span>
                      </strong>
                    </div>
                  </div>
                </div>

                {subject.prerequisites && subject.prerequisites.length > 0 && (
                  <div className="overview-card">
                    <div className="card-icon">
                      <i className="fas fa-link"></i>
                    </div>
                    <h3>รายวิชาที่ต้องเรียนก่อน</h3>
                    <div className="prerequisites-list">
                      {subject.prerequisites.map((prereq) => (
                        <div key={prereq.subject_id} className="prerequisite-item">
                          <span className="prereq-code">{prereq.subject_code}</span>
                          <span className="prereq-name">{prereq.subject_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="overview-card">
                  <div className="card-icon">
                    <i className="fas fa-clipboard-list"></i>
                  </div>
                  <h3>แบบทดสอบ</h3>
                  <div className="tests-overview">
                    <div className={`test-item pre-test ${!subject.pre_test ? 'disabled' : ''}`}>
                      <i className="fas fa-play-circle"></i>
                      <div className="test-info">
                        <strong>Pre-test</strong>
                        <span>
                          {subject.pre_test ? subject.pre_test.title : 'ไม่มีแบบทดสอบก่อนเรียน'}
                        </span>
                      </div>
                    </div>
                    <div className={`test-item post-test ${!subject.post_test ? 'disabled' : ''}`}>
                      <i className="fas fa-stop-circle"></i>
                      <div className="test-info">
                        <strong>Post-test</strong>
                        <span>
                          {subject.post_test ? subject.post_test.title : 'ไม่มีแบบทดสอบหลังเรียน'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lessons' && (
            <div className="tab-panel lessons-panel">
              <div className="lessons-header">
                <h3>บทเรียนทั้งหมด</h3>
                <p>รายการบทเรียนในรายวิชา {subject.subject_name}</p>
              </div>
              
              {lessonsLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">กำลังโหลด...</span>
                    </div>
 <p className="loading-text">กำลังโหลดบทเรียน...</p>
                  </div>
                </div>
              ) : lessons.length === 0 ? (
                <div className="no-lessons">
                  <div className="no-lessons-icon">
                    <i className="fas fa-play-circle"></i>
                  </div>
                  <h4>ไม่มีบทเรียน</h4>
                  <p>ยังไม่มีบทเรียนในรายวิชานี้</p>
                </div>
              ) : (
                <div className="lessons-list">
                  {lessons.map((lesson, index) => (
                    <div key={`lesson-${lesson.lesson_id}`} className="lesson-item">
                      <div className="lesson-number">
                        <span>{index + 1}</span>
                      </div>
                      <div className="lesson-content">
                        <div className="lesson-header">
                          <h4 className="lesson-title">{lesson.title}</h4>
                          <div className="lesson-badges">
                            <span className={`status-badge ${lesson.status}`}>
                              {lesson.status === 'active' ? 'เปิดใช้งาน' : 
                               lesson.status === 'inactive' ? 'ปิดใช้งาน' : 'ร่าง'}
                            </span>
                          </div>
                        </div>
                        {lesson.description && (
                          <p className="lesson-description">{lesson.description}</p>
                        )}
                        <div className="lesson-meta">
                          <div className="meta-item">
                            <i className="fas fa-calendar me-1"></i>
                            <span>สร้างเมื่อ {new Date(lesson.created_at).toLocaleDateString('th-TH')}</span>
                          </div>
                          {lesson.video_url && (
                            <div className="meta-item">
                              <i className="fas fa-video me-1"></i>
                              <span>มีวิดีโอ</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="lesson-actions">
                        <Link
                          to={`/admin-lessons/edit/${lesson.lesson_id}`}
                          className="action-btn edit-btn"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>
                        <button className="action-btn view-btn">
                          <i className="fas fa-eye"></i>
                        </button>
                      </div>
                    </div>
                  ))}
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
                <div className="no-instructors">
                  <div className="no-instructors-icon">
                    <i className="fas fa-chalkboard-teacher"></i>
                  </div>
                  <h4>ไม่มีอาจารย์ผู้สอน</h4>
                  <p>ยังไม่มีการกำหนดอาจารย์ผู้สอนสำหรับรายวิชานี้</p>
                </div>
              ) : (
                <div className="instructors-grid">
                  {subject.instructors.map((instructor) => (
                    <div key={`instructor-${instructor.instructor_id}`} className="instructor-card">
                      <div className="instructor-avatar">
                        <img
                          src={instructor.avatar_file_id 
                            ? `${apiURL}/api/accounts/instructors/avatar/${instructor.avatar_file_id}`
                            : 'https://via.placeholder.com/100x100.png?text=ไม่มีรูป'
                          }
                          alt={instructor.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100.png?text=ไม่มีรูป';
                          }}
                        />
                      </div>
                      <div className="instructor-info">
                        <h4 className="instructor-name">{instructor.name}</h4>
                        <p className="instructor-position">{instructor.position}</p>
                        {instructor.ranking_name && (
                          <p className="instructor-ranking">{instructor.ranking_name}</p>
                        )}
                        {instructor.description && (
                          <p className="instructor-description">
                            {instructor.description.length > 100 
                              ? `${instructor.description.substring(0, 100)}...`
                              : instructor.description
                            }
                          </p>
                        )}
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
                <div className={`test-card pre-test ${!subject.pre_test ? 'disabled' : ''}`}>
                  <div className="test-card-header">
                    <div className={`test-icon pre-test ${!subject.pre_test ? 'disabled' : ''}`}>
                      <i className="fas fa-play-circle"></i>
                    </div>
                    <div className="test-title">
                      <h4>แบบทดสอบก่อนเรียน (Pre-test)</h4>
                      <p>ทดสอบความรู้พื้นฐานก่อนเริ่มเรียน</p>
                    </div>
                  </div>
                  {subject.pre_test ? (
                    <div className="test-details">
                      <div className="detail-item">
                        <span>ชื่อแบบทดสอบ</span>
                        <span>{subject.pre_test.title}</span>
                      </div>
                      <div className="detail-item">
                        <span>คำอธิบาย</span>
                        <span>{subject.pre_test.description || '-'}</span>
                      </div>
                      <div className="detail-item">
                        <span>คะแนนผ่าน</span>
                        <span>
                          {subject.pre_test.passing_score_enabled 
                            ? `${subject.pre_test.passing_score_value} คะแนน`
                            : 'ไม่กำหนด'
                          }
                        </span>
                      </div>
                      <div className="detail-item">
                        <span>สถานะ</span>
                        <span className={`status ${subject.pre_test.status}`}>
                          {subject.pre_test.status === 'active' ? 'เปิดใช้งาน' : 
                           subject.pre_test.status === 'inactive' ? 'ปิดใช้งาน' : 'ร่าง'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="no-test">
                      <i className="fas fa-exclamation-circle"></i>
                      <p>ไม่มีแบบทดสอบก่อนเรียน</p>
                    </div>
                  )}
                </div>

                <div className={`test-card post-test ${!subject.post_test ? 'disabled' : ''}`}>
                  <div className="test-card-header">
                    <div className={`test-icon post-test ${!subject.post_test ? 'disabled' : ''}`}>
                      <i className="fas fa-stop-circle"></i>
                    </div>
                    <div className="test-title">
                      <h4>แบบทดสอบหลังเรียน (Post-test)</h4>
                      <p>ทดสอบความรู้หลังจากเรียนจบ</p>
                    </div>
                  </div>
                  {subject.post_test ? (
                    <div className="test-details">
                      <div className="detail-item">
                        <span>ชื่อแบบทดสอบ</span>
                        <span>{subject.post_test.title}</span>
                      </div>
                      <div className="detail-item">
                        <span>คำอธิบาย</span>
                        <span>{subject.post_test.description || '-'}</span>
                      </div>
                      <div className="detail-item">
                        <span>คะแนนผ่าน</span>
                        <span>
                          {subject.post_test.passing_score_enabled 
                            ? `${subject.post_test.passing_score_value} คะแนน`
                            : 'ไม่กำหนด'
                          }
                        </span>
                      </div>
                      <div className="detail-item">
                        <span>สถานะ</span>
                        <span className={`status ${subject.post_test.status}`}>
                          {subject.post_test.status === 'active' ? 'เปิดใช้งาน' : 
                           subject.post_test.status === 'inactive' ? 'ปิดใช้งาน' : 'ร่าง'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="no-test">
                      <i className="fas fa-exclamation-circle"></i>
                      <p>ไม่มีแบบทดสอบหลังเรียน</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Course Detail component
const CourseDetail: React.FC<{
  course: Course;
  onBack: () => void;
  onSubjectSelect: (subject: Subject) => void;
}> = ({ course, onSubjectSelect }) => {
  const apiURL = import.meta.env.VITE_API_URL;
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);

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
            {course.description && (
              <div className="course-description-section">
                <h3>รายละเอียดหลักสูตร</h3>
                <div className="course-description">
                  {course.description}
                </div>
              </div>
            )}
            {course.study_result && (
              <div className="study-result-section">
                <h3>ผลลัพธ์การเรียนรู้</h3>
                <div className="study-result">
                  {course.study_result}
                </div>
              </div>
            )}
            {course.video_url && (
              <div className="course-video-section">
                <h3>วิดีโอแนะนำหลักสูตร</h3>
                <div className="ratio ratio-16x9">
                  <iframe
                    src={getVideoEmbedUrl(course.video_url)}
                    title={`วิดีโอแนะนำ ${course.title}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-2"
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
            <Link 
              to={`/admin-subjects/create-new?course_id=${course.course_id}`} 
              className="add-subject-btn"
            >
              <i className="fas fa-plus me-2"></i>
              เพิ่มรายวิชาใหม่
            </Link>
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
        ) : filteredSubjects.length === 0 ? (
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
        ) : (
          <div className="subjects-grid">
            {filteredSubjects.map((subject, index) => (
              <div 
                key={`subject-${subject.subject_id}-${index}`} 
                className="subject-card"
                onClick={() => onSubjectSelect(subject)}
              >
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
                  <div className="subject-card-overlay">
                    <div className="subject-order">
                      <span className="order-badge">#{subject.order_number || index + 1}</span>
                    </div>
                    <div className="subject-status">
                      <span className={`status-badge ${subject.status}`}>
                        {subject.status === 'active' ? 'เปิดใช้งาน' : 
                         subject.status === 'inactive' ? 'ปิดใช้งาน' : 'ร่าง'}
                      </span>
                    </div>
                  </div>
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
                      <i className="fas fa-graduation-cap me-1"></i>
                      <span>{subject.credits} หน่วยกิต</span>
                    </div>
                    <div className="stat-group">
                      <i className="fas fa-play-circle me-1"></i>
                      <span>{subject.lesson_count || 0} บทเรียน</span>
                    </div>
                    <div className="stat-group">
                      <i className="fas fa-question-circle me-1"></i>
                      <span>{subject.quiz_count || 0} แบบทดสอบ</span>
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
                <div className="subject-card-footer">
                  <div className="subject-actions">
                    <Link
                      to={`/admin-subjects/edit/${subject.subject_id}`}
                      className="action-btn edit-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <i className="fas fa-edit me-1"></i>
                      แก้ไข
                    </Link>
                    <button 
                      className="action-btn view-btn"
                      onClick={() => onSubjectSelect(subject)}
                    >
                      <i className="fas fa-eye me-1"></i>
                      ดูรายละเอียด
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
  
  // State management
  const [currentView, setCurrentView] = useState<'faculties' | 'departments' | 'courses' | 'subjects'>('faculties');
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

  // Load faculties on component mount
  useEffect(() => {
    fetchFaculties();
  }, []);

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
    setIsLoading(true);
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
      setIsLoading(false);
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
    fetchDepartmentsByFaculty(faculty);
  };

  const handleDepartmentSelect = (department: Department) => {
    setSelectedDepartment(department);
    setSelectedCourse(null);
    setSelectedSubject(null);
    setCurrentView('courses');
    setSearchTerm('');
    fetchCoursesByDepartment(department.department_id);
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setSelectedSubject(null);
    setCurrentView('subjects');
    setSearchTerm('');
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
  };

  const handleBackToFaculties = () => {
    setCurrentView('faculties');
    setSelectedFaculty(null);
    setSelectedDepartment(null);
    setSelectedCourse(null);
    setSelectedSubject(null);
    setSearchTerm('');
  };

  const handleBackToDepartments = () => {
    setCurrentView('departments');
    setSelectedDepartment(null);
    setSelectedCourse(null);
    setSelectedSubject(null);
    setSearchTerm('');
  };

  const handleBackToCourses = () => {
    setCurrentView('courses');
    setSelectedCourse(null);
    setSelectedSubject(null);
    setSearchTerm('');
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

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
                  <div className="alert alert-danger rounded-3 mb-4">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </div>
                )}

                {/* Content based on current view */}
                {selectedSubject ? (
                  <SubjectDetail
                    subject={selectedSubject}
                    course={selectedCourse!}
                    onBack={handleBackToSubjects}
                  />
                ) : currentView === 'subjects' && selectedCourse ? (
                  <CourseDetail
                    course={selectedCourse}
                    onBack={handleBackToCourses}
                    onSubjectSelect={handleSubjectSelect}
                  />
                ) : currentView === 'courses' && selectedDepartment ? (
                  <CourseList
                    courses={currentItems}
                    isLoading={isLoading}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onCourseSelect={handleCourseSelect}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminCreditbankArea;


