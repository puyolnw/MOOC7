import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../../dashboard-common/AdminSidebar";
import DashboardBanner from "../../dashboard-common/AdminBanner";

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

// Sample data for quizzes
const sampleQuizzes: Quiz[] = [
  {
    id: 1,
    title: "แบบทดสอบ React Hooks",
    lessonCode: "CS101-L1",
    lessonTitle: "แนะนำการใช้งาน React Hooks",
    questionCount: 10,
    type: "MC",
    status: "active",
    creator: "อาจารย์สมชาย ใจดี",
  },
  {
    id: 2,
    title: "แบบทดสอบ React Components",
    lessonCode: "CS101-L2",
    lessonTitle: "การสร้าง Component ใน React",
    questionCount: 8,
    type: "TF",
    status: "active",
    creator: "อาจารย์สมชาย ใจดี",
  },
  {
    id: 3,
    title: "แบบทดสอบ State และ Props",
    lessonCode: "CS101-L3",
    lessonTitle: "การจัดการ State และ Props",
    questionCount: 12,
    type: "SC",
    status: "active",
    creator: "อาจารย์สมชาย ใจดี",
  },
  {
    id: 4,
    title: "แบบทดสอบการวิเคราะห์ข้อมูลเบื้องต้น",
    lessonCode: "DS201-L1",
    lessonTitle: "การวิเคราะห์ข้อมูลเบื้องต้นด้วย Python",
    questionCount: 15,
    type: "FB",
    status: "active",
    creator: "ดร.วิชัย นักวิจัย",
  },
  {
    id: 5,
    title: "แบบทดสอบการใช้งาน Pandas",
    lessonCode: "DS201-L2",
    lessonTitle: "การใช้งาน Pandas สำหรับจัดการข้อมูล",
    questionCount: 10,
    type: "MC",
    status: "active",
    creator: "ดร.วิชัย นักวิจัย",
  },
  {
    id: 6,
    title: "แบบทดสอบการสร้างแบบจำลอง",
    lessonCode: "DS201-L3",
    lessonTitle: "การสร้างแบบจำลองด้วย Scikit-learn",
    questionCount: 0,
    type: "MIX",
    status: "draft",
    creator: "ดร.วิชัย นักวิจัย",
  },
  {
    id: 7,
    title: "แบบทดสอบหลักการตลาดดิจิทัล",
    lessonCode: "MK301-L1",
    lessonTitle: "หลักการตลาดดิจิทัลเบื้องต้น",
    questionCount: 20,
    type: "TF",
    status: "active",
    creator: "รศ.ดร.มานี ธุรกิจ",
  },
  {
    id: 8,
    title: "แบบทดสอบพฤติกรรมผู้บริโภคออนไลน์",
    lessonCode: "MK301-L2",
    lessonTitle: "การวิเคราะห์พฤติกรรมผู้บริโภคออนไลน์",
    questionCount: 15,
    type: "SC",
    status: "active",
    creator: "รศ.ดร.มานี ธุรกิจ",
  },
  {
    id: 9,
    title: "แบบทดสอบกลยุทธ์การตลาดบนสื่อสังคมออนไลน์",
    lessonCode: "MK301-L3",
    lessonTitle: "กลยุทธ์การตลาดบนสื่อสังคมออนไลน์",
    questionCount: 12,
    type: "FB",
    status: "inactive",
    creator: "รศ.ดร.มานี ธุรกิจ",
  },
  {
    id: 10,
    title: "แบบทดสอบการวางแผนแคมเปญการตลาดดิจิทัล",
    lessonCode: "MK301-L4",
    lessonTitle: "การวางแผนแคมเปญการตลาดดิจิทัล",
    questionCount: 0,
    type: "MIX",
    status: "draft",
    creator: "รศ.ดร.มานี ธุรกิจ",
  },
  {
    id: 11,
    title: "แบบทดสอบไวยากรณ์ภาษาอังกฤษ",
    lessonCode: "EN202-L1",
    lessonTitle: "ไวยากรณ์ภาษาอังกฤษสำหรับการสื่อสารธุรกิจ",
    questionCount: 25,
    type: "MC",
    status: "active",
    creator: "อาจารย์แอนนา สมิท",
  },
  {
    id: 12,
    title: "แบบทดสอบการเขียนอีเมลธุรกิจ",
    lessonCode: "EN202-L2",
    lessonTitle: "การเขียนอีเมลธุรกิจภาษาอังกฤษ",
    questionCount: 15,
    type: "FB",
    status: "active",
    creator: "อาจารย์แอนนา สมิท",
  },
  {
    id: 13,
    title: "แบบทดสอบการนำเสนองาน",
    lessonCode: "EN202-L3",
    lessonTitle: "การนำเสนองานเป็นภาษาอังกฤษ",
    questionCount: 10,
    type: "SC",
    status: "inactive",
    creator: "อาจารย์แอนนา สมิท",
  },
  {
    id: 14,
    title: "แบบทดสอบหลักการออกแบบกราฟิก",
    lessonCode: "AR105-L1",
    lessonTitle: "หลักการออกแบบกราฟิก",
    questionCount: 18,
    type: "TF",
    status: "active",
    creator: "อาจารย์ศิลปิน วาดเก่ง",
  },
  {
    id: 15,
    title: "แบบทดสอบการใช้งาน Adobe Photoshop",
    lessonCode: "AR105-L2",
    lessonTitle: "การใช้งาน Adobe Photoshop เบื้องต้น",
    questionCount: 20,
    type: "MC",
    status: "active",
    creator: "อาจารย์ศิลปิน วาดเก่ง",
  },
];

const QuizzesArea = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>(sampleQuizzes);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const quizzesPerPage = 10;

  // Filter quizzes based on search term
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
  const handleDeleteQuiz = (id: number) => {
    if (window.confirm("คุณต้องการลบแบบทดสอบนี้ใช่หรือไม่?")) {
      setQuizzes(quizzes.filter(quiz => quiz.id !== id));
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

  const totalQuestions = quizzes.reduce((sum, quiz) => sum + quiz.questionCount, 0);

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
                      <div className="bg-info-subtle rounded p-3 text-center">
                        <h6 className="mb-1 text-info">จำนวนคำถาม</h6>
                        <h5 className="mb-0">{totalQuestions} ข้อ</h5>
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

                {/* Quizzes table */}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuizzesArea;
