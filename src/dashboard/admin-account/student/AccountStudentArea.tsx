import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import DashboardSidebar from "../../dashboard-common/AdminSidebar";
import DashboardBanner from "../../dashboard-common/AdminBanner";

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          setError('ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่');
          setIsLoading(false);
          return;
        }

        const response = await axios.get(`${apiURL}/api/accounts/students`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setStudents(response.data.students);
          setFilteredStudents(response.data.students);
          setTotalPages(Math.ceil(response.data.students.length / itemsPerPage));
        } else {
          setError('ไม่สามารถดึงข้อมูลนักศึกษาได้');
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        setError('เกิดข้อผิดพลาดในการดึงข้อมูลนักศึกษา');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [apiURL, itemsPerPage]);

  useEffect(() => {
    let results = students;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter(
        student =>
          student.username.toLowerCase().includes(searchLower) ||
          student.first_name.toLowerCase().includes(searchLower) ||
          student.last_name.toLowerCase().includes(searchLower) ||
          student.email.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'all') {
      results = results.filter(student => student.status === statusFilter);
    }

    setFilteredStudents(results);
    setTotalPages(Math.ceil(results.length / itemsPerPage));
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter, students, itemsPerPage]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleDeleteStudent = async (userId: number) => {
    if (window.confirm("คุณต้องการลบนักศึกษาคนนี้ใช่หรือไม่?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
          return;
        }
  
        const response = await axios.delete(`${apiURL}/api/accounts/students/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        // Update this condition to match backend response
        if (response.status === 200) {
          setStudents(prev => prev.filter(student => student.user_id !== userId));
          setFilteredStudents(prev => prev.filter(student => student.user_id !== userId));
          toast.success("ลบนักศึกษาสำเร็จ");
        }
      } catch (error) {
        console.error("Error deleting student:", error);
        toast.error("เกิดข้อผิดพลาดในการลบนักศึกษา");
      }
    }
  };
  

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge bg-success">เปิดใช้งาน</span>;
      case 'inactive':
        return <span className="badge bg-danger">ปิดใช้งาน</span>;
      case 'pending':
        return <span className="badge bg-warning">รอการยืนยัน</span>;
      default:
        return <span className="badge bg-secondary">ไม่ระบุ</span>;
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
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title mb-0">จัดการบัญชีนักศึกษา</h5>
                  <Link to="/admin-account/students/create-new" className="btn btn-primary">
                    <i className="fas fa-plus-circle me-2"></i>เพิ่มนักศึกษาใหม่
                  </Link>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6 mb-3 mb-md-0">
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
                  <div className="col-md-3">
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
                      {searchTerm || statusFilter !== 'all'
                        ? 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา'
                        : 'ยังไม่มีข้อมูลนักศึกษาในระบบ'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-hover border">
                        <thead className="table-light">
                          <tr>
                            <th scope="col" style={{ width: '50px' }}>#</th>
                            <th scope="col">ชื่อผู้ใช้</th>
                            <th scope="col">ชื่อ-นามสกุล</th>
                            <th scope="col">อีเมล</th>
                            <th scope="col" className="text-center">สถานะ</th>
                            <th scope="col" className="text-center">จัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.map((student, index) => (
                            <tr key={`student-${student.student_id}-${index}`}>
                            <td>{indexOfFirstItem + index + 1}</td>
                            <td>{student.username}</td>
                            <td>{`${student.first_name} ${student.last_name}`}</td>
                            <td>{student.email}</td>
                            <td className="text-center">{renderStatusBadge(student.status)}</td>
                            <td>
                              <div className="d-flex justify-content-center gap-3">
                                <Link
                                  to={`/admin-account/students/edit/${student.student_id}`}
                                  className="text-primary"
                                  style={{ display: "inline-flex", alignItems: "center" }}
                                >
                                  <i className="fas fa-edit icon-action" style={{ cursor: "pointer", lineHeight: 1 }}></i>
                                </Link>
                                <button
  className="btn btn-link text-danger p-0 border-0"
  onClick={() => handleDeleteStudent(student.user_id)}
  style={{ cursor: "pointer", lineHeight: 1 }}
>
  <i className="fas fa-trash-alt icon-action"></i>
</button>
                              </div>
                            </td>
                          </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-4">
                      <div className="text-muted small">
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