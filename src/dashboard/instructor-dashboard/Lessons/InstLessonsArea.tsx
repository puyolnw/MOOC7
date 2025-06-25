import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import DashboardBanner from "../../dashboard-common/DashboardBanner";
import DashboardSidebar from "../../dashboard-common/DashboardSidebar";

type TestType = "MC" | "TF" | "SC" | "FB" | null;

interface Lesson {
  lesson_id: number | null;
  title: string;
  hasVideo: boolean;
  video_url?: string;
  file_url?: string;
  creator: string;
  courseCode: string;
  courseName: string;
  status: "active" | "inactive" | "draft";
  testType: TestType;
  subject?: string;
  quizTitle?: string;
  quiz_id?: number | null;
}

const InsLessonsArea = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const lessonsPerPage = 10;
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLessons = async () => {
      setIsLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
          setIsLoading(false);
          return;
        }

        const response = await axios.get<{ success: boolean; lessons: any[] }>(`${apiUrl}/api/courses/lessons`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          const formattedLessons: Lesson[] = response.data.lessons.map((lesson) => ({
            lesson_id: lesson.lesson_id ?? lesson.id ?? null,
            title: lesson.title || "",
            hasVideo: !!lesson.video_url,
            video_url: lesson.video_url || undefined,
            file_url: lesson.file_url || undefined,
            creator: lesson.creator_name || "ไม่ระบุ",
            courseCode: lesson.coursecode || "ไม่ระบุ",
            courseName: lesson.coursename || "ไม่ระบุ",
            status: lesson.status || "inactive",
            testType: lesson.testtype || null,
            subject: lesson.subjects && typeof lesson.subjects === "object" ? lesson.subjects.subject_name : lesson.subjects || "ไม่มี",
            quizTitle: lesson.quiz_title || (lesson.quiz_id ? `แบบทดสอบ ID: ${lesson.quiz_id}` : "ไม่มีแบบทดสอบ"),
            quiz_id: lesson.quiz_id || null,
          }));

          setLessons(formattedLessons);
        } else {
          setError("ไม่สามารถโหลดข้อมูลบทเรียนได้");
          toast.error("ไม่สามารถโหลดข้อมูลบทเรียนได้");
        }
      } catch (error) {
        console.error("Error fetching lessons:", error);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessons();
  }, [apiUrl]);

  const filteredLessons = lessons.filter(
    (lesson) =>
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lesson.subject && typeof lesson.subject === "string" ? lesson.subject.toLowerCase().includes(searchTerm.toLowerCase()) : false),
  );

  const indexOfLastLesson = currentPage * lessonsPerPage;
  const indexOfFirstLesson = indexOfLastLesson - lessonsPerPage;
  const currentLessons = filteredLessons.slice(indexOfFirstLesson, indexOfLastLesson);
  const totalPages = Math.ceil(filteredLessons.length / lessonsPerPage);

  const handleDeleteLesson = async (id: number) => {
    if (window.confirm("คุณต้องการลบบทเรียนนี้ใช่หรือไม่?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("กรุณาเข้าสู่ระบบก่อนใช้งาน");
          return;
        }

        const response = await axios.delete(`${apiUrl}/api/courses/lessons/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setLessons(lessons.filter((lesson) => lesson.lesson_id !== id));
          toast.success("ลบบทเรียนสำเร็จ");
          setShowDetailModal(false);
          setSelectedLesson(null);
        } else {
          toast.error(response.data.message || "ไม่สามารถลบบทเรียนได้");
        }
      } catch (error) {
        console.error("Error deleting lesson:", error);
        toast.error("เกิดข้อผิดพลาดในการลบบทเรียน");
      }
    }
  };

  const handleRowClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setShowDetailModal(true);
  };

  const StatusBadge = ({ status }: { status: Lesson["status"] }) => {
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

  const VideoBadge = ({ hasVideo }: { hasVideo: boolean }) => {
    return hasVideo ? (
      <span className="badge bg-info-subtle text-info rounded-pill px-3 py-1 small">
        มี
      </span>
    ) : (
      <span className="badge bg-warning-subtle text-warning rounded-pill px-3 py-1 small">
        ไม่มี
      </span>
    );
  };

  const FileBadge = ({ fileUrl }: { fileUrl?: string }) => {
    return fileUrl ? (
      <span className="badge bg-success-subtle text-success rounded-pill px-3 py-1 small">
        <i className="fas fa-file me-1"></i> มี
      </span>
    ) : (
      <span className="badge bg-secondary-subtle text-secondary rounded-pill px-3 py-1 small">
        <i className="fas fa-times me-1"></i> ไม่มี
      </span>
    );
  };

  const TestTypeText = ({ type }: { type: TestType }) => {
    let typeText = "";
    switch (type) {
      case "MC":
        typeText = "ปรนัย";
        break;
      case "TF":
        typeText = "ถูก/ผิด";
        break;
      case "SC":
        typeText = "จับคู่";
        break;
      case "FB":
        typeText = "เติมคำ";
        break;
      default:
        typeText = "ไม่มี";
    }
    return <span>{typeText}</span>;
  };

  const getFileName = (url: string) => {
    return url.split("/").pop() || "ไฟล์";
  };

  const isViewableFile = (url: string) => {
    const viewableExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".gif"];
    return viewableExtensions.some((ext) => url.toLowerCase().endsWith(ext));
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
                  <h2 className="title text-muted">รายการบทเรียน</h2>
                  <p className="desc">จัดการบทเรียนทั้งหมดในระบบ</p>
                </div>
<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
  <div className="input-group w-50">
    <input
      type="text"
      className="form-control"
      placeholder="ค้นหาบทเรียน..."
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
      }}
      aria-label="ค้นหาบทเรียน"
    />
    <button className="btn btn-outline-secondary" type="button">
      <i className="fas fa-search"></i>
    </button>
  </div>
  <Link to="/instructor-lessons/create-new" className="btn btn-primary">
    <i className="fas fa-plus-circle me-2"></i>เพิ่มบทเรียน
  </Link>
</div>
                {error && (
                  <div className="alert alert-danger rounded-3" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </div>
                )}

                {isLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">กำลังโหลด...</span>
                    </div>
                    <p className="mt-3">กำลังโหลดข้อมูล...</p>
                  </div>
                ) : (
                  <div className="card shadow-sm border-0">
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover table-sm mb-0 align-middle table-striped">
                          <thead className="table-light sticky-top">
                            <tr>
                              <th>ชื่อบทเรียน</th>
                              <th className="text-center">วิดีโอการสอน</th>
                              <th className="text-center">ไฟล์การสอน</th>
                              <th>ผู้สร้าง</th>
                              <th className="text-center">สถานะ</th>
                              <th style={{ width: "100px" }} className="text-center">
                                จัดการ
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentLessons.length > 0 ? (
                              currentLessons.map((lesson) => (
                                <tr
                                  key={lesson.lesson_id ?? Math.random()}
                                  onClick={() => handleRowClick(lesson)}
                                  style={{ cursor: "pointer" }}
                                >
                                  <td>
                                    <div className="d-flex flex-column">
                                      <span className="fw-medium">{lesson.title}</span>
                                      <small className="text-muted">{lesson.quizTitle}</small>
                                    </div>
                                  </td>
                                  <td className="text-center">
                                    <VideoBadge hasVideo={lesson.hasVideo} />
                                  </td>
                                  <td className="text-center">
                                    <FileBadge fileUrl={lesson.file_url} />
                                  </td>
                                  <td>{lesson.creator}</td>
                                  <td className="text-center">
                                    <StatusBadge status={lesson.status} />
                                  </td>
                                  <td>
                                    <div className="d-flex justify-content-center gap-3 action-icons">
                                      <i
                                        className="fas fa-edit action-icon text-primary"
                                        style={{ cursor: "pointer", lineHeight: 1 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          lesson.lesson_id && navigate(`/admin-lessons/edit-lessons/${lesson.lesson_id}`);
                                        }}
                                      ></i>
                                      <i
                                        className="fas fa-trash-alt action-icon text-danger"
                                        style={{ cursor: "pointer", lineHeight: 1 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          lesson.lesson_id && handleDeleteLesson(lesson.lesson_id);
                                        }}
                                      ></i>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="text-center py-4">
                                  ไม่พบข้อมูลบทเรียน
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
                                aria-label="Previous"
                              >
                                <i className="fas fa-chevron-left"></i>
                              </button>
                            </li>
                            {Array.from({ length: totalPages }).map((_, index) => (
                              <li
                                key={index}
                                className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
                              >
                                <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
                                  {index + 1}
                                </button>
                              </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                              <button
                                className="page-link"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                aria-label="Next"
                              >
                                <i className="fas fa-chevron-right"></i>
                              </button>
                            </li>
                          </ul>
                          <p className="mt-2 mb-0 small text-muted">
                            แสดง {indexOfFirstLesson + 1} ถึง {Math.min(indexOfLastLesson, filteredLessons.length)} จากทั้งหมด{" "}
                            {filteredLessons.length} รายการ
                          </p>
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

      {showDetailModal && selectedLesson && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.75)" }}
          tabIndex={-1}
          aria-labelledby="lessonDetailModalLabel"
          aria-hidden="false"
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="modal-header bg-gradient-primary border-0 py-3">
                <h5 className="modal-title text-white fw-bold" id="lessonDetailModalLabel">
                  <i className="fas fa-book me-2" />
                  {selectedLesson.title}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedLesson(null);
                  }}
                  aria-label="ปิด"
                />
              </div>
              <div className="modal-body p-4 bg-light">
                <div className="row g-4">
                  <div className="col-lg-12">
                    <div className="card shadow-sm border-0 bg-white rounded-3 h-100">
                      <div className="card-body p-4">
                        <h6 className="card-title mb-3 fw-bold text-primary border-bottom pb-2">ข้อมูลบทเรียน</h6>
                        <table className="table table-borderless">
                          <tbody>
                            <tr>
                              <td className="fw-medium text-muted" style={{ width: "120px" }}>
                                ชื่อบทเรียน:
                              </td>
                              <td>{selectedLesson.title}</td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">รหัสคอร์ส:</td>
                              <td>{selectedLesson.courseCode}</td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">ชื่อคอร์ส:</td>
                              <td>{selectedLesson.courseName}</td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">วิชา:</td>
                              <td>{selectedLesson.subject || "ไม่มี"}</td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">วิดีโอการสอน:</td>
                              <td>
                                <VideoBadge hasVideo={selectedLesson.hasVideo} />
                              </td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">ไฟล์การสอน:</td>
                              <td>
                                <FileBadge fileUrl={selectedLesson.file_url} />
                                {selectedLesson.file_url && (
                                  <div className="mt-2">
                                    <a
                                      href={selectedLesson.file_url}
                                      target={isViewableFile(selectedLesson.file_url) ? "_blank" : "_self"}
                                      rel="noopener noreferrer"
                                      className="btn btn-outline-primary btn-sm me-2"
                                      download={!isViewableFile(selectedLesson.file_url)}
                                    >
                                      <i className="fas fa-eye me-1"></i>
                                      {isViewableFile(selectedLesson.file_url) ? "ดูไฟล์" : "ดาวน์โหลด"}
                                    </a>
                                    <small className="text-muted">{getFileName(selectedLesson.file_url)}</small>
                                  </div>
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">ประเภทแบบทดสอบ:</td>
                              <td>
                                <TestTypeText type={selectedLesson.testType} />
                              </td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">ชื่อแบบทดสอบ:</td>
                              <td>{selectedLesson.quizTitle}</td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">ผู้สร้าง:</td>
                              <td>{selectedLesson.creator}</td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">สถานะ:</td>
                              <td>
                                <StatusBadge status={selectedLesson.status} />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-4 bg-light">
                {selectedLesson.lesson_id && (
                  <Link
                    to={`/admin-lessons/edit-lessons/${selectedLesson.lesson_id}`}
                    className="btn btn-primary btn-sm px-4 py-2 rounded-pill me-2"
                    aria-label={`แก้ไขบทเรียน ${selectedLesson.title}`}
                  >
                    <i className="fas fa-edit me-2" />
                    แก้ไข
                  </Link>
                )}
                <button
                  type="button"
                  className="btn btn-danger btn-sm px-4 py-2 rounded-pill me-2"
                  onClick={() => selectedLesson.lesson_id && handleDeleteLesson(selectedLesson.lesson_id)}
                  aria-label={`ลบบทเรียน ${selectedLesson.title}`}
                  disabled={!selectedLesson.lesson_id}
                >
                  <i className="fas fa-trash-alt me-2" />
                  ลบ
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm px-4 py-2 rounded-pill"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedLesson(null);
                  }}
                  aria-label="ปิด"
                >
                  <i className="fas fa-times me-2" />
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
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

        .btn-danger, .btn-secondary, .btn-primary, .btn-outline-primary {
          transition: all 0.3s ease;
          font-weight: 500;
          padding: 0.5rem 1.5rem;
          border-radius: 50px !important;
        }

        .btn-danger:hover, .btn-secondary:hover, .btn-primary:hover, .btn-outline-primary:hover {
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
          color: #0056b3;
          transform: scale(1.2);
        }

        .text-danger.action-icon:hover {
          color: #a52834;
        }

        .sticky-top {
          top: 0;
          z-index: 1020;
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
          .btn-close {
            top: -15px;
            right: -15px;
            padding: 8px;
          }
        }
      `}</style>
    </section>
  );
};

export default InsLessonsArea;