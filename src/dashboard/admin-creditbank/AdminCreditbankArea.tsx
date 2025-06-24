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
  cover_image_path: string | null;
  cover_image_file_id: string | null;
  video_url: string | null;
  department_name: string | null;
  subject_count: number;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

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

const AdminCreditbankArea: React.FC = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          setError('ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่');
          return;
        }

        const response = await axios.get(`${apiURL}/api/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.courses) {
          const formattedCourses: Course[] = response.data.courses.map((course: any) => ({
            course_id: course.course_id,
            title: course.title || '',
            description: course.description || '',
            cover_image_path: course.cover_image_path || null,
            cover_image_file_id: course.cover_image_file_id || null,
            video_url: course.video_url || null,
            department_name: course.department_name || null,
            subject_count: course.subject_count || 0,
          }));
          setCourses(formattedCourses);
          setFilteredCourses(formattedCourses);
          setTotalPages(Math.ceil(formattedCourses.length / itemsPerPage));
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
          (course.title?.toLowerCase().includes(searchLower) || false) ||
          (course.department_name?.toLowerCase().includes(searchLower) || false)
      );
    }

    setFilteredCourses(results);
    setTotalPages(Math.ceil(results.length / itemsPerPage));
    setCurrentPage(1);
  }, [searchTerm, courses, itemsPerPage]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!window.confirm('คุณต้องการลบหลักสูตรนี้ใช่หรือไม่?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('กรุณาเข้าสู่ระบบก่อนใช้งาน');
        return;
      }

      const response = await axios.delete(`${apiURL}/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setCourses(prev => prev.filter(course => course.course_id !== courseId));
        setFilteredCourses(prev => prev.filter(course => course.course_id !== courseId));
        setShowDetailModal(false);
        setSelectedCourse(null);
        setShowImageLightbox(false);
        toast.success('ลบหลักสูตรสำเร็จ');
      } else {
        toast.error(response.data.message || 'ไม่สามารถลบหลักสูตรได้');
      }
    } catch (err) {
      console.error('Error deleting course:', err);
      toast.error('เกิดข้อผิดพลาดในการลบหลักสูตร');
    }
  };

  const handleRowClick = (course: Course) => {
    setSelectedCourse(course);
    setShowDetailModal(true);
    setImageLoading(true);
    setImageError(false);
    setIsDescriptionExpanded(false);
  };

  const getImageUrl = (course: Course): string => {
    if (course.cover_image_file_id) {
      return `${apiURL}/api/courses/image/${course.cover_image_file_id}`;
    }
    if (course.cover_image_path && typeof course.cover_image_path === 'string' && course.cover_image_path.trim() !== '') {
      const fileIdMatch = course.cover_image_path.match(/\/d\/(.+?)\//);
      if (fileIdMatch && fileIdMatch[1]) {
        return `${apiURL}/api/courses/image/${fileIdMatch[1]}`;
      }
    }
    return 'https://via.placeholder.com/200x200.png?text=ไม่มีรูปภาพ';
  };

  const getVideoUrl = (videoUrl: string | null): string => {
    if (!videoUrl) return '';
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const videoIdMatch = videoUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
      if (videoIdMatch) {
        return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
      }
    }
    return videoUrl;
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200.png?text=ไม่มีรูปภาพ';
    setImageLoading(false);
    setImageError(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setShowImageLightbox(false);
    }
  };

  const isDescriptionLong = (description: string): boolean => {
    return description?.length > 100;
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(prev => !prev);
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




<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
  <div className="input-group w-50">
    <input
      type="text"
      className="form-control"
      placeholder="ค้นหาหลักสูตร..."
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // รีเซ็ตหน้าเมื่อค้นหาใหม่
      }}
      aria-label="ค้นหาหลักสูตร"
    />
    <button className="btn btn-outline-secondary" type="button">
      <i className="fas fa-search"></i>
    </button>
  </div>
  <Link to="/admin-creditbank/create-new" className="btn btn-primary">
    <i className="fas fa-plus-circle me-2"></i>สร้างหลักสูตรใหม่
  </Link>
</div>

                {isLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">กำลังโหลด...</span>
                    </div>
                    <p className="mt-2 text-muted">กำลังโหลดข้อมูลหลักสูตร...</p>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger rounded-3">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <div className="text-center py-5 bg-light rounded-3">
                    <i className="fas fa-book-open fa-3x text-muted mb-3"></i>
                    <h5>ไม่พบข้อมูลหลักสูตร</h5>
                    <p className="text-muted">
                      {searchTerm ? 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา' : 'ยังไม่มีข้อมูลหลักสูตรในระบบ'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive shadow-sm rounded-3">
                      <table className="table table-hover table-sm mb-0 align-middle table-striped">
                        <thead className="table-light sticky-top">
                          <tr>
                            <th scope="col" style={{ width: '30px' }}>#</th>
                            <th scope="col">ชื่อหลักสูตร</th>
                            <th scope="col">สาขาวิชา</th>
                            <th scope="col" style={{ width: '130px' }}>จำนวนรายวิชา</th>
                            <th scope="col" style={{ width: '100px' }} className="text-center">จัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.map((course, index) => (
                            <tr
                              key={`course-${course.course_id}-${index}`}
                              onClick={() => handleRowClick(course)}
                              style={{ cursor: 'pointer' }}
                            >
                              <td>{indexOfFirstItem + index + 1}</td>
                              <td>{course.title || '-'}</td>
                              <td>{course.department_name || '-'}</td>
                              <td>{course.subject_count} วิชา</td>
                              <td className="text-center">
                                <div className="d-flex justify-content-center gap-3">
                                  <Link
                                    to={`/admin-creditbank/edit-course/${course.course_id}`}
                                    className="text-primary action-icon"
                                    onClick={(e) => e.stopPropagation()}
                                    aria-label={`แก้ไขหลักสูตร ${course.title}`}
                                  >
                                    <i className="fas fa-edit"></i>
                                  </Link>
                                  <button
                                    className="text-danger action-icon border-0 bg-transparent"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCourse(course.course_id);
                                    }}
                                    aria-label={`ลบหลักสูตร ${course.title}`}
                                  >
                                    <i className="fas fa-trash-alt"></i>
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
                        แสดง {indexOfFirstItem + 1} ถึง{' '}
                        {Math.min(indexOfLastItem, filteredCourses.length)} จากทั้งหมด{' '}
                        {filteredCourses.length} รายการ
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

      {showDetailModal && selectedCourse && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.75)' }}
          tabIndex={-1}
          aria-labelledby="courseDetailModalLabel"
          aria-hidden="false"
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="modal-header bg-gradient-primary border-0 py-3">
                <h5 className="modal-title text-white fw-bold" id="courseDetailModalLabel">
                  <i className="fas fa-book me-2" />
                  {selectedCourse.title || 'ไม่มีชื่อหลักสูตร'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedCourse(null);
                    setShowImageLightbox(false);
                    setImageLoading(true);
                    setImageError(false);
                    setIsDescriptionExpanded(false);
                  }}
                  aria-label="ปิด"
                />
              </div>
              <div className="modal-body p-4 bg-light">
                <div className="row g-4">
                  <div className="col-lg-6">
                    <div className="card shadow-sm border-0 bg-white rounded-3 h-100">
                      <div className="card-body p-4">
                        <h6 className="card-title mb-3 fw-bold text-primary border-bottom pb-2">
                          ข้อมูลหลักสูตร
                        </h6>
                        <table className="table table-borderless">
                          <tbody>
                            <tr>
                              <td className="fw-medium text-muted" style={{ width: '120px' }}>
                                ชื่อหลักสูตร:
                              </td>
                              <td>{selectedCourse.title || '-'}</td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">สาขาวิชา:</td>
                              <td>{selectedCourse.department_name || '-'}</td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">จำนวนรายวิชา:</td>
                              <td>{selectedCourse.subject_count} วิชา</td>
                            </tr>
                          </tbody>
                        </table>
                        <h6 className="card-title mb-3 fw-bold text-primary border-bottom pb-2">
                          รายละเอียด
                        </h6>
                        <div className={`description ${isDescriptionExpanded ? '' : 'description-truncated'}`}>
                          {selectedCourse.description || 'ไม่มีคำอธิบาย'}
                        </div>
                        {isDescriptionLong(selectedCourse.description || '') && (
                          <button
                            className="btn btn-link btn-sm p-0 mt-1 text-primary"
                            onClick={toggleDescription}
                            aria-expanded={isDescriptionExpanded}
                          >
                            {isDescriptionExpanded ? 'แสดงน้อยลง' : 'แสดงเพิ่ม'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="card shadow-sm border-0 bg-white rounded-3 mb-4">
                      <div className="card-body p-4">
                        <h6 className="card-title mb-3 fw-bold text-primary border-bottom pb-2">
                          รูปภาพหน้าปก
                        </h6>
                        <div className="card-img-container">
                          {imageLoading && !imageError && (
                            <div className="spinner-border text-primary mb-3" role="status">
                              <span className="visually-hidden">กำลังโหลดรูปภาพ...</span>
                            </div>
                          )}
                          {imageError ? (
                            <div className="text-muted text-center">
                              <i className="fas fa-image fa-2x mb-2"></i>
                              <p>ไม่สามารถโหลดรูปภาพได้</p>
                            </div>
                          ) : (
                            <img
                              src={getImageUrl(selectedCourse)}
                              alt={`หน้าปกของ ${selectedCourse.title || 'หลักสูตร'}`}
                              className={`img-fluid rounded-2 shadow-sm cursor-pointer ${imageLoading ? 'd-none' : ''}`}
                              style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover' }}
                              onLoad={handleImageLoad}
                              onError={handleImageError}
                              onClick={() => setShowImageLightbox(true)}
                              aria-label={`ดูภาพหน้าปกของ ${selectedCourse.title || 'หลักสูตร'} ขนาดเต็ม`}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="card shadow-sm border-0 bg-white rounded-3">
                      <div className="card-body p-4">
                        <h6 className="card-title mb-3 fw-bold text-primary border-bottom pb-2">
                          คลิปตัวอย่าง
                        </h6>
                        {selectedCourse.video_url ? (
                          <div className="ratio ratio-16x9">
                            <iframe
                              src={getVideoUrl(selectedCourse.video_url)}
                              title={`ตัวอย่างวิดีโอของ ${selectedCourse.title}`}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="rounded-2 shadow-sm"
                            ></iframe>
                          </div>
                        ) : (
                          <div className="text-center py-4 bg-light rounded-2">
                            <i className="fas fa-video-slash fa-2x text-muted mb-2"></i>
                            <p className="text-muted mb-0">ไม่มีวิดีโอตัวอย่าง</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-4 bg-light">
                <Link
                  to={`/admin-creditbank/edit-course/${selectedCourse.course_id}`}
                  className="btn btn-primary btn-sm px-4 py-2 rounded-pill me-2"
                  aria-label={`แก้ไขหลักสูตร ${selectedCourse.title}`}
                >
                  <i className="fas fa-edit me-2" />แก้ไข
                </Link>
                <button
                  type="button"
                  className="btn btn-danger btn-sm px-4 py-2 rounded-pill me-2"
                  onClick={() => handleDeleteCourse(selectedCourse.course_id)}
                  aria-label={`ลบหลักสูตร ${selectedCourse.title}`}
                >
                  <i className="fas fa-trash-alt me-2" />ลบ
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm px-4 py-2 rounded-pill"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedCourse(null);
                    setShowImageLightbox(false);
                    setImageLoading(true);
                    setImageError(false);
                    setIsDescriptionExpanded(false);
                  }}
                  aria-label="ปิด"
                >
                  <i className="fas fa-times me-2" />ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImageLightbox && selectedCourse && (
        <div
          className="lightbox fade show"
          style={{
            display: 'block',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 1060,
          }}
          onClick={() => setShowImageLightbox(false)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          aria-labelledby="imageLightboxLabel"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="lightbox-content"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: '90%',
              maxHeight: '90%',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {imageLoading && !imageError && (
              <div className="spinner-border text-light mb-3" role="status">
                <span className="visually-hidden">กำลังโหลดรูปภาพ...</span>
              </div>
            )}
            {imageError ? (
              <div className="text-light">
                <i className="fas fa-image fa-3x mb-2"></i>
                <p>ไม่สามารถโหลดรูปภาพได้</p>
              </div>
            ) : (
              <img
                src={getImageUrl(selectedCourse)}
                alt={`หน้าปกเต็มของ ${selectedCourse.title || 'หลักสูตร'}`}
                className={`img-fluid rounded-2 shadow-lg ${imageLoading ? 'd-none' : ''}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                }}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            )}
            <button
              type="button"
              className="btn-close btn-close-white"
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: '50%',
                padding: '10px',
              }}
              onClick={() => setShowImageLightbox(false)}
              aria-label="ปิดภาพหน้าปก"
            />
          </div>
        </div>
      )}

      <style>
        {`
          .modal.fade.show {
            animation: fadeIn 0.3s ease-out;
            z-index: 1050;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .modal-dialog {
            transition: transform 0.3s ease-out;
            transform: translateY(0);
            max-width: 90vw;
            width: 1200px;
          }

          .modal-content {
            border-radius: 12px !important;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }

          .modal-header.bg-gradient-primary {
            background: linear-gradient(90deg, #0d6efd, #6610f2);
            border-bottom: none;
            padding: 1.5rem 2rem;
          }

          .modal-title {
            font-size: 1.25rem;
            font-weight: 600;
            display: flex;
            align-items: center;
          }

          .modal-body.bg-light {
            background: #f8f9fa;
            padding: 2rem !important;
          }

          .card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border-radius: 12px !important;
          }

          .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important;
          }

          .card-title {
            font-size: 1.1rem;
            font-weight: 600;
          }

          .btn-danger, .btn-secondary, .btn-primary {
            transition: all 0.3s ease;
            font-weight: 500;
            padding: 0.5rem 1.5rem;
            border-radius: 50px !important;
          }

          .btn-danger:hover, .btn-secondary:hover, .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }

          .btn-danger {
            background: linear-gradient(90deg, #dc3545, #a52834);
            border: none;
          }

          .btn-secondary {
            background: #6c757d;
            border: none;
          }

          .btn-link {
            text-decoration: none;
            color: #0d6efd;
            padding: 0;
            font-size: 0.875rem;
            transition: color 0.2s ease;
          }

          .btn-link:hover {
            color: #0056b3;
            text-decoration: underline;
          }

          .table-hover tbody tr:hover {
            background-color: #f1f5f9;
            transition: background-color 0.2s ease;
            cursor: pointer;
          }

          .action-icon {
            cursor: pointer;
            font-size: 1rem;
            transition: color 0.2s ease, transform 0.2s ease;
          }

          .action-icon:hover {
            color: #007bff;
            transform: scale(1.2);
          }

          .text-danger.action-icon:hover {
            color: #a52834;
          }

          .sticky-top {
            top: 0;
            z-index: 1020;
          }

          .ratio-16x9 iframe {
            border: none;
            width: 100%;
            height: 100%;
          }

          .cursor-pointer {
            cursor: pointer;
          }

          .lightbox {
            animation: fadeIn 0.3s ease-out;
            outline: none;
          }

          .lightbox-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .lightbox-content img {
            transition: opacity 0.3s ease, transform 0.3s ease;
            opacity: 1;
          }

          .lightbox-content img.d-none {
            opacity: 0;
          }

          .card-img-container {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 150px;
          }

          .card-img-container img {
            transition: opacity 0.3s ease;
            opacity: 1;
          }

          .card-img-container img.d-none {
            opacity: 0;
          }

          .description-truncated {
            max-height: 4.5rem;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
          }

          @media (max-width: 991px) {
            .modal-dialog {
              margin: 1rem;
              max-width: 95vw;
            }
            .modal-body {
              padding: 1.5rem !important;
            }
            .card-body {
              padding: 1rem !important;
            }
            .card-img-container {
              min-height: 100px;
            }
            .card-img-container img {
              max-width: 100%;
              max-height: 150px;
            }
            .lightbox-content {
              max-width: 95%;
              max-height: 95%;
            }
            .lightbox-content img {
              max-height: 70vh;
            }
            .btn-close {
              top: -15px;
              right: -15px;
              padding: 8px;
            }
          }
        `}
      </style>
    </section>
  );
};

export default AdminCreditbankArea;