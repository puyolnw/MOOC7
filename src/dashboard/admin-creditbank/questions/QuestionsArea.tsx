import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../../dashboard-common/AdminSidebar";
import DashboardBanner from "../../dashboard-common/AdminBanner";

// Define question type
type QuestionType = "MC" | "TF" | "SC" | "FB";

// Define question interface
interface Question {
  id: number;
  text: string;
  quizCode: string;
  quizTitle: string;
  type: QuestionType;
  status: "active" | "inactive" | "draft";
  difficulty: "easy" | "medium" | "hard";
  score: number; // Added score field
  creator: string;
}

// Sample data for questions
const sampleQuestions: Question[] = [
  {
    id: 1,
    text: "React Hooks ใช้สำหรับอะไร?",
    quizCode: "CS101-Q1",
    quizTitle: "แบบทดสอบ React Hooks",
    type: "MC",
    status: "active",
    difficulty: "medium",
    score: 5,
    creator: "อาจารย์สมชาย ใจดี",
  },
  {
    id: 2,
    text: "useState เป็น Hook ที่ใช้จัดการ state ใน functional component ใช่หรือไม่?",
    quizCode: "CS101-Q1",
    quizTitle: "แบบทดสอบ React Hooks",
    type: "TF",
    status: "active",
    difficulty: "easy",
    score: 3,
    creator: "อาจารย์สมชาย ใจดี",
  },
  {
    id: 3,
    text: "useEffect Hook ทำงานในขั้นตอนใดของ component lifecycle?",
    quizCode: "CS101-Q1",
    quizTitle: "แบบทดสอบ React Hooks",
    type: "SC",
    status: "active",
    difficulty: "medium",
    score: 4,
    creator: "อาจารย์สมชาย ใจดี",
  },
  {
    id: 4,
    text: "จงเติมชื่อ Hook ที่ใช้ในการอ้างอิงถึง DOM element โดยตรง: use_____",
    quizCode: "CS101-Q1",
    quizTitle: "แบบทดสอบ React Hooks",
    type: "FB",
    status: "active",
    difficulty: "medium",
    score: 5,
    creator: "อาจารย์สมชาย ใจดี",
  },
  {
    id: 5,
    text: "ข้อใดคือประโยชน์ของการใช้ React Component?",
    quizCode: "CS101-Q2",
    quizTitle: "แบบทดสอบ React Components",
    type: "MC",
    status: "active",
    difficulty: "easy",
    score: 4,
    creator: "อาจารย์สมชาย ใจดี",
  },
  {
    id: 6,
    text: "Class Component สามารถใช้ Hooks ได้โดยตรงใช่หรือไม่?",
    quizCode: "CS101-Q2",
    quizTitle: "แบบทดสอบ React Components",
    type: "TF",
    status: "active",
    difficulty: "easy",
    score: 3,
    creator: "อาจารย์สมชาย ใจดี",
  },
  {
    id: 7,
    text: "Pandas ใช้สำหรับทำอะไรใน Python?",
    quizCode: "DS201-Q2",
    quizTitle: "แบบทดสอบการใช้งาน Pandas",
    type: "SC",
    status: "active",
    difficulty: "medium",
    score: 4,
    creator: "ดร.วิชัย นักวิจัย",
  },
  {
    id: 8,
    text: "จงเติมชื่อเมธอดที่ใช้ในการอ่านไฟล์ CSV ใน Pandas: pd.read_____",
    quizCode: "DS201-Q2",
    quizTitle: "แบบทดสอบการใช้งาน Pandas",
    type: "FB",
    status: "active",
    difficulty: "medium",
    score: 5,
    creator: "ดร.วิชัย นักวิจัย",
  },
  {
    id: 9,
    text: "ข้อใดคือประเภทของ Digital Marketing?",
    quizCode: "MK301-Q1",
    quizTitle: "แบบทดสอบหลักการตลาดดิจิทัล",
    type: "MC",
    status: "active",
    difficulty: "medium",
    score: 5,
    creator: "รศ.ดร.มานี ธุรกิจ",
  },
  {
    id: 10,
    text: "SEO ย่อมาจาก Search Engine Optimization ใช่หรือไม่?",
    quizCode: "MK301-Q1",
    quizTitle: "แบบทดสอบหลักการตลาดดิจิทัล",
    type: "TF",
    status: "active",
    difficulty: "easy",
    score: 2,
    creator: "รศ.ดร.มานี ธุรกิจ",
  },
  {
    id: 11,
    text: "Present Simple Tense ใช้ในกรณีใด?",
    quizCode: "EN202-Q1",
    quizTitle: "แบบทดสอบไวยากรณ์ภาษาอังกฤษ",
    type: "SC",
    status: "active",
    difficulty: "medium",
    score: 4,
    creator: "อาจารย์แอนนา สมิท",
  },
  {
    id: 12,
    text: "จงเติมคำที่ถูกต้อง: I _____ (go) to school every day.",
    quizCode: "EN202-Q1",
    quizTitle: "แบบทดสอบไวยากรณ์ภาษาอังกฤษ",
    type: "FB",
    status: "active",
    difficulty: "easy",
    score: 3,
    creator: "อาจารย์แอนนา สมิท",
  },
  {
    id: 13,
    text: "ข้อใดคือหลักการออกแบบกราฟิกที่ดี?",
    quizCode: "AR105-Q1",
    quizTitle: "แบบทดสอบหลักการออกแบบกราฟิก",
    type: "MC",
    status: "active",
    difficulty: "medium",
    score: 5,
    creator: "อาจารย์ศิลปิน วาดเก่ง",
  },
  {
    id: 14,
    text: "การใช้สีที่ตัดกันมากเกินไปเป็นสิ่งที่ควรทำในการออกแบบกราฟิกใช่หรือไม่?",
    quizCode: "AR105-Q1",
    quizTitle: "แบบทดสอบหลักการออกแบบกราฟิก",
    type: "TF",
    status: "inactive",
    difficulty: "easy",
    score: 2,
    creator: "อาจารย์ศิลปิน วาดเก่ง",
  },
  {
    id: 15,
    text: "เครื่องมือใดใน Adobe Photoshop ใช้สำหรับการตัดภาพ?",
    quizCode: "AR105-Q2",
    quizTitle: "แบบทดสอบการใช้งาน Adobe Photoshop",
    type: "SC",
    status: "draft",
    difficulty: "medium",
    score: 4,
    creator: "อาจารย์ศิลปิน วาดเก่ง",
  },
];

const QuestionsArea = () => {
  const [questions, setQuestions] = useState<Question[]>(sampleQuestions);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;

  // Filter questions based on search term
  const filteredQuestions = questions.filter(question =>
    question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.quizCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.quizTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

  // Handle delete question
  const handleDeleteQuestion = (id: number) => {
    if (window.confirm("คุณต้องการลบคำถามนี้ใช่หรือไม่?")) {
      setQuestions(questions.filter(question => question.id !== id));
    }
  };

  // Status badge component
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

  // Question type badge component
  const QuestionTypeBadge = ({ type }: { type: QuestionType }) => {
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
    }

    return (
      <span className={badgeClass} title={tooltipText}>
        {typeText}
      </span>
    );
  };

  // Difficulty badge component

  // Statistics
  const totalQuestions = questions.length;
  const countByStatus = {
    active: questions.filter(q => q.status === "active").length,
    inactive: questions.filter(q => q.status === "inactive").length,
    draft: questions.filter(q => q.status === "draft").length,
  };
  const totalScore = questions.reduce((sum, q) => sum + q.score, 0);

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

                {/* Statistics */}
                <div className="mb-4">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <div className="bg-light rounded p-3 text-center">
                        <h6 className="mb-1 text-muted">คำถามทั้งหมด</h6>
                        <h5 className="mb-0">{totalQuestions} ข้อ</h5>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="bg-success-subtle rounded p-3 text-center">
                        <h6 className="mb-1 text-success">เปิดใช้งาน</h6>
                        <h5 className="mb-0">{countByStatus.active} ข้อ</h5>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="bg-primary-subtle rounded p-3 text-center">
                        <h6 className="mb-1 text-primary">คะแนนรวม</h6>
                        <h5 className="mb-0">{totalScore} คะแนน</h5>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="bg-secondary-subtle rounded p-3 text-center">
                        <h6 className="mb-1 text-secondary">ฉบับร่าง</h6>
                        <h5 className="mb-0">{countByStatus.draft} ข้อ</h5>
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
                      placeholder="ค้นหาคำถาม..."
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
                  <Link to="/admin-questions/create-new" className="btn btn-primary">
                    <i className="fas fa-plus-circle me-2"></i>เพิ่มคำถาม
                  </Link>
                </div>

                {/* Questions table */}
                <div className="card shadow-sm border-0">
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover table-sm mb-0 align-middle table-striped">
                        <thead className="table-light">
                          <tr>
                            <th>คำถาม</th>
                            <th>รหัสแบบทดสอบ</th>
                            <th className="text-center">ประเภท</th>
                            <th className="text-center">คะแนน</th>
                            <th>สถานะ</th>
                            <th style={{ width: "100px" }}>จัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentQuestions.length > 0 ? (
                            currentQuestions.map((question) => (
                              <tr key={question.id}>
                                <td>
                                  <div className="d-flex flex-column">
                                    <span className="fw-medium">{question.text.length > 60 ? question.text.substring(0, 60) + "..." : question.text}</span>
                                    <small className="text-muted">{question.quizTitle}</small>
                                  </div>
                                </td>
                                <td>{question.quizCode}</td>
                                <td className="text-center">
                                  <QuestionTypeBadge type={question.type} />
                                </td>
                                <td className="text-center">
                                  <span className="fw-medium">{question.score} คะแนน</span>
                                </td>
                                <td><StatusBadge status={question.status} /></td>
                                <td>
                                  <div className="d-flex justify-content-center gap-3">
                                    <Link to={`/admin-creditbank/edit-question/${question.id}`} className="text-primary">
                                      <i className="fas fa-edit icon-action"></i>
                                    </Link>
                                    <i
                                      className="fas fa-trash-alt text-danger icon-action"
                                      style={{ cursor: "pointer" }}
                                      onClick={() => handleDeleteQuestion(question.id)}
                                    ></i>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="text-center py-4">ไม่พบข้อมูลคำถาม</td>
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
                          แสดง {indexOfFirstQuestion + 1} ถึง {Math.min(indexOfLastQuestion, filteredQuestions.length)} จากทั้งหมด {filteredQuestions.length} รายการ
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

export default QuestionsArea;
