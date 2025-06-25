import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardBanner from "../../dashboard-common/DashboardBanner";
import DashboardSidebar from "../../dashboard-common/DashboardSidebar";
import { toast } from "react-toastify";

type QuestionType = "MC" | "TF" | "SC" | "FB";

interface Question {
  id: number;
  text: string;
  quizCode: string;
  quizTitle: string;
  quizzes: { quiz_id: number; title: string }[];
  type: QuestionType;
  status: "active" | "inactive" | "draft";
  difficulty: "easy" | "medium" | "hard";
  score: number;
  creator: string;
}

const QuestionsArea = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const questionsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");

        if (!token) {
          setError("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
          setIsLoading(false);
          return;
        }

        const response = await axios.get(`${apiUrl}/api/courses/questions`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.data && response.data.questions) {
          const formattedQuestions = response.data.questions.map((q: any) => ({
            id: q.question_id,
            text: q.title,
            quizCode: q.quiz_code || "N/A",
            quizTitle: q.quiz_title || "N/A",
            quizzes: q.quizzes || [],
            type: q.type as QuestionType,
            status: q.status || "active",
            difficulty: q.difficulty || "medium",
            score: q.score || 0,
            creator: q.creator_name || "Unknown"
          }));

          setQuestions(formattedQuestions);
          setError("");
        } else {
          setQuestions([]);
          setError("ไม่พบข้อมูลคำถาม");
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        setError("ไม่สามารถโหลดข้อมูลคำถามได้");
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลคำถาม");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const filteredQuestions = questions.filter(question =>
    question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.quizCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.quizTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

  const handleDeleteQuestion = async (id: number) => {
    if (window.confirm("คุณต้องการลบคำถามนี้ใช่หรือไม่?")) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem("token");

        if (!token) {
          toast.error("ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่");
          return;
        }

        await axios.delete(`${apiUrl}/api/courses/questions/${id}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        setQuestions(questions.filter(question => question.id !== id));
        toast.success("ลบคำถามสำเร็จ");
        setShowDetailModal(false);
        setSelectedQuestion(null);
      } catch (error) {
        console.error("Error deleting question:", error);
        toast.error("เกิดข้อผิดพลาดในการลบคำถาม");
      }
    }
  };

  const handleRowClick = (question: Question) => {
    setSelectedQuestion(question);
    setShowDetailModal(true);
  };

  const StatusBadge = ({ status }: { status: Question["status"] }) => {
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

  const QuestionTypeBadge = ({ type }: { type: QuestionType }) => {
    let badgeClass = "";
    let typeText = "";
    let tooltipText = "";

    switch (type) {
      case "MC":
        badgeClass = "badge bg-primary-subtle text-primary rounded-pill px-3 py-1 small";
        typeText = "MC";
        tooltipText = "ปรนัย";
        break;
      case "TF":
        badgeClass = "badge bg-success-subtle text-success rounded-pill px-3 py-1 small";
        typeText = "TF";
        tooltipText = "ถูก/ผิด";
        break;
      case "SC":
        badgeClass = "badge bg-info-subtle text-info rounded-pill px-3 py-1 small";
        typeText = "SC";
        tooltipText = "จับคู่";
        break;
      case "FB":
        badgeClass = "badge bg-warning-subtle text-warning rounded-pill px-3 py-1 small";
        typeText = "FB";
        tooltipText = "เติมคำ";
        break;
    }

    return (
      <span className={badgeClass} title={tooltipText}>
        {typeText}
      </span>
    );
  };

  const DifficultyBadge = ({ difficulty }: { difficulty: Question["difficulty"] }) => {
    let badgeClass = "";
    let difficultyText = "";

    switch (difficulty) {
      case "easy":
        badgeClass = "badge bg-success-subtle text-success rounded-pill px-3 py-1 small";
        difficultyText = "ง่าย";
        break;
      case "medium":
        badgeClass = "badge bg-warning-subtle text-warning rounded-pill px-3 py-1 small";
        difficultyText = "ปานกลาง";
        break;
      case "hard":
        badgeClass = "badge bg-danger-subtle text-danger rounded-pill px-3 py-1 small";
        difficultyText = "ยาก";
        break;
    }

    return <span className={badgeClass}>{difficultyText}</span>;
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
                  <h2 className="title text-muted">รายการคำถาม</h2>
                  <p className="desc">จัดการคำถามทั้งหมดในระบบ</p>
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
                    <p className="mt-2">กำลังโหลดข้อมูลคำถาม...</p>
                  </div>
                ) : (
                  <>
<div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 search-and-add">
  <div className="input-group w-50">
    <input
      type="text"
      className="form-control"
      placeholder="ค้นหาคำถาม..."
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
      }}
      aria-label="ค้นหาคำถาม"
    />
    <button className="btn btn-outline-secondary" type="button">
      <i className="fas fa-search"></i>
    </button>
  </div>
  <Link to="/instructor-questions/create-new" className="btn btn-primary">
    <i className="fas fa-plus-circle me-2"></i>เพิ่มคำถาม
  </Link>
</div>
                    <div className="card shadow-sm border-0">
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <table className="table table-hover table-sm mb-0 align-middle table-striped responsive-table">
                            <thead className="table-light sticky-top">
                              <tr>

                                <th>คำถาม</th>
                                <th>รหัสแบบทดสอบ</th>
                                <th className="text-center">ประเภท</th>
                                <th className="text-center">คะแนน</th>
                                <th className="text-center">สถานะ</th>
                                <th style={{ width: "100px" }} className="text-center">จัดการ</th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentQuestions.length > 0 ? (
                                currentQuestions.map((question) => (
                                  <tr
                                    key={question.id}
                                    onClick={() => handleRowClick(question)}
                                    style={{ cursor: "pointer" }}
                                  >
                                    <td data-label="คำถาม:">
                                      <div className="d-flex flex-column">
                                        <span className="fw-medium text-truncate d-block" style={{ maxWidth: "100%" }}>
                                          {question.text.length > 60 ? question.text.substring(0, 60) + "..." : question.text}
                                        </span>
                                        <small className="text-muted">
                                          {question.quizzes.length > 0 ? question.quizzes[0].title : "N/A"}
                                        </small>
                                      </div>
                                    </td>
                                    <td data-label="รหัสแบบทดสอบ:">{question.quizzes.length > 0 ? question.quizzes[0].quiz_id : "N/A"}</td>
                                    <td data-label="ประเภท:" className="text-center">
                                      <QuestionTypeBadge type={question.type} />
                                    </td>
                                    <td data-label="คะแนน:" className="text-center">
                                      <span className="fw-medium">{question.score} คะแนน</span>
                                    </td>
                                    <td data-label="สถานะ:" className="text-center">
                                      <StatusBadge status={question.status} />
                                    </td>
                                    <td data-label="จัดการ:">
                                      <div className="d-flex justify-content-center gap-3 action-icons">
                                        <i
                                          className="fas fa-edit action-icon text-primary"
                                          style={{ cursor: "pointer", lineHeight: 1 }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/admin-questions/edit-question/${question.id}`);
                                          }}
                                        ></i>
                                        <i
                                          className="fas fa-trash-alt action-icon text-danger"
                                          style={{ cursor: "pointer", lineHeight: 1 }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteQuestion(question.id);
                                          }}
                                        ></i>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={6} className="text-center py-4">
                                    ไม่พบข้อมูลคำถาม
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
                              แสดง {indexOfFirstQuestion + 1} ถึง{' '}
                              {Math.min(indexOfLastQuestion, filteredQuestions.length)} จากทั้งหมด{' '}
                              {filteredQuestions.length} รายการ
                            </p>
                          </nav>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDetailModal && selectedQuestion && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.75)' }}
          tabIndex={-1}
          aria-labelledby="questionDetailModalLabel"
          aria-hidden="false"
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="modal-header bg-gradient-primary border-0 py-3">
                <h5 className="modal-title text-white fw-bold" id="questionDetailModalLabel">
                  <i className="fas fa-book me-2" />
                  {selectedQuestion.text.length > 60 ? selectedQuestion.text.substring(0, 60) + "..." : selectedQuestion.text}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedQuestion(null);
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
                          ข้อมูลคำถาม
                        </h6>
                        <table className="table table-borderless">
                          <tbody>
                            <tr>
                              <td className="fw-medium text-muted" style={{ width: '120px' }}>
                                คำถาม:
                              </td>
                              <td>{selectedQuestion.text}</td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">รหัสแบบทดสอบ:</td>
                              <td>{selectedQuestion.quizCode || 'N/A'}</td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">ชื่อแบบทดสอบ:</td>
                              <td>{selectedQuestion.quizTitle || 'N/A'}</td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">ประเภท:</td>
                              <td>
                                <QuestionTypeBadge type={selectedQuestion.type} />
                              </td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">สถานะ:</td>
                              <td>
                                <StatusBadge status={selectedQuestion.status} />
                              </td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">ระดับความยาก:</td>
                              <td>
                                <DifficultyBadge difficulty={selectedQuestion.difficulty} />
                              </td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">คะแนน:</td>
                              <td>{selectedQuestion.score} คะแนน</td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">ผู้สร้าง:</td>
                              <td>{selectedQuestion.creator}</td>
                            </tr>
                            <tr>
                              <td className="fw-medium text-muted">อยู่ในแบบทดสอบ:</td>
                              <td>
                                {selectedQuestion.quizzes.length > 0
                                  ? selectedQuestion.quizzes.map(quiz => quiz.title).join(', ')
                                  : 'N/A'}
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
                  to={`/admin-questions/edit-question/${selectedQuestion.id}`}
                  className="btn btn-primary btn-sm px-4 py-2 rounded-pill me-2"
                  aria-label={`แก้ไขคำถาม ${selectedQuestion.text}`}
                >
                  <i className="fas fa-edit me-2" />แก้ไข
                </Link>
                <button
                  type="button"
                  className="btn btn-danger btn-sm px-4 py-2 rounded-pill me-2"
                  onClick={() => handleDeleteQuestion(selectedQuestion.id)}
                  aria-label={`ลบคำถาม ${selectedQuestion.text}`}
                >
                  <i className="fas fa-trash-alt me-2" />ลบ
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm px-4 py-2 rounded-pill"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedQuestion(null);
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

            .responsive-table .action-icons {
              display: flex;
              justify-content: flex-start;
              gap: 1.5rem;
            }

            .responsive-table .action-icon {
              font-size: 1.2rem;
              padding: 0.5rem;
            }
          }

          @media (max-width: 576px) {
            .search-and-add {
              flex-direction: column;
            }

            .search-and-add .input-group {
              width: 100% !important;
              margin-bottom: 0.5rem;
            }

            .pagination .page-link {
              padding: 0.5rem 0.75rem;
              font-size: 1rem;
            }
          }
        `}
      </style>
    </section>
  );
};

export default QuestionsArea;