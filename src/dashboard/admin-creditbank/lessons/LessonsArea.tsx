import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import DashboardSidebar from "../../dashboard-common/AdminSidebar";
import DashboardBanner from "../../dashboard-common/AdminBanner";

type TestType = "MC" | "TF" | "SC" | "FB" | null;

interface Lesson {
  lesson_id: number | null;
  title: string;
  hasVideo: boolean;
  creator: string;
  courseCode: string;
  courseName: string;
  status: "active" | "inactive" | "draft";
  testType: TestType;
  subject?: string;
  quizTitle?: string;
  quiz_id?: number | null;
}

const LessonsArea = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
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

        const response = await axios.get(`${apiUrl}/api/courses/lessons`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          const formattedLessons = response.data.lessons.map((lesson: any) => ({
            lesson_id: lesson.lesson_id ?? lesson.id ?? null,
            title: lesson.title,
            hasVideo: !!lesson.video_url,
            creator: lesson.creator_name || "ไม่ระบุ", // เปลี่ยนจาก lesson.creator?.name เป็น lesson.creator_name
            courseCode: lesson.coursecode || "ไม่ระบุ",
            courseName: lesson.coursename || "ไม่ระบุ",
            status: lesson.status || "inactive",
            testType: lesson.testtype || null,
            subject: lesson.subjects || "ไม่มี",
            quizTitle: lesson.quiz_title || (lesson.quiz_id ? `แบบทดสอบ ID: ${lesson.quiz_id}` : "ไม่มีแบบทดสอบ"),
            quiz_id: lesson.quiz_id || null
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

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lesson.subject && lesson.subject.toLowerCase().includes(searchTerm.toLowerCase()))
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
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setLessons(lessons.filter(lesson => lesson.lesson_id !== id));
          toast.success("ลบบทเรียนสำเร็จ");
        } else {
          toast.error(response.data.message || "ไม่สามารถลบบทเรียนได้");
        }
      } catch (error) {
        console.error("Error deleting lesson:", error);
        toast.error("เกิดข้อผิดพลาดในการลบบทเรียน");
      }
    }
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
        <i className="fas fa-video me-1"></i> มี
      </span>
    ) : (
      <span className="badge bg-warning-subtle text-warning rounded-pill px-3 py-1 small">
        <i className="fas fa-times me-1"></i> ไม่มี
      </span>
    );
  };

  const FileBadge = () => {
    return (
      <span className="badge bg-secondary-subtle text-secondary rounded-pill px-3 py-1 small">ไม่มี</span>
    );
  };

  const totalLessons = lessons.length;
  const countByStatus = {
    active: lessons.filter(l => l.status === "active").length,
    inactive: lessons.filter(l => l.status === "inactive").length,
    draft: lessons.filter(l => l.status === "draft").length
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

                <div className="mb-4">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <div className="bg-light rounded p-3 text-center">
                        <h6 className="mb-1 text-muted">บทเรียนทั้งหมด</h6>
                        <h5 className="mb-0">{totalLessons} บทเรียน</h5>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="bg-success-subtle rounded p-3 text-center">
                        <h6 className="mb-1 text-success">เปิดใช้งาน</h6>
                        <h5 className="mb-0">{countByStatus.active} บทเรียน</h5>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="bg-secondary-subtle rounded p-3 text-center">
                        <h6 className="mb-1 text-secondary">ฉบับร่าง</h6>
                        <h5 className="mb-0">{countByStatus.draft} บทเรียน</h5>
                      </div>
                    </div>
                  </div>
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
                    />
                    <button className="btn btn-outline-secondary" type="button">
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                  <Link to="/admin-lessons/create-new" className="btn btn-primary">
                    <i className="fas fa-plus-circle me-2"></i>เพิ่มบทเรียน
                  </Link>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
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
                          <thead className="table-light">
                            <tr>
                              <th>ชื่อบทเรียน</th>
                              <th className="text-center">วิดีโอการสอน</th>
                              <th className="text-center">ไฟล์การสอน</th>
                              <th>ผู้สร้าง</th>
                              <th className="text-center" >สถานะ</th>
                              <th style={{ width: "100px" }} className="text-center">จัดการ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentLessons.length > 0 ? (
                              currentLessons.map((lesson) => (
                                <tr key={lesson.lesson_id ?? Math.random()}>
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
                                    <FileBadge />
                                  </td>
                                  <td>{lesson.creator}</td>
                                  <td className="text-center" ><StatusBadge status={lesson.status} /></td>
                                  <td>
                                    <div className="d-flex justify-content-center gap-3">
                                      {lesson.lesson_id ? (
                                        <i
                                          className="fas fa-edit icon-action text-primary"
                                          style={{ cursor: "pointer", lineHeight: 1 }}
                                          onClick={() => navigate(`/admin-lessons/edit-lessons/${lesson.lesson_id}`)}
                                        ></i>
                                      ) : (
                                        <span className="text-muted" title="ไม่มี ID บทเรียน"
                                          style={{ display: "inline-flex", alignItems: "center" }}>
                                          <i className="fas fa-edit icon-action" style={{ cursor: "pointer", lineHeight: 1 }}></i>
                                        </span>
                                      )}
                                      <i
                                        className="fas fa-trash-alt text-danger icon-action"
                                        style={{ cursor: "pointer", lineHeight: 1 }}
                                        onClick={() => lesson.lesson_id && handleDeleteLesson(lesson.lesson_id)}
                                      ></i>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="text-center py-4">ไม่พบข้อมูลบทเรียน</td>
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
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                                <i className="fas fa-chevron-left"></i>
                              </button>
                            </li>
                            {Array.from({ length: totalPages }).map((_, index) => (
                              <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
                                  {index + 1}
                                </button>
                              </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                                <i className="fas fa-chevron-right"></i>
                              </button>
                            </li>
                          </ul>
                          <p className="mt-2 mb-0 small text-muted">
                            แสดง {indexOfFirstLesson + 1} ถึง {Math.min(indexOfLastLesson, filteredLessons.length)} จากทั้งหมด {filteredLessons.length} รายการ
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
    </section>
  );
};

export default LessonsArea;

