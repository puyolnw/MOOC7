import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import DashboardSidebar from "../dashboard-common/ManagerSidebar";
import DashboardBanner from "../dashboard-common/ManagerBanner";
import ManagerSubjectArea from "./ManagerSubjectArea";
import "./manager.css";

// เพิ่ม interface สำหรับ Faculty ใหม่
interface FacultyWithStats {
  faculty_id?: number;
  name: string;
  department_count: number;
  total_courses: number;
  student_count?: number;
  description?: string;
  created_at?: string;
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
  student_count?: number;
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
  student_count?: number;
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
  student_count?: number;
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
  faculties: FacultyWithStats[];
  isLoading: boolean;
  onSelectFaculty: (faculty: string) => void;
  sortBy: 'name' | 'created_at' | 'department_count' | 'total_courses';
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: 'name' | 'created_at' | 'department_count' | 'total_courses', sortOrder: 'asc' | 'desc') => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}> = ({ faculties, isLoading, onSelectFaculty, sortBy, sortOrder, onSortChange, searchTerm, onSearchChange }) => {
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

      {/* Search and Sort Controls */}
      <div className="controls-container mb-4">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="ค้นหาคณะ..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-flex gap-2 justify-content-end">
              <select
                className="form-select form-select-sm"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as any, sortOrder)}
                style={{ width: 'auto' }}
              >
                <option value="name">ชื่อคณะ</option>
                <option value="department_count">จำนวนสาขา</option>
                <option value="total_courses">จำนวนหลักสูตร</option>
                <option value="created_at">วันที่สร้าง</option>
              </select>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
                title={sortOrder === 'asc' ? 'เรียงจากน้อยไปมาก' : 'เรียงจากมากไปน้อย'}
              >
                <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="table-view">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-primary">
              <tr>
                <th>ชื่อคณะ</th>
                <th className="text-center">จำนวนสาขา</th>
                <th className="text-center">จำนวนหลักสูตร</th>
                <th className="text-center">จำนวนผู้เรียน</th>
                <th className="text-center">วันที่สร้าง</th>
                <th className="text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {faculties.map((faculty, index) => (
                <tr 
                  key={`faculty-${index}`} 
                  className="faculty-row"
                  onClick={() => onSelectFaculty(faculty.name)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                           style={{ width: '40px', height: '40px' }}>
                        <i className="fas fa-university"></i>
                      </div>
                      <div>
                        <h6 className="mb-0">{faculty.name}</h6>
                        <small className="text-muted">คณะ</small>
                      </div>
                    </div>
                  </td>
                  <td className="text-center">
                    <span className="badge bg-info">{faculty.department_count}</span>
                  </td>
                  <td className="text-center">
                    <span className="badge bg-success">{faculty.total_courses}</span>
                  </td>
                  <td className="text-center">
                    <span className="badge bg-info">{faculty.student_count || 'ไม่มีผู้เรียน'}</span>
                  </td>
                  <td className="text-center">
                    <small className="text-muted">
                      {faculty.created_at ? new Date(faculty.created_at).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                    </small>
                  </td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => onSelectFaculty(faculty.name)}
                        title="เข้าสู่คณะ"
                      >
                        <i className="fas fa-arrow-right"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
  onEditDepartment: (department: Department) => void;
  onDeleteDepartment: (department: Department) => void;
  onAddDepartment: () => void;
  sortBy: 'name' | 'created_at' | 'department_count' | 'total_courses';
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: 'name' | 'created_at' | 'department_count' | 'total_courses', sortOrder: 'asc' | 'desc') => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}> = ({ departments, isLoading, selectedFaculty, onSelectDepartment, onEditDepartment, onDeleteDepartment, onAddDepartment, sortBy, sortOrder, onSortChange, searchTerm, onSearchChange }) => {
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

  const handleDeleteDepartment = async (department: Department, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if ((department.course_count || 0) > 0) {
      alert('ไม่สามารถลบสาขาที่มีหลักสูตรอยู่ได้ กรุณาลบหลักสูตรทั้งหมดก่อน');
      return;
    }

    if (window.confirm(`คุณต้องการลบสาขา "${department.department_name}" ใช่หรือไม่?`)) {
      onDeleteDepartment(department);
    }
  };

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

      {/* Search and Sort Controls */}
      <div className="controls-container mb-4">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="ค้นหาสาขา..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-flex gap-2 justify-content-end">
              <select
                className="form-select form-select-sm"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as any, sortOrder)}
                style={{ width: 'auto' }}
              >
                <option value="name">ชื่อสาขา</option>
                <option value="created_at">วันที่สร้าง</option>
                <option value="total_courses">จำนวนหลักสูตร</option>
              </select>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
                title={sortOrder === 'asc' ? 'เรียงจากน้อยไปมาก' : 'เรียงจากมากไปน้อย'}
              >
                <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="table-view">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-info">
              <tr>
                <th>ชื่อสาขา</th>
                <th>รายละเอียด</th>
                <th className="text-center">จำนวนหลักสูตร</th>
                <th className="text-center">จำนวนผู้เรียน</th>
                <th className="text-center">วันที่สร้าง</th>
                <th className="text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr className="table-success">
                <td colSpan={6}>
                  <div className="d-flex align-items-center p-2" onClick={onAddDepartment} style={{ cursor: 'pointer' }}>
                    <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                         style={{ width: '40px', height: '40px' }}>
                      <i className="fas fa-plus"></i>
                    </div>
                    <div>
                      <h6 className="mb-0 text-success">เพิ่มสาขาใหม่</h6>
                      <small className="text-muted">สร้างสาขาใหม่สำหรับคณะ {selectedFaculty}</small>
                    </div>
                  </div>
                </td>
              </tr>
              {departments.map((department) => (
                <tr 
                  key={`department-${department.department_id}`} 
                  className="department-row"
                  onClick={() => onSelectDepartment(department)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                           style={{ width: '40px', height: '40px' }}>
                        <i className="fas fa-building"></i>
                      </div>
                      <div>
                        <h6 className="mb-0">{department.department_name}</h6>
                        <small className="text-muted">สาขา</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    {department.description ? (
                      <span title={department.description}>
                        {department.description.length > 50 
                          ? `${department.description.substring(0, 50)}...`
                          : department.description
                        }
                      </span>
                    ) : (
                      <span className="text-muted">ไม่มีรายละเอียด</span>
                    )}
                  </td>
                  <td className="text-center">
                    <span className="badge bg-primary">{department.course_count || 0}</span>
                  </td>
                  <td className="text-center">
                    <span className="badge bg-info">{department.student_count || 'ไม่ระบุ'}</span>
                  </td>
                  <td className="text-center">
                    <small className="text-muted">
                      {department.created_at ? new Date(department.created_at).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                    </small>
                  </td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => onSelectDepartment(department)}
                        title="เข้าสู่สาขา"
                      >
                        <i className="fas fa-arrow-right"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditDepartment(department);
                        }}
                        title="แก้ไข"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDepartment(department, e);
                        }}
                        title="ลบ"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
  onDeleteCourse: (course: Course) => void;
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
  onDeleteCourse,
  selectedDepartment,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const navigate = useNavigate();

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
    <div className="selection-container">
      <div className="section-header">
        <div className="section-icon">
          <i className="fas fa-graduation-cap"></i>
        </div>
        <div className="section-title">
          <h2>หลักสูตร</h2>
          <p>สาขา {selectedDepartment.department_name} - เลือกหลักสูตรที่ต้องการจัดการ</p>
        </div>
      </div>

      {/* Search Controls */}
      <div className="search-controls mb-3">
        <div className="row">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="ค้นหาหลักสูตร..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="table-view">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-success">
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>ชื่อหลักสูตร</th>
                <th>รหัสหลักสูตร</th>
                <th>รายละเอียด</th>
                <th className="text-center">จำนวนรายวิชา</th>
                <th className="text-center">จำนวนผู้เรียน</th>
                <th className="text-center">สถานะ</th>
                <th className="text-center">วันที่สร้าง</th>
                <th className="text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr className="table-success">
                <td></td>
                <td colSpan={8}>
                  <div className="d-flex align-items-center p-2" onClick={() => navigate('/manager-creditbank/create-new')} style={{ cursor: 'pointer' }}>
                    <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                         style={{ width: '40px', height: '40px' }}>
                      <i className="fas fa-plus"></i>
                    </div>
                    <div>
                      <h6 className="mb-0 text-success">เพิ่มหลักสูตรใหม่</h6>
                      <small className="text-muted">สร้างหลักสูตรใหม่สำหรับสาขา {selectedDepartment.department_name}</small>
                    </div>
                  </div>
                </td>
              </tr>
              {courses.map((course) => (
                <tr 
                  key={`course-${course.course_id}`} 
                  className="course-row"
                  onClick={() => onCourseSelect(course)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                         style={{ width: '40px', height: '40px' }}>
                      <i className="fas fa-graduation-cap"></i>
                    </div>
                  </td>
                  <td>
                    <div>
                      <h6 className="mb-0">{course.title}</h6>
                      <small className="text-muted">หลักสูตร</small>
                    </div>
                  </td>
                  <td>
                    {course.course_code ? (
                      <span className="badge bg-info">{course.course_code}</span>
                    ) : (
                      <span className="text-muted">ไม่มีรหัส</span>
                    )}
                  </td>
                  <td>
                    {course.description ? (
                      <span title={course.description}>
                        {course.description.length > 50 
                          ? `${course.description.substring(0, 50)}...`
                          : course.description
                        }
                      </span>
                    ) : (
                      <span className="text-muted">ไม่มีรายละเอียด</span>
                    )}
                  </td>
                  <td className="text-center">
                    <span className="badge bg-primary">{course.subject_count}</span>
                  </td>
                  <td className="text-center">
                    <span className="badge bg-info">{course.student_count || 0}</span>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${course.status === 'active' ? 'bg-success' : course.status === 'inactive' ? 'bg-warning' : 'bg-secondary'}`}>
                      {course.status === 'active' ? 'เปิดใช้งาน' : 
                       course.status === 'inactive' ? 'ปิดใช้งาน' : 'ร่าง'}
                    </span>
                  </td>
                  <td className="text-center">
                    <small className="text-muted">
                      {course.created_at ? new Date(course.created_at).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                    </small>
                  </td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => onCourseSelect(course)}
                        title="เข้าสู่หลักสูตร"
                      >
                        <i className="fas fa-arrow-right"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (course.subject_count > 0) {
                            alert('ไม่สามารถลบหลักสูตรที่มีรายวิชาอยู่ได้ กรุณาลบรายวิชาทั้งหมดก่อน');
                            return;
                          }
                          if (window.confirm(`คุณต้องการลบหลักสูตร "${course.title}" ใช่หรือไม่?`)) {
                            onDeleteCourse(course);
                          }
                        }}
                        title="ลบหลักสูตร"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                      <div className="stat-item">
                        <i className="fas fa-users me-1"></i>
                        <span>{subject.student_count || 0} ผู้เรียน</span>
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

// Main AdminCreditbankArea component
const ManagerCreditbankArea: React.FC = () => {
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
  
  // Filtered states for faculties and departments
  const [filteredFaculties, setFilteredFaculties] = useState<FacultyWithStats[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Search states for faculties and departments
  const [facultySearchTerm, setFacultySearchTerm] = useState('');
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);


  // Add state for initialization
  const [isInitialized, setIsInitialized] = useState(false);

  // Modal states
  const [showEditDepartmentModal, setShowEditDepartmentModal] = useState(false);
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [selectedDepartmentForEdit, setSelectedDepartmentForEdit] = useState<Department | null>(null);

  // Add sorting states
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'department_count' | 'total_courses'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');



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

  // Handle sorting for faculties
  useEffect(() => {
    if (filteredFaculties.length > 0 && currentView === 'faculties') {
      const sortedFaculties = sortFaculties(filteredFaculties);
      // Only update if the sorted data is actually different
      const isDifferent = JSON.stringify(sortedFaculties) !== JSON.stringify(filteredFaculties);
      if (isDifferent) {
        setFilteredFaculties(sortedFaculties);
      }
    }
  }, [sortBy, sortOrder, currentView]);

  // Handle sorting for departments
  useEffect(() => {
    if (filteredDepartments.length > 0 && currentView === 'departments') {
      const sortedDepartments = sortDepartments(filteredDepartments);
      // Only update if the sorted data is actually different
      const isDifferent = JSON.stringify(sortedDepartments) !== JSON.stringify(filteredDepartments);
      if (isDifferent) {
        setFilteredDepartments(sortedDepartments);
      }
    }
  }, [sortBy, sortOrder, currentView]);

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

  // Handle search for faculties
  useEffect(() => {
    let results = faculties;

    if (facultySearchTerm) {
      const searchLower = facultySearchTerm.toLowerCase();
      results = results.filter(
        faculty =>
          faculty.name.toLowerCase().includes(searchLower)
      );
    }

    setFilteredFaculties(results);
  }, [facultySearchTerm, faculties]);

  // Handle search for departments
  useEffect(() => {
    let results = departments;

    if (departmentSearchTerm) {
      const searchLower = departmentSearchTerm.toLowerCase();
      results = results.filter(
        department =>
          department.department_name.toLowerCase().includes(searchLower) ||
          (department.description && department.description.toLowerCase().includes(searchLower))
      );
    }

    setFilteredDepartments(results);
  }, [departmentSearchTerm, departments]);

  // API calls - แก้ไข fetchFaculties ให้ดึงข้อมูลพร้อมสถิติ
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

      // ใช้ API ใหม่สำหรับ manager
      const response = await axios.get(`${apiURL}/api/manager/departments/faculties`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // Count departments and courses for each faculty
        const facultiesWithStats = await Promise.all(
          response.data.faculties.map(async (faculty: string) => {
            try {
              const deptResponse = await axios.get(
                `${apiURL}/api/manager/departments?faculty=${encodeURIComponent(faculty)}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              let totalCourses = 0;
              let totalStudents = 0;
              if (deptResponse.data.success && deptResponse.data.departments) {
                // Count courses and students for each department
                const coursePromises = deptResponse.data.departments.map(async (dept: Department) => {
                  try {
                    const coursesResponse = await axios.get(
                      `${apiURL}/api/courses?department_id=${dept.department_id}`,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    const courseCount = parseInt(coursesResponse.data.courses?.length?.toString()) || 0;
                    
                    // ดึงจำนวนผู้เรียนจาก API courses โดยตรง
                    let departmentStudents = 0;
                    try {
                      // ใช้ข้อมูลจาก coursesResponse ที่มี student_count อยู่แล้ว
                      const departmentCourses = coursesResponse.data.courses || [];
                      
                      // Debug: ตรวจสอบข้อมูลที่ได้จาก API
                      console.log(`Department ${dept.department_name} courses:`, departmentCourses.map((c: any) => ({
                        course_id: c.course_id,
                        title: c.title,
                        student_count: c.student_count,
                        student_count_type: typeof c.student_count
                      })));
                      
                      departmentStudents = departmentCourses.reduce((sum: number, course: any) => {
                        // ใช้ parseInt เพื่อให้แน่ใจว่าเป็นตัวเลข
                        const studentCount = parseInt(course.student_count?.toString()) || 0;
                        console.log(`Course ${course.title}: student_count=${course.student_count}, parsed=${studentCount}`);
                        return sum + studentCount;
                      }, 0);
                      
                      console.log(`Department ${dept.department_name} total students: ${departmentStudents}`);
                    } catch (error) {
                      console.log(`Error calculating student count for department ${dept.department_id}, using fallback`);
                      departmentStudents = courseCount * 25; // fallback
                    }
                    
                    // ส่งกลับทั้ง courseCount และ departmentStudents
                    return { courseCount, departmentStudents };
                  } catch (error) {
                    console.error(`Error fetching courses for department ${dept.department_id}:`, error);
                    return { courseCount: 0, departmentStudents: 0 };
                  }
                });
                
                const courseResults = await Promise.all(coursePromises);
                totalCourses = courseResults.reduce((sum: number, result: any) => sum + (parseInt(result.courseCount) || 0), 0);
                totalStudents = courseResults.reduce((sum: number, result: any) => sum + (parseInt(result.departmentStudents) || 0), 0);
                
                // Debug logging
                console.log(`Faculty: ${faculty} - Total Courses: ${totalCourses}, Total Students: ${totalStudents}`);
                console.log('Course Results:', courseResults);
              }
              
              return {
                name: faculty,
                department_count: parseInt((deptResponse.data.departments?.length || 0).toString()),
                total_courses: parseInt(totalCourses.toString()),
                student_count: parseInt(totalStudents.toString()),
                created_at: new Date().toISOString() // Default to current date since API doesn't provide this
              };
            } catch (error) {
              console.error(`Error fetching departments for faculty ${faculty}:`, error);
              return {
                name: faculty,
                department_count: 0,
                total_courses: 0,
                student_count: 0,
                created_at: new Date().toISOString() // Default to current date since API doesn't provide this
              };
            }
          })
        );
        
        // Sort faculties based on current sort settings
        const sortedFaculties = sortFaculties(facultiesWithStats);
        setFaculties(sortedFaculties);
        setFilteredFaculties(sortedFaculties);
      } else {
        setError('ไม่สามารถดึงข้อมูลคณะได้');
      }
    } catch (error: any) {
      console.error('Error fetching faculties:', error);
      
      // แสดง debug information ถ้ามี
      if (error.response?.data?.debug) {
        console.log('Debug info:', error.response.data.debug);
        setError(`เกิดข้อผิดพลาดในการดึงข้อมูลคณะ: ${error.response.data.message}\n\nDebug: ${JSON.stringify(error.response.data.debug, null, 2)}`);
      } else {
        setError('เกิดข้อผิดพลาดในการดึงข้อมูลคณะ');
      }
    } finally {
      if (currentView === 'faculties') {
        setIsLoading(false);
      }
    }
  };

  // Add sorting function for faculties
  const sortFaculties = (facultiesToSort: FacultyWithStats[]) => {
    return [...facultiesToSort].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
          break;
        case 'department_count':
          aValue = a.department_count;
          bValue = b.department_count;
          break;
        case 'total_courses':
          aValue = a.total_courses;
          bValue = b.total_courses;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Add sorting function for departments
  const sortDepartments = (departmentsToSort: Department[]) => {
    return [...departmentsToSort].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.department_name.toLowerCase();
          bValue = b.department_name.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
          break;
        case 'department_count':
          aValue = a.course_count || 0;
          bValue = b.course_count || 0;
          break;
        case 'total_courses':
          aValue = a.course_count || 0;
          bValue = b.course_count || 0;
          break;
        default:
          aValue = a.department_name.toLowerCase();
          bValue = b.department_name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
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

      // ใช้ API ใหม่สำหรับ manager
      const response = await axios.get(
        `${apiURL}/api/manager/departments?faculty=${encodeURIComponent(faculty)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Count courses and students for each department
        const departmentsWithCount = await Promise.all(
          response.data.departments.map(async (department: Department) => {
            try {
              const coursesResponse = await axios.get(
                `${apiURL}/api/courses?department_id=${department.department_id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const courseCount = parseInt(coursesResponse.data.courses?.length?.toString()) || 0;
              
              // ดึงจำนวนผู้เรียนจาก API courses โดยตรง
              let studentCount = 0;
              try {
                // ใช้ข้อมูลจาก coursesResponse ที่มี student_count อยู่แล้ว
                const departmentCourses = coursesResponse.data.courses || [];
                studentCount = departmentCourses.reduce((sum: number, course: any) => {
                  // ใช้ parseInt เพื่อให้แน่ใจว่าเป็นตัวเลข
                  const courseStudentCount = parseInt(course.student_count?.toString()) || 0;
                  return sum + courseStudentCount;
                }, 0);
              } catch (error) {
                console.log(`Error calculating student count, using fallback`);
                studentCount = courseCount * 25; // fallback
              }
              
              return {
                ...department,
                course_count: parseInt(courseCount.toString()),
                student_count: parseInt(studentCount.toString())
              };
            } catch (error) {
              console.error(`Error fetching courses for department ${department.department_id}:`, error);
              return {
                ...department,
                course_count: 0,
                student_count: 0
              };
            }
          })
        );
        
        // Sort departments based on current sort settings
        const sortedDepartments = sortDepartments(departmentsWithCount);
        setDepartments(sortedDepartments);
        setFilteredDepartments(sortedDepartments);
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
          student_count: course.student_count || 0, // ใช้ข้อมูลจาก API โดยตรง
          status: course.status || 'draft',
          created_at: course.created_at || new Date().toISOString(),
          updated_at: course.updated_at || new Date().toISOString(),
        }));
        
        // ใช้ข้อมูลจำนวนผู้เรียนจาก API courses โดยตรง
        const coursesWithStudents = formattedCourses.map((course: Course) => {
          // ข้อมูลจำนวนผู้เรียนมีอยู่แล้วใน course.student_count
          return {
            ...course,
            student_count: typeof course.student_count === 'string' ? parseInt(course.student_count) : (course.student_count || 0)
          };
        });
        
        setCourses(coursesWithStudents);
        setFilteredCourses(coursesWithStudents);
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

  // Department CRUD operations - ใช้ API ใหม่สำหรับ manager
  const handleAddDepartment = async (newDepartment: Department) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${apiURL}/api/manager/departments`,
        {
          department_name: newDepartment.department_name,
          faculty: selectedFaculty,
          description: newDepartment.description
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Refresh departments list
        if (selectedFaculty) {
          fetchDepartmentsByFaculty(selectedFaculty);
        }
        
        // Update faculty stats
        setFaculties(prev => 
          prev.map(faculty => 
            faculty.name === selectedFaculty 
              ? { ...faculty, department_count: faculty.department_count + 1 }
              : faculty
          )
        );
        
        alert('เพิ่มสาขาสำเร็จ');
      }
    } catch (error: any) {
      console.error('Error adding department:', error);
      if (error.response?.status === 409) {
        alert('สาขานี้มีอยู่แล้วในคณะนี้');
      } else {
        alert('เกิดข้อผิดพลาดในการเพิ่มสาขา: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartmentForEdit(department);
    setShowEditDepartmentModal(true);
  };

  const handleUpdateDepartment = async (updatedDepartment: Department) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${apiURL}/api/manager/departments/${updatedDepartment.department_id}`,
        {
          department_name: updatedDepartment.department_name,
          description: updatedDepartment.description
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setDepartments(prev => 
          prev.map(dept => 
            dept.department_id === updatedDepartment.department_id ? updatedDepartment : dept
          )
        );
        
        // Update selected department if it's the one being edited
        if (selectedDepartment?.department_id === updatedDepartment.department_id) {
          setSelectedDepartment(updatedDepartment);
        }
        
        alert('แก้ไขสาขาสำเร็จ');
      }
    } catch (error: any) {
      console.error('Error updating department:', error);
      if (error.response?.status === 409) {
        alert('สาขานี้มีอยู่แล้วในคณะนี้');
      } else {
        alert('เกิดข้อผิดพลาดในการแก้ไขสาขา: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleDeleteDepartment = async (department: Department) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${apiURL}/api/manager/departments/${department.department_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setDepartments(prev => prev.filter(d => d.department_id !== department.department_id));
        
        // Update faculty stats
        setFaculties(prev => 
          prev.map(faculty => 
            faculty.name === selectedFaculty 
              ? { ...faculty, department_count: faculty.department_count - 1 }
              : faculty
          )
        );
        
        // Reset selection if deleted department was selected
        if (selectedDepartment?.department_id === department.department_id) {
          setSelectedDepartment(null);
          setSelectedCourse(null);
          setSelectedSubject(null);
          setCurrentView('departments');
          updateBrowserHistory('departments', selectedFaculty, null, null, null);
        }
        
        alert('ลบสาขาสำเร็จ');
      }
    } catch (error: any) {
      console.error('Error deleting department:', error);
      if (error.response?.status === 400) {
        alert('ไม่สามารถลบสาขาได้: มีหลักสูตรอยู่ กรุณาลบหลักสูตรทั้งหมดก่อน');
      } else {
        alert('เกิดข้อผิดพลาดในการลบสาขา: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleDeleteCourse = async (course: Course) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${apiURL}/api/courses/${course.course_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Remove course from state
        const updatedCourses = courses.filter(c => c.course_id !== course.course_id);
        setCourses(updatedCourses);
        setFilteredCourses(updatedCourses);
        
        // Update department stats
        if (selectedDepartment) {
          setDepartments(prev => 
            prev.map(dept => 
              dept.department_id === selectedDepartment.department_id 
                ? { ...dept, course_count: (dept.course_count || 1) - 1 }
                : dept
            )
          );
        }

        // Update faculty stats
        if (selectedFaculty) {
          setFaculties(prev => 
            prev.map(faculty => 
              faculty.name === selectedFaculty 
                ? { ...faculty, total_courses: faculty.total_courses - 1 }
                : faculty
            )
          );
        }
        
        alert('ลบหลักสูตรสำเร็จ');
      }
    } catch (error: any) {
      console.error('Error deleting course:', error);
      
      if (error.response?.status === 400) {
        alert('ไม่สามารถลบหลักสูตรได้: มีรายวิชาอยู่ กรุณาลบรายวิชาทั้งหมดก่อน');
      } else if (error.response?.status === 403) {
        alert('คุณไม่มีสิทธิ์ลบหลักสูตรนี้');
      } else if (error.response?.status === 404) {
        alert('ไม่พบหลักสูตรที่ต้องการลบ');
      } else {
        alert('เกิดข้อผิดพลาดในการลบหลักสูตร');
      }
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
                  <ManagerSubjectArea 
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
                    onDeleteCourse={handleDeleteCourse}

                    selectedDepartment={selectedDepartment}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    indexOfFirstItem={indexOfFirstItem}
                  />
                ) : currentView === 'departments' && selectedFaculty ? (
                  <DepartmentSelection
                    departments={filteredDepartments}
                    isLoading={isLoading}
                    selectedFaculty={selectedFaculty}
                    onSelectDepartment={handleDepartmentSelect}
                    onAddDepartment={() => setShowAddDepartmentModal(true)}
                    onEditDepartment={handleEditDepartment}
                    onDeleteDepartment={handleDeleteDepartment}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={(sortBy, sortOrder) => {
                      setSortBy(sortBy);
                      setSortOrder(sortOrder);
                    }}
                    searchTerm={departmentSearchTerm}
                    onSearchChange={setDepartmentSearchTerm}
                  />
                ) : (
                  <FacultySelection
                    faculties={filteredFaculties}
                    isLoading={isLoading}
                    onSelectFaculty={handleFacultySelect}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={(sortBy, sortOrder) => {
                      setSortBy(sortBy);
                      setSortOrder(sortOrder);
                    }}
                    searchTerm={facultySearchTerm}
                    onSearchChange={setFacultySearchTerm}
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

      {showAddDepartmentModal && selectedFaculty && (
        <AddDepartmentModal
          show={showAddDepartmentModal}
          onClose={() => setShowAddDepartmentModal(false)}
          faculty={selectedFaculty}
          onAdd={handleAddDepartment}
        />
      )}

      {showEditDepartmentModal && selectedDepartmentForEdit && (
        <EditDepartmentModal
          show={showEditDepartmentModal}
          onClose={() => {
            setShowEditDepartmentModal(false);
            setSelectedDepartmentForEdit(null);
          }}
          department={selectedDepartmentForEdit}
          onUpdate={handleUpdateDepartment}
        />
      )}
    </section>
  );
};

// เพิ่ม interfaces สำหรับ Modal components
interface FacultyWithStats {
  name: string;
  department_count: number;
  total_courses: number;
}


const AddDepartmentModal: React.FC<{
  show: boolean;
  onClose: () => void;
  faculty: string;
  onAdd: (department: Department) => void;
}> = ({ show, onClose, faculty, onAdd }) => {
  const [departmentName, setDepartmentName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!departmentName.trim()) {
      setError('กรุณากรอกชื่อสาขา');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      // ใช้ API ใหม่สำหรับ manager
      const response = await axios.post(
        `${apiURL}/api/manager/departments`,
        { 
          department_name: departmentName.trim(),
          faculty: faculty,
          description: description.trim() || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const newDepartment: Department = {
          department_id: response.data.department.department_id,
          department_name: departmentName.trim(),
          faculty: faculty,
          description: description.trim() || undefined,
          created_at: new Date().toISOString(),
          course_count: 0
        };
        
        onAdd(newDepartment);
        setDepartmentName('');
        setDescription('');
        onClose();
        alert('เพิ่มสาขาสำเร็จ');
      }
    } catch (error: any) {
      console.error('Error adding department:', error);
      if (error.response?.status === 409) {
        setError('สาขานี้มีอยู่แล้วในคณะนี้');
      } else {
        setError('เกิดข้อผิดพลาดในการเพิ่มสาขา: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">เพิ่มสาขาใหม่</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <div className="mb-3">
                <label htmlFor="facultyDisplay" className="form-label">คณะ</label>
                <input
                  type="text"
                  className="form-control"
                  id="facultyDisplay"
                  value={faculty}
                  disabled
                />
              </div>
              <div className="mb-3">
                <label htmlFor="departmentName" className="form-label">ชื่อสาขา</label>
                <input
                  type="text"
                  className="form-control"
                  id="departmentName"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="กรอกชื่อสาขา"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="description" className="form-label">รายละเอียด (ไม่บังคับ)</label>
                <textarea
                  className="form-control"
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="กรอกรายละเอียดสาขา"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                ยกเลิก
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'กำลังเพิ่ม...' : 'เพิ่มสาขา'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const EditDepartmentModal: React.FC<{
  show: boolean;
  onClose: () => void;
  department: Department;
  onUpdate: (department: Department) => void;
}> = ({ show, onClose, department, onUpdate }) => {
  const [departmentName, setDepartmentName] = useState(department.department_name);
  const [description, setDescription] = useState(department.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setDepartmentName(department.department_name);
    setDescription(department.description || '');
  }, [department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!departmentName.trim()) {
      setError('กรุณากรอกชื่อสาขา');
      return;
    }

    if (departmentName.trim() === department.department_name && 
        description.trim() === (department.description || '')) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const apiURL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('token');
      
      // ใช้ API ใหม่สำหรับ manager
      const response = await axios.put(
        `${apiURL}/api/manager/departments/${department.department_id}`,
        { 
          department_name: departmentName.trim(),
          description: description.trim() || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const updatedDepartment: Department = {
          ...department,
          department_name: departmentName.trim(),
          description: description.trim() || undefined
        };
        
        onUpdate(updatedDepartment);
        onClose();
        alert('แก้ไขสาขาสำเร็จ');
      }
    } catch (error: any) {
      console.error('Error updating department:', error);
      if (error.response?.status === 409) {
        setError('สาขานี้มีอยู่แล้วในคณะนี้');
      } else {
        setError('เกิดข้อผิดพลาดในการแก้ไขสาขา: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">แก้ไขสาขา</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <div className="mb-3">
                <label htmlFor="facultyDisplay" className="form-label">คณะ</label>
                <input
                  type="text"
                  className="form-control"
                  id="facultyDisplay"
                  value={department.faculty}
                  disabled
                />
              </div>
              <div className="mb-3">
                <label htmlFor="departmentName" className="form-label">ชื่อสาขา</label>
                <input
                  type="text"
                  className="form-control"
                  id="departmentName"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  placeholder="กรอกชื่อสาขา"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="description" className="form-label">รายละเอียด (ไม่บังคับ)</label>
                <textarea
                  className="form-control"
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="กรอกรายละเอียดสาขา"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                ยกเลิก
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManagerCreditbankArea;