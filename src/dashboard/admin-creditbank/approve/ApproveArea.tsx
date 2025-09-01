import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminBanner from "../../dashboard-common/AdminBanner";

// Interface สำหรับข้อมูล Payment Slip
interface PaymentSlip {
  id: number;
  subject_id: number;
  user_id: number;
  slip_url: string;
  file_name: string;
  uploaded_at: string;
  approved: boolean;
  approved_at: string | null;
  approved_by: number | null;
  rejected_at: string | null;
  rejected_by: number | null;
  rejection_reason: string | null;
  subject_title: string;
  user_name: string;
  user_email: string;
  approved_by_name: string | null;
  rejected_by_name: string | null;
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

const ApproveArea: React.FC = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const [paymentSlips, setPaymentSlips] = useState<PaymentSlip[]>([]);
  const [filteredSlips, setFilteredSlips] = useState<PaymentSlip[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState<number | null>(null);

  // ดึงข้อมูล Payment Slips
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

        // ดึงข้อมูล Payment Slips
        const response = await axios.get(`${apiURL}/api/learn/admin/payment-slips`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setPaymentSlips(response.data.slips);
          setFilteredSlips(response.data.slips);
          
          // สร้างรายการวิชา
          const uniqueSubjects = [...new Set(response.data.slips.map((slip: PaymentSlip) => slip.subject_title))] as string[];
          setSubjects(uniqueSubjects);
          setTotalPages(Math.ceil(response.data.slips.length / itemsPerPage));
        } else {
          setError('ไม่สามารถดึงข้อมูลการชำระเงินได้');
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        
        // จัดการ token หมดอายุ
        if (error.response?.status === 401) {
          const errorCode = error.response.data?.code;
          if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN') {
            setError('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
            // ลบ token และ redirect ไปหน้า login
            localStorage.removeItem('token');
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          } else {
            setError('ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่');
          }
        } else {
          setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [apiURL, itemsPerPage]);

  // กรองข้อมูล Payment Slips
  useEffect(() => {
    let results = paymentSlips;

    // กรองตามคำค้นหา
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter(
        slip =>
          slip.user_name.toLowerCase().includes(searchLower) ||
          slip.user_email.toLowerCase().includes(searchLower) ||
          slip.subject_title.toLowerCase().includes(searchLower) ||
          slip.file_name.toLowerCase().includes(searchLower)
      );
    }

    // กรองตามสถานะ
    if (statusFilter !== 'all') {
      results = results.filter(slip => {
        if (statusFilter === 'approved') return slip.approved;
        if (statusFilter === 'pending') return !slip.approved && !slip.rejected_at;
        if (statusFilter === 'rejected') return slip.rejected_at;
        return true;
      });
    }

    // กรองตามวิชา
    if (subjectFilter !== 'all') {
      results = results.filter(slip => slip.subject_title === subjectFilter);
    }

    setFilteredSlips(results);
    setTotalPages(Math.ceil(results.length / itemsPerPage));
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter, subjectFilter, paymentSlips, itemsPerPage]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSlips.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleApprovePayment = async (slipId: number) => {
    if (window.confirm("คุณต้องการอนุมัติการชำระเงินนี้ใช่หรือไม่?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
          return;
        }

        // หา subject_id จาก slip ที่ต้องการ approve
        const slipToApprove = paymentSlips.find(slip => slip.id === slipId);
        if (!slipToApprove) {
          toast.error("ไม่พบข้อมูลการชำระเงินที่ต้องการ");
          return;
        }

        const response = await axios.patch(`${apiURL}/api/learn/subject/${slipToApprove.subject_id}/approve-payment`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          // อัปเดตสถานะใน state - ใช้ slip.id และล้างข้อมูลการปฏิเสธ
          const updatedSlip = {
            ...slipToApprove,
            approved: true,
            approved_at: new Date().toISOString(),
            rejected_at: null,
            rejected_by: null,
            rejection_reason: null
          };

          setPaymentSlips(prev => prev.map(slip => 
            slip.id === slipId ? updatedSlip : slip
          ));
          
          setFilteredSlips(prev => prev.map(slip => 
            slip.id === slipId ? updatedSlip : slip
          ));
          
          toast.success("อนุมัติการชำระเงินสำเร็จ");
        } else {
          toast.error(response.data.message || "เกิดข้อผิดพลาดในการอนุมัติ");
        }
      } catch (error: any) {
        console.error("Error approving payment:", error);
        
        // จัดการ token หมดอายุ
        if (error.response?.status === 401) {
          const errorCode = error.response.data?.code;
          if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN') {
            toast.error("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
            localStorage.removeItem('token');
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          } else {
            toast.error("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
          }
        } else {
          toast.error("เกิดข้อผิดพลาดในการอนุมัติ");
        }
      }
    }
  };

  const handleRejectPayment = async (slipId: number) => {
    const reason = window.prompt("กรุณาระบุเหตุผลในการปฏิเสธ (ไม่บังคับ):");
    if (reason !== null) { // User didn't cancel
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
          return;
        }

        // หา subject_id จาก slip ที่ต้องการ reject
        const slipToReject = paymentSlips.find(slip => slip.id === slipId);
        if (!slipToReject) {
          toast.error("ไม่พบข้อมูลการชำระเงินที่ต้องการ");
          return;
        }

        const response = await axios.patch(`${apiURL}/api/learn/subject/${slipToReject.subject_id}/reject-payment`, 
          { reason: reason || 'ไม่ระบุเหตุผล' },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          // อัปเดตสถานะใน state - ล้างข้อมูลการอนุมัติและเพิ่มข้อมูลการปฏิเสธ
          const updatedSlip = {
            ...slipToReject,
            approved: false,
            approved_at: null,
            rejected_at: new Date().toISOString(),
            rejected_by: null,
            rejection_reason: reason || 'ไม่ระบุเหตุผล'
          };

          setPaymentSlips(prev => prev.map(slip => 
            slip.id === slipId ? updatedSlip : slip
          ));
          
          setFilteredSlips(prev => prev.map(slip => 
            slip.id === slipId ? updatedSlip : slip
          ));
          
          toast.success("ปฏิเสธการชำระเงินสำเร็จ");
        } else {
          toast.error(response.data.message || "เกิดข้อผิดพลาดในการปฏิเสธ");
        }
      } catch (error: any) {
        console.error("Error rejecting payment:", error);
        
        // จัดการ token หมดอายุ
        if (error.response?.status === 401) {
          const errorCode = error.response.data?.code;
          if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN') {
            toast.error("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
            localStorage.removeItem('token');
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          } else {
            toast.error("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
          }
        } else {
          toast.error("เกิดข้อผิดพลาดในการปฏิเสธ");
        }
      }
    }
  };

  const StatusBadge = ({ approved, rejected_at, rejection_reason }: { approved: boolean; rejected_at?: string | null; rejection_reason?: string | null }) => {
    // ตรวจสอบสถานะให้ชัดเจน
    const isApproved = approved === true;
    const isRejected = rejected_at !== null && rejected_at !== undefined;
    
    if (isApproved && !isRejected) {
      return (
        <span className="badge bg-success-subtle text-success rounded-pill px-3 py-1 small">
          อนุมัติแล้ว
        </span>
      );
    } else if (isRejected && !isApproved) {
      return (
        <div>
          <span className="badge bg-danger-subtle text-danger rounded-pill px-3 py-1 small">
            ถูกปฏิเสธ
          </span>
          {rejection_reason && (
            <div className="text-muted small mt-1">
              เหตุผล: {rejection_reason}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <span className="badge bg-warning-subtle text-warning rounded-pill px-3 py-1 small">
          รออนุมัติ
        </span>
      );
    }
  };

  return (
    <section className="dashboard__area section-pb-120">
      <div className="container">
        <AdminBanner />
        <div className="dashboard__inner-wrap">
          <div className="row">
            <div className="dashboard__content-area col-12">
              <div className="dashboard__content-main">
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
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title mb-0">อนุมัติการชำระเงิน</h5>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-outline-info btn-sm"
                      onClick={() => window.location.reload()}
                    >
                      <i className="fas fa-sync-alt me-2"></i>รีเฟรช
                    </button>
                  </div>
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
                        placeholder="ค้นหาชื่อ, อีเมล, วิชา, ไฟล์..."
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
                          setSubjectFilter('all');
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
                      <div className="col-md-6 mb-3">
                        <label className="form-label small">สถานะ</label>
                        <select
                          className="form-select form-select-sm"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <option value="all">ทุกสถานะ</option>
                          <option value="pending">รออนุมัติ</option>
                          <option value="approved">อนุมัติแล้ว</option>
                          <option value="rejected">ถูกปฏิเสธ</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label small">วิชา</label>
                        <select
                          className="form-select form-select-sm"
                          value={subjectFilter}
                          onChange={(e) => setSubjectFilter(e.target.value)}
                        >
                          <option value="all">ทุกวิชา</option>
                          {subjects.map((subject) => (
                            <option key={subject} value={subject}>
                              {subject}
                            </option>
                          ))}
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
                    <p className="mt-2 text-muted">กำลังโหลดข้อมูลการชำระเงิน...</p>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </div>
                ) : filteredSlips.length === 0 ? (
                  <div className="text-center py-5 bg-light rounded">
                    <i className="fas fa-receipt fa-3x text-muted mb-3"></i>
                    <h5>ไม่พบข้อมูลการชำระเงิน</h5>
                    <p className="text-muted">
                      {searchTerm || statusFilter !== 'all' || subjectFilter !== 'all'
                        ? 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา'
                        : 'ยังไม่มีข้อมูลการชำระเงินในระบบ'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-hover table-sm mb-0 align-middle">
                        <thead className="table-dark">
                          <tr>
                            <th scope="col" style={{ width: '40px' }}>#</th>
                            <th scope="col">ข้อมูลผู้ชำระ</th>
                            <th scope="col">วิชา</th>
                            <th scope="col">ไฟล์สลิป</th>
                            <th scope="col" className="text-center">สถานะ</th>
                            <th scope="col" style={{ width: '120px' }} className="text-center">จัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.map((slip, index) => (
                            <React.Fragment key={`slip-${slip.id}-${index}`}>
                              <tr>
                                <td>{indexOfFirstItem + index + 1}</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                                         style={{ width: '40px', height: '40px', fontSize: '14px', fontWeight: 'bold' }}>
                                      {slip.user_name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                      <div className="fw-bold">{slip.user_name}</div>
                                      <div className="text-muted small">
                                        <i className="fas fa-envelope me-1"></i>{slip.user_email}
                                      </div>
                                      <div className="text-muted small">
                                        <i className="fas fa-clock me-1"></i>
                                        อัปโหลดเมื่อ {new Date(slip.uploaded_at).toLocaleString('th-TH')}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div>
                                    <div className="fw-medium">
                                      <i className="fas fa-book me-1 text-primary"></i>
                                      {slip.subject_title}
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div>
                                    <div className="fw-medium">
                                      <i className="fas fa-file me-1 text-info"></i>
                                      {slip.file_name}
                                    </div>
                                    <div className="mt-2">
                                      <a 
                                        href={slip.slip_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="btn btn-outline-primary btn-sm"
                                      >
                                        <i className="fas fa-external-link-alt me-1"></i>
                                        ตรวจสลิป
                                      </a>
                                    </div>
                                  </div>
                                </td>
                                <td className="text-center">
                                  <StatusBadge 
                                    approved={slip.approved} 
                                    rejected_at={slip.rejected_at}
                                    rejection_reason={slip.rejection_reason}
                                  />
                                  {slip.approved && slip.approved_at && (
                                    <div className="text-muted small mt-1">
                                      อนุมัติเมื่อ {new Date(slip.approved_at).toLocaleString('th-TH')}
                                    </div>
                                  )}
                                  {slip.rejected_at && (
                                    <div className="text-muted small mt-1">
                                      ถูกปฏิเสธเมื่อ {new Date(slip.rejected_at).toLocaleString('th-TH')}
                                    </div>
                                  )}
                                </td>
                                <td>
                                  <div className="d-flex justify-content-center gap-2 action-icons">
                                    <button
                                      className="btn btn-outline-info btn-sm"
                                      onClick={() => setShowDetails(showDetails === slip.id ? null : slip.id)}
                                      title="ดูรายละเอียด"
                                    >
                                      <i className={`fas ${showDetails === slip.id ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                    
                                    {/* ตรวจสอบสถานะให้ชัดเจน */}
                                    {slip.approved === false && slip.rejected_at === null && (
                                      <>
                                        <button
                                          className="btn btn-outline-success btn-sm"
                                          onClick={() => handleApprovePayment(slip.id)}
                                          title="อนุมัติ"
                                        >
                                          <i className="fas fa-check"></i>
                                        </button>
                                        <button
                                          className="btn btn-outline-danger btn-sm"
                                          onClick={() => handleRejectPayment(slip.id)}
                                          title="ปฏิเสธ"
                                        >
                                          <i className="fas fa-times"></i>
                                        </button>
                                      </>
                                    )}
                                    
                                    {/* แสดงปุ่มแก้ไขเหตุผลการปฏิเสธเฉพาะเมื่อถูกปฏิเสธ */}
                                    {slip.rejected_at !== null && slip.approved === false && (
                                      <button
                                        className="btn btn-outline-warning btn-sm"
                                        onClick={() => handleRejectPayment(slip.id)}
                                        title="แก้ไขเหตุผลการปฏิเสธ"
                                      >
                                        <i className="fas fa-edit"></i>
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                              {showDetails === slip.id && (
                                <tr>
                                  <td colSpan={6} className="bg-light">
                                    <div className="p-3">
                                      <h6 className="mb-3">
                                        <i className="fas fa-receipt me-2"></i>
                                        รายละเอียดการชำระเงิน
                                      </h6>
                                      <div className="row">
                                        <div className="col-md-6">
                                          <div className="card">
                                            <div className="card-header bg-primary text-white">
                                              <h6 className="mb-0">ข้อมูลผู้ชำระ</h6>
                                            </div>
                                            <div className="card-body">
                                              <table className="table table-sm mb-0">
                                                <tbody>
                                                  <tr>
                                                    <td><strong>ชื่อ:</strong></td>
                                                    <td>{slip.user_name}</td>
                                                  </tr>
                                                  <tr>
                                                    <td><strong>อีเมล:</strong></td>
                                                    <td>{slip.user_email}</td>
                                                  </tr>
                                                  <tr>
                                                    <td><strong>วิชา:</strong></td>
                                                    <td>{slip.subject_title}</td>
                                                  </tr>
                                                  <tr>
                                                    <td><strong>อัปโหลดเมื่อ:</strong></td>
                                                    <td>{new Date(slip.uploaded_at).toLocaleString('th-TH')}</td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="col-md-6">
                                          <div className="card">
                                            <div className="card-header bg-success text-white">
                                              <h6 className="mb-0">ไฟล์สลิป</h6>
                                            </div>
                                            <div className="card-body">
                                              <div className="text-center">
                                                <div className="mb-3">
                                                  <i className="fas fa-file-pdf fa-3x text-danger"></i>
                                                </div>
                                                <div className="fw-bold">{slip.file_name}</div>
                                                <div className="text-muted small mb-3">
                                                  ไฟล์สลิปการชำระเงิน
                                                </div>
                                                <a 
                                                  href={slip.slip_url} 
                                                  target="_blank" 
                                                  rel="noopener noreferrer"
                                                  className="btn btn-primary"
                                                >
                                                  <i className="fas fa-external-link-alt me-2"></i>
                                                  เปิดดูสลิป
                                                </a>
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
                        แสดง {indexOfFirstItem + 1} ถึง {Math.min(indexOfLastItem, filteredSlips.length)} จากทั้งหมด {filteredSlips.length} รายการ
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

export default ApproveArea;
