import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import DashboardSidebar from "../dashboard-common/AdminSidebar";
import DashboardBanner from "../dashboard-common/AdminBanner";

interface Course {
  course_id: number;
  title: string;
  description: string;
  cover_image_path: string;
  video_url: string;
  status: 'active' | 'inactive' | 'draft';
  department_name: string;
  subject_count: number;
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

const AdminCreditbankArea: React.FC = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          setError('ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่');
          setIsLoading(false);
          return;
        }

        const response = await axios.get(`${apiURL}/api/courses`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setCourses(response.data.courses);
          setFilteredCourses(response.data.courses);
          setTotalPages(Math.ceil(response.data.courses.length / itemsPerPage));
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

    fetchCourses();
  }, [apiURL, itemsPerPage]);

  useEffect(() => {
    let results = courses;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter(
        course =>
          course.title.toLowerCase().includes(searchLower) ||
          course.department_name.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'all') {
      results = results.filter(course => course.status === statusFilter);
    }

    setFilteredCourses(results);
    setTotalPages(Math.ceil(results.length / itemsPerPage));
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter, courses, itemsPerPage]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (window.confirm("คุณต้องการลบหลักสูตรนี้ใช่หรือไม่?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
          return;
        }

        const response = await axios.delete(`${apiURL}/api/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setCourses((prev) => prev.filter((course) => course.course_id !== courseId));
          toast.success("ลบหลักสูตรสำเร็จ");
        } else {
          toast.error(response.data.message || "ไม่สามารถลบหลักสูตรได้");
        }
      } catch (error) {
        console.error("Error deleting course:", error);
        toast.error("เกิดข้อผิดพลาดในการลบหลักสูตร");
      }
    }
  };

  const StatusBadge = ({ status }: { status: Course["status"] }) => {
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
      case "draft":
        badgeClass = "badge bg-secondary-subtle text-secondary rounded-pill px-3 py-1 small";
        statusText = "ฉบับร่าง";
        break;
    }

    return <span className={badgeClass}>{statusText}</span>;
  };

  // คำนวณจำนวนหลักสูตรตามสถานะ
  const totalCourses = courses.length;
  const activeCourses = courses.filter(course => course.status === 'active').length;
  const inactiveCourses = courses.filter(course => course.status === 'inactive').length;
  const draftCourses = courses.filter(course => course.status === 'draft').length;

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
                  <h5 className="card-title mb-0">จัดการหลักสูตร</h5>
                  <Link to="/admin-creditbank/create-new" className="btn btn-primary">
                    <i className="fas fa-plus-circle me-2"></i>สร้างหลักสูตรใหม่
                  </Link>
                </div>

                {/* การ์ดแสดงข้อมูลหลักสูตร */}
                <div className="row mb-4">
                  <div className="col-md-3">
                    <div className="bg-light rounded p-3 text-center">
                      <h6 className="mb-1 text-muted">หลักสูตรทั้งหมด</h6>
                      <h5 className="mb-0">{totalCourses} หลักสูตร</h5>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="bg-success-subtle rounded p-3 text-center">
                      <h6 className="mb-1 text-success">เปิดใช้งาน</h6>
                      <h5 className="mb-0">{activeCourses} หลักสูตร</h5>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="bg-danger-subtle rounded p-3 text-center">
                      <h6 className="mb-1 text-danger">ปิดใช้งาน</h6>
                      <h5 className="mb-0">{inactiveCourses} หลักสูตร</h5>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="bg-secondary-subtle rounded p-3 text-center">
                      <h6 className="mb-1 text-secondary">ฉบับร่าง</h6>
                      <h5 className="mb-0">{draftCourses} หลักสูตร</h5>
                    </div>
                  </div>
                </div>

                {/* ฟิลเตอร์การค้นหา */}
                <div className="row mb-4">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="fas fa-search text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="ค้นหาหลักสูตร..."
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
                      <option value="draft">แบบร่าง</option>
                    </select>
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">กำลังโหลด...</span>
                    </div>
                    <p className="mt-2 text-muted">กำลังโหลดข้อมูลหลักสูตร...</p>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <div className="text-center py-5 bg-light rounded">
                    <i className="fas fa-book-open fa-3x text-muted mb-3"></i>
                    <h5>ไม่พบข้อมูลหลักสูตร</h5>
                    <p className="text-muted">
                      {searchTerm || statusFilter !== 'all'
                        ? 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา'
                        : 'ยังไม่มีข้อมูลหลักสูตรในระบบ'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-hover table-sm mb-0 align-middle table-striped">
                        <thead className="table-light">
                          <tr>
                            <th scope="col" style={{ width: '30px' }}>#</th>
                            <th scope="col">ชื่อหลักสูตร</th>
                            <th scope="col">สาขาวิชา</th>
                            <th scope="col" style={{ width: '130px' }}>จำนวนรายวิชา</th>
                            <th scope='col' className='text-center'>สถานะ</th>
                            <th scope='col' style={{ width: '100px' }} className='text-center'>จัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.map((course, index) => (
                            <tr key={`course-${course.course_id}-${index}`}>
                              <td>{indexOfFirstItem + index + 1}</td>
                              <td>{course.title}</td>
                              <td>{course.department_name}</td>
                              <td>{course.subject_count} วิชา</td>
                              <td className='text-center'>
                                <StatusBadge status={course.status} />
                              </td>
                              <td>
                                <div className="d-flex justify-content-center text-center gap-3">
                                  <Link
                                    to={`/admin-creditbank/edit-course/${course.course_id}`}
                                    className="text-primary"
                                    style={{ display: "inline-flex", alignItems: "center" }}
                                  >
                                    <i className="fas fa-edit icon-action" style={{ cursor: "pointer", lineHeight: 1 }}></i>
                                  </Link>
                                  <i
                                    className="fas fa-trash-alt text-danger icon-action"
                                    style={{ cursor: "pointer", lineHeight: 1 }}
                                    onClick={() => handleDeleteCourse(course.course_id)}
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
                        แสดง {indexOfFirstItem + 1} ถึง {Math.min(indexOfLastItem, filteredCourses.length)} จากทั้งหมด {filteredCourses.length} รายการ
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

export default AdminCreditbankArea;
