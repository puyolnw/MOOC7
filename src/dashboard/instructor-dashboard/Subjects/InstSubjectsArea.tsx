import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import DashboardBanner from "../../dashboard-common/DashboardBanner";
import DashboardSidebar from "../../dashboard-common/DashboardSidebar";

// Define subject type
interface Subject {
  subject_id: number;
  subject_code: string;
  subject_name: string;
  cover_image: string | null; // URL (webViewLink) from Google Drive or null
  department_name: string | null; // Allow null for consistency
  instructor_count: number;
  lesson_count: number;
  course_count: number;
  created_at: string;
}

const InsSubjectsArea = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const closeModal = () => setModalImage(null);
  const subjectsPerPage = 10;

  // ฟังก์ชันแปลง webViewLink เป็น URL สำหรับเรียก endpoint ใน backend
  const getImageUrl = (webViewLink: string | null) => {
    if (!webViewLink) return "/assets/img/courses/default-course.jpg";
    const fileIdMatch = webViewLink.match(/\/d\/(.+?)\//);
    if (!fileIdMatch) return "/assets/img/courses/default-course.jpg";
    const fileId = fileIdMatch[1];
    return `${apiUrl}/api/courses/subjects/image/${fileId}`; // เรียก endpoint ใน backend
  };

  // Fetch subjects from API
  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("กรุณาเข้าสู่ระบบก่อนใช้งาน");
          setIsLoading(false);
          return;
        }

        const response = await axios.get(`${apiUrl}/api/courses/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          const formattedSubjects = response.data.subjects.map((subject: any) => ({
            subject_id: subject.subject_id,
            subject_code: subject.subject_code,
            subject_name: subject.subject_name,
            cover_image: subject.cover_image || null,
            department_name: subject.department_name || null,
            instructor_count: subject.instructor_count || 0,
            lesson_count: subject.lesson_count || 0,
            course_count: subject.course_count || 0,
            created_at: subject.created_at,
          }));
          setSubjects(formattedSubjects);
        } else {
          setError(response.data.message || "ไม่สามารถโหลดข้อมูลรายวิชาได้");
        }
      } catch (err: any) {
        console.error("Error fetching subjects:", err);
        const errorMessage =
          err.response?.data?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลรายวิชา";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, [apiUrl]);

  // Filter subjects based on search term
  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.subject_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.department_name &&
        subject.department_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate pagination
  const indexOfLastSubject = currentPage * subjectsPerPage;
  const indexOfFirstSubject = indexOfLastSubject - subjectsPerPage;
  const currentSubjects = filteredSubjects.slice(indexOfFirstSubject, indexOfLastSubject);
  const totalPages = Math.ceil(filteredSubjects.length / subjectsPerPage);

  // Handle delete subject
  const handleDeleteSubject = async (id: number) => {
    if (window.confirm("คุณต้องการลบรายวิชานี้ใช่หรือไม่?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("กรุณาเข้าสู่ระบบก่อนดำเนินการ");
          return;
        }

        const response = await axios.delete(`${apiUrl}/api/courses/subjects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          toast.success("ลบรายวิชาสำเร็จ");
          setSubjects(subjects.filter((subject) => subject.subject_id !== id));
          setShowDetailModal(false);
          setSelectedSubject(null);
        } else {
          toast.error(response.data.message || "ไม่สามารถลบรายวิชาได้");
        }
      } catch (err: any) {
        console.error("Error deleting subject:", err);
        const errorMessage =
          err.response?.data?.message || "เกิดข้อผิดพลาดในการลบรายวิชา";
        toast.error(errorMessage);
      }
    }
  };

  // Handle row click
  const handleRowClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setShowDetailModal(true);
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
                <div className="dashboard__content-header mb-4">
                  <h2 className="title text-muted">รายการวิชา</h2>
                  <p className="desc">จัดการรายวิชาทั้งหมดในระบบ</p>
                </div>

                {/* Search and Add button */}
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <div className="input-group w-50">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ค้นหารายวิชา..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                    <button className="btn btn-outline-secondary" type="button">
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                  <Link to="/instructor-subjects/create-new" className="btn btn-primary">
                    <i className="fas fa-plus-circle me-2"></i>เพิ่มรายวิชา
                  </Link>
                </div>

                {/* Loading and Error states */}
                {isLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">กำลังโหลด...</span>
                    </div>
                    <p className="mt-3">กำลังโหลดข้อมูลรายวิชา...</p>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </div>
                ) : (
                  /* Subjects table */
                  <div className="card shadow-sm border-0">
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover table-sm mb-0 align-middle table-striped">
                          <thead className="table-light">
                            <tr>
                              <th style={{ width: "80px" }} className="text-center">รูปปก</th>
                              <th style={{ width: "100px" }}>รหัสวิชา</th>
                              <th>ชื่อวิชา</th>
                              <th>ผู้สอน</th>
                              <th>บทเรียน</th>
                              <th>หมวดหมู่</th>
                              <th style={{ width: "100px" }} className="text-center">จัดการ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentSubjects.length > 0 ? (
                              currentSubjects.map((subject) => (
                                <tr key={subject.subject_id}>
                                  <td onClick={() => handleRowClick(subject)}>
                                    <img
                                      src={getImageUrl(subject.cover_image)}
                                      alt={subject.subject_name}
                                      className="img-thumbnail"
                                      style={{ width: "70px", height: "50px", objectFit: "cover", cursor: "pointer" }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setModalImage(getImageUrl(subject.cover_image));
                                      }}
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                          "/assets/img/courses/default-course.jpg";
                                      }}
                                    />
                                  </td>
                                  <td onClick={() => handleRowClick(subject)}>{subject.subject_code}</td>
                                  <td onClick={() => handleRowClick(subject)}>{subject.subject_name}</td>
                                  <td onClick={() => handleRowClick(subject)}>
                                    <span className="badge bg-info-subtle text-info rounded-pill px-3 py-1">
                                      {subject.instructor_count} คน
                                    </span>
                                  </td>
                                  <td onClick={() => handleRowClick(subject)}>
                                    <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1">
                                      {subject.lesson_count} บทเรียน
                                    </span>
                                  </td>
                                  <td onClick={() => handleRowClick(subject)}>{subject.department_name || "ไม่ระบุ"}</td>
                                  <td>
                                    <div className="d-flex justify-content-center gap-3 action-icons">
                                      <i
                                        className="fas fa-edit text-primary icon-action"
                                        style={{ cursor: "pointer", lineHeight: 1 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/admin-subjects/edit-subject/${subject.subject_id}`);
                                        }}
                                      ></i>
                                      <i
                                        className="fas fa-trash-alt text-danger icon-action"
                                        style={{ cursor: "pointer", lineHeight: 1 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteSubject(subject.subject_id);
                                        }}
                                      ></i>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={7} className="text-center py-4">
                                  ไม่พบข้อมูลรายวิชา
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    {totalPages > 1 && (
                      <div className="card-footer bg-light text-center">
                        <nav aria-label="Page navigation">
                          <ul className="pagination justify-content-center mb-0">
                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                              <button
                                className="page-link"
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                              >
                                <i className="fas fa-chevron-left small"></i>
                              </button>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                                <button className="page-link" onClick={() => setCurrentPage(page)}>
                                  {page}
                                </button>
                              </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                              <button
                                className="page-link"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                              >
                                <i className="fas fa-chevron-right small"></i>
                              </button>
                            </li>
                          </ul>
                        </nav>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {modalImage && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">ภาพปกรายวิชา</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body text-center">
                <img
                  src={modalImage}
                  alt="Subject Cover"
                  className="img-fluid"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/assets/img/courses/default-course.jpg";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subject Detail Modal */}
      {showDetailModal && selectedSubject && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.75)' }}
          tabIndex={-1}
          aria-labelledby="subjectDetailModalLabel"
          aria-hidden="false"
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="modal-header bg-gradient-primary border-0 py-3">
                <h5 className="modal-title text-white fw-bold" id="subjectDetailModalLabel">
                  <i className="fas fa-book me-2" />
                  {selectedSubject.subject_name}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedSubject(null);
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
                          ข้อมูลรายวิชา
                        </h6>
                        <table className="table table-borderless">
                          <tbody>
                            <tr>
                              <td className="fw-medium text-muted" style={{ width: '120px' }}>รหัสวิชา:</td>
                              <td>{selectedSubject.subject_code}</td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">ชื่อวิชา:</td>
                              <td>{selectedSubject.subject_name}</td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">หมวดหมู่:</td>
                              <td>{selectedSubject.department_name || 'ไม่ระบุ'}</td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">จำนวนผู้สอน:</td>
                              <td>{selectedSubject.instructor_count} คน</td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">จำนวนบทเรียน:</td>
                              <td>{selectedSubject.lesson_count} บทเรียน</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="card shadow-sm border-0 bg-white rounded-3">
                      <div className="card-body p-4">
                        <h6 className="card-title mb-3 fw-bold text-primary border-bottom pb-2">
                          รูปภาพหน้าปก
                        </h6>
                        <div className="card-img-container">
                          <img
                            src={getImageUrl(selectedSubject.cover_image)}
                            alt={selectedSubject.subject_name}
                            className="img-fluid rounded-2 shadow-sm cursor-pointer"
                            style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/assets/img/courses/default-course.jpg";
                            }}
                            onClick={() => setModalImage(getImageUrl(selectedSubject.cover_image))}
                            aria-label={`ดูภาพหน้าปกของ ${selectedSubject.subject_name} ขนาดเต็ม`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-4 bg-light">
                <Link
                  to={`/admin-subjects/edit-subject/${selectedSubject.subject_id}`}
                  className="btn btn-primary btn-sm px-4 py-2 rounded-pill me-2"
                  aria-label={`แก้ไขรายวิชา ${selectedSubject.subject_name}`}
                >
                  <i className="fas fa-edit me-2" />แก้ไข
                </Link>
                <button
                  type="button"
                  className="btn btn-danger btn-sm px-4 py-2 rounded-pill me-2"
                  onClick={() => handleDeleteSubject(selectedSubject.subject_id)}
                  aria-label={`ลบรายวิชา ${selectedSubject.subject_name}`}
                >
                  <i className="fas fa-trash-alt me-2" />ลบ
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm px-4 py-2 rounded-pill"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedSubject(null);
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

          .cursor-pointer {
            cursor: pointer;
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
          }
        `}
      </style>
    </section>
  );
};

export default InsSubjectsArea;