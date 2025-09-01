// $TSX:MOOC7/src/dashboard/admin-account/manager/AdminAccountManagersArea.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminBanner from "../../dashboard-common/AdminBanner";

interface Manager {
  manager_id: number;
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

const AdminAccountManagersArea: React.FC = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const [managers, setManagers] = useState<Manager[]>([]);
  const [filteredManagers, setFilteredManagers] = useState<Manager[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่');
          setIsLoading(false);
          return;
        }
        const response = await axios.get(`${apiURL}/api/accounts/managers`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.data.success) {
          setManagers(response.data.managers);
          setFilteredManagers(response.data.managers);
          setTotalPages(Math.ceil(response.data.managers.length / itemsPerPage));
        } else {
          setError('ไม่สามารถดึงข้อมูลผู้จัดการได้');
        }
      } catch (error) {
        console.error('Error fetching managers:', error);
        setError('เกิดข้อผิดพลาดในการดึงข้อมูลผู้จัดการ');
      } finally {
        setIsLoading(false);
      }
    };
    fetchManagers();
  }, [apiURL, itemsPerPage]);

  useEffect(() => {
    let results = managers;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter(
        manager =>
          manager.username.toLowerCase().includes(searchLower) ||
          manager.first_name.toLowerCase().includes(searchLower) ||
          manager.last_name.toLowerCase().includes(searchLower) ||
          manager.email.toLowerCase().includes(searchLower)
      );
    }
    if (statusFilter !== 'all') {
      results = results.filter(manager => manager.status === statusFilter);
    }
    setFilteredManagers(results);
    setTotalPages(Math.ceil(results.length / itemsPerPage));
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter, managers, itemsPerPage]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredManagers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleDeleteManager = async (managerId: number) => {
    if (window.confirm("คุณต้องการลบผู้จัดการคนนี้ใช่หรือไม่?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
          return;
        }
  
        const response = await axios.delete(`${apiURL}/api/accounts/managers/${managerId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (response.data.success) {
          setManagers(prev => prev.filter(manager => manager.manager_id !== managerId));
          setFilteredManagers(prev => prev.filter(manager => manager.manager_id !== managerId));
          toast.success("ลบผู้จัดการสำเร็จ");
        } else {
          toast.error(response.data.message || "ไม่สามารถลบผู้จัดการได้");
        }
      } catch (error) {
        console.error("Error deleting manager:", error);
        toast.error("เกิดข้อผิดพลาดในการลบผู้จัดการ");
      }
    }
  };

  const StatusBadge = ({ status }: { status: Manager["status"] }) => {
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
        badgeClass = "badge bg-warning-subtle text-warning rounded-pill px-3 py-1 small";
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
        <AdminBanner />
        <div className="dashboard__inner-wrap">
          <div className="row">
            <div className="dashboard__content-area col-12">
              <div className="dashboard__content-main">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title mb-0">จัดการบัญชีผู้จัดการ</h5>
                  <Link to="/admin-account/managers/create-new" className="btn btn-primary">
                    <i className="fas fa-plus-circle me-2"></i>เพิ่มผู้จัดการใหม่
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
                        placeholder="ค้นหาผู้จัดการ..."
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
                    <p className="mt-2 text-muted">กำลังโหลดข้อมูลผู้จัดการ...</p>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </div>
                ) : filteredManagers.length === 0 ? (
                  <div className="text-center py-5 bg-light rounded">
                    <i className="fas fa-user-tie fa-3x text-muted mb-3"></i>
                    <h5>ไม่พบข้อมูลผู้จัดการ</h5>
                    <p className="text-muted">
                      {searchTerm || statusFilter !== 'all'
                        ? 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา'
                        : 'ยังไม่มีข้อมูลผู้จัดการในระบบ'}
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
                            <th scope="col" className="text-center">จำนวนหลักสูตร</th>
                            <th scope="col" className="text-center">สถานะ</th>
                            <th scope="col" className="text-center" style={{ width: '100px' }}>จัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.map((manager, index) => (
                            <tr key={`manager-${manager.manager_id}-${index}`}>
                              <td>{indexOfFirstItem + index + 1}</td>
                              <td>{manager.username}</td>
                              <td>{`${manager.first_name} ${manager.last_name}`}</td>
                              <td>{manager.email}</td>
                              <td className="text-center">{manager.courseCount || 0}</td>
                              <td className="text-center"><StatusBadge status={manager.status}/></td>
                              <td>
                                <div className="d-flex justify-content-center gap-3">
                                  <Link
                                    to={`/admin-account/managers/edit-manager/${manager.manager_id}`}
                                    className="text-primary"
                                    style={{ display: "inline-flex", alignItems: "center" }}
                                  >
                                    <i className="fas fa-edit icon-action" style={{ cursor: "pointer", lineHeight: 1 }}></i>
                                  </Link>
                                  <i
                                    className="fas fa-trash-alt text-danger icon-action"
                                    style={{ cursor: "pointer", lineHeight: 1 }}
                                    onClick={() => {
                                      console.log('Deleting manager with id:', manager.manager_id);
                                      handleDeleteManager(manager.manager_id);
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
                        แสดง {indexOfFirstItem + 1} ถึง {Math.min(indexOfLastItem, filteredManagers.length)} จากทั้งหมด {filteredManagers.length} รายการ
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

export default AdminAccountManagersArea;
