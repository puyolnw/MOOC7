import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  status: "active" | "inactive" | "draft";
  created_at: string;
}

const InstSubjectsArea = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL;

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
            status: subject.status,
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

  // Status badge component
  const StatusBadge = ({ status }: { status: Subject["status"] }) => {
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

  // Statistics
  const totalSubjects = subjects.length;
  const countByStatus = {
    active: subjects.filter((s) => s.status === "active").length,
    inactive: subjects.filter((s) => s.status === "inactive").length,
    draft: subjects.filter((s) => s.status === "draft").length,
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

                {/* Statistics */}
                <div className="mb-4">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <div className="bg-light rounded p-3 text-center">
                        <h6 className="mb-1 text-muted">วิชาทั้งหมด</h6>
                        <h5 className="mb-0">{totalSubjects} วิชา</h5>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="bg-success-subtle rounded p-3 text-center">
                        <h6 className="mb-1 text-success">เปิดใช้งาน</h6>
                        <h5 className="mb-0">{countByStatus.active} วิชา</h5>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="bg-danger-subtle rounded p-3 text-center">
                        <h6 className="mb-1 text-danger">ปิดใช้งาน</h6>
                        <h5 className="mb-0">{countByStatus.inactive} วิชา</h5>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="bg-secondary-subtle rounded p-3 text-center">
                        <h6 className="mb-1 text-secondary">ฉบับร่าง</h6>
                        <h5 className="mb-0">{countByStatus.draft} วิชา</h5>
                      </div>
                    </div>
                  </div>
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
                              <th className="text-center">สถานะ</th>
                              <th style={{ width: "100px" }} className="text-center">จัดการ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentSubjects.length > 0 ? (
                              currentSubjects.map((subject) => (
                                <tr key={subject.subject_id}>
                                  <td>
                                    <img
                                      src={getImageUrl(subject.cover_image)}
                                      alt={subject.subject_name}
                                      className="img-thumbnail"
                                      style={{ width: "70px", height: "50px", objectFit: "cover", cursor: "pointer" }}
                                      onClick={() => setModalImage(getImageUrl(subject.cover_image))}
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                          "/assets/img/courses/default-course.jpg";
                                      }}
                                    />
                                  </td>
                                  <td>{subject.subject_code}</td>
                                  <td>{subject.subject_name}</td>
                                  <td>
                                    <span className="badge bg-info-subtle text-info rounded-pill px-3 py-1">
                                      {subject.instructor_count} คน
                                    </span>
                                  </td>
                                  <td>
                                    <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1">
                                      {subject.lesson_count} บทเรียน
                                    </span>
                                  </td>
                                  <td>{subject.department_name || "ไม่ระบุ"}</td>
                                  <td className="text-center">
                                    <StatusBadge status={subject.status} />
                                  </td>
                                  <td>
                                    <div className="d-flex justify-content-center gap-3">
                                      <Link
                                        to={`/admin-subjects/edit-subject/${subject.subject_id}`}
                                        className="text-primary"
                                        style={{ display: "inline-flex", alignItems: "center" }}
                                      >
                                        <i className="fas fa-edit icon-action" style={{ lineHeight: 1 }}></i>
                                      </Link>
                                      <i
                                        className="fas fa-trash-alt text-danger icon-action"
                                        style={{ cursor: "pointer", lineHeight: 1 }}
                                        onClick={() => handleDeleteSubject(subject.subject_id)}
                                      ></i>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={8} className="text-center py-4">
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
    </section>
  );
};

export default InstSubjectsArea;