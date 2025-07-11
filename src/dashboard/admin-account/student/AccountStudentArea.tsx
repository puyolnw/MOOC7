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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

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
          (student.department_name || '').toLowerCase().includes(searchLower)
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

    setFilteredStudents(results);
    setTotalPages(Math.ceil(results.length / itemsPerPage));
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter, departmentFilter, students, itemsPerPage]);

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

                <div className="row mb-4 search-filter-row">
                  <div className="col-md-4 mb-3 mb-md-0">
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="fas fa-search text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="ค้นหานักศึกษา..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4 mb-3 mb-md-0">
                    <select
                      className="form-select"
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                    >
                      <option value="all">ทุกสาขาวิชา</option>
                      {departments.map((dept) => (
                        <option key={dept.department_id} value={dept.department_id}>
                          {dept.department_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <select
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">สถานะทั้งหมด</option>
                      <option value="active">เปิดใช้งาน</option>
                      <option value="inactive">ปิดใช้งาน</option>
                      <option value="pending">รอการยืนยัน</option>
                    </select>
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
                      <table className="table table-hover table-sm mb-0 align-middle table-striped">
                        <thead className="table-light">
                          <tr>
                            <th scope="col" style={{ width: '50px' }}>#</th>
                            <th scope="col">รหัสนักศึกษา</th>
                            <th scope="col">ชื่อผู้ใช้</th>
                            <th scope="col">ชื่อ-นามสกุล</th>
                            <th scope="col">อีเมล</th>
                            <th scope="col">สาขาวิชา</th>
                            <th scope="col" style={{ width: '120px' }} >ระดับการศึกษา</th>
                            <th scope="col" className="text-center">สถานะ</th>
                            <th scope="col" style={{ width: '100px' }} className="text-center">จัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.map((student, index) => (
                            <tr key={`student-${student.student_id}-${index}`}>
                              <td data-label="#">{indexOfFirstItem + index + 1}</td>
                              <td data-label="รหัสนักศึกษา">{student.student_code}</td>
                              <td data-label="ชื่อผู้ใช้">{student.username}</td>
                              <td data-label="ชื่อ-นามสกุล">{`${student.first_name} ${student.last_name}`}</td>
                              <td data-label="อีเมล">{student.email}</td>
                              <td data-label="สาขาวิชา">{student.department_name || 'ไม่ระบุ'}</td>
                              <td data-label="ระดับการศึกษา">{student.education_level || 'ไม่ระบุ'}</td>
                              <td data-label="สถานะ"><StatusBadge status={student.status }/></td>
                              <td data-label="จัดการ">
                                <div className="d-flex justify-content-center gap-3 action-icons">
                                  <Link
                                    to={`/admin-account/students/edit/${student.student_id}`}
                                    className="text-primary"
                                    style={{ display: "inline-flex", alignItems: "center" }}
                                  >
                                    <i className="fas fa-edit icon-action" style={{ cursor: "pointer", lineHeight: 1 }}></i>
                                  </Link>
                                  <i
                                    className="fas fa-trash-alt text-danger icon-action"
                                    style={{ cursor: "pointer", lineHeight: 1 }}
                                    onClick={() => {
                                      console.log('Deleting student with user_id:', student.user_id);
                                      handleDeleteStudent(student.user_id);
                                    }}
                                  ></i>
                                </div>
                              </td>
                            </tr>
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