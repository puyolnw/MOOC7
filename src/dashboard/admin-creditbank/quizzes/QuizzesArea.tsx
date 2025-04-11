import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import DashboardSidebar from "../../dashboard-common/AdminSidebar";
import DashboardBanner from "../../dashboard-common/AdminBanner";
import { toast } from "react-toastify";

// Define quiz type
type QuizType = "MC" | "TF" | "SC" | "FB" | "MIX";

// Define quiz interface
interface Quiz {
  id: number;
  title: string;
  lessonCode: string;
  lessonTitle: string;
  questionCount: number;
  type: QuizType;
  status: "active" | "inactive" | "draft";
  creator: string;
}

const QuizzesArea = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const quizzesPerPage = 10;

  // Fetch quizzes from API
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");
        
        if (!token) {
          setError("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`${apiUrl}/api/courses/quizzes`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            search: searchTerm !== "" ? searchTerm : undefined
          }
        });
        
        if (response.data && response.data.quizzes) {
          // Transform API response to match our Quiz interface
          const transformedQuizzes: Quiz[] = response.data.quizzes.map((quiz: any) => ({
            id: quiz.quiz_id,
            title: quiz.title,
            lessonCode: quiz.lessonCode || "",
            lessonTitle: quiz.lessonTitle || "",
            questionCount: quiz.question_count || 0,
            type: quiz.type || "MIX",
            status: quiz.status || "draft",
            creator: quiz.creator || "ไม่ระบุ"
          }));
          
          setQuizzes(transformedQuizzes);
          setError("");
        } else {
          setQuizzes([]);
          setError("ไม่พบข้อมูลแบบทดสอบ");
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        setError("เกิดข้อผิดพลาดในการดึงข้อมูลแบบทดสอบ");
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizzes();
  }, [searchTerm]); // Re-fetch when search term changes

  // Filter quizzes based on search term (client-side filtering as backup)
  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.lessonCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.lessonTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastQuiz = currentPage * quizzesPerPage;
  const indexOfFirstQuiz = indexOfLastQuiz - quizzesPerPage;
  const currentQuizzes = filteredQuizzes.slice(indexOfFirstQuiz, indexOfLastQuiz);
  const totalPages = Math.ceil(filteredQuizzes.length / quizzesPerPage);

  // Handle delete quiz
  const handleDeleteQuiz = async (id: number) => {
    if (window.confirm("คุณต้องการลบแบบทดสอบนี้ใช่หรือไม่?")) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");
        
        if (!token) {
          toast.error("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
          return;
        }
        
        await axios.delete(`${apiUrl}/api/courses/quizzes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Remove the deleted quiz from state
        setQuizzes(quizzes.filter(quiz => quiz.id !== id));
        toast.success("ลบแบบทดสอบสำเร็จ");
      } catch (error) {
        console.error("Error deleting quiz:", error);
        toast.error("เกิดข้อผิดพลาดในการลบแบบทดสอบ");
      }
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: Quiz["status"] }) => {
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

  // Quiz type badge component
  const QuizTypeBadge = ({ type }: { type: QuizType }) => {
    let badgeClass = "";
    let typeText = "";
    let tooltipText = "";

    switch (type) {
      case "MC":
        badgeClass = "badge bg-primary-subtle text-primary rounded-pill px-3 py-1 small";
        typeText = "MC";
        tooltipText = "Multi Choice";
        break;
      case "TF":
        badgeClass = "badge bg-success-subtle text-success rounded-pill px-3 py-1 small";
        typeText = "TF";
        tooltipText = "True or False";
        break;
      case "SC":
        badgeClass = "badge bg-info-subtle text-info rounded-pill px-3 py-1 small";
        typeText = "SC";
        tooltipText = "Single Choice";
        break;
      case "FB":
        badgeClass = "badge bg-warning-subtle text-warning rounded-pill px-3 py-1 small";
        typeText = "FB";
        tooltipText = "Fill in Blank";
        break;
      case "MIX":
        badgeClass = "badge bg-purple-subtle text-purple rounded-pill px-3 py-1 small";
        typeText = "MIX";
        tooltipText = "Mixed Types";
        break;
    }

    return (
      <span className={badgeClass} title={tooltipText}>
        {typeText}
      </span>
    );
  };

  // Statistics
  const totalQuizzes = quizzes.length;
  const countByStatus = {
    active: quizzes.filter(q => q.status === "active").length,
    inactive: quizzes.filter(q => q.status === "inactive").length,
    draft: quizzes.filter(q => q.status === "draft").length,
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
                  <h2 className="title text-muted">รายการแบบทดสอบ</h2>
                  <p className="desc">จัดการแบบทดสอบทั้งหมดในระบบ</p>
                </div>

                {/* Statistics */}
                <div className="mb-4">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <div className="bg-light rounded p-3 text-center">
                        <h6 className="mb-1 text-muted">แบบทดสอบทั้งหมด</h6>
                        <h5 className="mb-0">{totalQuizzes} ชุด</h5>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="bg-success-subtle rounded p-3 text-center">
                        <h6 className="mb-1 text-success">เปิดใช้งาน</h6>
                        <h5 className="mb-0">{countByStatus.active} ชุด</h5>
                      </div>
                    </div>
                    
                    <div className="col-md-3">
                      <div className="bg-secondary-subtle rounded p-3 text-center">
                        <h6 className="mb-1 text-secondary">ฉบับร่าง</h6>
                        <h5 className="mb-0">{countByStatus.draft} ชุด</h5>
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
                      placeholder="ค้นหาแบบทดสอบ..."
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
                  <Link to="/admin-quizzes/create-new" className="btn btn-primary">
                    <i className="fas fa-plus-circle me-2"></i>เพิ่มแบบทดสอบ
                  </Link>
                </div>

                {/* Error message */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </div>
                )}

                {/* Loading indicator */}
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">กำลังโหลด...</span>
                    </div>
                    <p className="mt-2">กำลังโหลดข้อมูล...</p>
                  </div>
                ) : (
                  /* Quizzes table */
                  <div className="card shadow-sm border-0">
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover table-sm mb-0 align-middle table-striped">
                          <thead className="table-light">
                            <tr>
                              <th>ชื่อแบบทดสอบ</th>
                              <th>รหัสบทเรียน</th>
                              <th className="text-center">จำนวนคำถาม</th>
                              <th className="text-center">ประเภท</th>
                              <th>สถานะ</th>
                              <th style={{ width: "100px" }}>จัดการ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentQuizzes.length > 0 ? (
                              currentQuizzes.map((quiz) => (
                                <tr key={quiz.id}>
                                  <td>
                                    <div className="d-flex flex-column">
                                      <span className="fw-medium">{quiz.title}</span>
                                      <small className="text-muted">{quiz.lessonTitle}</small>
                                    </div>
                                  </td>
                                  <td>{quiz.lessonCode}</td>
                                  <td className="text-center">
                                    {quiz.questionCount > 0 ? (
                                      <span className="fw-medium">{quiz.questionCount} ข้อ</span>
                                    ) : (
                                      <span className="text-muted">ไม่มีคำถาม</span>
                                    )}
                                  </td>
                                  <td className="text-center">
                                    <QuizTypeBadge type={quiz.type} />
                                  </td>
                                  <td><StatusBadge status={quiz.status} /></td>
                                  <td>
                                    <div className="d-flex justify-content-center gap-3">
                                      <Link to={`/admin-creditbank/edit-quiz/${quiz.id}`} className="text-primary">
                                        <i className="fas fa-edit icon-action"></i>
                                      </Link>
                                      <i
                                        className="fas fa-trash-alt text-danger icon-action"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleDeleteQuiz(quiz.id)}
                                      ></i>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="text-center py-4">ไม่พบข้อมูลแบบทดสอบ</td>
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
                              <button
                                className="page-link"
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                              >
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
                              <button
                                className="page-link"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                              >
                                <i className="fas fa-chevron-right"></i>
                              </button>
                            </li>
                          </ul>
                          <p className="mt-2 mb-0 small text-muted">
                            แสดง {indexOfFirstQuiz + 1} ถึง {Math.min(indexOfLastQuiz, filteredQuizzes.length)} จากทั้งหมด {filteredQuizzes.length} รายการ
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

export default QuizzesArea;

