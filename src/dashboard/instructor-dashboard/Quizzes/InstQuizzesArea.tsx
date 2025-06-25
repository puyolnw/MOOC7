import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardBanner from "../../dashboard-common/DashboardBanner";
import DashboardSidebar from "../../dashboard-common/DashboardSidebar";
import { toast } from "react-toastify";

type QuizType = "MC" | "TF" | "SC" | "FB" | "MIX";

interface Quiz {
  id: number;
  title: string;
  lessonCode: string;
  lessonTitle: string;
  questionCount: number;
  type: QuizType;
  creator: string;
  totalScore: number;
  isUsed: boolean;
  usedInLesson?: string;
}

const InsQuizzesArea = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const quizzesPerPage = 10;
  const navigate = useNavigate();

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
          const transformedQuizzes: Quiz[] = response.data.quizzes.map((quiz: any) => ({
            id: quiz.quiz_id,
            title: quiz.title,
            lessonCode: quiz.lessonCode || "",
            lessonTitle: quiz.lessonTitle || "",
            questionCount: quiz.question_count || 0,
            type: quiz.type || "MIX",
            creator: quiz.creator || "ไม่ระบุ",
            totalScore: quiz.total_score || quiz.questionCount * 1 || 0,
            isUsed: !!quiz.used_in_lesson,
            usedInLesson: quiz.used_in_lesson || ""
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
  }, [searchTerm]);

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.lessonCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.lessonTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastQuiz = currentPage * quizzesPerPage;
  const indexOfFirstQuiz = indexOfLastQuiz - quizzesPerPage;
  const currentQuizzes = filteredQuizzes.slice(indexOfFirstQuiz, indexOfLastQuiz);
  const totalPages = Math.ceil(filteredQuizzes.length / quizzesPerPage);

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

        setQuizzes(quizzes.filter(quiz => quiz.id !== id));
        toast.success("ลบแบบทดสอบสำเร็จ");
        setShowDetailModal(false);
        setSelectedQuiz(null);
      } catch (error) {
        console.error("Error deleting quiz:", error);
        toast.error("เกิดข้อผิดพลาดในการลบแบบทดสอบ");
      }
    }
  };

  const handleRowClick = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setShowDetailModal(true);
  };

  const UsageBadge = ({ isUsed, lesson }: { isUsed: boolean, lesson?: string }) => {
    if (!isUsed) {
      return <small className="text-muted">ไม่ถูกเรียกใช้งาน</small>;
    }
    return <small className="text-success">กำลังใช้งานใน: {lesson}</small>;
  };

  const QuizTypeText = ({ type }: { type: QuizType }) => {
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
      case "MIX":
        typeText = "ผสม";
        break;
    }
    return <span>{typeText}</span>;
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
      aria-label="ค้นหาแบบทดสอบ"
    />
    <button className="btn btn-outline-secondary" type="button">
      <i className="fas fa-search"></i>
    </button>
  </div>
  <Link to="/instructor-quizzes/create-new" className="btn btn-primary">
    <i className="fas fa-plus-circle me-2"></i>เพิ่มแบบทดสอบ
  </Link>
</div>

                {error && (
                  <div className="alert alert-danger rounded-3" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">กำลังโหลด...</span>
                    </div>
                    <p className="mt-2">กำลังโหลดข้อมูล...</p>
                  </div>
                ) : (
                  <div className="card shadow-sm border-0">
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover table-sm mb-0 align-middle table-striped">
                          <thead className="table-light sticky-top">
                            <tr>
                              <th style={{ width: "35%" }}>ชื่อแบบทดสอบ</th>
                              <th className="text-center" style={{ width: "15%" }}>จำนวนคำถาม</th>
                              <th className="text-center" style={{ width: "15%" }}>คะแนนรวม</th>
                              <th className="text-center">จัดการ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentQuizzes.length > 0 ? (
                              currentQuizzes.map((quiz) => (
                                <tr
                                  key={quiz.id}
                                  onClick={() => handleRowClick(quiz)}
                                  style={{ cursor: "pointer" }}
                                >
                                  <td>
                                    <div className="d-flex flex-column">
                                      <span className="fw-medium">{quiz.title}</span>
                                      <UsageBadge isUsed={quiz.isUsed} lesson={quiz.usedInLesson} />
                                    </div>
                                  </td>
                                  <td className="text-center">
                                    {quiz.questionCount > 0 ? (
                                      <span className="fw-medium">{quiz.questionCount} ข้อ</span>
                                    ) : (
                                      <span className="text-muted">ไม่มีคำถาม</span>
                                    )}
                                  </td>
                                  <td className="text-center">
                                    <span className="fw-medium">{quiz.totalScore} คะแนน</span>
                                  </td>
                                  <td>
                                    <div className="d-flex justify-content-center gap-3 action-icons">
                                      <i
                                        className="fas fa-edit action-icon text-primary"
                                        style={{ cursor: "pointer", lineHeight: 1 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/admin-quizzes/edit-quiz/${quiz.id}`);
                                        }}
                                      ></i>
                                      <i
                                        className="fas fa-trash-alt action-icon text-danger"
                                        style={{ cursor: "pointer", lineHeight: 1 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteQuiz(quiz.id);
                                        }}
                                      ></i>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="text-center py-4">
                                  ไม่พบข้อมูลแบบทดสอบ
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
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
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
                                className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                              >
                                <button
                                  className="page-link"
                                  onClick={() => setCurrentPage(index + 1)}
                                >
                                  {index + 1}
                                </button>
                              </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
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
                            แสดง {indexOfFirstQuiz + 1} ถึง{' '}
                            {Math.min(indexOfLastQuiz, filteredQuizzes.length)} จากทั้งหมด{' '}
                            {filteredQuizzes.length} รายการ
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

      {showDetailModal && selectedQuiz && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.75)' }}
          tabIndex={-1}
          aria-labelledby="quizDetailModalLabel"
          aria-hidden="false"
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="modal-header bg-gradient-primary border-0 py-3">
                <h5 className="modal-title text-white fw-bold" id="quizDetailModalLabel">
                  <i className="fas fa-book me-2" />
                  {selectedQuiz.title}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedQuiz(null);
                  }}
                  aria-label="ปิด"
                />
              </div>
              <div className="modal-body p-4 bg-light">
                <div className="row g-4">
                  <div className="col-lg-12">
                    <div className="card shadow-sm border-0 bg-white rounded-3 h-100">
                      <div className="card-body p-4">
                        <h6 className="card-title mb-3 fw-bold text-primary border-bottom pb-2">
                          ข้อมูลแบบทดสอบ
                        </h6>
                        <table className="table table-borderless">
                          <tbody>
                            <tr>
                              <td className="fw-medium text-muted" style={{ width: '120px' }}>
                                ชื่อแบบทดสอบ:
                              </td>
                              <td>{selectedQuiz.title}</td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">รหัสบทเรียน:</td>
                              <td>{selectedQuiz.lessonCode || 'ไม่ระบุ'}</td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">ชื่อบทเรียน:</td>
                              <td>{selectedQuiz.lessonTitle || 'ไม่ระบุ'}</td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">จำนวนคำถาม:</td>
                              <td>{selectedQuiz.questionCount} ข้อ</td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">ประเภท:</td>
                              <td>
                                <QuizTypeText type={selectedQuiz.type} />
                              </td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">ผู้สร้าง:</td>
                              <td>{selectedQuiz.creator}</td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">คะแนนรวม:</td>
                              <td>{selectedQuiz.totalScore} คะแนน</td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">การใช้งาน:</td>
                              <td>
                                <UsageBadge
                                  isUsed={selectedQuiz.isUsed}
                                  lesson={selectedQuiz.usedInLesson}
                                />
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
                <Link
                  to={`/admin-quizzes/edit-quiz/${selectedQuiz.id}`}
                  className="btn btn-primary btn-sm px-4 py-2 rounded-pill me-2"
                  aria-label={`แก้ไขแบบทดสอบ ${selectedQuiz.title}`}
                >
                  <i className="fas fa-edit me-2" />แก้ไข
                </Link>
                <button
                  type="button"
                  className="btn btn-danger btn-sm px-4 py-2 rounded-pill me-2"
                  onClick={() => handleDeleteQuiz(selectedQuiz.id)}
                  aria-label={`ลบแบบทดสอบ ${selectedQuiz.title}`}
                >
                  <i className="fas fa-trash-alt me-2" />ลบ
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm px-4 py-2 rounded-pill"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedQuiz(null);
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
        `}
      </style>
    </section>
  );
};

export default InsQuizzesArea;