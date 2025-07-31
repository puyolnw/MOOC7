import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import DashboardSidebar from "../../dashboard-common/AdminSidebar";
import DashboardBanner from "../../dashboard-common/AdminBanner";

// Interface สำหรับข้อมูลแผนก
interface Department {
  department_id: number;
  department_name: string;
}

// Interface สำหรับข้อมูลนักศึกษา
interface Student {
  student_id: number;
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  student_code: string;
  department_id: number;
  education_level: string;
  department_name?: string;
  academic_year?: number;
  school_name?: string;
  study_program?: string;
  grade_level?: string;
  created_at: string;
  // Quiz/Test Results
  total_quizzes_taken?: number;
  average_score?: number;
  completed_courses?: number;
  enrolled_courses?: number;
  progress_percentage?: number;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const SimplePagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];

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
    (number, index, array) => number !== -1 || (number === -1 && array[index - 1] !== -1)
  );

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination mb-0">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
        </li>

        {filteredPageNumbers.map((number, index) => {
          if (number === -1) {
            return (
              <li key={`ellipsis-${index}`} className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            );
          }

          return (
            <li key={`page-${number}-${index}`} className={`page-item ${currentPage === number ? 'active' : ''}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(number)}
              >
                {number}
              </button>
            </li>
          );
        })}

        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>
  );
};

const AccountStudentArea: React.FC = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [performanceFilter, setPerformanceFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [schools, setSchools] = useState<string[]>([]);
  const [academicYears, setAcademicYears] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState<number | null>(null);

  // ดึงข้อมูลนักศึกษาและแผนก
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          setError('ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่');
          setIsLoading(false);
          return;
        }

        // ดึงข้อมูลนักศึกษา
        const studentResponse = await axios.get(`${apiURL}/api/accounts/students`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // ดึงข้อมูลแผนก
        const departmentResponse = await axios.get(`${apiURL}/api/auth/departments`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (studentResponse.data.success && departmentResponse.data.success) {
          // เพิ่ม department_name ให้กับนักศึกษาแต่ละคน
          const updatedStudents = studentResponse.data.students.map((student: Student) => {
            const dept = departmentResponse.data.departments.find(
              (d: Department) => d.department_id === student.department_id
            );
            return {
              ...student,
              department_name: dept ? dept.department_name : 'ไม่ระบุ'
            };
          });

          setStudents(updatedStudents);
          setFilteredStudents(updatedStudents);
          setDepartments(departmentResponse.data.departments || []);
          
          // สร้างรายการโรงเรียนและปีการศึกษา
          const uniqueSchools = [...new Set(updatedStudents.map((s: Student) => s.school_name).filter(Boolean))] as string[];
          const uniqueYears = [...new Set(updatedStudents.map((s: Student) => s.academic_year).filter(Boolean))] as number[];
          uniqueYears.sort((a, b) => (b as number) - (a as number));
          
          setSchools(uniqueSchools);
          setAcademicYears(uniqueYears);
          setTotalPages(Math.ceil(updatedStudents.length / itemsPerPage));
        } else {
          setError('ไม่สามารถดึงข้อมูลนักศึกษาได้');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [apiURL, itemsPerPage]);

  // กรองข้อมูลนักศึกษา
  useEffect(() => {
    let results = students;

    // กรองตามคำค้นหา
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter(
        student =>
          student.username.toLowerCase().includes(searchLower) ||
          student.first_name.toLowerCase().includes(searchLower) ||
          student.last_name.toLowerCase().includes(searchLower) ||
          student.email.toLowerCase().includes(searchLower) ||
          student.student_code.toLowerCase().includes(searchLower) ||
          (student.department_name || '').toLowerCase().includes(searchLower) ||
          (student.school_name || '').toLowerCase().includes(searchLower)
      );
    }

    // กรองตามสถานะ
    if (statusFilter !== 'all') {
      results = results.filter(student => student.status === statusFilter);
    }

    // กรองตามแผนก
    if (departmentFilter !== 'all') {
      results = results.filter(student => String(student.department_id) === departmentFilter);
    }

    // กรองตามโรงเรียน
    if (schoolFilter !== 'all') {
      results = results.filter(student => student.school_name === schoolFilter);
    }

    // กรองตามปีการศึกษา
    if (yearFilter !== 'all') {
      results = results.filter(student => String(student.academic_year) === yearFilter);
    }

    // กรองตามระดับชั้น
    if (gradeFilter !== 'all') {
      results = results.filter(student => student.grade_level === gradeFilter);
    }

    // กรองตามผลการเรียน
    if (performanceFilter !== 'all') {
      results = results.filter(student => {
        const avgScore = student.average_score || 0;
        switch (performanceFilter) {
          case 'excellent': return avgScore >= 80;
          case 'good': return avgScore >= 70 && avgScore < 80;
          case 'fair': return avgScore >= 60 && avgScore < 70;
          case 'poor': return avgScore < 60;
          default: return true;
        }
      });
    }

    setFilteredStudents(results);
    setTotalPages(Math.ceil(results.length / itemsPerPage));
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter, departmentFilter, schoolFilter, yearFilter, gradeFilter, performanceFilter, students, itemsPerPage]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (window.confirm("คุณต้องการลบนักศึกษาคนนี้ใช่หรือไม่?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
          return;
        }

        const response = await axios.delete(`${apiURL}/api/accounts/students/${studentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setStudents(prev => prev.filter(student => student.user_id !== studentId));
          setFilteredStudents(prev => prev.filter(student => student.user_id !== studentId));
          toast.success("ลบนักศึกษาสำเร็จ");
        } else {
          toast.error(response.data.message || "เกิดข้อผิดพลาดในการลบนักศึกษา");
        }
      } catch (error) {
        console.error("Error deleting student:", error);
        toast.error("เกิดข้อผิดพลาดในการลบนักศึกษา");
        console.log("Deleting user_id:", studentId);
      }
    }
  };

  const StatusBadge = ({ status }: { status: Student["status"] }) => {
    let badgeClass = "";
    let statusText = "";

    switch (status) {
      case "active":
        badgeClass = "badge bg-success-subtle text-success rounded-pill px-3 py-1 small";
        statusText = "เปิดใช้งาน";
        break;
      case "inactive":
        badgeClass = "badge bg-danger-subtle text-danger rounded-pill px-3 py-1 small";
        statusText = "ปิดใช้งาน";
        break;
      case "pending":
        badgeClass = "badge bg-danger-subtle text-danger rounded-pill px-3 py-1 small";
        statusText = "รอการยืนยัน";
        break;
      default:
        badgeClass = "badge bg-secondary-subtle text-secondary rounded-pill px-3 py-1 small";
        statusText = "ไม่ระบุ";
        break;
    }
    return <span className={badgeClass}>{statusText}</span>;
  };

  return (
    <section className="dashboard__area section-pb-120">
      <style>
        {`
          /* Responsive table styling */
          @media (max-width: 768px) {
            .responsive-table thead {
              display: none;
            }

            .responsive-table tbody tr {
              display: block;
              margin-bottom: 1rem;
              border: 1px solid #dee2e6;
              border-radius: 0.25rem;
              padding: 0.5rem;
            }

            .responsive-table tbody td {
              display: block;
              text-align: left !important;
              padding: 0.25rem 0.5rem;
              border: none;
              position: relative;
            }

            .responsive-table tbody td:before {
              content: attr(data-label);
              font-weight: bold;
              display: inline-block;
              width: 40%;
              padding-right: 0.5rem;
            }

            .responsive-table tbody td.text-center {
              text-align: left !important;
            }

            /* Adjust action icons for better touch targets */
            .responsive-table .action-icons {
              display: flex;
              justify-content: flex-start;
              gap: 1.5rem;
            }

            .responsive-table .icon-action {
              font-size: 1.2rem;
              padding: 0.5rem;
            }
          }

          /* Adjust search bar and filters on mobile */
          @media (max-width: 576px) {
            .search-filter-row {
              flex-direction: column;
            }

            .search-filter-row .input-group,
            .search-filter-row .form-select {
              width: 100% !important;
              margin-bottom: 0.5rem;
            }
          }

          /* Ensure pagination buttons are touch-friendly */
          @media (max-width: 576px) {
            .pagination .page-link {
              padding: 0.5rem 0.75rem;
              font-size: 1rem;
            }

            .pagination-info {
              font-size: 0.9rem;
            }
          }
        `}
      </style>

      <div className="container">
        <DashboardBanner />
        <div className="dashboard__inner-wrap">
          <div className="row">
            <DashboardSidebar />
            <div className="dashboard__content-area col-lg-9">
              <div className="dashboard__content-main">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title mb-0">จัดการบัญชีนักศึกษา</h5>
                  <Link to="/admin-account/students/create-new" className="btn btn-primary">
                    <i className="fas fa-plus-circle me-2"></i>เพิ่มนักศึกษาใหม่
                  </Link>
                </div>

                {/* Search and Basic Filters */}
                <div className="row mb-3 search-filter-row">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="fas fa-search text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="ค้นหาชื่อ, รหัส, อีเมล, โรงเรียน..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex justify-content-end">
                      <button 
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                          setDepartmentFilter('all');
                          setSchoolFilter('all');
                          setYearFilter('all');
                          setGradeFilter('all');
                          setPerformanceFilter('all');
                        }}
                      >
                        <i className="fas fa-undo me-1"></i>ล้างตัวกรอง
                      </button>
                    </div>
                  </div>
                </div>

                {/* Advanced Filters */}
                <div className="card mb-4">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">
                      <i className="fas fa-filter me-2"></i>ตัวกรองข้อมูล
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3 mb-3">
                        <label className="form-label small">สาขาวิชา</label>
                        <select
                          className="form-select form-select-sm"
                          value={departmentFilter}
                          onChange={(e) => setDepartmentFilter(e.target.value)}
                        >
                          <option value="all">ทุกสาขา</option>
                          {departments.map((dept) => (
                            <option key={dept.department_id} value={dept.department_id}>
                              {dept.department_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-3 mb-3">
                        <label className="form-label small">สถานะ</label>
                        <select
                          className="form-select form-select-sm"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <option value="all">ทุกสถานะ</option>
                          <option value="active">เปิดใช้งาน</option>
                          <option value="inactive">ปิดใช้งาน</option>
                          <option value="pending">รอการยืนยัน</option>
                        </select>
                      </div>
                      <div className="col-md-3 mb-3">
                        <label className="form-label small">โรงเรียน</label>
                        <select
                          className="form-select form-select-sm"
                          value={schoolFilter}
                          onChange={(e) => setSchoolFilter(e.target.value)}
                        >
                          <option value="all">ทุกโรงเรียน</option>
                          {schools.map((school) => (
                            <option key={school} value={school}>
                              {school}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-3 mb-3">
                        <label className="form-label small">ปีการศึกษา</label>
                        <select
                          className="form-select form-select-sm"
                          value={yearFilter}
                          onChange={(e) => setYearFilter(e.target.value)}
                        >
                          <option value="all">ทุกปี</option>
                          {academicYears.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label small">ระดับชั้น</label>
                        <select
                          className="form-select form-select-sm"
                          value={gradeFilter}
                          onChange={(e) => setGradeFilter(e.target.value)}
                        >
                          <option value="all">ทุกระดับ</option>
                          <option value="ม.1">ม.1</option>
                          <option value="ม.2">ม.2</option>
                          <option value="ม.3">ม.3</option>
                          <option value="ม.4">ม.4</option>
                          <option value="ม.5">ม.5</option>
                          <option value="ม.6">ม.6</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label small">ผลการเรียน</label>
                        <select
                          className="form-select form-select-sm"
                          value={performanceFilter}
                          onChange={(e) => setPerformanceFilter(e.target.value)}
                        >
                          <option value="all">ทุกระดับ</option>
                          <option value="excellent">ดีเยี่ยม (80+ คะแนน)</option>
                          <option value="good">ดี (70-79 คะแนน)</option>
                          <option value="fair">พอใช้ (60-69 คะแนน)</option>
                          <option value="poor">ต้องปรับปรุง ({'<'} 60 คะแนน)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">กำลังโหลด...</span>
                    </div>
                    <p className="mt-2 text-muted">กำลังโหลดข้อมูลนักศึกษา...</p>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-5 bg-light rounded">
                    <i className="fas fa-user-slash fa-3x text-muted mb-3"></i>
                    <h5>ไม่พบข้อมูลนักศึกษา</h5>
                    <p className="text-muted">
                      {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'
                        ? 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา'
                        : 'ยังไม่มีข้อมูลนักศึกษาในระบบ'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-hover table-sm mb-0 align-middle">
                        <thead className="table-dark">
                          <tr>
                            <th scope="col" style={{ width: '40px' }}>#</th>
                            <th scope="col">ข้อมูลนักเรียน</th>
                            <th scope="col">โรงเรียน/ชั้น</th>
                            <th scope="col">ผลการเรียน</th>
                            <th scope="col" className="text-center">สถานะ</th>
                            <th scope="col" style={{ width: '120px' }} className="text-center">จัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.map((student, index) => (
                            <React.Fragment key={`student-${student.student_id}-${index}`}>
                              <tr>
                                <td>{indexOfFirstItem + index + 1}</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                                         style={{ width: '40px', height: '40px', fontSize: '14px', fontWeight: 'bold' }}>
                                      {student.first_name?.charAt(0) || 'N'}{student.last_name?.charAt(0) || 'A'}
                                    </div>
                                    <div>
                                      <div className="fw-bold">{`${student.first_name || ''} ${student.last_name || ''}`.trim()}</div>
                                      <div className="text-muted small">
                                        <i className="fas fa-id-card me-1"></i>{student.student_code}
                                      </div>
                                      <div className="text-muted small">
                                        <i className="fas fa-envelope me-1"></i>{student.email}
                                      </div>
                                      <div className="text-muted small">
                                        <i className="fas fa-graduation-cap me-1"></i>{student.department_name || 'ไม่ระบุสาขา'}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div>
                                    <div className="fw-medium">
                                      <i className="fas fa-school me-1 text-primary"></i>
                                      {student.school_name || 'ไม่ระบุโรงเรียน'}
                                    </div>
                                    <div className="text-muted small mt-1">
                                      <span className="badge bg-info me-2">
                                        {student.grade_level || 'ไม่ระบุชั้น'}
                                      </span>
                                      <span className="text-muted">
                                        ปีการศึกษา {student.academic_year || 'ไม่ระบุ'}
                                      </span>
                                    </div>
                                    {student.study_program && (
                                      <div className="text-muted small">
                                        <i className="fas fa-book me-1"></i>{student.study_program}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <div className="d-flex flex-column">
                                    <div className="mb-2">
                                      <div className="d-flex justify-content-between align-items-center mb-1">
                                        <small className="text-muted">คะแนนเฉลี่ย</small>
                                        <span className={`badge ${
                                          (student.average_score || 0) >= 80 ? 'bg-success' :
                                          (student.average_score || 0) >= 70 ? 'bg-warning' :
                                          (student.average_score || 0) >= 60 ? 'bg-info' : 'bg-danger'
                                        }`}>
                                          {student.average_score?.toFixed(1) || '0.0'}
                                        </span>
                                      </div>
                                      <div className="progress" style={{ height: '4px' }}>
                                        <div 
                                          className={`progress-bar ${
                                            (student.average_score || 0) >= 80 ? 'bg-success' :
                                            (student.average_score || 0) >= 70 ? 'bg-warning' :
                                            (student.average_score || 0) >= 60 ? 'bg-info' : 'bg-danger'
                                          }`}
                                          style={{ width: `${Math.min(student.average_score || 0, 100)}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                    <div className="small text-muted">
                                      <div>
                                        <i className="fas fa-tasks me-1"></i>
                                        ทำแบบทดสอบ {student.total_quizzes_taken || 0} ครั้ง
                                      </div>
                                      <div>
                                        <i className="fas fa-chart-line me-1"></i>
                                        เรียนจบ {student.completed_courses || 0}/{student.enrolled_courses || 0} วิชา
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="text-center">
                                  <StatusBadge status={student.status} />
                                  <div className="text-muted small mt-1">
                                    ลงทะเบียน {new Date(student.created_at).toLocaleDateString('th-TH')}
                                  </div>
                                </td>
                                <td>
                                  <div className="d-flex justify-content-center gap-2 action-icons">
                                    <button
                                      className="btn btn-outline-info btn-sm"
                                      onClick={() => setShowDetails(showDetails === student.student_id ? null : student.student_id)}
                                      title="ดูรายละเอียด"
                                    >
                                      <i className={`fas ${showDetails === student.student_id ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                    <Link
                                      to={`/admin-account/students/edit/${student.student_id}`}
                                      className="btn btn-outline-primary btn-sm"
                                      title="แก้ไข"
                                    >
                                      <i className="fas fa-edit"></i>
                                    </Link>
                                    <button
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => handleDeleteStudent(student.user_id)}
                                      title="ลบ"
                                    >
                                      <i className="fas fa-trash-alt"></i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              {showDetails === student.student_id && (
                                <tr>
                                  <td colSpan={6} className="bg-light">
                                    <div className="p-3">
                                      <h6 className="mb-3">
                                        <i className="fas fa-chart-bar me-2"></i>
                                        รายละเอียดผลการเรียนของ {student.first_name} {student.last_name}
                                      </h6>
                                      <div className="row">
                                        <div className="col-md-6">
                                          <div className="card">
                                            <div className="card-header bg-primary text-white">
                                              <h6 className="mb-0">ข้อมูลทั่วไป</h6>
                                            </div>
                                            <div className="card-body">
                                              <table className="table table-sm mb-0">
                                                <tbody>
                                                  <tr>
                                                    <td><strong>รหัสนักเรียน:</strong></td>
                                                    <td>{student.student_code}</td>
                                                  </tr>
                                                  <tr>
                                                    <td><strong>Username:</strong></td>
                                                    <td>{student.username}</td>
                                                  </tr>
                                                  <tr>
                                                    <td><strong>อีเมล:</strong></td>
                                                    <td>{student.email}</td>
                                                  </tr>
                                                  <tr>
                                                    <td><strong>สาขาวิชา:</strong></td>
                                                    <td>{student.department_name}</td>
                                                  </tr>
                                                  <tr>
                                                    <td><strong>ระดับการศึกษา:</strong></td>
                                                    <td>{student.education_level}</td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="col-md-6">
                                          <div className="card">
                                            <div className="card-header bg-success text-white">
                                              <h6 className="mb-0">ผลการเรียน</h6>
                                            </div>
                                            <div className="card-body">
                                              <div className="row text-center">
                                                <div className="col-6">
                                                  <div className="border rounded p-2 mb-2">
                                                    <div className="h4 text-primary mb-0">{student.average_score?.toFixed(1) || '0.0'}</div>
                                                    <small>คะแนนเฉลี่ย</small>
                                                  </div>
                                                </div>
                                                <div className="col-6">
                                                  <div className="border rounded p-2 mb-2">
                                                    <div className="h4 text-info mb-0">{student.total_quizzes_taken || 0}</div>
                                                    <small>แบบทดสอบ</small>
                                                  </div>
                                                </div>
                                                <div className="col-6">
                                                  <div className="border rounded p-2">
                                                    <div className="h4 text-success mb-0">{student.completed_courses || 0}</div>
                                                    <small>วิชาที่จบ</small>
                                                  </div>
                                                </div>
                                                <div className="col-6">
                                                  <div className="border rounded p-2">
                                                    <div className="h4 text-warning mb-0">{student.enrolled_courses || 0}</div>
                                                    <small>วิชาที่ลงทะเบียน</small>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-4">
                      <div className="text-muted small pagination-info">
                        แสดง {indexOfFirstItem + 1} ถึง {Math.min(indexOfLastItem, filteredStudents.length)} จากทั้งหมด {filteredStudents.length} รายการ
                      </div>
                      <SimplePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccountStudentArea;