import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import DashboardSidebar from "../../dashboard-common/AdminSidebar";
import DashboardBanner from "../../dashboard-common/AdminBanner";

// ประกาศ interface สำหรับข้อมูลผู้สอน
interface Instructor {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  courseCount: number;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

// คอมโพเนนต์ Pagination แบบง่าย
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const SimplePagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];
  
  // สร้างปุ่มหน้าต่างๆ
  for (let i = 1; i <= totalPages; i++) {
    // แสดงเฉพาะหน้าแรก, หน้าสุดท้าย, หน้าปัจจุบัน และหน้าที่อยู่ติดกับหน้าปัจจุบัน
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
      // แสดงจุดไข่ปลา (...) เมื่อมีหน้าที่ถูกข้าม
      pageNumbers.push(-1); // ใช้ -1 แทนจุดไข่ปลา
    }
  }
  
  // กรองจุดไข่ปลาที่ซ้ำกัน
  const filteredPageNumbers = pageNumbers.filter(
    (number, index, array) => number !== -1 || (number === -1 && array[index - 1] !== -1)
  );
  
  return (
    <nav aria-label="Page navigation">
      <ul className="pagination mb-0">
        {/* ปุ่มย้อนกลับ */}
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
        </li>
        
        {/* ปุ่มหน้าต่างๆ */}
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
        
        {/* ปุ่มถัดไป */}
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
  
  // State สำหรับเก็บข้อมูลผู้สอน
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [filteredInstructors, setFilteredInstructors] = useState<Instructor[]>([]);
  
  // State สำหรับการค้นหาและกรอง
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // State สำหรับการโหลดข้อมูล
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State สำหรับการแบ่งหน้า
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // ดึงข้อมูลผู้สอนจาก API
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
  
  // กรองข้อมูลตามการค้นหาและตัวกรอง
  useEffect(() => {
    let results = instructors;
    
    // กรองตามคำค้นหา
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter(
        instructor => 
          instructor.username.toLowerCase().includes(searchLower) ||
          instructor.firstName.toLowerCase().includes(searchLower) ||
          instructor.lastName.toLowerCase().includes(searchLower) ||
          instructor.email.toLowerCase().includes(searchLower)
      );
    }
    
    // กรองตามสถานะ
    if (statusFilter !== 'all') {
      results = results.filter(instructor => instructor.status === statusFilter);
    }
    
    setFilteredInstructors(results);
    setTotalPages(Math.ceil(results.length / itemsPerPage));
    setCurrentPage(1); // รีเซ็ตหน้าเมื่อมีการกรอง
  }, [searchTerm, statusFilter, instructors, itemsPerPage]);
  
  // คำนวณข้อมูลสำหรับหน้าปัจจุบัน
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInstructors.slice(indexOfFirstItem, indexOfLastItem);
  
  // เปลี่ยนหน้า
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  // เปลี่ยนสถานะผู้สอน
  const handleStatusChange = async (instructorId: number, newStatus: 'active' | 'inactive') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่');
        return;
      }
      
      const response = await axios.put(
        `${apiURL}/api/accounts/instructors/${instructorId}/status`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // อัปเดตข้อมูลในสเตท
        setInstructors(prevInstructors => 
          prevInstructors.map(instructor => 
            instructor.id === instructorId 
              ? { ...instructor, status: newStatus }
              : instructor
          )
        );
        
        toast.success(`เปลี่ยนสถานะผู้สอนเป็น ${newStatus === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} สำเร็จ`);
      } else {
        toast.error(response.data.message || 'ไม่สามารถเปลี่ยนสถานะผู้สอนได้');
      }
    } catch (error) {
      console.error('Error changing instructor status:', error);
      toast.error('เกิดข้อผิดพลาดในการเปลี่ยนสถานะผู้สอน');
    }
  };
  
  // แสดงสถานะในรูปแบบ badge
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
                  <h5 className="card-title mb-0">จัดการบัญชีผู้สอน</h5>
                  <Link to="/admin-account/instructors/create-new" className="btn btn-primary">
                    <i className="fas fa-plus-circle me-2"></i>เพิ่มผู้สอนใหม่
                  </Link>
                </div>
                
                {/* ส่วนค้นหาและกรอง */}
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
                  <div className="col-md-3">

                  </div>
                </div>
                
                {/* แสดงข้อความโหลดหรือข้อผิดพลาด */}
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
                                    {/* ตารางแสดงข้อมูลผู้สอน */}
                                    <div className="table-responsive">
                                      <table className="table table-hover border">
                                        <thead className="table-light">
                                          <tr>
                                            <th scope="col" style={{ width: '50px' }}>#</th>
                                            <th scope="col">ชื่อผู้ใช้</th>
                                            <th scope="col">ชื่อ-นามสกุล</th>
                                            <th scope="col">อีเมล</th>
                                            <th scope="col" className="text-center">จำนวนรายวิชา</th>
                                            <th scope="col" className="text-center">สถานะ</th>
                                            <th scope="col" className="text-center">จัดการ</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {currentItems.map((instructor, index) => (
                                            <tr key={`instructor-${instructor.id}-${index}`}>
                                              <td>{indexOfFirstItem + index + 1}</td>
                                              <td>{instructor.username}</td>
                                              <td>{`${instructor.firstName} ${instructor.lastName}`}</td>
                                              <td>{instructor.email}</td>
                                              <td className="text-center">{instructor.courseCount}</td>
                                              <td className="text-center">
                                                {renderStatusBadge(instructor.status)}
                                              </td>
                                              <td>
                                                <div className="d-flex justify-content-center gap-2">
                                                  <Link 
                                                    to={`/admin-account/instructors/edit/${instructor.id}`} 
                                                    className="btn btn-sm btn-outline-primary"
                                                    title="แก้ไข"
                                                  >
                                                    <i className="fas fa-edit"></i>
                                                  </Link>
                                                  
                                                  {instructor.status === 'active' ? (
                                                    <button
                                                      className="btn btn-sm btn-outline-danger"
                                                      title="ปิดใช้งาน"
                                                      onClick={() => handleStatusChange(instructor.id, 'inactive')}
                                                    >
                                                      <i className="fas fa-ban"></i>
                                                    </button>
                                                  ) : (
                                                    <button
                                                      className="btn btn-sm btn-outline-success"
                                                      title="เปิดใช้งาน"
                                                      onClick={() => handleStatusChange(instructor.id, 'active')}
                                                    >
                                                      <i className="fas fa-check-circle"></i>
                                                    </button>
                                                  )}
                                                </div>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                    
                                    {/* Pagination */}
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
                