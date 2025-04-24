// $TSX:MOOC7/src/dashboard/admin-account/instructor/AdminAccountInstructorsArea.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import DashboardSidebar from "../../dashboard-common/AdminSidebar";
import DashboardBanner from "../../dashboard-common/AdminBanner";

interface Instructor {
  instructor_id: number; // Add this
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  courseCount: number;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
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

const AdminAccountInstructorsArea: React.FC = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [filteredInstructors, setFilteredInstructors] = useState<Instructor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่');
          setIsLoading(false);
          return;
        }
        const response = await axios.get(`${apiURL}/api/accounts/instructors`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.data.success) {
          setInstructors(response.data.instructors);
          setFilteredInstructors(response.data.instructors);
          setTotalPages(Math.ceil(response.data.instructors.length / itemsPerPage));
        } else {
          setError('ไม่สามารถดึงข้อมูลผู้สอนได้');
        }
      } catch (error) {
        console.error('Error fetching instructors:', error);
        setError('เกิดข้อผิดพลาดในการดึงข้อมูลผู้สอน');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInstructors();
  }, [apiURL, itemsPerPage]);

  useEffect(() => {
    let results = instructors;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter(
        instructor =>
          instructor.username.toLowerCase().includes(searchLower) ||
          instructor.first_name.toLowerCase().includes(searchLower) ||
          instructor.last_name.toLowerCase().includes(searchLower) ||
          instructor.email.toLowerCase().includes(searchLower)
      );
    }
    if (statusFilter !== 'all') {
      results = results.filter(instructor => instructor.status === statusFilter);
    }
    setFilteredInstructors(results);
    setTotalPages(Math.ceil(results.length / itemsPerPage));
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter, instructors, itemsPerPage]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInstructors.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleDeleteInstructor = async (instructorId: number) => {
    if (window.confirm("คุณต้องการลบผู้สอนคนนี้ใช่หรือไม่?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
          return;
        }
  
        const response = await axios.delete(`${apiURL}/api/accounts/instructors/${instructorId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        // Update this condition to match backend response
        if (response.data.message === "Instructor deleted successfully") {
          setInstructors(prev => prev.filter(instructor => instructor.instructor_id !== instructorId));
          setFilteredInstructors(prev => prev.filter(instructor => instructor.instructor_id !== instructorId));
          toast.success("ลบผู้สอนสำเร็จ");
        } else {
          toast.error(response.data.message || "ไม่สามารถลบผู้สอนได้");
        }
      } catch (error) {
        console.error("Error deleting instructor:", error);
        toast.error("เกิดข้อผิดพลาดในการลบผู้สอน");
      }
    }
  };
  

  const StatusBadge = ({ status }: { status: Instructor["status"] }) => {
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
      <div className="container">
        <DashboardBanner />
        <div className="dashboard__inner-wrap">
          <div className="row">
            <DashboardSidebar />
            <div className="dashboard__content-area col-lg-9">
              <div className="dashboard__content-main">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title mb-0">จัดการบัญชีผู้สอน</h5>
                  <Link to="/admin-account/instructors/create-new" className="btn btn-primary">
                    <i className="fas fa-plus-circle me-2"></i>เพิ่มผู้สอนใหม่
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
                        placeholder="ค้นหาผู้สอน..."
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
                    <p className="mt-2 text-muted">กำลังโหลดข้อมูลผู้สอน...</p>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </div>
                ) : filteredInstructors.length === 0 ? (
                  <div className="text-center py-5 bg-light rounded">
                    <i className="fas fa-user-slash fa-3x text-muted mb-3"></i>
                    <h5>ไม่พบข้อมูลผู้สอน</h5>
                    <p className="text-muted">
                      {searchTerm || statusFilter !== 'all'
                        ? 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา'
                        : 'ยังไม่มีข้อมูลผู้สอนในระบบ'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-hover table-sm mb-0 align-middle table-striped">
                        <thead className="table-light">
                          <tr>
                            <th scope="col" style={{ width: '50px' }}>#</th>
                            <th scope="col">ชื่อผู้ใช้</th>
                            <th scope="col">ชื่อ-นามสกุล</th>
                            <th scope="col">อีเมล</th>
                            <th scope="col" className="text-center">สถานะ</th>
                            <th scope="col" className="text-center" style={{ width: '100px' }}>จัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.map((instructor, index) => (
                            <tr key={`instructor-${instructor.instructor_id}-${index}`}>
                              <td>{indexOfFirstItem + index + 1}</td>
                              <td>{instructor.username}</td>
                              <td>{`${instructor.first_name} ${instructor.last_name}`}</td>
                              <td>{instructor.email}</td>
                              <td className="text-center"><StatusBadge status={instructor.status}/></td>
                              <td>
                                <div className="d-flex justify-content-center gap-3">
                                  <Link
                                    to={`/admin-account/instructors/edit/${instructor.instructor_id}`}
                                    className="text-primary"
                                    style={{ display: "inline-flex", alignItems: "center" }}
                                  >
                                    <i className="fas fa-edit icon-action" style={{ cursor: "pointer", lineHeight: 1 }}></i>
                                  </Link>
                                  <i
                                    className="fas fa-trash-alt text-danger icon-action"
                                    style={{ cursor: "pointer", lineHeight: 1 }}
                                    onClick={() => {
                                      console.log('Deleting instructor with id:', instructor.instructor_id);
                                      handleDeleteInstructor(instructor.instructor_id);
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
                      <div className="text-muted small">
                        แสดง {indexOfFirstItem + 1} ถึง {Math.min(indexOfLastItem, filteredInstructors.length)} จากทั้งหมด {filteredInstructors.length} รายการ
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

export default AdminAccountInstructorsArea;
